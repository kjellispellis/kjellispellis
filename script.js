const LOGO_URL = "https://www.stacc.com/stacc_logo.png";
const TEXT = "#1a1f2b";
const MUTED = "#5b6472";
const ICON = "#B6B6B6";

const SITE_LINKS = [
  { label: "stacc.com", href: "https://www.stacc.com" },
  { label: "Products", href: "https://www.stacc.com/products" },
  { label: "Solutions", href: "https://www.stacc.com/solutions" },
  { label: "News", href: "https://www.stacc.com/news" },
  { label: "Guides", href: "https://www.stacc.com/guides" },
  { label: "Locations", href: "https://www.stacc.com/locations" },
  { label: "About Stacc", href: "https://www.stacc.com/about" },
];
const COMPANY_LINKEDIN = "https://www.linkedin.com/company/stacc";

const ICONS = {
  person: `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 1C5.935 1 1 5.935 1 12C1 18.065 5.935 23 12 23C18.065 23 23 18.065 23 12C23 5.935 18.065 1 12 1ZM9.289 7.209C9.979 6.44 10.968 6 12 6C13.032 6 14.021 6.44 14.711 7.209C15.401 7.977 15.734 9.006 15.624 10.033L15.54 10.819C15.346 12.632 13.823 14 12 14C10.177 14 8.654 12.632 8.46 10.819L8.376 10.033C8.266 9.006 8.599 7.977 9.289 7.209ZM12 21C9.409 21 7.078 19.893 5.434 18.136C5.636 17.544 6.091 17.074 6.685 16.877C10.21 15.712 13.788 15.711 17.313 16.877C17.908 17.074 18.362 17.544 18.565 18.137C16.921 19.894 14.59 21 12 21Z" fill="${ICON}"/></svg>`,
  chat: `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.346 2 1 3.346 1 5V16C1 17.654 2.346 19 4 19H8.5L12 23.667L15.5 19H20C21.654 19 23 17.654 23 16V5C23 3.346 21.654 2 20 2Z" fill="${ICON}"/></svg>`,
  link: `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 19H7C3.141 19 0 15.86 0 12C0 8.14 3.141 5 7 5H10V7H7C4.243 7 2 9.243 2 12C2 14.757 4.243 17 7 17H10V19Z" fill="${ICON}"/><path d="M17 19H14V17H17C19.757 17 22 14.757 22 12C22 9.243 19.757 7 17 7H14V5H17C20.859 5 24 8.14 24 12C24 15.86 20.859 19 17 19Z" fill="${ICON}"/><path d="M17 11H7V13H17V11Z" fill="${ICON}"/></svg>`,
  linkedin: `<svg width="22" height="22" viewBox="0 0 22 22" xmlns="http://www.w3.org/2000/svg"><path d="M20 0C21.1046 0 22 0.895431 22 2V20C22 21.1046 21.1046 22 20 22H2C0.895431 22 3.22133e-08 21.1046 0 20V2C0 0.895431 0.895431 3.22128e-08 2 0H20ZM14.4375 8.72461C13.8768 8.69942 13.3185 8.80661 12.8184 9.03613C12.3182 9.26576 11.8935 9.60983 11.5869 10.0332H11.5078V8.92676H8.8584V17.042H11.6758V12.7266C11.6347 12.2842 11.7897 11.8451 12.1064 11.5049C12.4232 11.1648 12.8762 10.9511 13.3672 10.9102H13.4736C14.3699 10.9102 15.036 11.4175 15.0361 12.6953V17.043H17.8535L17.875 12.1123C17.875 9.67295 16.1504 8.72461 14.4375 8.72461ZM4.34961 17.042H7.16797V8.92676H4.34961V17.042ZM5.75879 4.66602C5.32551 4.66609 4.90989 4.82094 4.60352 5.09668C4.29714 5.37248 4.125 5.74672 4.125 6.13672C4.12507 6.52669 4.29712 6.901 4.60352 7.17676C4.90988 7.45244 5.32556 7.60734 5.75879 7.60742C6.18903 7.61668 6.60636 7.47126 6.91797 7.2041C7.22935 6.937 7.41026 6.56965 7.4209 6.18262V6.1377C7.42244 5.94582 7.38192 5.75495 7.30176 5.57715C7.22167 5.39963 7.10349 5.23806 6.9541 5.10156C6.80449 4.96495 6.62599 4.85595 6.42969 4.78125C6.23343 4.70659 6.02263 4.66744 5.80957 4.66602H5.75879Z" fill="${ICON}"/></svg>`,
};

