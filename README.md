# WABA Template Guard

**AI-ready WhatsApp template risk checker and optimizer.**

WABA Template Guard is a lightweight browser-first MVP for teams that want to review WhatsApp Business message templates before submitting them. It looks for common wording, category, variable, CTA and structure risk signals and produces practical rewrite guidance.

> **Important:** This tool is a heuristic checker. It does not represent Meta/WhatsApp, does not guarantee approval, and should always be used alongside the latest official policies.

## MVP features

- Utility / Marketing / Authentication category selector
- Template body, header, footer and button inputs
- Promotional-language detection
- Urgency-language detection
- Sensitive credential/payment wording checks
- Variable sequence checks
- CTA clarity checks
- 0–100 heuristic risk score
- Suggested cleaner rewrite
- One-click copy
- Responsive landing page
- Browser-only analysis in the current MVP

## Run locally

No build step is required.

1. Clone the repository.
2. Open `index.html` in a browser, or serve the directory with any static HTTP server.

For example:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Roadmap

### Phase 1 — Product MVP
- [x] Landing page
- [x] Template analyzer UI
- [x] Heuristic risk engine
- [x] Suggested rewrite
- [x] Responsive design

### Phase 2 — SaaS foundation
- [ ] Server-side analysis API
- [ ] User accounts
- [ ] Usage limits
- [ ] Saved template history
- [ ] Stripe/Razorpay billing
- [ ] Team workspaces

### Phase 3 — WABA Connect integration
- [ ] Import templates from WABA Connect
- [ ] Pre-submission checks
- [ ] Template history and approval outcomes
- [ ] Bulk CSV analysis
- [ ] Agency workspace / white-label mode

### Phase 4 — Intelligence
- [ ] AI-assisted rewrites
- [ ] Policy knowledge base with versioned sources
- [ ] Explainable rule references
- [ ] Analytics on rejected/approved templates

## Product positioning

**Review first. Submit with confidence.**

The initial monetization direction is a free tier for occasional checks, followed by paid plans for unlimited analysis, saved history, bulk checks, teams and WABA Connect integration.

## License

MIT
