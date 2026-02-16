// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Cube
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 5, 5).normalize();
scene.add(light);

// Resize
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Nav Elements
const navElems = {
  "top-left": document.getElementById("top-left"),
  "top-right": document.getElementById("top-right"),
  "bottom-left": document.getElementById("bottom-left"),
  "bottom-right": document.getElementById("bottom-right"),
};

for (const corner in navElems) {
  const elem = navElems[corner];
  elem.classList.add("visible");
  elem.style.backgroundColor = "transparent";
  elem.style.color = "white";
  elem.style.pointerEvents = "auto";
}

/* =========================================================
   MUSIC PLAYER
   ========================================================= */

const playlist = [
  'music-site/skyhigh.mp3',
];

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(playlist);

let currentTrackIndex = 0;
const audio = new Audio();
audio.preload = 'auto';
audio.volume = 0.3;

/* //// PERSISTENT MUSIC (NEW): restore state */
const savedTime = parseFloat(sessionStorage.getItem("musicTime"));
const wasPlaying = sessionStorage.getItem("musicPlaying") === "true";
const savedTrack = parseInt(sessionStorage.getItem("musicTrack"));

if (!isNaN(savedTrack)) {
  currentTrackIndex = savedTrack;
}

audio.src = playlist[currentTrackIndex];
audio.addEventListener("loadedmetadata", () => {

  let resumeTime = savedTime;

  // If user left near the end, skip to next track instead
  if (!isNaN(savedTime) && audio.duration - savedTime < 1.5) {
    currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
    audio.src = playlist[currentTrackIndex];
    audio.load();
    return;
  }

  if (!isNaN(resumeTime)) {
    audio.currentTime = resumeTime;
  }

  if (wasPlaying) {
    document.addEventListener("click", () => {
      audio.play().catch(() => {});
    }, { once: true });
  }
});


const btn = document.getElementById('music-player-btn');
const pauseIcon = document.getElementById('pause-icon');
const playIcon = document.getElementById('play-icon');

// Web Audio API
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();
source.connect(analyser);
analyser.connect(audioCtx.destination);
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Play / Pause
function togglePlayPause() {
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (audio.paused) {
    audio.play();
    btn.textContent = 'Curated by Brandon';
    btn.prepend(pauseIcon);
    pauseIcon.style.display = 'inline';
    playIcon.style.display = 'none';
  } else {
    audio.pause();
    btn.textContent = 'Play';
    btn.prepend(playIcon);
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
  }
}
btn.addEventListener('click', togglePlayPause);

// Track change
audio.addEventListener('ended', () => {
  currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
  audio.src = playlist[currentTrackIndex];
  audio.load();
  audio.play();
});

setInterval(() => {
  if (!audio.paused && audio.duration) {

    // don't store last second explanation
    if (audio.duration - audio.currentTime > 1.2) {
      sessionStorage.setItem("musicTime", audio.currentTime);
      sessionStorage.setItem("musicTrack", currentTrackIndex);
    }

    sessionStorage.setItem("musicPlaying", "true");

  } else {
    sessionStorage.setItem("musicPlaying", "false");
  }
}, 500);


/* =========================================================
   LOADING SCREEN
   ========================================================= */

window.addEventListener("load", function () {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.add("fade-out");

  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 10000);
});

/* =========================================================
   ANIMATION LOOP
   ========================================================= */

let currentRGB = { r: 0.0, g: 0.67, b: 1.0 };
let targetRGB = { r: 0.0, g: 0.67, b: 1.0 };
const fadeSpeed = 0.01;

function lerp(a, b, t) { return a + (b - a) * t; }

/* =========================================================
   CUBE ROTATION SYSTEM (RESTORED)
   ========================================================= */

const faceRotations = {
  right: { x: 0, y: -Math.PI / 2 },
  top: { x: Math.PI / 2, y: 0 },
  front: { x: 0, y: 0 },
  back: { x: 0, y: Math.PI },
};

const sequence = [
  { face: "right" },
  { face: "top" },
  { face: "front" },
  { face: "back" },
];

let currentIndex = 0;
const rotationDuration = 6000;
let rotationStartTime = performance.now();


function animate(time = performance.now()) {
  requestAnimationFrame(animate);

  analyser.getByteFrequencyData(dataArray);

  // Beat scaling
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) sum += dataArray[i];
  const avg = sum / bufferLength;
  const scale = 1 + avg / 256;
  cube.scale.set(scale, scale, scale);

  /* ---- ROTATION ---- */
  const elapsed = time - rotationStartTime;
  const t = Math.min(elapsed / rotationDuration, 1);

  const nextIndex = (currentIndex + 1) % sequence.length;
  const fromRot = faceRotations[sequence[currentIndex].face];
  const toRot = faceRotations[sequence[nextIndex].face];

  cube.rotation.x = lerp(fromRot.x, toRot.x, t);
  cube.rotation.y = lerp(fromRot.y, toRot.y, t);

  if (t === 1) {
    currentIndex = nextIndex;
    rotationStartTime = time;
  }

  renderer.render(scene, camera);
}


animate();
