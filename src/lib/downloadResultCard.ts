import type { SelectionResult } from "@/src/data/dancingCrewResults";

// Portrait 4:5 format, ideal for phone galleries and social sharing.
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

function drawInfoPanel(
  context: CanvasRenderingContext2D,
  y: number,
  label: string,
  value: string,
) {
  const x = 140;
  const panelGradient = context.createLinearGradient(x, y, x + 800, y + 160);
  panelGradient.addColorStop(0, "rgba(255,255,255,0.075)");
  panelGradient.addColorStop(1, "rgba(59,130,246,0.035)");

  roundedRect(context, x, y, 800, 160, 28);
  context.fillStyle = panelGradient;
  context.fill();
  context.strokeStyle = "rgba(147,197,253,0.22)";
  context.lineWidth = 2;
  context.stroke();

  context.beginPath();
  context.arc(x + 736, y + 80, 34, 0, Math.PI * 2);
  context.fillStyle = "rgba(96,165,250,0.11)";
  context.fill();
  context.strokeStyle = "rgba(147,197,253,0.24)";
  context.stroke();
  context.textAlign = "center";
  context.fillStyle = "rgba(219,234,254,0.65)";
  context.font = "600 17px Cinzel, Georgia, serif";
  context.fillText("ID", x + 736, y + 87);

  context.textAlign = "left";
  context.fillStyle = "rgba(191,219,254,0.55)";
  context.font = "600 22px Cinzel, Georgia, serif";
  context.fillText(label.toUpperCase(), x + 42, y + 52);

  context.fillStyle = "#eff6ff";
  context.font = "700 42px Cinzel, Georgia, serif";
  context.fillText(value, x + 42, y + 112);
}

function drawSoundWave(context: CanvasRenderingContext2D, centerY: number) {
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
    const alpha = 0.15 + envelope * 0.5;
    context.strokeStyle = `rgba(125,211,252,${alpha})`;
    context.beginPath();
    context.moveTo(startX + index * gap, centerY - height / 2);
    context.lineTo(startX + index * gap, centerY + height / 2);
    context.stroke();
  }
  context.restore();
}

