# HubSpot → Ad Platforms: Server-Side Conversion Sync Spec

**Purpose:** Send verified, consent-compliant conversions from HubSpot form submissions to Google Ads, LinkedIn, and Microsoft (Bing) Ads — bypassing the cross-origin iframe limitation by using the email HubSpot already holds server-side.

**Two supported paths.** Path A (native integrations) is least effort. Path B (webhook → server-side GTM) is most flexible and gives you one consistent pipeline. You can run either or both; if both, **dedupe on `conversion_id`**.

---

## Prerequisite: consent must be captured in HubSpot

Server-side sync is only GDPR-legal for users who consented to ad measurement. Make consent a first-class property:

1. Add a HubSpot contact property, e.g. `ad_consent_granted` (boolean) or reuse HubSpot's consent/communication-subscription state.
2. Populate it at submission time. Options:
   - Add a **hidden form field** `ad_consent_granted` set from the CookieYes consent state at submit (read CookieYes' consent cookie / `getCkyConsent()` in the page and inject into the form), **or**
   - Map CookieYes consent into a HubSpot consent object via the HubSpot tracking API.
3. **Every workflow below must branch on `ad_consent_granted = true`.** If false → do not sync.

---

## Path A — HubSpot native ad integrations (lowest effort)

1. HubSpot → **Settings → Integrations → Connected Apps** → connect:
   - **Google Ads**
   - **LinkedIn Ads**
   - **Microsoft Advertising** (if available in your portal; otherwise use Path B for Bing)
2. Create a **workflow**:
   - **Enrollment trigger:** `Form submission = <your form>` AND `ad_consent_granted = true`.
   - **Action:** the platform's "create/sync conversion" or "add to audience" step exposed by the connected app.
3. HubSpot sends the conversion with the contact's email (hashed by the platform) and HubSpot's click identifiers where available.

**Pros:** no code, honors HubSpot consent. **Cons:** less control over event payload, dedup, and timing than Path B.

---

## Path B — Workflow → Webhook → Server-side GTM (recommended)

Single pipeline that fans out to all three platforms from your sGTM container (`https://sgtm.stacc.com`).

### B1. HubSpot workflow + webhook

1. **Workflow enrollment:** `Form submission = <form>` AND `ad_consent_granted = true`.
2. **Action → Send a webhook** (POST) to your sGTM Client endpoint:
   - **URL:** `https://sgtm.stacc.com/hubspot-lead` (custom path handled by a sGTM Client)
   - **Method:** POST
   - **Authentication:** include a shared secret header `X-Stacc-Token: <random-secret>` (validate in sGTM).
3. **Payload** (HubSpot lets you include contact properties):

```json
{
  "event": "generate_lead",
  "conversion_id": "{{contact.hs_object_id}}-{{form.submission_id}}",
  "occurred_at": "{{submission.timestamp}}",
  "consent": { "ad_consent_granted": "{{contact.ad_consent_granted}}" },
  "user": {
    "email": "{{contact.email}}",
    "phone": "{{contact.phone}}",
    "first_name": "{{contact.firstname}}",
    "last_name": "{{contact.lastname}}",
    "country": "{{contact.country}}"
  },
  "click_ids": {
    "gclid": "{{contact.hs_google_click_id}}",
    "fbclid": "",
    "li_fat_id": "{{contact.li_fat_id}}",
    "msclkid": "{{contact.msclkid}}"
  },
  "value": 0,
  "currency": "NOK"
}
```

> Capture `gclid` / `li_fat_id` / `msclkid` into hidden HubSpot fields on the landing page (read them from the URL/cookies at form load) so they're available here. These click IDs raise match quality dramatically.

### B2. Server-side GTM handling

1. **Client** (custom or a community "JSON HTTP" client) listens on `/hubspot-lead`:
   - Validate `X-Stacc-Token`.
   - Reject if `consent.ad_consent_granted` is not `true`.
   - Parse into the sGTM event model.
2. **Tags** (each hashes PII with SHA-256 before sending — most server tags do this automatically):
   - **Google Ads Conversion (server)** — conversion ID/label, `gclid`, user-provided data (email/phone) → Enhanced Conversions for Leads.
   - **LinkedIn CAPI tag** — conversion ID, hashed email, `li_fat_id`, event time.
   - **Microsoft CAPI / Offline Conversion** — `msclkid`, hashed email, conversion name, event time.
3. **Dedup:** pass `conversion_id` as the transaction/order ID on every tag so client-side (Phase 9c) and server-side events collapse into one.

### B3. Security & compliance notes
- Validate the shared secret on every request; rotate it periodically.
- Never log raw email/PII in sGTM; rely on built-in hashing.
- Drop (don't queue) non-consented payloads — do not store them for later.
- Keep EU data residency in mind: HubSpot portal `eu1`, and prefer sGTM hosting in the EU (Stape EU region / GCP europe-*).

---

## Field mapping reference

| Concept | HubSpot source | Google Ads | LinkedIn | Microsoft |
|---|---|---|---|---|
| Email (hashed) | `contact.email` | user-provided data | `hashedEmail` | hashed email |
| Click ID | hidden field | `gclid` | `li_fat_id` | `msclkid` |
| Event/conversion name | workflow | conversion label | conversion rule | conversion goal |
| Dedup key | `hs_object_id`+submission | order_id | event id | conversion id |
| Consent gate | `ad_consent_granted` | required | required | required |

---

## Validation
- [ ] Submit a real form with consent → webhook fires (check HubSpot workflow history).
- [ ] sGTM Preview shows the `/hubspot-lead` request parsed and tags firing.
- [ ] Conversion appears in Google Ads (Enhanced Conversions for Leads), LinkedIn, and Microsoft within their reporting windows.
- [ ] Submit **without** consent → workflow does NOT enroll / webhook NOT sent.
- [ ] Client-side (`hubspot_form_success`) and server-side conversions **dedupe** (no double counting).
