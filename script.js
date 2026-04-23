const app = document.getElementById("app");

// ---------- CIPHER ----------
const CIPHER_SHIFT = 7;

function encodeName(name) {
  return name.split('').map(c => {
    if (c.match(/[a-z]/i)) {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + CIPHER_SHIFT) % 26 + base);
    }
    return c;
  }).join('');
}

function decodeName(encoded) {
  return encoded.split('').map(c => {
    if (c.match(/[a-z]/i)) {
      const base = c <= 'Z' ? 65 : 97;
      return String.fromCharCode((c.charCodeAt(0) - base + 26 - CIPHER_SHIFT) % 26 + base);
    }
    return c;
  }).join('');
}

// ---------- STATE ----------
const gameState = {
  currentScreen: 0,
  gender: null,
  name: "",
  isShared: false
};

// ---------- SHARED MODE DETECTION ----------
(function detectSharedLink() {
  const params = new URLSearchParams(window.location.search);
  const g = params.get('g');
  const n = params.get('n');

  if (g && n) {
    gameState.isShared = true;
    gameState.gender = g === 'b' ? 'boy' : 'girl';
    gameState.name = decodeName(n);
    gameState.currentScreen = 0;
  }
})();

// ---------- HELPERS ----------
function getBabySprite() {
  return gameState.gender === "boy"
    ? "assets/images/boy.png"
    : "assets/images/girl.png";
}

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

const sharedLines = [
  "Hi there!",
  "We have some news...",
  "We are expecting a baby!",
  "We are so excited to share this with you.",
  "Are you ready to find out?"
];

let dialogueIndex = 0;
let charIndex = 0;
let currentLines = [];

// ---------- RENDER ----------
function render() {
  if (gameState.isShared) {
    switch (gameState.currentScreen) {
      case 0: renderBoot(); break;
      case 10: playMusic("intro"); renderPresents(); break;
      case 11: renderStork(); break;
      case 12: renderSharedDialogue(); break;
      case 13: stopAllMusic(); renderReveal(); break;
    }
    return;
  }

  switch (gameState.currentScreen) {
    case 0: renderBoot(); break;
    case 1: playMusic("intro"); renderPresents(); break;
    case 2: renderStork(); break;
    case 3: playMusic("menu"); renderMenu(); break;
    case 4: renderGender(); break;
    case 5: renderIntroDialogue(); break;
    case 6: renderNameInput(); break;
    case 7: stopAllMusic(); renderReveal(); break;
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
  const preloadVideo = document.createElement("video");
  preloadVideo.style.display = "none";
  const source = document.createElement("source");
  source.src = "assets/video/stork.mp4";
  source.type = "video/mp4";
  preloadVideo.appendChild(source);
  preloadVideo.preload = "auto";
  document.body.appendChild(preloadVideo);

  const isMobile = window.innerWidth <= 996;

  const stars = isMobile ? [
    { right: '10%', delay: '0s' },
    { right: '5%', delay: '0.2s' },
    { right: '25%', delay: '0.4s' },
  ] : [
    { right: '-15%', delay: '0s' },
    { right: '-5%', delay: '0.2s' },
    { right: '-30%', delay: '0.4s' },
  ];

  app.innerHTML = `
    <div class="screen star-screen">
      <div class="star" style="top: -5%; right: ${stars[0].right}; animation-delay: ${stars[0].delay};"></div>
      <div class="star" style="top: -5%; right: ${stars[1].right}; animation-delay: ${stars[1].delay};"></div>
      <div class="star" style="top: -5%; right: ${stars[2].right}; animation-delay: ${stars[2].delay};"></div>
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
      <div class="bottom-cta">Press any key...</div>
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
  typeLineFrom(introLines);
}

function renderSharedDialogue() {
  playMusic("menu");
  app.innerHTML = `
    <div class="screen intro-screen">
      <img src="assets/images/parents.png" class="parents-sprite" />
      <div id="dialogueBox"></div>
    </div>
  `;
  dialogueIndex = 0;
  charIndex = 0;
  typeLineFrom(sharedLines);
}

function typeLineFrom(lines) {
  currentLines = lines;
  dialogueIndex = 0;
  charIndex = 0;
  typeLine();
}

function typeLine() {
  const box = document.getElementById("dialogueBox");
  if (!box) return;

  if (charIndex < currentLines[dialogueIndex].length) {
    box.textContent += currentLines[dialogueIndex][charIndex];
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
  preloadImage(getBabySprite());

  app.innerHTML = `
    <div class="screen reveal-screen">
      <img src="assets/images/baby.png" class="swaddle" />
      <div class="flash"></div>
      <p id="revealText"></p>
      <button id="shareBtn" class="share-btn" style="display:none" onclick="shareReveal()">Share 🎉</button>
    </div>
  `;
  startRevealAnimation();
}

// ---------- SHARE ----------
window.shareReveal = function() {
  const name = gameState.name || "";
  const genderText = gameState.gender === "boy" ? "Boy" : "Girl";
  const encoded = encodeName(name);
  const g = gameState.gender === 'boy' ? 'b' : 'g';
  const shareUrl = `${window.location.origin}${window.location.pathname}?g=${g}&n=${encoded}`;

  const shareData = {
    title: "Gender Reveal!",
    text: `It's a ${genderText}! Welcome, ${name}! 🎉`,
    url: shareUrl
  };

  if (navigator.share) {
    navigator.share(shareData).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`).then(() => {
      alert("Copied to clipboard!");
    });
  }
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
    errorEl.style.display = "block";
    return;
  }

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
    sounds.shake.play().catch(() => {});
    if (sounds.shake.duration) duration = sounds.shake.duration;
  }

  swaddle.style.animation = `shake ${duration / 6}s ease 6`;

  setTimeout(() => {
    swaddle.style.transform = "scale(1.15)";
  }, duration * 1000 - 300);

  setTimeout(() => {
    flash.classList.add("active");

    setTimeout(() => {
      swaddle.outerHTML = `
        <img src="${getBabySprite()}" class="sprite reveal-baby" />
      `;
    }, 120);

    setTimeout(() => {
      const name = gameState.name || "";
      const genderText = gameState.gender === "boy" ? "BOY" : "GIRL";

      document.getElementById("revealText").innerHTML =
        `It's a ${genderText}!<br>Welcome, ${name}!`;

      document.body.classList.remove("boy", "girl");
      document.body.classList.add(gameState.gender);

      const shareBtn = document.getElementById("shareBtn");
      if (shareBtn) shareBtn.style.display = "block";

      if (audioUnlocked) {
        sounds.celebrate.currentTime = 0;
        sounds.celebrate.play().catch(() => {});
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
  if (!e.target.closest("#app") && e.type === "click") return;
  if (e.target.closest("button") || e.target.closest("input")) return;

  if (!audioUnlocked) audioUnlocked = true;

  if (gameState.isShared) {
    if (gameState.currentScreen === 0) {
      audioUnlocked = true;
      gameState.currentScreen = 10;
    }
    else if (gameState.currentScreen === 10) {
      gameState.currentScreen = 11; // took out music here, now just advances.
    }
    else if (gameState.currentScreen === 11) {
      playClick();
      gameState.currentScreen = 12;
    }
    else if (gameState.currentScreen === 12) {
      playClick();
      if (dialogueIndex < sharedLines.length - 1) {
        dialogueIndex++;
        charIndex = 0;
        document.getElementById("dialogueBox").textContent = "";
        typeLine();
        return;
      } else {
        gameState.currentScreen = 13;
      }
    } else return;
    render();
    return;
  }

  // normal flow
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