export async function downloadResultCard(result: SelectionResult, categoryName: string) {
  await document.fonts.ready;

  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not available in this browser.");

  const background = context.createLinearGradient(0, 0, WIDTH, HEIGHT);
  background.addColorStop(0, "#02040d");
  background.addColorStop(0.52, "#071229");
  background.addColorStop(1, "#02040d");
  context.fillStyle = background;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const upperGlow = context.createRadialGradient(WIDTH / 2, 190, 20, WIDTH / 2, 190, 560);
  upperGlow.addColorStop(0, "rgba(59,130,246,0.3)");
  upperGlow.addColorStop(0.45, "rgba(37,99,235,0.1)");
  upperGlow.addColorStop(1, "rgba(2,4,13,0)");
  context.fillStyle = upperGlow;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  const lowerGlow = context.createRadialGradient(WIDTH / 2, 1280, 10, WIDTH / 2, 1280, 560);
  lowerGlow.addColorStop(0, "rgba(14,165,233,0.16)");
  lowerGlow.addColorStop(1, "rgba(2,4,13,0)");
  context.fillStyle = lowerGlow;
  context.fillRect(0, 650, WIDTH, 700);

  context.save();
  context.globalCompositeOperation = "screen";
  context.lineWidth = 90;
  context.strokeStyle = "rgba(37,99,235,0.06)";
  context.beginPath();
  context.moveTo(-180, 470);
  context.bezierCurveTo(260, 180, 730, 740, 1260, 340);
  context.stroke();
  context.lineWidth = 34;
  context.strokeStyle = "rgba(34,211,238,0.045)";
  context.beginPath();
  context.moveTo(-120, 930);
  context.bezierCurveTo(330, 600, 790, 1120, 1210, 790);
  context.stroke();
  context.restore();

  for (let index = 0; index < 90; index += 1) {
    const x = (index * 211 + 97) % WIDTH;
    const y = (index * 137 + 53) % HEIGHT;
    const radius = index % 7 === 0 ? 2.2 : 1.2;
    context.beginPath();
    context.arc(x, y, radius, 0, Math.PI * 2);
    context.fillStyle = index % 4 === 0 ? "rgba(147,197,253,0.55)" : "rgba(255,255,255,0.24)";
    context.fill();
  }

  roundedRect(context, 42, 42, WIDTH - 84, HEIGHT - 84, 44);
  context.strokeStyle = "rgba(147,197,253,0.28)";
  context.lineWidth = 2;
  context.stroke();

  const cornerLength = 82;
  context.strokeStyle = "rgba(125,211,252,0.42)";
  context.lineWidth = 3;
  [[86, 86, 1, 1], [WIDTH - 86, 86, -1, 1], [86, HEIGHT - 86, 1, -1], [WIDTH - 86, HEIGHT - 86, -1, -1]].forEach(([x, y, horizontal, vertical]) => {
    context.beginPath();
    context.moveTo(x, y + vertical * cornerLength);
    context.lineTo(x, y);
    context.lineTo(x + horizontal * cornerLength, y);
    context.stroke();
  });
  roundedRect(context, 60, 60, WIDTH - 120, HEIGHT - 120, 36);
  context.strokeStyle = "rgba(255,255,255,0.06)";
  context.lineWidth = 1;
  context.stroke();

  const lineGradient = context.createLinearGradient(180, 0, 900, 0);
  lineGradient.addColorStop(0, "rgba(96,165,250,0)");
  lineGradient.addColorStop(0.5, "rgba(147,197,253,0.8)");
  lineGradient.addColorStop(1, "rgba(96,165,250,0)");
  context.fillStyle = lineGradient;
  context.fillRect(180, 128, 720, 2);

  context.textAlign = "center";
  context.fillStyle = "rgba(219,234,254,0.72)";
  context.font = "600 25px Cinzel, Georgia, serif";
  context.fillText("SATHSARA DAHANA 2026", WIDTH / 2, 112);

  context.beginPath();
  context.arc(WIDTH / 2, 240, 62, 0, Math.PI * 2);
  context.fillStyle = "rgba(59,130,246,0.12)";
  context.fill();
  context.strokeStyle = "rgba(147,197,253,0.38)";
  context.lineWidth = 2;
  context.stroke();
  context.save();
  context.translate(WIDTH / 2, 240);
  context.strokeStyle = "rgba(125,211,252,0.22)";
  context.lineWidth = 2;
  context.rotate(-0.32);
  context.beginPath();
  context.ellipse(0, 0, 115, 42, 0, 0, Math.PI * 2);
  context.stroke();
  context.rotate(0.64);
  context.beginPath();
  context.ellipse(0, 0, 115, 42, 0, 0, Math.PI * 2);
  context.stroke();
  context.restore();
  context.fillStyle = "#bfdbfe";
  context.font = "700 58px Georgia, serif";
  context.fillText("✦", WIDTH / 2, 260);

  roundedRect(context, WIDTH / 2 - 144, 318, 288, 44, 22);
  context.fillStyle = "rgba(59,130,246,0.14)";
  context.fill();
  context.strokeStyle = "rgba(147,197,253,0.28)";
  context.lineWidth = 1;
  context.stroke();
  context.fillStyle = "rgba(219,234,254,0.72)";
  context.font = "600 17px Cinzel, Georgia, serif";
  context.fillText("OFFICIAL SELECTION", WIDTH / 2, 346);

  context.fillStyle = "#dbeafe";
  context.font = "600 27px Cinzel, Georgia, serif";
  context.fillText("CONGRATULATIONS", WIDTH / 2, 408);

  context.fillStyle = "#ffffff";
  drawFittedText(context, result.name, WIDTH / 2, 500, 880, 68, 36);

  context.fillStyle = "rgba(219,234,254,0.7)";
  context.font = "400 27px Arial, sans-serif";
  context.fillText(`You are selected for the ${categoryName}`, WIDTH / 2, 574);
  context.fillText("of Sathsara Dahana 2026.", WIDTH / 2, 612);

  context.fillStyle = lineGradient;
  context.fillRect(250, 654, 580, 2);

  drawInfoPanel(context, 760, "Index Number", result.indexNumber);

  drawSoundWave(context, 1010);

  context.textAlign = "center";
  context.fillStyle = "rgba(191,219,254,0.48)";
  context.font = "500 20px Cinzel, Georgia, serif";
  context.fillText("WELCOME TO THE JOURNEY", WIDTH / 2, 1100);

  context.fillStyle = "rgba(255,255,255,0.25)";
  context.font = "400 18px Arial, sans-serif";
  context.fillText("We are excited to have you with us.", WIDTH / 2, 1138);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((image) => {
      if (image) resolve(image);
      else reject(new Error("The result card could not be generated."));
    }, "image/png");
  });

  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeIndex = result.indexNumber.replace(/[^a-z0-9_-]+/gi, "-");
  link.href = objectUrl;
  link.download = `sathsara-dahana-2026-${safeIndex}.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
