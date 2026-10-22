/**
 * Hae San & Kristal — RSVP collector + confirmation email + 1-month reminder
 * Paste this into a Google Apps Script bound to a Google Sheet
 * (Extensions → Apps Script from the Sheet), then deploy as a Web App.
 * After deploying, run scheduleReminder() once from the editor to set the
 * one-month reminder for 20 January 2027, 9:00 AM Singapore time.
 */

const SHEET_NAME = "RSVPs";
const SITE = "https://haesan-blackfrost.github.io/wedding-invite/";

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
  "Lang",
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
      p.lang || "en",
    ]);

    // confirmation email — must never block the row from being saved
    try {
      sendConfirmation(p, pax);
    } catch (mailErr) {
      console.error("confirmation email failed: " + mailErr);
    }

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

/* ── shared pieces ── */

const EVENT_NAMES = {
  en: {
    "tea-ceremony": "Tea Ceremony · 5:00 PM",
    "solemnization": "Solemnization · 6:00 PM",
    "evening-banquet": "Evening Banquet · 7:00 PM",
  },
  ko: {
    "tea-ceremony": "다례식 · 오후 5시",
    "solemnization": "혼인 서약식 · 오후 6시",
    "evening-banquet": "저녁 연회 · 오후 7시",
  },
};

function eventList(eventsStr, ko) {
  const names = ko ? EVENT_NAMES.ko : EVENT_NAMES.en;
  return String(eventsStr || "")
    .split(",")
    .map(function (s) { return names[s.trim()]; })
    .filter(Boolean);
}

function validEmail(s) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s || "").trim());
}

/**
 * The pretty email card: paper ground, 囍 seal, gold names, a details table.
 * Table-based and fully inline-styled so Gmail, Outlook and Apple Mail all
 * render it the same.
 */
function weddingEmailHtml(opts) {
  // opts: { heading, intro (array of strings), details (array of [label, value]),
  //         notes (array of strings), cta (bool), ctaLabel, signoff }
  const detailRows = (opts.details || [])
    .filter(function (d) { return d && d[1]; })
    .map(function (d) {
      return (
        '<tr>' +
        '<td style="padding:7px 14px 7px 0;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#A87F2F;white-space:nowrap;vertical-align:top;font-family:Georgia,serif">' + d[0] + '</td>' +
        '<td style="padding:7px 0;font-size:15px;color:#2B2620;line-height:1.5;font-family:Georgia,serif">' + d[1] + '</td>' +
        '</tr>'
      );
    })
    .join("");

  const intro = (opts.intro || [])
    .map(function (l) { return '<p style="margin:0 0 10px;font-size:15px;line-height:1.65;color:#2B2620;font-family:Georgia,serif">' + l + '</p>'; })
    .join("");

  const notes = (opts.notes || [])
    .map(function (l) { return '<p style="margin:0 0 6px;font-size:13px;line-height:1.6;color:#6E6558;font-family:Georgia,serif">' + l + '</p>'; })
    .join("");

  const cta = opts.cta
    ? '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px auto 0"><tr><td bgcolor="#A87F2F" style="border-radius:3px">' +
      '<a href="' + SITE + '" style="display:inline-block;padding:11px 28px;font-size:12px;letter-spacing:3px;text-transform:uppercase;color:#FFFDF8;text-decoration:none;font-family:Georgia,serif">' + opts.ctaLabel + '</a>' +
      '</td></tr></table>'
    : "";

  return (
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F4EDE0"><tr><td align="center" style="padding:34px 14px">' +
    '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#FBF7EF" style="max-width:560px;border:1px solid #D9C9A3;border-radius:8px">' +
    '<tr><td align="center" style="padding:36px 32px 30px">' +
    '<div style="display:inline-block;width:54px;height:54px;line-height:54px;background:#B8432F;color:#F6DFA8;border-radius:12px;font-size:26px;text-align:center;font-family:Georgia,serif">囍</div>' +
    '<div style="padding-top:16px;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#6E6558;font-family:Georgia,serif">Tan Hae San &amp; Kristal Wong</div>' +
    '<div style="padding-top:4px;font-size:13px;font-style:italic;color:#A87F2F;font-family:Georgia,serif">20 February 2027 · Raffles Sentosa, Singapore</div>' +
    '<hr style="border:none;border-top:1px solid #D9C9A3;margin:22px 0">' +
    '<div style="font-size:21px;color:#2B2620;font-family:Georgia,serif;padding-bottom:14px">' + opts.heading + '</div>' +
    '<div style="text-align:left">' + intro + '</div>' +
    (detailRows
      ? '<table role="presentation" cellpadding="0" cellspacing="0" style="margin:14px auto 4px;text-align:left">' + detailRows + '</table>'
      : "") +
    (notes ? '<div style="text-align:left;padding-top:12px">' + notes + '</div>' : "") +
    cta +
    '<hr style="border:none;border-top:1px solid #D9C9A3;margin:26px 0 16px">' +
    '<div style="font-size:14px;font-style:italic;color:#2B2620;font-family:Georgia,serif">' + opts.signoff + '</div>' +
    '</td></tr></table>' +
    '</td></tr></table>'
  );
}

