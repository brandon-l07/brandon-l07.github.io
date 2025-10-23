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
// Keeping this function in case you want to later add subtle highlighting.
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

// Music Player Setup
const playlist = [
  'music-site/background1.mp3',
  'music-site/background2.mp3',
];

let currentTrackIndex = 0;
let audio;
let audioCtx;
let analyser;
let dataArray;
let source;

// Button elements
const btn = document.getElementById('music-player-btn');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');

// Shuffle playlist once at start
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(playlist);

// Toggle Play/Pause
btn.addEventListener('click', () => {
  // Create AudioContext and audio on first user interaction
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    audio = new Audio();
    audio.src = playlist[currentTrackIndex];
    audio.volume = 0.3;
    audio.loop = false;

    source = audioCtx.createMediaElementSource(audio);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyser.connect(audioCtx.destination);

    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    // Track change when ended
    audio.addEventListener('ended', () => {
      currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
      audio.src = playlist[currentTrackIndex];
      audio.load();
      audio.play();
    });
  }

  // Resume context if suspended
  if (audioCtx.state === 'suspended') audioCtx.resume();

  // Play or pause
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

  // Scale cube based on average frequency volume
  let sum = 0;
  for (let i = 0; i < bufferLength; i++) {
    sum += dataArray[i];
  }
  const avg = sum / bufferLength;
  const scale = 1 + avg / 256;
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


animate();

