# Stacc.com — Max Ad Signal + GDPR/Nordic Compliance Runbook

**Goal:** Maximize ad-conversion signal into Google Ads, LinkedIn Ads, and Microsoft (Bing) Ads while staying compliant with GDPR and Nordic DPA enforcement (Datatilsynet NO/DK, IMY SE, Tietosuoja FI).

**Stack:** Framer (website) · CookieYes (CMP) · Google Tag Manager (web + server) · HubSpot (forms).

> Core principle: you do **not** maximize signal by loosening consent. You maximize it by (a) lifting consent rates, (b) recovering signal from non-consenters via Google's modeling, and (c) making every consented hit richer and more durable via server-side + first-party data. Every marketing tag stays consent-gated.

---

## Target architecture

```
CookieYes (single CMP, equal "Reject all", prior-blocking)
        │  emits Consent Mode v2 signals
        ▼
Google Consent Mode v2 — ADVANCED mode      ← biggest legal signal lever
        │
        ▼
GTM (web)  ───────────────►  Server-side GTM @ https://sgtm.stacc.com (Stape)
        │                            │
        │                            ├─► Google Ads  (Enhanced Conversions)
        │                            ├─► GA4
        │                            ├─► LinkedIn     (Conversions API)
        │                            └─► Microsoft    (CAPI / offline)
        ▼
HubSpot forms (iframe)  ──► server-side conversion sync (HubSpot workflow → ad platforms)
                            + client-side postMessage event for fast optimization
```

**Why this design**
- **Consent Mode v2 Advanced** lets Google model the conversions lost from people who decline, using only cookieless pings (no personal data → GDPR-legal). Basic mode discards that signal.
- **Server-side GTM** sets first-party cookies that survive Safari ITP / Firefox ETP (significant in the Nordics) and improves match quality across all three platforms at once.
- **HubSpot server-side sync** solves the cross-origin iframe problem permanently — HubSpot holds the verified email, so conversions match without ever reading inside the iframe.

---

## Decision log

| Question | Decision | Reason |
|---|---|---|
| CMP: CookieYes vs HubSpot banner | **CookieYes** | Site is Framer-hosted (HubSpot Consent Mode is scoped to HubSpot-hosted content); HubSpot banner doesn't block 3rd-party scripts; can't run both (HubSpot scanner fails if another banner is present). |
| Consent Mode | **v2 Advanced** | Unlocks conversion modeling for non-consenters. |
| Server-side tagging | **Yes (Stape)** | ITP/ETP durability + match quality across all platforms. |
| HubSpot form conversions | **Server-side sync (primary) + postMessage (secondary)** | iframe blocks client-side email capture; HubSpot owns verified email. |

---

## Priority order (impact-first)

| # | Move | Effort | Why |
|---|------|--------|-----|
| 1 | CookieYes: equal "Reject all" + true prior-blocking | Low | Compliance gate; also lifts consent rate. |
| 2 | Consent Mode v2 **Advanced** + correct Framer head order | Low | Unlocks modeled conversions immediately. |
| 3 | Google **Enhanced Conversions** | Low | Recovers match rate on consented conversions. |
| 4 | **HubSpot server-side conversion sync** | Medium | Fixes the iframe gap; reliable B2B conversions. |
| 5 | **Server-side GTM** (Stape + `sgtm.stacc.com`) | Medium | Durability + quality across all platforms. |
| 6 | **LinkedIn CAPI** + **Bing CAPI/offline** | Medium | Recovers events the browser tags drop. |

Steps 1–3 capture most of the compliant signal gain quickly. 4–6 add the durability layer.

---

## Phase 0 — Prerequisites
1. Framer **paid Site plan** (custom code requires it).
2. Access: GTM, Google Ads, GA4, LinkedIn Campaign Manager, Microsoft Advertising, CookieYes, HubSpot.
3. Admin access to the **DNS registrar** for `stacc.com`.
4. Reserve a tracking subdomain: `sgtm.stacc.com`.

---

## Phase 1 — CookieYes (consent foundation)
1. Add `stacc.com` in CookieYes.
2. **Banner:** first-layer **"Reject All"** with **equal prominence** to "Accept All" (non-negotiable for Nordic DPAs).
3. Default consent = **denied** for all non-essential categories; **no pre-ticked boxes**.
4. Map categories: Analytics, Advertisement, Functional, Necessary.
5. **Enable Google Consent Mode v2** in CookieYes so it emits `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` and pushes the `denied` default + `update` on consent.
6. Enable **consent logging** (regulators expect demonstrable proof).
7. Copy your CookieYes script tag.

---

## Phase 2 — Install in Framer (order is critical)

Framer → **Site Settings → General → Custom Code → `Start of <head>`** — paste in this exact order:

```html
<!-- 1) Consent Mode v2 default state — MUST run before GTM -->
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);
</script>

<!-- 2) CookieYes (replace with your real client_data ID) -->
<script id="cookieyes" type="text/javascript"
  src="https://cdn-cookieyes.com/client_data/XXXXXXXX/script.js"></script>

<!-- 3) Google Tag Manager (replace GTM-XXXXXXX) -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXXX');</script>
```