/* ── confirmation on submit ── */

function sendConfirmation(p, pax) {
  const email = String(p.email || "").trim();
  if (!validEmail(email)) return;

  const ko = p.lang === "ko";
  const accepted = p.attending === "accepts";
  const name = p.fullName || (ko ? "하객" : "Guest");
  const events = eventList(p.events, ko);

  let subject, html, text;
  if (accepted) {
    subject = ko
      ? "참석 회신이 접수되었습니다 · 해산 & 크리스탈 결혼식"
      : "Your RSVP is confirmed · Hae San & Kristal · 20 February 2027";
    const details = ko
      ? [["일시", "2027년 2월 20일 (토)"], ["장소", "래플스 센토사<br>4 Bukit Manis Road, Sentosa, Singapore 099947"], ["참석 순서", events.join("<br>")], ["일행", pax > 1 ? "총 " + pax + "명" : ""]]
      : [["Date", "20 February 2027 (Saturday)"], ["Venue", "Raffles Sentosa<br>4 Bukit Manis Road, Sentosa, Singapore 099947"], ["Joining", events.join("<br>")], ["Party", pax > 1 ? pax + " guests" : ""]];
    html = weddingEmailHtml({
      heading: ko ? "참석해 주셔서 감사합니다" : "We can't wait to see you",
      intro: ko
        ? [name + "님, 참석 회신 감사합니다. 함께해 주신다니 정말 기쁩니다."]
        : ["Dear " + name + ", thank you for your RSVP. We are so glad you will be joining us."],
      details: details,
      notes: ko
        ? ["저녁 연회에 참석하시는 경우, 오후 6시 50분까지 착석 부탁드립니다.", "일정이 변경되면 이 메일로 회신해 주세요."]
        : ["If you are joining the evening banquet, kindly be seated by 6:50 PM.", "If your plans change, just reply to this email."],
      cta: true,
      ctaLabel: ko ? "청첩장 다시 보기" : "View the invitation",
      signoff: ko ? "해산 & 크리스탈 드림 囍" : "With love, Hae San & Kristal 囍",
    });
    text = (ko
      ? [name + "님, 참석 회신 감사합니다.", "일시: 2027년 2월 20일 (토)", "장소: 래플스 센토사, 4 Bukit Manis Road, Sentosa", "참석 순서: " + events.join(" / "), "저녁 연회는 오후 6시 50분까지 착석 부탁드립니다.", SITE]
      : ["Dear " + name + ", thank you for your RSVP.", "Date: 20 February 2027 (Saturday)", "Venue: Raffles Sentosa, 4 Bukit Manis Road, Sentosa", "Joining: " + events.join(" / "), "Kindly be seated by 6:50 PM for the banquet.", SITE]
    ).join("\n");
  } else {
    subject = ko
      ? "회신 감사합니다 · 해산 & 크리스탈"
      : "Thank you for letting us know · Hae San & Kristal";
    html = weddingEmailHtml({
      heading: ko ? "마음만으로도 감사합니다" : "You will be missed",
      intro: ko
        ? [name + "님, 알려주셔서 감사합니다.", "그날 함께하지 못해 아쉽지만, 보내주신 마음 소중히 간직하겠습니다."]
        : ["Dear " + name + ", thank you for letting us know.", "We will miss you on the day, and we are grateful for your warm wishes."],
      details: [],
      notes: [],
      cta: false,
      ctaLabel: "",
      signoff: ko ? "해산 & 크리스탈 드림" : "With love, Hae San & Kristal",
    });
    text = ko
      ? name + "님, 알려주셔서 감사합니다. 보내주신 마음 소중히 간직하겠습니다."
      : "Dear " + name + ", thank you for letting us know. We will miss you on the day.";
  }

  MailApp.sendEmail({
    to: email,
    subject: subject,
    body: text,
    htmlBody: html,
    name: "Hae San & Kristal",
  });
}

