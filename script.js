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
  chat: `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20 2H4C2.897 2 2 2.897 2 4v13c0 1.103.897 2 2 2h3v3.767L13.277 19H20c1.103 0 2-.897 2-2V4c0-1.103-.897-2-2-2z" fill="${ICON}"/></svg>`,
  link: `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M8.465 11.293c.976-.977 2.559-.977 3.535 0l1.414 1.414 1.414-1.414-1.414-1.414c-1.951-1.951-5.121-1.951-7.072 0L4.929 9.293C3 11.222 3 14.363 4.929 16.293l1.414 1.414c.976.976 2.263 1.464 3.55 1.464 1.287 0 2.574-.488 3.55-1.464l1.414-1.414-1.414-1.414-1.414 1.414c-.977.977-2.559.977-3.536 0L6.343 14.879c-.977-.977-.977-2.559 0-3.536l2.122-2.05zm10.606-6.364c-1.95-1.95-5.12-1.95-7.07 0L10.586 6.343 12 7.757l1.414-1.414c.977-.977 2.559-.977 3.536 0l1.414 1.414c.977.977.977 2.559 0 3.536l-2.122 2.05c-.976.976-2.559.976-3.535 0l-1.414-1.414-1.414 1.414 1.414 1.414c.975.975 2.262 1.464 3.535 1.464 1.273 0 2.56-.489 3.535-1.464l2.122-2.05c1.95-1.95 1.95-5.12 0-7.07l-1.414-1.415z" fill="${ICON}"/></svg>`,
  linkedin: `<svg width="22" height="22" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M19 3H5c-1.105 0-2 .895-2 2v14c0 1.105.895 2 2 2h14c1.105 0 2-.895 2-2V5c0-1.105-.895-2-2-2zM8.5 18H6V10h2.5v8zM7.25 8.75A1.5 1.5 0 118.75 7.25 1.5 1.5 0 017.25 8.75zM18 18h-2.5v-3.9c0-1.05-.45-1.6-1.3-1.6-.9 0-1.45.6-1.45 1.6V18H10.25v-8h2.5v1.1c.4-.7 1.35-1.3 2.5-1.3 1.9 0 2.75 1.2 2.75 3.15V18z" fill="${ICON}"/></svg>`,
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
