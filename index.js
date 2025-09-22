const texts = [
  "Welcome to My Awesome Website!",
  "I build clean & modern websites.",
  "Let's create something amazing!",
  "Ready to start your project?",
  "Contact me for a free consultation!",
];

const headline = document.querySelector(".headline");
const statusEl = document.getElementById("status");
let textIndex = 0;
let charIndex = 0;
let isDeleting = false;
let isAnimating = false;

// Settings
let soundEnabled = true;
let errorsEnabled = false;
let currentSpeed = 1; // 1 = normal, 2 = fast, 0.5 = slow
const speedLabels = ["🐌 Slow Speed", "⚡ Normal Speed", "🚀 Fast Speed"];
let speedIndex = 1;

// Audio context for typewriter sounds
let audioContext;

function initAudio() {
  if (!audioContext && soundEnabled) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
}

function playTypeSound() {
  if (!soundEnabled || !audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Different frequencies for different actions
  oscillator.frequency.setValueAtTime(
    800 + Math.random() * 200,
    audioContext.currentTime
  );
  oscillator.type = "square";

  gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.1
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.1);
}

function playErrorSound() {
  if (!soundEnabled || !audioContext) return;

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  oscillator.frequency.setValueAtTime(300, audioContext.currentTime);
  oscillator.type = "sawtooth";

  gainNode.gain.setValueAtTime(0.05, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(
    0.01,
    audioContext.currentTime + 0.2
  );

  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.2);
}

function getVariableSpeed(baseSpeed) {
  // Add some natural variation to typing speed
  const variation = 0.3 + Math.random() * 0.7; // 30-100% of base speed
  return (baseSpeed * variation) / currentSpeed;
}

function shouldMakeError() {
  return errorsEnabled && Math.random() < 0.05; // 5% chance
}

function simulateError() {
  const wrongChar = String.fromCharCode(65 + Math.random() * 26); // Random A-Z
  headline.textContent += wrongChar;
  headline.classList.add("error");
  playErrorSound();

  setTimeout(() => {
    headline.classList.remove("error");
    headline.textContent = headline.textContent.slice(0, -1); // Remove wrong char
    setTimeout(() => typeEffect(), getVariableSpeed(100));
  }, 300);
}

function typeEffect() {
  if (!isAnimating) return;

  const currentText = texts[textIndex];
  statusEl.textContent = `Typing message ${textIndex + 1} of ${texts.length}`;

  if (!isDeleting) {
    // Check for error simulation
    if (shouldMakeError() && charIndex < currentText.length) {
      simulateError();
      return;
    }

    headline.textContent = currentText.substring(0, charIndex + 1);
    charIndex++;
    playTypeSound();

    if (charIndex === currentText.length) {
      isDeleting = true;
      statusEl.textContent = "Pausing...";
      setTimeout(typeEffect, 2000); // pause before deleting
      return;
    }
  } else {
    headline.textContent = currentText.substring(0, charIndex - 1);
    charIndex--;
    playTypeSound();

    if (charIndex === 0) {
      isDeleting = false;
      textIndex = (textIndex + 1) % texts.length;
      statusEl.textContent = `Next: "${texts[textIndex]}"`;
    }
  }

  const nextDelay = isDeleting ? getVariableSpeed(30) : getVariableSpeed(120);

  setTimeout(typeEffect, nextDelay);
}

// Control functions
function toggleSound() {
  soundEnabled = !soundEnabled;
  const btn = document.getElementById("soundBtn");
  btn.textContent = soundEnabled ? "🔊 Sound ON" : "🔇 Sound OFF";

  if (soundEnabled) {
    initAudio();
  } else if (audioContext) {
    audioContext.close();
    audioContext = null;
  }
}

function toggleErrors() {
  errorsEnabled = !errorsEnabled;
  const btn = document.getElementById("errorBtn");
  btn.textContent = errorsEnabled ? "✅ Errors ON" : "❌ Errors OFF";
}

function changeSpeed() {
  speedIndex = (speedIndex + 1) % speedLabels.length;
  currentSpeed = [0.5, 1, 2][speedIndex];
  document.getElementById("speedBtn").textContent = speedLabels[speedIndex];
}

function restartAnimation() {
  isAnimating = false;
  textIndex = 0;
  charIndex = 0;
  isDeleting = false;
  headline.textContent = "";
  headline.classList.remove("error");

  setTimeout(() => {
    isAnimating = true;
    statusEl.textContent = "Starting animation...";
    typeEffect();
  }, 500);
}

// Initialize
window.onload = () => {
  initAudio();
  headline.classList.add("typing");
  isAnimating = true;
  setTimeout(() => {
    typeEffect();
  }, 1000);
};

// Handle reduced motion preference
if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
  soundEnabled = false;
  currentSpeed = 3; // Much faster for reduced motion users
  document.getElementById("soundBtn").textContent = "🔇 Sound OFF";
}