/* ── one-month reminder ──
   Run scheduleReminder() ONCE from the editor. It sets a one-time trigger
   that fires sendOneMonthReminders() on 20 January 2027, 9:00 AM SGT. */

function scheduleReminder() {
  // remove any earlier reminder trigger so re-running never doubles it
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === "sendOneMonthReminders") ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger("sendOneMonthReminders")
    .timeBased()
    .at(new Date("2027-01-20T09:00:00+08:00"))
    .create();
  Logger.log("Reminder scheduled for 20 Jan 2027, 9:00 AM SGT.");
}

function sendOneMonthReminders() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return;
  const rows = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
  const col = function (n) { return HEADERS.indexOf(n); };

  // latest row per email wins; accepted guests only
  const latest = {};
  rows.forEach(function (r) {
    const email = String(r[col("Email")] || "").trim().toLowerCase();
    if (validEmail(email)) latest[email] = r;
  });

  let sent = 0;
  Object.keys(latest).forEach(function (email) {
    const r = latest[email];
    if (r[col("Attending")] !== "accepts") return;
    const ko = r[col("Lang")] === "ko";
    const name = r[col("Full Name")] || (ko ? "하객" : "Guest");
    const events = eventList(r[col("Events")], ko);
    const pax = parseInt(r[col("Pax")], 10) || 1;

    const html = weddingEmailHtml({
      heading: ko ? "결혼식까지 한 달 남았습니다" : "One month to go",
      intro: ko
        ? [name + "님, 저희 결혼식이 한 달 앞으로 다가왔습니다. 그날 뵙기를 기대하고 있습니다!"]
        : ["Dear " + name + ", our wedding is one month away, and we are so looking forward to seeing you!"],
      details: ko
        ? [["일시", "2027년 2월 20일 (토)"], ["장소", "래플스 센토사<br>4 Bukit Manis Road, Sentosa, Singapore 099947"], ["참석 순서", events.join("<br>")], ["일행", pax > 1 ? "총 " + pax + "명" : ""], ["복장", "정장"]]
        : [["Date", "20 February 2027 (Saturday)"], ["Venue", "Raffles Sentosa<br>4 Bukit Manis Road, Sentosa, Singapore 099947"], ["Joining", events.join("<br>")], ["Party", pax > 1 ? pax + " guests" : ""], ["Dress code", "Formal attire"]],
      notes: ko
        ? ["저녁 연회에 참석하시는 경우, 오후 6시 50분까지 착석 부탁드립니다.", "변경 사항이 있으면 이 메일로 회신해 주세요."]
        : ["If you are joining the evening banquet, kindly be seated by 6:50 PM.", "Any changes, just reply to this email."],
      cta: true,
      ctaLabel: ko ? "오시는 길 보기" : "Directions & details",
      signoff: ko ? "곧 뵙겠습니다 · 해산 & 크리스탈 드림 囍" : "See you very soon · Hae San & Kristal 囍",
    });

    try {
      MailApp.sendEmail({
        to: email,
        subject: ko
          ? "한 달 남았습니다 · 해산 & 크리스탈 결혼식 · 2027년 2월 20일"
          : "One month to go · Hae San & Kristal · 20 February 2027",
        body: (ko ? "결혼식까지 한 달 남았습니다. " : "One month to our wedding. ") + SITE,
        htmlBody: html,
        name: "Hae San & Kristal",
      });
      sent++;
    } catch (err) {
      console.error("reminder to " + email + " failed: " + err);
    }
  });
  Logger.log("Reminders sent: " + sent);
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
  const cars = rows.filter(function (r) { return String(r[drivingCol]).toLowerCase() === "yes"; }).length;
  Logger.log("Estimated cars: " + cars);
}
