# Hae San & Kristal — Wedding RSVP Site

A single-page wedding invite with a scroll-drawn hanok animation and an RSVP
form that writes into a Google Sheet.

## Files

| File | What it is |
|---|---|
| `index.html` | The whole invite (hero, story, schedule, venue map, dress code, gifts, FAQ, RSVP) |
| `styles.css` | Styling — rice-paper / ink / vermilion / celadon palette |
| `app.js` | Scroll animations + RSVP conditional logic + submission |
| `apps-script/Code.gs` | Google Apps Script that receives RSVPs into a Google Sheet |

## 1 · Connect the Google Sheet (~3 minutes)

1. Create a new Google Sheet (e.g. "Wedding RSVPs").
2. In the Sheet: **Extensions → Apps Script**.
3. Delete the placeholder code, paste in the contents of `apps-script/Code.gs`, save.
4. Click **Deploy → New deployment → Web app**:
   - *Execute as:* **Me**
   - *Who has access:* **Anyone**
5. Click **Deploy**, authorise it, and copy the **Web app URL**
   (looks like `https://script.google.com/macros/s/…/exec`).
6. Open `app.js` and paste that URL into `RSVP_ENDPOINT` at the top.

Every RSVP then appears as a row in the `RSVPs` tab — including per-event
attendance, plus-one name/email, and driving status. The `parkingEstimate`
function in the script logs a live car count any time you run it.

## 2 · Deploy (Vercel)

```bash
cd wedding-invite
npx vercel login        # one-time
npx vercel --prod       # deploys; gives you the public URL
```

(Netlify equivalent: `npx netlify-cli deploy --prod --dir .`)

## 3 · Placeholders still to fill in

Search `index.html` for `✏️` comments:

- **Event timings** — currently 11:00 AM / 4:00 PM / 7:00 PM (all TBC)
- **RSVP deadline** — currently 20 December 2026
- **Our Story** paragraph — placeholder text to replace
