# Stacc.com — Max Ad Signal + GDPR/Nordic Compliance Runbook

**Goal:** Maximize ad-conversion signal into Google Ads, LinkedIn Ads, and Microsoft (Bing) Ads while staying compliant with GDPR and Nordic DPA enforcement (Datatilsynet NO/DK, IMY SE, Tietosuoja FI).

**Stack:** Framer (website) · CookieYes (CMP) · Google Tag Manager (web + server) · HubSpot (forms).

> Core principle: you do **not** maximize signal by loosening consent. You maximize it by (a) lifting consent rates, (b) recovering signal from non-consenters via Google's modeling, and (c) making every consented hit richer and more durable via server-side + first-party data. Every marketing tag stays consent-gated.

---

## Live-site audit — confirmed facts (verified from stacc.com source, 2026-06)

These supersede earlier inferences. Implementation below is now grounded in what is actually deployed.

| Item | Confirmed state | Implication |
|---|---|---|
| Platform | Framer (`www.stacc.com`) | Custom code via Framer head/body injection (paid plan in use). |
| GTM container | **`GTM-P2VKTL82`** (live) | Use this ID everywhere below — not a placeholder. |
| Click-ID capture | Custom snippet already captures `gclid`, `li_fat_id`, `msclkid`, `utm_*` into `sessionStorage["stacc_attr"]`; a `framerFormsUTMTags` cookie also set | The hard part is half-done. We just need to forward `stacc_attr` into the HubSpot form + offline/CAPI payloads (see Phase 9e). |
| Forms | **Live forms are HubSpot iframes.** FramerForm markup (`#my-framerform-container`) is **residue / not in use** | Use the HubSpot `postMessage` path (9c) + server-side sync (9d). Ignore the Framer-native-form path entirely. |
| CMP | CookieYes present in CSP — **but HubSpot `hs-banner.com` also allowlisted** | Possible dual-CMP. Confirm only CookieYes renders a banner (remediation R3). |
| CSP allowlist | Google, HubSpot `eu1` (incl. `hsadspixel.net`, `hs-banner.com`), LinkedIn, Bing UET, Clarity, CookieYes | Pixels for all three ad platforms are already wired into CSP; consent-gating is the gap, not connectivity. |
| Data residency | HubSpot portal `eu1`; JSON-LD = Stacc AS, Bergen NO; ISO 27001 / SOC 2 / DORA / EU AI Act posture; EU/EEA storage | Keep all PII flows in EU regions (sGTM EU, GA4 EU). Fintech sensitivity rules apply (see deep-dive §C-11). |
| Bing | `msvalidate` meta present | Microsoft tooling already partially set up. |

### Gaps found (drive the remediation section)
- **No Consent Mode v2 `default` snippet in `<head>` before GTM** → prior-consent risk under ekomloven. (R1)
- **Framer native analytics (`events.framer.com`) firing unconditionally** → non-consented tracking. (R2)
- **Possible dual-CMP** (CookieYes + HubSpot banner both reachable per CSP). (R3)
- **Click IDs captured but not forwarded** into the form / CRM / offline-conversion payloads. (R4 / Phase 9e)

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

