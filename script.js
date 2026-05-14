const LOGO_URL = "https://www.stacc.com/stacc-logo.png";
const ACCENT = "#0057ff";
const TEXT = "#1a1f2b";
const MUTED = "#5b6472";

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

const link = (href, label, color = ACCENT) =>
  `<a href="${escapeHtml(href)}" style="color:${color};text-decoration:none;">${escapeHtml(label)}</a>`;

function buildSignature(data) {
  const titleLine = [data.title, data.department].filter(Boolean).map(escapeHtml).join(" &middot; ");
  const contactLines = [];

  if (data.email) {
    contactLines.push(link(`mailto:${data.email}`, data.email));
  }
  if (data.phone) {
    contactLines.push(escapeHtml(data.phone));
  }
  if (data.location) {
    contactLines.push(escapeHtml(data.location));
  }
  if (data.linkedin) {
    contactLines.push(link(data.linkedin, "LinkedIn"));
  }

  return `
    <table cellpadding="0" cellspacing="0" border="0" style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:${TEXT};line-height:1.45;">
      <tr>
        <td style="padding-right:16px;vertical-align:top;border-right:2px solid ${ACCENT};">
          <img src="${LOGO_URL}" alt="Stacc" style="height:40px;display:block;" />
        </td>
        <td style="padding-left:16px;vertical-align:top;">
          <div style="font-size:15px;font-weight:bold;color:${TEXT};">${escapeHtml(data.name || "Your Name")}</div>
          ${titleLine ? `<div style="color:${MUTED};margin-top:2px;">${titleLine}</div>` : ""}
          ${contactLines.length ? `<div style="margin-top:8px;">${contactLines.join(' <span style="color:' + MUTED + ';"> &middot; </span> ')}</div>` : ""}
        </td>
      </tr>
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
