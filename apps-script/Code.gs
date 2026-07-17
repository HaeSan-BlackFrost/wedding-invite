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
  "Attending",
  "Events",
  "Plus One",
  "Plus One Name",
  "Plus One Email",
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
    }

    const p = e.parameter;
    sheet.appendRow([
      p.submittedAt || new Date().toISOString(),
      p.fullName || "",
      p.email || "",
      p.attending || "",
      p.events || "",
      p.plusOne || "",
      p.plusOneName || "",
      p.plusOneEmail || "",
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