> The `consent default … denied` block MUST execute before GTM loads. CookieYes sits between them so it's ready to push the `update`.

Publish the Framer site after each change.

---

## Phase 3 — Disable Framer's native tracking
1. Turn **off** Framer's built-in cookie banner.
2. Turn **off** Framer native analytics.
3. CookieYes is now the single source of consent truth.

---

## Phase 4 — GTM consent configuration
1. GTM **Admin → Container Settings → enable "Consent Overview."**
2. In Consent Overview, for every marketing/analytics tag set **"Require additional consent"**:
   - GA4 → `analytics_storage`
   - Google Ads / LinkedIn / Bing → `ad_storage` + `ad_user_data`
3. In **Preview**, confirm consent flips denied→granted only after Accept, and tags fire only then.

---

## Phase 5 — Google Ads: Advanced Consent Mode + Enhanced Conversions
1. **Verify Advanced mode:** in GTM Preview, Google tags should send cookieless pings *before* consent (not be fully blocked).
2. Google Ads → **Goals → Conversions → Settings → Enhanced conversions** → ON → method **Google Tag Manager** → accept data terms.
3. In GTM, open the **Google Ads Conversion Tracking** tag → enable **"Include user-provided data from your website."**
4. Create a **User-Provided Data variable** → manual configuration → email from `enhanced_conversion_data.email` (populated by HubSpot in Phase 9).
5. Keep the tag gated on `ad_storage` + `ad_user_data`. Hashing (SHA-256) is automatic.

---

## Phase 6 — Server-side GTM (Stape)
1. GTM → **Admin → Create Container → Server.** Copy the container config.
2. **stape.io** → Create Container → paste config.
3. Add custom domain `sgtm.stacc.com`:
   - In Stape: add the domain.
   - At the **DNS registrar**, create the CNAME/A record Stape specifies. *This is independent of Framer's domain config and won't affect the live site.*
   - Wait for SSL/propagation.
4. In the **web** container, set GA4 / Google Ads tags to send to `https://sgtm.stacc.com`.
5. In the **server** container, add the GA4 Client and server-side tags (GA4, Google Ads Conversion, etc.).
6. First-party cookies now set server-side → ITP/ETP resilient. Consent still applies (server only gets what the consented client sends).

---

## Phase 7 — LinkedIn (Insight Tag + Conversions API)
**Insight Tag (client-side)**
1. Campaign Manager → **Analyze → Insight Tag → "I will use a tag manager"** → copy **Partner ID**.
2. Add LinkedIn Insight Tag in web GTM; gate on `ad_storage` + `ad_user_data`.
3. Define conversions in Campaign Manager.

**Conversions API (server-side)**
1. Campaign Manager → **Conversions → Create → data source = Conversions API** (or "Both").
2. Implement via the **LinkedIn CAPI tag in the Stape server container**.
3. Send SHA-256 hashed email + event time + conversion ID. Source email from the same variable as Enhanced Conversions.
4. Fire only when consent granted.

---

## Phase 8 — Microsoft (Bing) Ads
**UET tag**
1. Microsoft Advertising → **Tools → UET tag → Create** → copy **Tag ID.**
2. Add UET via web GTM; gate on `ad_storage` + `ad_user_data`.
3. Create conversion goals.

**Microsoft Consent Mode** — push the signal so UET respects consent.

Default (before UET loads):
```html
<script>
  window.uetq = window.uetq || [];
  window.uetq.push('consent', 'default', { 'ad_storage': 'denied' });
</script>
```
On consent granted (fire from a GTM tag triggered by CookieYes acceptance):
```html
<script>
  window.uetq = window.uetq || [];
  window.uetq.push('consent', 'update', { 'ad_storage': 'granted' });
</script>
```

**Offline / CAPI:** use Microsoft offline conversion import or Conversions API with hashed data (route via sGTM), consent-gated.

---

## Phase 9 — HubSpot forms (iframe) conversions

### 9a. Why the generic listener fails
A HubSpot form in a cross-origin iframe is sealed by same-origin policy: parent-page `submit` listeners and MutationObservers never see it, and you **cannot read the email field** from the parent. Do **not** use a generic form listener for HubSpot.

### 9b. Gate HubSpot's own cookies (compliance)
1. HubSpot → **Settings → Privacy & Consent** → turn **OFF** HubSpot's own cookie banner (CookieYes is the single CMP) and enable **"Restrict non-essential cookies until consent."**
2. In CookieYes, classify `hubspotutk` / `__hs*` under **Analytics/Advertisement** (not Necessary).
3. If you load the HubSpot tracking script, add it as a **GTM tag gated on consent** rather than hard-coding it in Framer's head.

### 9c. Client-side capture via HubSpot postMessage (fast optimization signal)
HubSpot broadcasts form events to the parent window and includes submitted field values. Put this in Framer **`End of <body>`**:

