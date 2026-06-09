# Max Data Intel × Legality — Complete Technique & Compliance Sweep

Companion to `stacc-ad-signals-gdpr-runbook.md`. This is the exhaustive list — every technique to maximize signal and every legal control — with a B2B-fintech lens (long sales cycles, lead-gen, financial-data sensitivity).

> **Live-site note (updated):** the deployed stack has now been audited from stacc.com's source. Confirmed: Framer, GTM **`GTM-P2VKTL82`**, click-ID capture into `sessionStorage["stacc_attr"]` (`gclid`/`li_fat_id`/`msclkid`/`utm_*`), CSP allowlisting Google/HubSpot-eu1/LinkedIn/Bing UET/Clarity/CookieYes, EU/EEA residency (Stacc AS, Bergen). **Live forms are HubSpot iframes** — the FramerForm markup in the source is residue/unused. See the runbook's "Live-site audit" + "Remediation" sections for specifics.

---

## A. The strategic reframe (most important)

A form-fill is not a customer. For B2B fintech, optimizing ad platforms on raw form submissions trains them to find cheap form-fillers, not buyers. **Feed deeper-funnel events with values back to the platforms.** This is both the biggest signal win and fully legal.

**Conversion ladder to send (each as a distinct conversion action):**
| Stage | Source in HubSpot | Send to ads as |
|---|---|---|
| Form submit (lead) | form submission | lead (low/no value) |
| MQL | lifecycle stage = MQL | qualified lead (small value) |
| SQL / opportunity | deal created | opportunity (pipeline value) |
| Closed-won | deal stage = won | customer (deal value) → **value-based bidding** |

Bidding then optimizes toward revenue, not volume.

---

## B. Maximum-data techniques (complete list)

### Consent-time / browser signal
1. **Consent Mode v2 — Advanced** (modeling of non-consenters). Requires a Google-certified CMP (CookieYes qualifies) and minimum volume thresholds for modeling to kick in. *(runbook Phase 5)*
2. **`url_passthrough` + `ads_data_redaction`** — preserves `gclid` across pages without cookies pre-consent, redacts ad identifiers when consent denied. *(runbook Phase 2)*
3. **Enhanced Conversions for Web** — hashed email with consented web conversions. *(runbook Phase 5)*

### Server-side & durability
4. **Server-side GTM** on `sgtm.stacc.com` + **first-party server cookies (FPID)** — survives Safari ITP / Firefox ETP. *(runbook Phase 6)*
5. **Deduplication** via a shared `conversion_id` across client + server events. *(spec B2)*

### Offline / CRM-back (the B2B core — partly NEW vs earlier docs)
6. **Enhanced Conversions for Leads via Google Data Manager** — upload qualified/closed leads matched by hashed email. *From June 15, 2026 this is the supported path (legacy Ads-API offline import is blocked).* HubSpot has a **direct Data Manager connection**.
7. **Value-Based Bidding (VBB)** — attach deal/pipeline value to offline conversions; bid to revenue.
8. **Click-ID capture** — store `gclid`/`gbraid`/`wbraid` (Google), `li_fat_id` (LinkedIn), `msclkid` (Microsoft) in hidden HubSpot fields at form load, send back with the offline conversion. *(spec field map)*
9. **LinkedIn Conversions API** + **Microsoft CAPI / offline conversion import** — server-side conversions with hashed PII. *(runbook Phases 7–8)*

### Audiences / first-party data activation
10. **Customer Match (Google)**, **Matched Audiences / contact lists (LinkedIn)**, **Customer Match (Microsoft)** — upload hashed CRM segments for targeting/suppression. **Only for users who consented to this use.**
11. **GA4 ↔ Google Ads link** + import GA4 conversions/audiences; **data-driven attribution**.
12. **Google Ads Data Manager** as the unified first-party data hub (2026 consolidation point for web tags + Data Manager + API).

### Optional behavioral
13. **Microsoft Clarity / heatmaps** — consent-gated, useful for CRO (not ad signal per se).
14. **Cross-domain linker** — only if you run multiple domains/subdomains.

---

## C. Legality & compliance controls (complete list)

### Legal basis & consent
1. **Prior opt-in consent** for all non-essential storage/access — ePrivacy Art 5(3) + GDPR Art 6(1)(a). No "legitimate interest" for ad/profiling cookies.
2. **Equal-prominence reject**, no pre-ticked boxes, **withdrawal as easy as giving**. *(runbook Phase 1)*
3. **Honor withdrawal end-to-end** — stop tags *and* suppress the user in platform audiences/uploads going forward.
4. **Consent duration / re-consent** — re-ask periodically (Nordic practice ≈ 6–12 months; Denmark guidance leans shorter). Configure in CookieYes.

### Jurisdiction specifics
5. **Norway — ekomloven (in force 1 Jan 2025):** now full GDPR consent standard; enforced by **NKOM + Datatilsynet**; April 2025 guidance + active inspection of **pixels leaking sensitive data**.
6. **Sweden:** LEK + IMY enforcement. **Denmark:** cookiebekendtgørelsen + Datatilsynet. **Finland:** Traficom (cookies) + Tietosuojavaltuutettu (GDPR).

