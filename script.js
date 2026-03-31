const app = document.getElementById("app");

// ---------- STATE ----------
const gameState = {
  currentScreen: 0,
  gender: null,
  name: ""
};

// ---------- HELPERS ----------
function getBabySprite() {
  return gameState.gender === "boy"
    ? "assets/images/boy.png"
    : "assets/images/girl.png";
}

// preload to avoid flicker on reveal
function preloadImage(src) {
  const img = new Image();
  img.src = src;
}

// ---------- AUDIO ----------
const sounds = {
  intro: new Audio("assets/audio/intro.mp3"),
  menu: new Audio("assets/audio/menu.mp3"),
  click: new Audio("assets/audio/click.wav"),
  star: new Audio("assets/audio/star.mp3"),
  shake: new Audio("assets/audio/shake.mp3"),
  celebrate: new Audio("assets/audio/celebrate.mp3"),
};

sounds.intro.loop = true;
sounds.menu.loop = true;
sounds.celebrate.loop = true;

sounds.intro.volume = 0.08;
sounds.menu.volume = 0.08;
sounds.click.volume = 0.08;
sounds.star.volume = 0.2;
sounds.shake.volume = 0.2;
sounds.celebrate.volume = 0.2;

let audioUnlocked = false;

// ---------- AUDIO HELPERS ----------
function stopAllMusic() {
  sounds.intro.pause();
  sounds.menu.pause();
  sounds.intro.currentTime = 0;
  sounds.menu.currentTime = 0;
}

function playMusic(track) {
  if (!audioUnlocked) return;
  stopAllMusic();
  sounds[track].play();
}

function playClick() {
  if (!audioUnlocked) return;
  sounds.click.currentTime = 0;
  sounds.click.play();
}

function playStarSound() {
  if (!audioUnlocked) return;
  sounds.star.currentTime = 0;
  sounds.star.play();
}

// ---------- DIALOGUE ----------
const introLines = [
  "Hello there!",
  "Welcome to the world!",
  "We are Dad and Mom.",
  "We love you very much.",
  "Your journey is just beginning..."
];

let dialogueIndex = 0;
let charIndex = 0;

// ---------- RENDER ----------
function render() {
  switch (gameState.currentScreen) {
    case 0:
      renderBoot();
      break;

    case 1:
      playMusic("intro");
      renderPresents();
      break;

    case 2:
      renderStork();
      break;

    case 3:
      playMusic("menu");
      renderMenu();
      break;

    case 4:
      renderGender();
      break;

    case 5:
      renderIntroDialogue();
      break;

    case 6:
      renderNameInput();
      break;

    case 7:
      stopAllMusic();
      renderReveal();
      break;
  }
}

// ---------- SCREENS ----------
function renderBoot() {
  app.innerHTML = `
    <div class="screen">
      <p>© 2026</p>
      <p>Not PKMN Gender Reveal</p>
      <p>Press any key...</p>
    </div>
  `;
}

function renderPresents() {
  app.innerHTML = `
    <div class="screen star-screen">
    <div class="star" style="top: -5%; right: -15%; animation-delay: 0s;"></div>
    <div class="star" style="top: -5%; right: -5%; animation-delay: 0.2s;"></div>
    <div class="star" style="top: -5%; right: -30%; animation-delay: 0.4s;"></div>
      <p class="presents-text">Jimmy Q Presents</p>
    </div>
  `;

  playStarSound();
}

function renderStork() {
  app.innerHTML = `
    <div class="screen video-screen">
      <video class="bg-video" autoplay muted loop playsinline>
        <source src="assets/video/stork.mp4" type="video/mp4">
      </video>

      <div class="top-title">
        <div>Not PKMN</div>
        <div>GENDER REVEAL</div>
      </div>

      <div class="bottom-cta">
        Press any key...
      </div>
    </div>
  `;
}

function renderMenu() {
  app.innerHTML = `
    <div class="screen">
      <div class="menu-option" onclick="startGame()">New Game</div>
      <div class="menu-option disabled">Continue</div>
      <div class="menu-option disabled">Options</div>
    </div>
  `;
}

function renderGender() {
  app.innerHTML = `
    <div class="screen">
      <p>Are you a boy or girl?</p>
      <div class="menu-option" onclick="selectGender('boy')">Boy</div>
      <div class="menu-option" onclick="selectGender('girl')">Girl</div>
    </div>
  `;
}

function renderIntroDialogue() {
  app.innerHTML = `
    <div class="screen intro-screen">
      <img src="assets/images/parents.png" class="parents-sprite" />
      <div id="dialogueBox"></div>
    </div>
  `;

  dialogueIndex = 0;
  charIndex = 0;
  typeLine();
}

function typeLine() {
  const box = document.getElementById("dialogueBox");
  if (!box) return; // user navigated away, stop typing

  if (charIndex < introLines[dialogueIndex].length) {
    box.textContent += introLines[dialogueIndex][charIndex];
    charIndex++;
    setTimeout(typeLine, 30);
  }
}

function renderNameInput() {
  app.innerHTML = `
    <div class="screen name-screen">
      <div class="name-content">
        <p>What is your name?</p>
        <input id="nameInput" placeholder="Enter name" />
        <p id="error" class="error"></p>
        <button class="confirm-btn" onclick="submitName()">Confirm</button>
      </div>

      <img src="assets/images/baby.png" class="sprite"/>
    </div>
  `;

  document.getElementById("nameInput").focus();
}