```html
<script>
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'hsFormCallback') return;

    // Fired just before submission — contains submitted field values
    if (event.data.eventName === 'onFormSubmit') {
      var email;
      (event.data.data || []).forEach(function (f) {
        if (f.name === 'email') email = (f.value || '').trim();
      });
      window.__hsEmail = email; // stash for the success event
    }

    // Fired on successful submission — the real conversion moment
    if (event.data.eventName === 'onFormSubmitted') {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: 'hubspot_form_success',
        form_id: event.data.id,
        enhanced_conversion_data: { email: window.__hsEmail }
      });
    }
  });
</script>
```

Then in GTM:
1. **Custom Event trigger** on `hubspot_form_success`.
2. Fire Google Ads conversion, GA4, LinkedIn Insight, UET tags on it.
3. Map `enhanced_conversion_data.email` into the Enhanced Conversions + LinkedIn/Bing user-data variables.
4. Keep all consent-gated on `ad_storage` + `ad_user_data`.

> If currently using a raw `<iframe src="…hubspot…">`, switch to HubSpot's **JS embed** (`hbspt.forms.create`) — it integrates better and coordinates the `hubspotutk` cookie for HubSpot's own attribution.

### 9d. Server-side sync (primary, most reliable — recommended for B2B)
HubSpot owns the verified email server-side, so this bypasses the iframe entirely and gives near-100% match.

- **Path A — Native ad integrations:** HubSpot → **Settings → Connected Apps** → connect Google Ads, LinkedIn Ads, Microsoft Ads. A HubSpot **workflow** ("Contact submitted form X") syncs the conversion with the stored email, honoring HubSpot's stored consent.
- **Path B — Webhook → sGTM / CAPI:** HubSpot **workflow → webhook** on form submission → `sgtm.stacc.com` or directly to Google Ads offline conversions / LinkedIn CAPI / Bing CAPI with the hashed email. Fire only when the HubSpot consent property = granted.

Run **client-side (9c)** for fast optimization signal **and** **server-side (9d)** for durable, high-match conversions; **dedupe** on a conversion/order ID.

---

## Starter GTM definitions (build manually or adapt to an import)

**Variable — User-Provided Data (Enhanced Conversions)**
- Type: User-Provided Data → Manual
- Email: `{{DLV - enhanced_conversion_data.email}}`

**Variable — Data Layer Variable**
- Name: `DLV - enhanced_conversion_data.email`
- Data Layer Variable Name: `enhanced_conversion_data.email`

**Trigger — HubSpot form success**
- Type: Custom Event
- Event name: `hubspot_form_success`

**Tags (all with Consent: require `ad_storage` + `ad_user_data`)**
- Google Ads Conversion Tracking — Conversion ID/Label, Include user-provided data = `{{User-Provided Data}}`, trigger = HubSpot form success.
- GA4 Event `generate_lead` — trigger = HubSpot form success.
- LinkedIn Insight conversion — trigger = HubSpot form success.
- Microsoft UET event — trigger = HubSpot form success.

---

## Compliance checklist (Nordic / GDPR)
- [ ] "Reject all" equally prominent on the banner's first layer (no dark patterns).
- [ ] No pre-ticked boxes; all non-essential default = denied.
- [ ] No marketing/analytics cookie or pixel before consent (verify in incognito + GTM Preview).
- [ ] `hubspotutk` / `__hs*` gated behind consent.
- [ ] No "legitimate interest" basis for ad/profiling cookies.
- [ ] No cookie wall forcing consent for access.
- [ ] Hashed email (Enhanced Conversions / CAPI) sent **only** for consented users.
- [ ] CookieYes consent logging enabled (demonstrable records).
- [ ] EU/EEA data residency considered for HubSpot (eu1) and GA4.

## Validation checklist
- [ ] Incognito + GTM Preview: no `ad_storage`/`analytics_storage` cookies or hits before Accept.
- [ ] After Accept: consent flips denied→granted; tags fire.
- [ ] Tag Assistant: Consent Mode = **Advanced**, pings present pre-consent.
- [ ] Google Ads → Enhanced Conversions status = **Recording**.
- [ ] sGTM: requests hitting `sgtm.stacc.com`; first-party cookies set.
- [ ] Test form → `hubspot_form_success` in GTM Preview with **email populated**.
- [ ] LinkedIn Insight + CAPI both reporting; Bing UET active + consent signal received.
- [ ] Server-side: HubSpot workflow fires and conversion lands with consent respected.

---

## Notes / honest caveats
- Implementing prior-blocking on a client-rendered Framer site, sGTM, and CAPI cleanly is specialist work (~1–2 week engagement for an experienced GTM/analytics implementer). This runbook is the spec to hand them.
- Platform UIs shift; field names above reflect state as of mid-2026.
- HubSpot is force-migrating its v1 cookie banner to v2 by ~May 2026 — irrelevant here since CookieYes is the CMP, but disable HubSpot's banner explicitly so the migration doesn't surface one.