const form = document.getElementById("signature-form");
const preview = document.getElementById("signature-preview");
const copyButton = document.getElementById("copy-button");
const copyStatus = document.getElementById("copy-status");

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const link = (href, label, color = TEXT) =>
  `<a href="${escapeHtml(href)}" style="color:${color};text-decoration:none;">${escapeHtml(label)}</a>`;

function row(icon, content, bottomPad = 6) {
  return `
    <tr>
      <td style="vertical-align:top;padding:2px 12px ${bottomPad}px 0;width:22px;">${icon}</td>
      <td style="vertical-align:top;padding-bottom:${bottomPad}px;">${content}</td>
    </tr>
  `;
}

function buildSignature(data) {
  const titleLine = [data.title, data.entity].filter(Boolean).map(escapeHtml).join(", ");

  const personBlock = [
    `<div style="font-weight:bold;color:${TEXT};">${escapeHtml(data.name || "Your Name")}</div>`,
    titleLine ? `<div style="color:${MUTED};margin-top:2px;">${titleLine}</div>` : "",
    data.expertise ? `<div style="color:${MUTED};margin-top:2px;">${escapeHtml(data.expertise)}</div>` : "",
  ].filter(Boolean).join("");

  const contactParts = [];
  if (data.phone) contactParts.push(escapeHtml(data.phone));
  if (data.email) contactParts.push(link(`mailto:${data.email}`, data.email));
  const contactLine = contactParts.join(` <span style="color:${MUTED};"> / </span> `);

  const linkedInLine = data.linkedin
    ? link(data.linkedin, "Connect on LinkedIn")
    : `<span style="color:${MUTED};">Connect on LinkedIn</span>`;

  const contactBlock = [
    contactLine ? `<div>${contactLine}</div>` : "",
    `<div style="margin-top:4px;">${linkedInLine}</div>`,
  ].filter(Boolean).join("");

  const siteNav = SITE_LINKS
    .map((item) => link(item.href, item.label, MUTED))
    .join(` <span style="color:${MUTED};">/</span> `);

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:${TEXT};line-height:1.5;">
      <tr><td colspan="2" style="color:${MUTED};padding-bottom:12px;">Best regards</td></tr>
      ${row(ICONS.person, personBlock, 14)}
      ${row(ICONS.chat, contactBlock, 16)}
      <tr><td colspan="2" style="padding-bottom:12px;"><img src="${LOGO_URL}" alt="Stacc" style="height:36px;display:block;" /></td></tr>
      ${row(ICONS.link, `<span style="color:${MUTED};font-size:13px;">${siteNav}</span>`, 4)}
      ${row(ICONS.linkedin, `<span style="color:${MUTED};font-size:13px;">${link(COMPANY_LINKEDIN, "linkedin.com/stacc", MUTED)}</span>`, 0)}
    </table>
  `.trim();
}

function readForm() {
  const data = {};
  for (const element of form.elements) {
    if (element.name) data[element.name] = element.value.trim();
  }
  return data;
}

function render() {
  preview.innerHTML = buildSignature(readForm());
}

async function copySignature() {
  const html = preview.innerHTML;
  const text = preview.innerText;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([text], { type: "text/plain" }),
        }),
      ]);
    } else {
      const range = document.createRange();
      range.selectNodeContents(preview);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      document.execCommand("copy");
      selection.removeAllRanges();
    }
    setStatus("Copied! Paste into your email signature settings.");
  } catch (err) {
    setStatus("Couldn't copy automatically — select the preview and copy manually.");
    console.error(err);
  }
}

function setStatus(message) {
  copyStatus.textContent = message;
  clearTimeout(setStatus._timer);
  setStatus._timer = setTimeout(() => {
    copyStatus.textContent = "";
  }, 4000);
}

form.addEventListener("input", render);
copyButton.addEventListener("click", copySignature);
render();
