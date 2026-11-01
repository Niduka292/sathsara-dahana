/**
 * Google Apps Script for Sathsara Dahana 2026 — Puzzle Solver Submissions
 *
 * Setup Instructions:
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Paste this code into Code.gs and save.
 * 3. Click "Deploy" -> "New deployment".
 * 4. Select type: "Web app".
 * 5. Set "Execute as": "Me" and "Who has access": "Anyone".
 * 6. Click "Deploy", copy the Web App URL (ends in /exec), and add it to your
 *    environment variables (.env.local / Netlify / Vercel) as:
 *    PUZZLE_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // Initialize header row if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Full Name",
        "Registration Number",
        "Email",
        "Completed At (Sri Lanka Time)",
        "Completed At (ISO)",
        "Solve Time (Seconds)",
        "Visitor ID",
      ]);
    }

    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    sheet.appendRow([
      data.fullName || "",
      data.registrationNumber || "",
      data.email || "",
      data.completedAtLocal || new Date().toLocaleString("en-GB", { timeZone: "Asia/Colombo" }),
      data.completedAtIso || new Date().toISOString(),
      data.solveTimeSeconds !== undefined && data.solveTimeSeconds !== null ? data.solveTimeSeconds : "",
      data.visitorId || "",
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ status: "success" })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
