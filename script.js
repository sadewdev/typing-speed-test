const quotes = [
  "The quick brown fox jumps over the lazy dog.",
  "Typing is a skill that improves with practice.",
  "Always aim for accuracy before speed.",
  "JavaScript and Tailwind make a great combo.",
  "Focus and consistency are the keys to mastery."
];

let currentQuote = "";
let startTime, timerInterval;
let isTyping = false;
let totalPoints = 0;

const quoteDisplay = document.getElementById("quoteDisplay");
const quoteInput = document.getElementById("quoteInput");
const timerEl = document.getElementById("timer");
const wpmEl = document.getElementById("wpm");
const accuracyEl = document.getElementById("accuracy");
const progressBar = document.getElementById("progressBar");
const pointsDisplay = document.getElementById("pointsDisplay");

function loadNewQuote() {
  currentQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteDisplay.innerHTML = currentQuote
    .split("")
    .map(char => `<span>${char}</span>`)
    .join("");
  quoteInput.value = "";
  timerEl.textContent = "0";
  wpmEl.textContent = "0";
  accuracyEl.textContent = "100";
  progressBar.style.width = "0%";
  clearInterval(timerInterval);
  isTyping = false;
}

function startTyping() {
  if (!isTyping) {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
    isTyping = true;
  }

  const input = quoteInput.value;
  const chars = quoteDisplay.querySelectorAll("span");
  let correct = 0;

  chars.forEach((char, i) => {
    const typed = input[i];
    if (typed == null) {
      char.classList.remove("text-green-500", "text-red-500");
    } else if (typed === char.textContent) {
      char.classList.add("text-green-500");
      char.classList.remove("text-red-500");
      correct++;
    } else {
      char.classList.add("text-red-500");
      char.classList.remove("text-green-500");
    }
  });

  const percent = (input.length / currentQuote.length) * 100;
  progressBar.style.width = `${Math.min(percent, 100)}%`;

  if (input === currentQuote) {
    finishTest();
  }
}

function updateTimer() {
  const time = Math.floor((new Date() - startTime) / 1000);
  timerEl.textContent = time;
}

function finishTest() {
  clearInterval(timerInterval);
  const time = Math.floor((new Date() - startTime) / 1000);
  const wordCount = currentQuote.split(" ").length;
  const wpm = Math.round((wordCount / time) * 60);
  const input = quoteInput.value;
  let correct = 0;
  for (let i = 0; i < input.length; i++) {
    if (input[i] === currentQuote[i]) correct++;
  }
  const accuracy = Math.round((correct / currentQuote.length) * 100);
  const points = Math.round((wpm * accuracy) / 10); // Simple formula

  // Update UI
  timerEl.textContent = time;
  wpmEl.textContent = wpm;
  accuracyEl.textContent = accuracy;

  // Save & display
  savePoints(points);
  showResultModal(time, wpm, accuracy, points);
}

function restartTest() {
  loadNewQuote();
}

function showResultModal(time, wpm, accuracy, points) {
  document.getElementById("modalTime").textContent = time;
  document.getElementById("modalWpm").textContent = wpm;
  document.getElementById("modalAccuracy").textContent = accuracy;
  document.getElementById("modalPoints").textContent = points;
  document.getElementById("resultModal").classList.remove("hidden");
}

function closeModal() {
  document.getElementById("resultModal").classList.add("hidden");
  restartTest();
}

function showPointPopup() {
  document.getElementById("pointPopup").classList.remove("hidden");
}
function closePointPopup() {
  document.getElementById("pointPopup").classList.add("hidden");
}

// IndexedDB for points storage
function savePoints(points) {
  totalPoints += points;
  updatePointsDisplay();

  const request = indexedDB.open("TypingDB", 1);
  request.onupgradeneeded = function (e) {
    const db = e.target.result;
    db.createObjectStore("points", { keyPath: "id" });
  };
  request.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("points", "readwrite");
    const store = tx.objectStore("points");
    store.put({ id: "total", value: totalPoints });
  };
}

function loadPoints() {
  const request = indexedDB.open("TypingDB", 1);
  request.onsuccess = function (e) {
    const db = e.target.result;
    const tx = db.transaction("points", "readonly");
    const store = tx.objectStore("points");
    const getReq = store.get("total");
    getReq.onsuccess = function () {
      totalPoints = getReq.result?.value || 0;
      updatePointsDisplay();
    };
  };
}

function updatePointsDisplay() {
  pointsDisplay.textContent = totalPoints;
}

window.onload = () => {
  loadPoints();
  loadNewQuote();
};

window.onload = () => {
  loadPoints();
  loadNewQuote();

  // Smoothly fade out loader and show app
  const loader = document.getElementById("loadingScreen");
  const appCard = document.querySelector(".bg-white");
  setTimeout(() => {
    loader.classList.add("fade-out");
    appCard.classList.add("app-appear");
  }, 1200); // match your Lottie load time
};