function renderReveal() {
  // preload correct sprite before animation starts
  preloadImage(getBabySprite());

  app.innerHTML = `
    <div class="screen reveal-screen">
      <img src="assets/images/baby.png" class="swaddle" />
      <div class="flash"></div>
      <p id="revealText"></p>
      <button id="shareBtn" class="share-btn" style="display:none" onclick="shareReveal()">Share 🎉</button>
    </div>
  `;

function shareReveal() {
  const name = gameState.name || "";
  const genderText = gameState.gender === "boy" ? "Boy" : "Girl";

  const shareData = {
    title: "Gender Reveal!",
    text: `It's a ${genderText}! Welcome, ${name}! 🎉`,
    url: window.location.href
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    // fallback: copy to clipboard
    navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
      alert("Copied to clipboard!");
    });
  }
}

  startRevealAnimation();
}

// ---------- ACTIONS ----------
function startGame() {
  playClick();
  gameState.currentScreen = 4;
  render();
}

function selectGender(gender) {
  playClick();
  gameState.gender = gender;

  document.body.classList.remove("boy", "girl");
  document.body.classList.add(gender);

  gameState.currentScreen = 5;
  render();
}

function submitName() {
  playClick();

  const input = document.getElementById("nameInput");
  const errorEl = document.getElementById("error");
  const value = input.value.trim();

  if (!value) {
    errorEl.textContent = "Name cannot be missing - no!";
    errorEl.style.display = "block";   // 👈 show error
    return;
  }

  // clear error when valid
  errorEl.style.display = "none";

  gameState.name = value;
  gameState.currentScreen = 7;
  render();
}

// ---------- REVEAL ----------
function startRevealAnimation() {
  const swaddle = document.querySelector(".swaddle");
  const flash = document.querySelector(".flash");

  let duration = 4;

  if (audioUnlocked) {
    sounds.shake.currentTime = 0;
    sounds.shake.play();

    if (sounds.shake.duration) {
      duration = sounds.shake.duration;
    }
  }

  // sync shake animation to audio
  swaddle.style.animation = `shake ${duration / 6}s ease 6`;

  // 🔥 slight scale before reveal (adds tension)
  setTimeout(() => {
    swaddle.style.transform = "scale(1.15)";
  }, duration * 1000 - 300);

  // 🔥 evolution moment
  setTimeout(() => {
    // flash
    flash.classList.add("active");

    // swap during flash (preloaded → no flicker)
    setTimeout(() => {
      swaddle.outerHTML = `
        <img src="${getBabySprite()}" class="sprite reveal-baby" />
      `;
    }, 120);

    // reveal text + celebration
    setTimeout(() => {
      const name = gameState.name || "";
      const genderText = gameState.gender === "boy" ? "BOY" : "GIRL";

      document.getElementById("revealText").innerHTML =
      `It's a ${genderText}!<br>Welcome, ${name}!`;

      // show share button
        const shareBtn = document.getElementById("shareBtn");
        if (shareBtn) shareBtn.style.display = "block";

      if (audioUnlocked) {
        sounds.celebrate.currentTime = 0;
        sounds.celebrate.play();
      }

      launchConfetti();
    }, 200);

  }, duration * 1000);
}

function launchConfetti() {
  for (let i = 0; i < 60; i++) {
    const c = document.createElement("div");
    c.className = "confetti";
    c.style.left = Math.random() * 100 + "%";
    c.style.background = ["#ff69b4", "#7ec8e3", "#ffd700"][Math.floor(Math.random()*3)];

    document.body.appendChild(c);

    setTimeout(() => c.remove(), 2000);
  }
}

// ---------- INPUT ----------
function advanceScreen(e) {
  // ignore clicks outside #app
  if (!e.target.closest("#app") && e.type === "click") return;
  
  if (e.target.closest("button") || e.target.closest("input")) return;

  if (!audioUnlocked) audioUnlocked = true;

  if (gameState.currentScreen === 0) gameState.currentScreen = 1;
  else if (gameState.currentScreen === 1) gameState.currentScreen = 2;
  else if (gameState.currentScreen === 2) gameState.currentScreen = 3;
  else if (gameState.currentScreen === 5) {
    if (dialogueIndex < introLines.length - 1) {
      dialogueIndex++;
      charIndex = 0;
      document.getElementById("dialogueBox").textContent = "";
      typeLine();
      return;
    } else {
      gameState.currentScreen = 6;
    }
  } else return;

  render();
}

document.addEventListener("click", advanceScreen);
document.addEventListener("keydown", advanceScreen);

// ---------- INIT ----------
render();

// ---------- MOBILE MENU ----------

// ---------- MOBILE MENU ----------
function toggleMenu() {
  const menu = document.getElementById("mobileMenu");
  const overlay = document.getElementById("mobileOverlay");
  const hamburger = document.getElementById("hamburger");
  const isOpen = menu.classList.toggle("open");
  overlay.classList.toggle("open");
  hamburger.textContent = isOpen ? "✕" : "☰";
}

function closeMenu() {
  document.getElementById("mobileMenu").classList.remove("open");
  document.getElementById("mobileOverlay").classList.remove("open");
  document.getElementById("hamburger").textContent = "☰";
}