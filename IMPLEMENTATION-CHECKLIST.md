# Stacc.com Ad-Signal + GDPR — Click-by-Click Implementation Checklist

A literal, ordered to-do list. Do it top to bottom. Each box is one action you can actually click.
Companion to `stacc-ad-signals-gdpr-runbook.md` (the *why*), `gtm-web-container-starter.json` (importable), and `hubspot-server-side-conversion-spec.md` (server sync).

**Confirmed live values you'll paste repeatedly:**
- GTM container: `GTM-P2VKTL82`
- Click-ID store already on site: `sessionStorage["stacc_attr"]` (`gclid`, `li_fat_id`, `msclkid`, `utm_*`)
- HubSpot portal region: `eu1` · Forms: HubSpot iframes
- Tracking subdomain to reserve: `sgtm.stacc.com`

**Legend:** ⚠️ = compliance-critical · 🔑 = needs an ID/secret you must collect · 🧪 = test step

---

## STAGE 0 — Collect your IDs first (15 min)

Open a scratch note and fill these in before touching anything. You'll paste them later.

- [ ] 🔑 GTM container ID — `GTM-P2VKTL82` (already known)
- [ ] 🔑 GA4 Measurement ID — GA4 → **Admin → Data streams → [web stream]** → copy `G-XXXXXXXXXX`
- [ ] 🔑 Google Ads Conversion ID + Label — Google Ads → **Goals → Conversions** → (create/open the "Lead" action) → **Tag setup → Use Google Tag Manager** → copy `Conversion ID` + `Conversion label`
- [ ] 🔑 CookieYes site ID — CookieYes dashboard → **Sites → [stacc.com] → Install** → copy the `client_data/XXXXXXXX` value
- [ ] 🔑 LinkedIn Partner ID — Campaign Manager → **Analyze → Insight Tag** → copy `Partner ID`
- [ ] 🔑 Microsoft UET Tag ID — Microsoft Advertising → **Tools → UET tag** → copy `Tag ID`
- [ ] Confirm Framer plan is a **paid Site plan** (custom code requires it): Framer → **Site Settings → Plans**

---

## STAGE 1 — ⚠️ Remediation (close the compliance gaps that exist TODAY)

Do this stage before adding any new signal. The live site fires tracking before consent today.

### 1A. CookieYes banner is compliant
- [ ] Log in to CookieYes → select **stacc.com**
- [ ] **Banner → Layout/Buttons:** enable a first-layer **"Reject All"** button
- [ ] ⚠️ Set "Reject All" to the **same size/colour/prominence** as "Accept All" (no greyed-out reject)
- [ ] **Consent → Categories:** set Analytics, Advertisement, Functional default = **OFF (denied)**; Necessary = on
- [ ] ⚠️ Confirm **no pre-ticked** boxes anywhere
- [ ] **Settings → Google Consent Mode:** toggle **ON** (emits `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`)
- [ ] **Settings → Consent log:** toggle **ON**
- [ ] Set re-consent interval to **6–12 months**
- [ ] Click **Save / Publish** in CookieYes

### 1B. ⚠️ R1 — Put Consent Mode default BEFORE GTM (the prior-consent fix)
- [ ] Framer → **Site Settings → General → Custom Code → Start of `<head>`**
- [ ] Paste these **three blocks in this exact order** (replace `XXXXXXXX` with your CookieYes ID):

```html
<!-- 1) Consent Mode v2 default — MUST run before GTM -->
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

<!-- 2) CookieYes -->
<script id="cookieyes" type="text/javascript"
  src="https://cdn-cookieyes.com/client_data/XXXXXXXX/script.js"></script>

<!-- 3) Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-P2VKTL82');</script>
```

- [ ] ⚠️ If `GTM-P2VKTL82` is currently loaded somewhere else in the head (not after the consent block), **remove that duplicate** so it only loads once, after the default block
- [ ] Click **Publish** (top-right in Framer)

### 1C. ⚠️ R2 — Stop Framer native analytics firing pre-consent
- [ ] Framer → **Site Settings → General → (Analytics / built-in tracking)** → turn **OFF** Framer Analytics
- [ ] Framer → turn **OFF** Framer's built-in cookie banner (CookieYes is the only banner)
- [ ] Click **Publish**

### 1D. ⚠️ R3 — Kill the dual-CMP (HubSpot banner)
- [ ] HubSpot → **Settings (gear) → Privacy & Consent → Cookies**
- [ ] Turn **OFF** HubSpot's cookie consent banner
- [ ] Turn **ON** "Restrict non-essential cookies until consent given"
- [ ] 🧪 Open stacc.com in a **fresh incognito window** → confirm **only the CookieYes banner** appears (no second banner)

