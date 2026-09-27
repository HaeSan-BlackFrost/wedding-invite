/**
 * Hae San & Kristal — RSVP collector
 * Paste this into a Google Apps Script bound to a Google Sheet
 * (Extensions → Apps Script from the Sheet), then deploy as a Web App.
 * Full steps in README.md.
 */

const SHEET_NAME = "RSVPs";

const HEADERS = [
  "Submitted At",
  "Full Name",
  "Email",
  "Side",
  "Attending",
  "Pax",
  "Events",
  "Plus One",
  "Plus One Name",
  "Plus One Email",
  "Children",
  "Children Count",
  "Children 12 & Below",
  "Children Names",
  "Driving",
  "Dietary",
  "Message",
];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
      sheet.setFrozenRows(1);
    } else if (sheet.getLastColumn() < HEADERS.length) {
      // the column set grew in a later version: rewrite the header row
      sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight("bold");
    }

    const p = e.parameter;
    // party headcount: the guest, the plus one if coming, and the children.
    // Total pax for the wedding = SUM of this column.
    const pax = p.attending === "accepts"
      ? 1 + (p.plusOne === "yes" ? 1 : 0) + (parseInt(p.childrenCount, 10) || 0)
      : 0;
    sheet.appendRow([
      p.submittedAt || new Date().toISOString(),
      p.fullName || "",
      p.email || "",
      p.side || "",
      p.attending || "",
      pax,
      p.events || "",
      p.plusOne || "",
      p.plusOneName || "",
      p.plusOneEmail || "",
      p.children || "",
      p.childrenCount || "",
      p.childrenUnder13 || "",
      p.childrenNames || "",
      p.driving || "",
      p.dietary || "",
      p.message || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/** Optional: quick sanity check — visit the web app URL in a browser. */
function doGet() {
  return ContentService.createTextOutput("RSVP endpoint is live 囍");
}

/**
 * Optional helper: run this from the Apps Script editor to see a
 * live parking estimate (count of parties who said they're driving).
 */
function parkingEstimate() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) {
    Logger.log("No RSVPs yet.");
    return;
  }
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
  const drivingCol = HEADERS.indexOf("Driving");
  const cars = rows.filter((r) => String(r[drivingCol]).toLowerCase() === "yes").length;
  Logger.log("Estimated cars: " + cars);
}
