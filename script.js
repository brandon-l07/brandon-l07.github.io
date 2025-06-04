// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75, window.innerWidth / window.innerHeight, 0.1, 1000
);
camera.position.z = 3;

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);

// Add the background canvas class here:
renderer.domElement.classList.add('background-canvas');

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

function updateLinks(faceName) {
  for (const corner in navElems) {
    if (faceName in faceToNav && corner === faceToNav[faceName].corner) {
      navElems[corner].textContent = faceToNav[faceName].text;
      navElems[corner].classList.add("visible");
      navElems[corner].style.backgroundColor = "transparent";
      navElems[corner].style.color = "white";
    } else {
      navElems[corner].textContent = "";
      navElems[corner].classList.remove("visible");
      navElems[corner].style.backgroundColor = "black";
      navElems[corner].style.color = "black";
    }
  }
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

// Music Player
const playlist = [
  'Music-Site/Abba - Dancing Queen (Official Music Video Remastered).mp3',
  'Music-Site/Rick Astley - Together Forever (Official Video) [4K Remaster].mp3',
  'Music-Site/Dschinghis Khan - Moskau (Starparade 14.06.1979).mp3',
  'Music-Site/Redbone - Come and Get Your Love (Single Edit - Audio).mp3',
  'Music-Site/Earth, Wind & Fire - September.mp3'
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
audio.src = playlist[currentTrackIndex];
audio.preload = 'auto';
audio.volume = 0.3;

const btn = document.getElementById('music-player-btn');
// Add your button logic as needed (play/pause, next, etc.)

// Animation loop
function animate() {
  requestAnimationFrame(animate);

  const currentTime = performance.now();
  const elapsedTime = currentTime - rotationStartTime;

  if (elapsedTime >= rotationDuration) {
    currentIndex = (currentIndex + 1) % sequence.length;
    rotationStartTime = currentTime;
  }

  const progress = Math.min(elapsedTime / rotationDuration, 1);
  const currentFace = sequence[currentIndex].face;
  const nextFace = sequence[(currentIndex + 1) % sequence.length].face;

  const fromRotation = faceRotations[currentFace];
  const toRotation = faceRotations[nextFace];

  cube.rotation.x = lerp(fromRotation.x, toRotation.x, progress);
  cube.rotation.y = lerp(fromRotation.y, toRotation.y, progress);

  updateLinks(currentFace);
  renderer.render(scene, camera);
}
animate();