### 1E. 🧪 Verify the gate works
- [ ] In Chrome incognito, open **DevTools → Application → Cookies** before clicking anything → confirm **no** `_ga`, `_gcl_*`, `hubspotutk`, LinkedIn/Bing cookies present
- [ ] Confirm **no** request to `events.framer.com` fires (DevTools → Network, filter "framer")
- [ ] Click **Reject All** → reload → still no marketing cookies
- [ ] Click **Accept All** → cookies now appear → gate confirmed ✅

---

## STAGE 2 — GTM consent wiring + import the starter

### 2A. Enable consent in GTM
- [ ] tagmanager.google.com → open **GTM-P2VKTL82**
- [ ] **Admin → Container Settings** → tick **"Enable consent overview"** → Save

### 2B. Import the starter container
- [ ] **Admin → Import Container**
- [ ] Choose file: `gtm-web-container-starter.json`
- [ ] Workspace: **Existing → Default Workspace**
- [ ] Mode: **Merge → Overwrite conflicting tags** (safe; this is a fresh set)
- [ ] Click **Confirm** → review the import summary (4 tags, 6 variables, 1 trigger)

### 2C. Fill the placeholders the import left for you
- [ ] **Tags → GA4 Event - generate_lead** → set Measurement ID to your `G-XXXXXXXXXX` → Save
- [ ] **Tags → Google Ads - Conversion (lead)** → set `conversionId` + `conversionLabel` → Save
- [ ] **Variables → UPD - User Provided Data (manual email)** → open → confirm **Manual**, Email = `{{DLV - enhanced_conversion_data.email}}` → Save
- [ ] **Tags → Google Ads - Conversion (lead)** → expand **"Include user-provided data from your website"** → select `{{UPD - User Provided Data (manual email)}}` → Save
- [ ] **Tags → LinkedIn - Insight conversion** → replace `PARTNER_ID` and `CONVERSION_ID` → Save
- [ ] **Tags → Microsoft UET - conversion event** → adjust event label if needed → Save

### 2D. Confirm consent gating on every marketing tag
- [ ] For each of the 4 tags → **Advanced Settings → Consent Settings** → confirm **"Require additional consent"**:
  - GA4 → `analytics_storage`
  - Google Ads / LinkedIn / Microsoft → `ad_storage` + `ad_user_data`

---

## STAGE 3 — HubSpot form conversions (the live forms)

### 3A. ⚠️ Gate HubSpot's own cookies
- [ ] In CookieYes → **Cookie list** → classify `hubspotutk` and `__hs*` under **Analytics/Advertisement** (not Necessary)

### 3B. Client-side success event (fast optimization signal)
- [ ] Framer → **Site Settings → Custom Code → End of `<body>`** → paste:

```html
<script>
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'hsFormCallback') return;
    if (event.data.eventName === 'onFormSubmit') {
      var email;
      (event.data.data || []).forEach(function (f) {
        if (f.name === 'email') email = (f.value || '').trim();
      });
      window.__hsEmail = email;
    }
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

- [ ] Click **Publish**

### 3C. 🔑 R4 — Forward the existing `stacc_attr` click IDs into the form
- [ ] HubSpot → **Marketing → Forms → [your live form] → Edit**
- [ ] Add hidden fields: `gclid`, `li_fat_id`, `msclkid` (create contact properties if missing; `gclid` maps to existing `hs_google_click_id`)
- [ ] Optionally add hidden `utm_source` / `utm_medium` / `utm_campaign`
- [ ] Save/publish the form
- [ ] Framer → **End of `<body>`** → add the `onFormReady` forwarder (full version in runbook **Phase 9e**):

```html
<script>
  window.addEventListener('message', function (event) {
    if (!event.data || event.data.type !== 'hsFormCallback') return;
    if (event.data.eventName !== 'onFormReady') return;
    var attr = {};
    try { attr = JSON.parse(sessionStorage.getItem('stacc_attr') || '{}'); } catch (e) {}
    var iframe = document.querySelector('iframe.hs-form-iframe');
    if (!iframe) return;
    ['gclid','li_fat_id','msclkid','utm_source','utm_medium','utm_campaign']
      .forEach(function (k) {
        if (attr[k]) iframe.contentWindow.postMessage(
          { type: 'hsFormSetValue', name: k, value: attr[k] }, '*');
      });
  });
