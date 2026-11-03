/**
 * Google Apps Script for Sathsara Dahana 2026 — Puzzle Solver Submissions & Leaderboard
 *
 * Setup Instructions:
 * 1. Open your Google Sheet -> Extensions -> Apps Script.
 * 2. Paste this entire code into Code.gs (replacing previous contents) and save.
 * 3. Click "Deploy" -> "Manage deployments" -> Edit (pencil icon) -> Version: "New version" -> "Deploy".
 *    (Ensure "Execute as": "Me" and "Who has access": "Anyone")
 * 4. Your Web App URL remains the same or updates in .env.local as:
 *    PUZZLE_GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/.../exec
 */

function doGet(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var action = (e && e.parameter && e.parameter.action) || "get_winner";

    if (action === "reset" || action === "clear") {
      return handleReset(sheet);
    }

    return handleGetWinner(sheet);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    ensureHeader(sheet);

    var data = {};
    if (e && e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseErr) {
        data = e.parameter || {};
      }
    } else if (e && e.parameter) {
      data = e.parameter;
    }

    var action = data.action || (e && e.parameter && e.parameter.action);

    // 1. Reset / Clear all submissions back to 0
    if (action === "reset" || action === "clear") {
      return handleReset(sheet);
    }

    // 2. Query winner / status
    if (action === "get_winner" || action === "status") {
      return handleGetWinner(sheet);
    }

    // 3. New solver submission
    var fullName = (data.fullName || "").trim();
    var registrationNumber = (data.registrationNumber || "").trim();
    var email = (data.email || "").trim();

    if (!fullName && !registrationNumber && !email) {
      // Empty ping
      return handleGetWinner(sheet);
    }

    var now = new Date();
    var completedAtLocal =
      data.completedAtLocal ||
      now.toLocaleString("en-GB", { timeZone: "Asia/Colombo" });
    var completedAtIso = data.completedAtIso || now.toISOString();
    var solveTime =
      data.solveTimeSeconds !== undefined && data.solveTimeSeconds !== null
        ? data.solveTimeSeconds
        : "";
    var visitorId = data.visitorId || "";

    sheet.appendRow([
      fullName,
      registrationNumber,
      email,
      completedAtLocal,
      completedAtIso,
      solveTime,
      visitorId,
    ]);

    var lastRow = sheet.getLastRow();
    var isFirstWinner = lastRow === 2;

    var winnerRecord = {
      fullName: fullName,
      registrationNumber: registrationNumber,
      email: email,
      completedAtLocal: completedAtLocal,
      completedAtIso: completedAtIso,
      solveTimeSeconds: typeof solveTime === "number" ? solveTime : null,
      visitorId: visitorId,
    };

    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        isFirstWinner: isFirstWinner,
        claimed: true,
        totalSubmissions: Math.max(0, lastRow - 1),
        winner: isFirstWinner ? winnerRecord : null,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ status: "error", message: String(err) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function ensureHeader(sheet) {
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
}

function handleGetWinner(sheet) {
  ensureHeader(sheet);
  var lastRow = sheet.getLastRow();

  if (lastRow <= 1) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        claimed: false,
        winner: null,
        totalSubmissions: 0,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  // Row 2 is the #1 first winner
  var rowValues = sheet.getRange(2, 1, 1, 7).getValues()[0];
  var fullName = String(rowValues[0] || "").trim();
  var registrationNumber = String(rowValues[1] || "").trim();
  var email = String(rowValues[2] || "").trim();
  var completedAtLocal = String(rowValues[3] || "").trim();
  var completedAtIso = String(rowValues[4] || "").trim();
  var solveTime = rowValues[5];
  var visitorId = String(rowValues[6] || "").trim();

  if (!fullName && !registrationNumber) {
    return ContentService.createTextOutput(
      JSON.stringify({
        status: "success",
        claimed: false,
        winner: null,
        totalSubmissions: 0,
      })
    ).setMimeType(ContentService.MimeType.JSON);
  }

  var winner = {
    fullName: fullName,
    registrationNumber: registrationNumber,
    email: email,
    completedAtLocal: completedAtLocal,
    completedAtIso: completedAtIso,
    solveTimeSeconds:
      typeof solveTime === "number" && !isNaN(solveTime) ? solveTime : null,
    visitorId: visitorId,
  };

  return ContentService.createTextOutput(
    JSON.stringify({
      status: "success",
      claimed: true,
      winner: winner,
      totalSubmissions: lastRow - 1,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}

function handleReset(sheet) {
  ensureHeader(sheet);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  return ContentService.createTextOutput(
    JSON.stringify({
      status: "success",
      reset: true,
      claimed: false,
      winner: null,
      totalSubmissions: 0,
    })
  ).setMimeType(ContentService.MimeType.JSON);
}
