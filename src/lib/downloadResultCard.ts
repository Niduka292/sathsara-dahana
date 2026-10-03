import type { SelectionResult } from "@/src/data/dancingCrewResults";
import { getDownloadFilename, getResultHighlight } from "@/src/lib/resultPresentation";

const WIDTH = 1080;
const HEIGHT = 1350;

function roundedRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  const corner = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + corner, y);
  context.arcTo(x + width, y, x + width, y + height, corner);
  context.arcTo(x + width, y + height, x, y + height, corner);
  context.arcTo(x, y + height, x, y, corner);
  context.arcTo(x, y, x + width, y, corner);
  context.closePath();
}

function drawFittedText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  y: number,
  maxWidth: number,
  startingSize: number,
  minimumSize: number,
) {
  let size = startingSize;
  do {
    context.font = `700 ${size}px Cinzel, Georgia, serif`;
    if (context.measureText(text).width <= maxWidth) break;
    size -= 2;
  } while (size > minimumSize);
  context.fillText(text, centerX, y);
}

function drawWrappedText(
  context: CanvasRenderingContext2D,
  text: string,
  centerX: number,
  startY: number,
  maxWidth: number,
  lineHeight: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (context.measureText(candidate).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  lines.forEach((currentLine, index) => context.fillText(currentLine, centerX, startY + index * lineHeight));
  return startY + lines.length * lineHeight;
}

function drawInfoPanel(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  label: string,
  value: string,
  accent: string,
) {
  const panelGradient = context.createLinearGradient(x, y, x + width, y + 156);
  panelGradient.addColorStop(0, "rgba(255,255,255,0.075)");
  panelGradient.addColorStop(1, accent);
  roundedRect(context, x, y, width, 156, 26);
  context.fillStyle = panelGradient;
  context.fill();
  context.strokeStyle = "rgba(191,219,254,0.2)";
  context.lineWidth = 2;
  context.stroke();

  context.textAlign = "left";
  context.fillStyle = "rgba(191,219,254,0.52)";
  context.font = "600 19px Cinzel, Georgia, serif";
  context.fillText(label.toUpperCase(), x + 34, y + 50);
  context.fillStyle = "#eff6ff";
  context.font = `700 ${width < 500 ? 31 : 38}px Cinzel, Georgia, serif`;
  context.fillText(value, x + 34, y + 106);
}

function drawSoundWave(context: CanvasRenderingContext2D, centerY: number, color: string) {
  const bars = 43;
  const startX = 324;
  const gap = 10;
  context.save();
  context.lineCap = "round";
  context.lineWidth = 4;
  for (let index = 0; index < bars; index += 1) {
    const distance = Math.abs(index - (bars - 1) / 2);
    const envelope = 1 - distance / ((bars - 1) / 2);
    const height = 8 + Math.abs(Math.sin(index * 1.37)) * 35 * envelope;
    context.globalAlpha = 0.16 + envelope * 0.52;
    context.strokeStyle = color;
    context.beginPath();
    context.moveTo(startX + index * gap, centerY - height / 2);
    context.lineTo(startX + index * gap, centerY + height / 2);
    context.stroke();
  }
  context.restore();
}

function drawBackground(context: CanvasRenderingContext2D, reserve: boolean) {
  const background = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, "#02040d");
  background.addColorStop(0.5, reserve ? "#110a2a" : "#071229");
  background.addColorStop(1, "#02040d");
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const upperGlow = context.createRadialGradient(WIDTH / 2, 210, 20, WIDTH / 2, 210, 580);
  upperGlow.addColorStop(0, reserve ? "rgba(139,92,246,0.28)" : "rgba(59,130,246,0.3)");
  upperGlow.addColorStop(0.48, reserve ? "rgba(109,40,217,0.08)" : "rgba(37,99,235,0.1)");
  upperGlow.addColorStop(1, "rgba(2,4,13,0)");
  context.fillStyle = upperGlow;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const lowerGlow = context.createRadialGradient(WIDTH / 2, 1270, 10, WIDTH / 2, 1270, 580);
  lowerGlow.addColorStop(0, reserve ? "rgba(167,139,250,0.12)" : "rgba(14,165,233,0.16)");
  lowerGlow.addColorStop(1, "rgba(2,4,13,0)");
  context.fillStyle = lowerGlow;
  context.fillRect(0, 650, WIDTH, 700);

  context.save();
  context.globalCompositeOperation = "screen";
  context.lineWidth = 84;
  context.strokeStyle = reserve ? "rgba(124,58,237,0.06)" : "rgba(37,99,235,0.06)";
  context.beginPath();
  context.moveTo(-180, 470);
  context.bezierCurveTo(260, 180, 730, 740, 1260, 340);
  context.stroke();
  context.lineWidth = 30;
  context.strokeStyle = "rgba(34,211,238,0.04)";
  context.beginPath();
  context.moveTo(-120, 930);
  context.bezierCurveTo(330, 600, 790, 1120, 1210, 790);
  context.stroke();
  context.restore();

  for (let index = 0; index < 100; index += 1) {
    const x = (index * 211 + 97) % WIDTH;
    const y = (index * 137 + 53) % HEIGHT;
    context.beginPath();
    context.arc(x, y, index % 7 === 0 ? 2.2 : 1.15, 0, Math.PI * 2);
    context.fillStyle = index % 4 === 0 ? "rgba(147,197,253,0.52)" : "rgba(255,255,255,0.22)";
    context.fill();
  }

  roundedRect(context, 42, 42, WIDTH - 84, HEIGHT - 84, 44);
  context.strokeStyle = reserve ? "rgba(196,181,253,0.28)" : "rgba(147,197,253,0.28)";
  context.lineWidth = 2;
  context.stroke();
  roundedRect(context, 60, 60, WIDTH - 120, HEIGHT - 120, 36);
  context.strokeStyle = "rgba(255,255,255,0.06)";
  context.lineWidth = 1;
  context.stroke();

  const cornerLength = 80;
  context.strokeStyle = reserve ? "rgba(196,181,253,0.38)" : "rgba(125,211,252,0.42)";
  context.lineWidth = 3;
  [[86, 86, 1, 1], [WIDTH - 86, 86, -1, 1], [86, HEIGHT - 86, 1, -1], [WIDTH - 86, HEIGHT - 86, -1, -1]].forEach(([x, y, horizontal, vertical]) => {
    context.beginPath();
    context.moveTo(x, y + vertical * cornerLength);
    context.lineTo(x, y);
    context.lineTo(x + horizontal * cornerLength, y);
    context.stroke();
  });
}