</script>
```

- [ ] Click **Publish**
- [ ] 🧪 Visit `stacc.com/?gclid=test123`, open the form, submit a test → confirm the contact in HubSpot has `gclid = test123`

### 3D. 🧪 Verify the client-side conversion
- [ ] GTM → **Preview** → enter `https://www.stacc.com` → Connect
- [ ] Submit a real test form with consent accepted
- [ ] Confirm `hubspot_form_success` appears in the Preview event list **with email populated**
- [ ] Confirm GA4 + Google Ads + LinkedIn + UET tags fired on that event

---

## STAGE 4 — Google Ads Enhanced Conversions

- [ ] Google Ads → **Goals → Conversions → Settings → Enhanced conversions** → toggle **ON**
- [ ] Method: **Google Tag Manager** → check the box / accept the **customer data terms**
- [ ] 🧪 In Tag Assistant, submit a test lead → status should later read **"Recording"** in Google Ads (can take ~24–48h)

---

## STAGE 5 — Publish GTM + go live

- [ ] GTM → **Submit** (top-right) → name the version e.g. `Ad-signal + consent v1` → **Publish**
- [ ] 🧪 Re-run the Stage 1E incognito gate test once more on production
- [ ] 🧪 Confirm in Tag Assistant: **Consent Mode = Advanced**, cookieless pings present before consent

---

## STAGE 6 — Server-side GTM (durability layer) — schedule as phase 2

> Medium effort, ~1–2 days incl. DNS propagation. Do after Stages 1–5 are verified.

- [ ] GTM → **Admin → Create Container → Server** → copy container config
- [ ] stape.io → **Create Container** (EU region) → paste config
- [ ] Stape → add custom domain `sgtm.stacc.com`
- [ ] 🔑 DNS registrar for stacc.com → add the **CNAME** record Stape specifies (independent of Framer; won't affect the live site)
- [ ] Wait for SSL/propagation (✅ Stape shows "healthy")
- [ ] Web GTM → point GA4 + Google Ads tags' server URL to `https://sgtm.stacc.com`
- [ ] Server GTM → add GA4 Client + server tags → Publish

---

## STAGE 7 — Offline conversions / CAPI (the B2B revenue signal) — phase 3

> This is the biggest B2B win (value-based bidding on closed-won). See `hubspot-server-side-conversion-spec.md`.

### 7A. Consent property in HubSpot
- [ ] HubSpot → **Settings → Properties → Create property** `ad_consent_granted` (boolean)
- [ ] Populate it at submit from CookieYes Advertisement-consent state
- [ ] ⚠️ Every workflow below must branch on `ad_consent_granted = true`

### 7B. Google — Enhanced Conversions for Leads via Data Manager
- [ ] HubSpot → **Settings → Connected Apps → Google Ads** → connect
- [ ] Google Ads → **Tools → Data Manager** → confirm the HubSpot connection
- [ ] Create the lead-ladder conversion actions: Lead / MQL / SQL / **Closed-won (value)**
- [ ] Build a HubSpot workflow: deal stage = won → send conversion with deal value + click IDs
- [ ] Turn on **value-based bidding** in the campaign once conversions accrue

### 7C. LinkedIn + Microsoft CAPI
- [ ] LinkedIn Campaign Manager → **Conversions → Create → Conversions API** → implement via Stape server tag
- [ ] Microsoft Advertising → **Offline conversions / CAPI** → implement via Stape server tag
- [ ] ⚠️ All fire only when `ad_consent_granted = true`; send hashed email + click ID + value only — **never** financial/eligibility data

---

## Final compliance sign-off (Nordic / GDPR)
- [ ] ⚠️ "Reject All" equally prominent; no dark patterns
- [ ] ⚠️ Nothing fires before consent (incognito + Preview verified)
- [ ] ⚠️ `hubspotutk` / `__hs*` gated behind consent
- [ ] ⚠️ Hashed email / click IDs sent only for consented users
- [ ] ⚠️ No financial/eligibility data ever sent to any pixel/CAPI/audience (fintech rule)
- [ ] CookieYes consent logging on
- [ ] EU/EEA residency: HubSpot `eu1`, GA4 EU, sGTM EU region
- [ ] DPAs signed with Google, LinkedIn, Microsoft, HubSpot, CookieYes, Stape
- [ ] Privacy policy + cookie declaration list every processor, purpose, retention, transfer basis (DPF/SCCs)
