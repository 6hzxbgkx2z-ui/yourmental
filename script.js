const STORAGE_KEY = "emotion_logs";

document.getElementById("saveBtn").addEventListener("click", saveLog);

function getLogs() {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
}

function saveLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

function saveLog() {
  const emotion = document.getElementById("emotion").value;
  const intensity = document.getElementById("intensity").value;
  const note = document.getElementById("note").value;

  const log = {
    date: new Date().toLocaleDateString(),
    emotion,
    intensity,
    note
  };

  const logs = getLogs();
  logs.unshift(log);
  saveLogs(logs);

  document.getElementById("note").value = "";
  renderLogs();
}

function renderLogs() {
  const logs = getLogs();
  const container = document.getElementById("logs");
  container.innerHTML = "";

  logs.slice(0, 7).forEach(log => {
    const div = document.createElement("div");
    div.className = "log";
    div.innerHTML = `
      <div>${log.date}</div>
      <div class="emotion">${log.emotion}（強度 ${log.intensity}）</div>
      <div>${log.note || ""}</div>
    `;
    container.appendChild(div);
  });

  analyzeLogs();
}

function analyzeLogs() {
  const logs = getLogs().slice(0, 7);
  const analysisDiv = document.getElementById("analysis");

  if (logs.length === 0) {
    analysisDiv.textContent = "まだデータがありません。";
    return;
  }

  const counts = {};
  logs.forEach(log => {
    counts[log.emotion] = (counts[log.emotion] || 0) + 1;
  });

  drawPieChart(counts);

  let maxEmotion = "";
  let maxCount = 0;
  for (const emotion in counts) {
    if (counts[emotion] > maxCount) {
      maxCount = counts[emotion];
      maxEmotion = emotion;
    }
  }

  const comments = {
    "不安": "不安が多い傾向です。予定や環境の負荷を少し下げてみましょう。",
    "怒り": "感情が外に向きやすい時期かもしれません。距離を取る時間を。",
    "悲しみ": "心が疲れているサインかもしれません。休息を優先して。",
    "安心": "安定した状態が続いています。このペースを大切に。",
    "喜び": "前向きな感情が多く、良い流れにあります。"
  };

  analysisDiv.textContent = comments[maxEmotion];
}

function drawPieChart(counts) {
  const canvas = document.getElementById("emotionChart");
  const ctx = canvas.getContext("2d");

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  if (total === 0) return;

  const colors = {
    "安心": "#6fcf97",
    "怒り": "#eb5757",
    "悲しみ": "#2f80ed",
    "不安": "#f2c94c",
    "喜び": "#bb6bd9"
  };

  let startAngle = -0.5 * Math.PI;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (const emotion in counts) {
    const value = counts[emotion];
    const angle = (value / total) * 2 * Math.PI;

    ctx.beginPath();
    ctx.moveTo(120, 120);
    ctx.arc(120, 120, 110, startAngle, startAngle + angle);
    ctx.closePath();
    ctx.fillStyle = colors[emotion] || "#ccc";
    ctx.fill();

    startAngle += angle;
  }
}

renderLogs();