export async function downloadResultCard(result: SelectionResult) {
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");

  const reserve = result.status === "reserve";
  const instrumental = result.category === "instrumental";
  const highlight = getResultHighlight(result);
  const accent = reserve ? "rgba(139,92,246,0.045)" : "rgba(59,130,246,0.035)";
  drawBackground(context, reserve);

  const lineGradient = context.createLinearGradient(180, 0, 900, 0);
  lineGradient.addColorStop(0, "rgba(96,165,250,0)");
  lineGradient.addColorStop(0.5, reserve ? "rgba(196,181,253,0.75)" : "rgba(252,211,77,0.7)");
  lineGradient.addColorStop(1, "rgba(96,165,250,0)");
  context.fillStyle = lineGradient;
  context.fillRect(180, 128, 720, 2);

  context.textAlign = "center";
  context.fillStyle = "rgba(219,234,254,0.75)";
  context.font = "600 25px Cinzel, Georgia, serif";
  context.fillText("SATHSARA DAHANA 2026", WIDTH / 2, 112);

  context.beginPath();
  context.arc(WIDTH / 2, 240, 62, 0, Math.PI * 2);
  context.fillStyle = reserve ? "rgba(139,92,246,0.12)" : "rgba(59,130,246,0.12)";
  context.fill();
  context.strokeStyle = reserve ? "rgba(196,181,253,0.36)" : "rgba(147,197,253,0.38)";
  context.lineWidth = 2;
  context.stroke();
  context.save();
  context.translate(WIDTH / 2, 240);
  context.strokeStyle = reserve ? "rgba(196,181,253,0.2)" : "rgba(125,211,252,0.22)";
  context.rotate(-0.32);
  context.beginPath();
  context.ellipse(0, 0, 115, 42, 0, 0, Math.PI * 2);
  context.stroke();
  context.rotate(0.64);
  context.beginPath();
  context.ellipse(0, 0, 115, 42, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
  context.fillStyle = reserve ? "#ddd6fe" : "#bfdbfe";
  context.font = "700 58px Georgia, serif";
  context.fillText(reserve ? "◇" : "✦", WIDTH / 2, 260);

  if (reserve) {
    context.fillStyle = "#ddd6fe";
    context.font = "600 30px Cinzel, Georgia, serif";
    context.fillText("RESERVE PERFORMER", WIDTH / 2, 382);
    context.fillStyle = "#ffffff";
    drawFittedText(context, result.name, WIDTH / 2, 482, 860, 65, 34);
    drawInfoPanel(context, 140, 550, 800, "Index Number", result.indexNumber, accent);

    context.fillStyle = "rgba(237,233,254,0.82)";
    context.font = "500 25px Arial, sans-serif";
    context.fillText("Your performance stood out to us.", WIDTH / 2, 790);
    context.fillStyle = "rgba(221,214,254,0.62)";
    context.font = "400 22px Arial, sans-serif";
    const nextY = drawWrappedText(
      context,
      "You have been placed on our Reserve Performers list and may be considered for future performance opportunities with Sathsara Dahana.",
      WIDTH / 2,
      850,
      790,
      36,
    );
    context.fillStyle = "rgba(221,214,254,0.78)";
    context.font = "500 22px Arial, sans-serif";
    context.fillText("Stay connected — your journey may continue with us.", WIDTH / 2, nextY + 28);
    drawSoundWave(context, 1120, "#c4b5fd");
  } else {
    context.fillStyle = "#fde68a";
    context.font = "600 28px Cinzel, Georgia, serif";
    context.fillText("CONGRATULATIONS", WIDTH / 2, 370);
    context.fillStyle = "rgba(219,234,254,0.62)";
    context.font = "500 18px Cinzel, Georgia, serif";
    context.fillText(instrumental ? "YOU HAVE BEEN SELECTED AS" : "YOU HAVE BEEN SELECTED FOR THE", WIDTH / 2, 425);

    context.fillStyle = "#ffffff";
    drawFittedText(context, highlight.toUpperCase(), WIDTH / 2, 505, 850, 62, 32);
    if (instrumental) {
      context.fillStyle = "rgba(219,234,254,0.6)";
      context.font = "500 18px Cinzel, Georgia, serif";
      context.fillText("IN THE SATHSARA DAHANA 2026 ORCHESTRA", WIDTH / 2, 555);
    }

    context.fillStyle = "#ffffff";
    drawFittedText(context, result.name, WIDTH / 2, instrumental ? 655 : 625, 870, 58, 32);

    drawInfoPanel(context, 140, instrumental ? 730 : 710, 800, "Index Number", result.indexNumber, accent);
    drawSoundWave(context, instrumental ? 1010 : 970, "#7dd3fc");
  }

  context.textAlign = "center";
  context.fillStyle = reserve ? "rgba(221,214,254,0.48)" : "rgba(191,219,254,0.5)";
  context.font = "500 20px Cinzel, Georgia, serif";
  context.fillText("A MUSICAL JOURNEY THROUGH TIME", WIDTH / 2, 1200);
  context.fillStyle = lineGradient;
  context.fillRect(250, 1235, 580, 2);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((image) => image ? resolve(image) : reject(new Error("The result card could not be generated.")), "image/png");
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = getDownloadFilename(result);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1_000);
}