<!-- 3) Google Tag Manager — Stacc's live container -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P2VKTL82');</script>
```

> The `consent default … denied` block MUST execute before GTM loads. CookieYes sits between them so it's ready to push the `update`.
>
> **Audit finding:** the live head currently loads `GTM-P2VKTL82` **without** a preceding Consent Mode `default` block — this is the prior-consent gap (R1). The fix is exactly the ordering above: prepend block (1), keep CookieYes (2) before GTM (3).

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

### 9e. Forward the existing `stacc_attr` click IDs into HubSpot (use what's already there)

The site **already** captures `gclid` / `li_fat_id` / `msclkid` / `utm_*` into `sessionStorage["stacc_attr"]`. Nothing reads them back into the form yet — that's the missing link for offline conversions and CAPI match quality. Wire it up:

1. **Add hidden fields to the HubSpot form(s):** `gclid`, `li_fat_id`, `msclkid`, and (optional) `utm_source/medium/campaign`. Create the matching contact properties in HubSpot if they don't exist (`hs_google_click_id` already exists for `gclid`).
2. **Populate them at form render.** Because the form is a cross-origin HubSpot iframe you can't write into it from the parent directly; instead use HubSpot's `onFormReady` postMessage to push values via the form API, or set them as **default values from URL/query** in HubSpot. Simplest robust path: on `onFormReady`, read `stacc_attr` and set the fields:

```html
<script>
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'hsFormCallback') return;
    if (event.data.eventName !== 'onFormReady') return;
    var attr = {};
    try { attr = JSON.parse(sessionStorage.getItem('stacc_attr') || '{}'); } catch (e) {}
    var iframe = document.querySelector('iframe.hs-form-iframe');
    if (!iframe) return;
    // HubSpot exposes setFieldValue via the embedded form API on the iframe's contentWindow
    ['gclid','li_fat_id','msclkid','utm_source','utm_medium','utm_campaign']
      .forEach(function (k) {
        if (attr[k]) iframe.contentWindow.postMessage(
          { type: 'hsFormSetValue', name: k, value: attr[k] }, '*');
      });
  });
</script>
```

> If your HubSpot embed type doesn't expose a setter over postMessage, the reliable alternative is to switch the form to the **JS embed** (`hbspt.forms.create`) and use its `onFormReady(form)` callback to `form.querySelector('input[name="gclid"]').value = attr.gclid`, etc. Same outcome, cleaner API.

3. These click IDs then flow into HubSpot → into the **webhook payload (spec B1)** → into **Enhanced Conversions for Leads / Data Manager** and **LinkedIn/Microsoft CAPI**, lifting match rate well above email-only.
4. **Consent note:** click IDs are first-party attribution identifiers tied to an ad click. Forward them to ad platforms **only** under the same `ad_storage` + `ad_user_data` consent gate as the conversion itself.

---

## Remediation — fix what the live audit found (do these first)

These four close the compliance gaps on the *current* deployment. They block nothing new; they make the existing rig lawful and complete.

**R1 — Add the Consent Mode v2 `default` block before GTM.**
The live head loads `GTM-P2VKTL82` with no preceding `consent default … denied`, so marketing/analytics can fire before consent (ekomloven prior-consent breach). Fix = Phase 2 ordering: prepend the `default denied` + `ads_data_redaction` + `url_passthrough` block, with CookieYes between it and GTM. Verify in incognito + GTM Preview that nothing fires pre-Accept.

**R2 — Stop Framer native analytics (`events.framer.com`) firing unconditionally.**
It currently sends hits regardless of consent. Either disable Framer analytics (Phase 3) — recommended, since GA4 covers the need — or, if kept, gate it on `analytics_storage` and add it to the CookieYes Analytics category so it only fires post-consent. Leaving it unconditional is a standalone ekomloven violation independent of the ad pixels.

**R3 — Resolve the dual-CMP risk.**
The CSP allowlists both CookieYes and HubSpot's `hs-banner.com`. Two consent banners = inconsistent/contradictory consent state and a HubSpot scanner that fails when another banner is present. Action: in HubSpot **Settings → Privacy & Consent**, turn its banner **OFF** and enable "restrict non-essential cookies until consent" (Phase 9b). Confirm in a clean browser that **only** CookieYes renders. CookieYes stays the single source of consent truth.

**R4 — Forward the captured click IDs.**
`stacc_attr` (`gclid`/`li_fat_id`/`msclkid`/`utm_*`) is captured but never read back into forms or conversions. Implement Phase 9e so these reach HubSpot → offline conversions / CAPI. Biggest match-quality win available with code you already ship.

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