### International transfers
7. **EU-US Data Privacy Framework — upheld by the EU General Court 3 Sept 2025.** Google, Microsoft, and LinkedIn are **DPF-certified** → US transfers lawful under DPF. Keep **SCCs** as a fallback and record the transfer basis.

### Contracts & roles
8. **Data Processing Agreements / data terms** signed with Google, LinkedIn, Microsoft, HubSpot, CookieYes, and your sGTM host.
9. **Controller roles:** Google/LinkedIn/Microsoft are typically **independent or joint controllers** for ad data (cf. CJEU *Fashion ID*). Reflect this in your privacy policy and DPAs.

### Data handling
10. **Hashing ≠ anonymization** — hashed email is still personal data; Enhanced Conversions / CAPI / Customer Match all still require consent.
11. **FINTECH — special-category / sensitive data:** never transmit signals that reveal financial circumstances (loan amounts, product/eligibility that implies financial status) to any pixel/CAPI/audience upload. Google policy forbids it; Datatilsynet is actively inspecting for it. Restrict payloads to identity (hashed email/phone) + conversion + value.
12. **Data minimization, purpose limitation, storage limitation** — send only what each platform needs; set GA4/Google Ads **data-retention** to the minimum useful.
13. **Google EU User Consent Policy** compliance (required to use Google ad features in the EEA).

### Governance
14. **DPIA** for large-scale tracking/profiling (advisable given fintech + cross-platform matching).
15. **Records of processing** (GDPR Art 30) covering each ad data flow.
16. **Transparency:** privacy policy + cookie declaration listing every processor, cookie, purpose, retention, and transfer basis. CookieYes auto-generates the cookie declaration.
17. **DSAR / erasure propagation** — process to remove a person from ad audiences/uploads on request.

---

## D. Updated priority order (supersedes runbook table for a B2B lens)

| # | Move | Why it's ranked here |
|---|------|----------------------|
| 1 | Compliant CookieYes banner + prior-blocking (ekomloven) | Legal gate; lifts consent rate. |
| 2 | Consent Mode v2 Advanced | Free modeled signal. |
| 3 | **Enhanced Conversions for Leads via Data Manager (HubSpot connector)** | **Biggest B2B signal win**; required path from Jun 2026. |
| 4 | **Value-based bidding** on closed-won deal values | Optimizes to revenue, not form-fills. |
| 5 | Enhanced Conversions for Web + click-ID capture | Improves match + attribution. |
| 6 | Server-side GTM | Durability across all platforms. |
| 7 | LinkedIn CAPI + Microsoft CAPI/offline | Recover dropped events; mirror the lead ladder. |
| 8 | Customer Match / Matched Audiences (consented segments) | Targeting + suppression. |

---

## E. What's still unverified / open questions
- **Dual-CMP:** CSP allowlists both CookieYes and HubSpot `hs-banner.com` — confirm only CookieYes renders a banner (runbook R3).
- **Prior-consent:** no Consent Mode v2 `default` block precedes `GTM-P2VKTL82` in the live head (runbook R1).
- **HubSpot ↔ Google Data Manager connector** availability in your portal tier.
- **Microsoft native connector** in HubSpot (may require Path B webhook).
- **DPF reliance vs. additional SCCs** — confirm with your DPO/legal.
- **Consent-to-ad-use mapping** — whether CookieYes "Advertisement" consent is the property you propagate to HubSpot for offline uploads.

---

## Sources
- [Google Ads — About Enhanced Conversions for Leads](https://support.google.com/google-ads/answer/15713840?hl=en)
- [Google Ads — Upgrade offline conversion import to ECL](https://support.google.com/google-ads/answer/14274408?hl=en)
- [Google blocks legacy offline conversion imports via Ads API from June 15 (Data Manager migration)](https://ppc.land/google-blocks-new-offline-conversion-imports-via-ads-api-from-june-15/)
- [Enhanced Conversions for Leads + VBB for B2B SaaS (2026)](https://www.growthspreeofficial.com/blogs/enhanced-conversions-for-leads-value-based-bidding-b2b-saas)
- [Norway E-Com Act — new cookie compliance rules (Usercentrics)](https://usercentrics.com/knowledge-hub/e-com-act-regulatory-updates-for-cookie-use-in-norway/)
- [Navigating Norway's 2025 Electronic Communications Act (Pandectes)](https://pandectes.io/blog/navigating-norways-2025-electronic-communications-act/)
- [EU General Court confirms validity of EU-US DPF, 3 Sept 2025 (Heuking)](https://www.heuking.de/en/news-events/newsletter-articles/detail/eug-confirms-effectiveness-of-eu-us-data-privacy-framework.html)
- [Microsoft & LinkedIn DPF-covered entities](https://www.microsoft.com/en-us/privacy/microsoft-data-privacy-framework-covered-entities)
- [Google data transfer frameworks (DPF)](https://policies.google.com/privacy/frameworks?hl=en-US)
