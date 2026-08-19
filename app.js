const $ = (id) => document.getElementById(id);

const escapeHtml = (value) => value.replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

function analyze(text, category, buttons, header, footer) {
  const lower = `${text}\n${buttons}\n${header}\n${footer}`.toLowerCase();
  const risks = [];
  const variables = [...text.matchAll(/\{\{\s*(\d+)\s*\}\}/g)].map(m => Number(m[1]));
  const unique = [...new Set(variables)];

  const promotional = ['limited time','buy now','shop now','special offer','exclusive offer','discount','sale','offer valid','hurry','act now','best price','free','deal','% off','save money','lowest price'];
  const urgency = ['urgent','immediately','right now','last chance','expires today','don’t miss','do not miss'];
  const sensitive = ['password','otp','one time password','cvv','card number','pin'];
  const vague = ['click here','tap here','visit our website','check this out'];

  const hits = (words) => words.filter(w => lower.includes(w));
  const promoHits = hits(promotional);
  const urgencyHits = hits(urgency);
  const sensitiveHits = hits(sensitive);
  const vagueHits = hits(vague);

  if (!text.trim()) risks.push({level:'high', title:'Template body is empty', detail:'Add the message body you intend to submit.'});
  if (text.length > 1024) risks.push({level:'high', title:'Body is unusually long', detail:'Shorter messages are easier to review and understand. Check the current limits for your selected WhatsApp template type.'});
  if (promoHits.length && category === 'utility') risks.push({level:'high', title:'Promotional language in a Utility template', detail:`Detected: ${promoHits.slice(0,4).join(', ')}. If the message is promotional, select the appropriate category instead of trying to disguise it as Utility.`});
  else if (promoHits.length) risks.push({level:'medium', title:'Promotional language detected', detail:`Detected: ${promoHits.slice(0,5).join(', ')}. Make sure the selected category and actual purpose match the message.`});
  if (urgencyHits.length) risks.push({level:'medium', title:'Urgency language detected', detail:`Detected: ${urgencyHits.slice(0,4).join(', ')}. Confirm this language is necessary and consistent with the message purpose.`});
  if (sensitiveHits.length && category !== 'authentication') risks.push({level:'high', title:'Sensitive credential/payment wording', detail:`Detected: ${sensitiveHits.slice(0,4).join(', ')}. Review whether the content belongs in an Authentication template and avoid requesting sensitive financial credentials.`});
  if (unique.length && Math.max(...unique) > unique.length + 1) risks.push({level:'medium', title:'Variable numbering has gaps', detail:'Variables should be numbered consistently. For example, use {{1}}, {{2}}, {{3}} rather than skipping numbers.'});
  if (variables.length > 0 && !variables.every((v, i) => v === i + 1)) risks.push({level:'medium', title:'Variable sequence needs review', detail:'Check that placeholders are sequential and that each variable has a clear value at send time.'});
  if (/\{\{\s*\d+\s*\}\}/.test(text) && !/\{\{\s*\d+\s*\}\}/.test(text.trim())) risks.push({level:'low', title:'Check variable placement', detail:'Keep placeholders inside a clear sentence and make sure they will be replaced with meaningful values.'});
  if (vagueHits.length) risks.push({level:'low', title:'Vague call-to-action wording', detail:`Detected: ${vagueHits.slice(0,3).join(', ')}. A specific button label or destination usually gives users clearer context.`});
  if (buttons.split('\n').filter(Boolean).length > 10) risks.push({level:'medium', title:'Many buttons added', detail:'Keep the action choices focused and verify the current button limits for your template type.'});
  if (!risks.length) risks.push({level:'low', title:'No major rule-of-thumb risks found', detail:'The message has a relatively clean structure. This is not a guarantee of approval.'});

  const points = risks.reduce((sum, r) => sum + ({high:30, medium:15, low:0}[r.level]), 0);
  const score = Math.max(5, 100 - points);
  const tier = score >= 80 ? 'good' : score >= 55 ? 'medium' : 'high';
  return { risks, score, tier, variables: unique.length };
}

function rewrite(text, category) {
  let result = text.trim();
  const replacements = [
    [/\blimited time\b/gi, ''], [/\bhurry\b/gi, ''], [/\bact now\b/gi, ''], [/\blast chance\b/gi, ''],
    [/\bdon[’']?t miss\b/gi, ''], [/\bbuy now\b/gi, 'View details'], [/\bshop now\b/gi, 'View details'],
    [/\bspecial offer\b/gi, 'Available details'], [/\bexclusive offer\b/gi, 'Available details']
  ];
  replacements.forEach(([pattern, replacement]) => { result = result.replace(pattern, replacement); });
  result = result.replace(/[ \t]{2,}/g, ' ').replace(/\s+([,.!?])/g, '$1').replace(/\n{3,}/g, '\n\n').trim();
  if (category === 'utility' && !result) result = text.trim();
  return result || 'Add your template text to generate a suggested rewrite.';
}

$('template-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const text = $('template').value;
  const category = $('category').value;
  const buttons = $('buttons').value;
  const result = analyze(text, category, buttons, $('header').value, $('footer').value);
  const rewriteText = rewrite(text, category);
  const label = result.tier === 'good' ? 'Lower risk' : result.tier === 'medium' ? 'Review needed' : 'Higher risk';
  $('results').innerHTML = `
    <div class="score-head"><div><div class="score-label">RISK SCORE</div><div class="score ${result.tier}">${result.score}<small>/100</small></div></div><div class="badge">${label}</div></div>
    <div class="risk-list">${result.risks.map(r => `<div class="risk ${r.level}"><div class="risk-title"><span>${escapeHtml(r.title)}</span><em>${r.level}</em></div><p>${escapeHtml(r.detail)}</p></div>`).join('')}</div>
    <div class="rewrite"><h4>Suggested cleaner version</h4><p id="rewrite-text">${escapeHtml(rewriteText)}</p><button class="copy-btn" id="copy">Copy rewrite</button></div>
    <p class="fine-print">Score is a heuristic based on common risk signals. It is not an official Meta/WhatsApp approval score.</p>`;
  $('copy').addEventListener('click', async () => { await navigator.clipboard.writeText(rewriteText); $('copy').textContent = 'Copied ✓'; setTimeout(() => $('copy').textContent = 'Copy rewrite', 1500); });
});