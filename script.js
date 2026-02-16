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

navElems["top-left"].textContent = "About";
navElems["top-left"].setAttribute("href", "about.html");

navElems["top-right"].textContent = "Blog";
navElems["top-right"].setAttribute("href", "https://x.com/brandonl_off");

navElems["bottom-left"].textContent = "Projects";
navElems["bottom-left"].setAttribute("href", "project.html");

navElems["bottom-right"].textContent = "Contact";
navElems["bottom-right"].setAttribute("href", "contact.html");

for (const corner in navElems) {
  const elem = navElems[corner];
  elem.classList.add("visible");
  elem.style.backgroundColor = "transparent";
  elem.style.color = "white";
  elem.style.pointerEvents = "auto";
}

const faceToNav = {
  right: { corner: "top-left", text: "About" },
  front: { corner: "bottom-left", text: "Projects" },
  top: { corner: "top-right", text: "Blog" },
  back: { corner: "bottom-right", text: "Contact" },
  left: { corner: "top-left", text: "About" },
  bottom: { corner: "bottom-right", text: "Contact" }
};

const faceRotations = {
  right: { x: 0, y: -Math.PI / 2 },
  top: { x: Math.PI / 2, y: 0 },
  front: { x: 0, y: 0 },
  back: { x: 0, y: Math.PI },
};

// If you want stationary links, no dynamic hiding/updating is needed.
function updateLinks(faceName) {
  // no-op: links remain constant and visible
}

const sequence = [
  { face: "right", label: "About" },
  { face: "top", label: "News" },
  { face: "front", label: "Projects" },
  { face: "back", label: "Contact" },
];

let currentIndex = 0;
const rotationDuration = 6000;
let rotationStartTime = performance.now();

function lerp(a, b, t) {
  return a + (b - a) * t;
}

// --- Music Player ---

const playlist = [
  'music-site/talk.mp3',
  'music-site/loop.mp3',
  'music-site/toofargone.mp3',
  'music-site/wyou.mp3',
  'music-site/makefeel.mp3',
  'music-site/roundaround.mp3',
  'music-site/rush.mp3'
];

// Pick a random first track on page load
let currentTrackIndex = Math.floor(Math.random() * playlist.length);

const audio = new Audio();
audio.src = playlist[currentTrackIndex];
audio.preload = 'auto';
audio.volume = 0; // start muted for fade-in

const btn = document.getElementById('music-player-btn');
const playButton = document.getElementById("play-button");
const pauseIcon = document.getElementById('pause-icon');
const playIcon = document.getElementById('play-icon');

// Web Audio API setup with GainNode for normalization
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const source = audioCtx.createMediaElementSource(audio);
const analyser = audioCtx.createAnalyser();
const gainNode = audioCtx.createGain();
gainNode.gain.value = 0.3; // base volume

// Connect nodes: source → analyser → gain → destination
source.connect(analyser);
analyser.connect(gainNode);
gainNode.connect(audioCtx.destination);
analyser.fftSize = 256;
const bufferLength = analyser.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

// Play/pause toggle with initial fade-in
function togglePlayPause() {
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  if (audio.paused) {
    audio.play();
    btn.textContent = 'Curated by Brandon';
    btn.prepend(pauseIcon);
    pauseIcon.style.display = 'inline';
    playIcon.style.display = 'none';

    // Fade in initial track smoothly
    let fadeInInterval = setInterval(() => {
      if (audio.volume < 0.3) {
        audio.volume += 0.03;
      } else {
        audio.volume = 0.3;
        clearInterval(fadeInInterval);
      }
    }, 50);
  } else {
    audio.pause();
    btn.textContent = 'Play';
    btn.prepend(playIcon);
    playIcon.style.display = 'inline';
    pauseIcon.style.display = 'none';
  }
}
btn.addEventListener('click', togglePlayPause);

// Track change: pick a random next track with fade and no immediate repeat
audio.addEventListener('ended', () => {
  let nextIndex;
  do {
    nextIndex = Math.floor(Math.random() * playlist.length);
  } while (nextIndex === currentTrackIndex && playlist.length > 1);

  const nextTrack = playlist[nextIndex];

  // Fade out current track over 1 second
  let fadeOutInterval = setInterval(() => {
    if (audio.volume > 0.05) {
      audio.volume -= 0.05;
    } else {
      clearInterval(fadeOutInterval);
      audio.pause();
      audio.src = nextTrack;
      audio.load();
      currentTrackIndex = nextIndex;

      // Fade in next track
      audio.volume = 0;
      audio.play();
      let fadeInInterval = setInterval(() => {
        if (audio.volume < 0.3) {
          audio.volume += 0.03;
        } else {
          audio.volume = 0.3;
          clearInterval(fadeInInterval);
        }
      }, 50);
    }
  }, 50);
});

// Loading screen fade out
window.addEventListener("load", function () {
  const loadingScreen = document.getElementById("loading-screen");
  loadingScreen.classList.add("fade-out");

  setTimeout(() => {
    loadingScreen.style.display = "none";
  }, 10000);
});

// --- Color fading variables ---
let currentRGB = { r: 0.0, g: 0.67, b: 1.0 }; // initial color normalized
let targetRGB = { r: 0.0, g: 0.67, b: 1.0 };
const fadeSpeed = 0.01; // lower = slower

// Animation loop
function animate(time = performance.now()) {
  requestAnimationFrame(animate);

  analyser.getByteFrequencyData(dataArray);

  // --- Simple dynamic volume control ---
  let sumVol = 0;
  for (let i = 0; i < bufferLength; i++) sumVol += dataArray[i];
  const avgVol = sumVol / bufferLength;
  const normalizedGain = 0.15 + (0.3 - 0.15) * (1 - Math.min(avgVol / 256, 1));
  gainNode.gain.setTargetAtTime(normalizedGain, audioCtx.currentTime, 0.05);

  // Scale cube based on average frequency volume
  const scale = 1 + avgVol / 256;
  cube.scale.set(scale, scale, scale);

  // Map frequency bands to RGB
  let lowSum = 0, midSum = 0, highSum = 0;
  for (let i = 0; i < bufferLength / 3; i++) lowSum += dataArray[i];
  for (let i = bufferLength / 3; i < 2 * bufferLength / 3; i++) midSum += dataArray[i];
  for (let i = 2 * bufferLength / 3; i < bufferLength; i++) highSum += dataArray[i];

  const normLow = Math.min(lowSum / (bufferLength / 3) / 256, 1);
  const normMid = Math.min(midSum / (bufferLength / 3) / 256, 1);
  const normHigh = Math.min(highSum / (bufferLength / 3) / 256, 1);

  targetRGB.r = lerp(currentRGB.r, normLow, 0.05);
  targetRGB.g = lerp(currentRGB.g, normMid, 0.05);
  targetRGB.b = lerp(currentRGB.b, normHigh, 0.05);

  currentRGB.r += (targetRGB.r - currentRGB.r) * fadeSpeed;
  currentRGB.g += (targetRGB.g - currentRGB.g) * fadeSpeed;
  currentRGB.b += (targetRGB.b - currentRGB.b) * fadeSpeed;

  const col = new THREE.Color(currentRGB.r, currentRGB.g, currentRGB.b);
  const hsl = {};
  col.getHSL(hsl);
  cube.material.color.setHSL(hsl.h, 0.4, 0.7); // pastel tweak

  // Rotation
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

  updateLinks(sequence[currentIndex].face);
  renderer.render(scene, camera);
}

animate();
