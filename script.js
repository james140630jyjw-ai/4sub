const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const subtitleBar = document.getElementById("subtitle-bar");
const subtitleSpan = subtitleBar.querySelector("span");

const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

let currentLang = "ko"; // 기본 한국어
let enTrack = null;
let koTrack = null;

// ------------------------------
// 트랙 초기화
// ------------------------------
function initTracks() {
  const tracks = video.textTracks;
  enTrack = null;
  koTrack = null;

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const lang = (t.language || "").toLowerCase();
    const label = (t.label || "").toLowerCase();

    if (!enTrack && (lang.startsWith("en") || label.includes("english"))) enTrack = t;
    if (!koTrack && (lang.startsWith("ko") || label.includes("korean"))) koTrack = t;
  }

  if (enTrack) enTrack.mode = "hidden";
  if (koTrack) koTrack.mode = "hidden";

  if (enTrack) {
    enTrack.addEventListener("cuechange", updateSubtitle);
  }
  if (koTrack) {
    koTrack.addEventListener("cuechange", updateSubtitle);
  }

  updateSubtitle();
}

// ------------------------------
// 자막 업데이트
// ------------------------------
function updateSubtitle() {
  const track = currentLang === "en" ? enTrack : koTrack;
  if (!track) return subtitleSpan.innerHTML = "";

  const cues = track.activeCues;
  if (!cues || cues.length === 0) return subtitleSpan.innerHTML = "";

  const text = cues[0].text.replace(/\n/g, "<br>");
  subtitleSpan.innerHTML = text;
}

// ------------------------------
// 자막 바 홀드 기능
// ------------------------------
function subtitleDown(e) {
  if (e.button !== 0 && e.pointerType === "mouse") return; // 좌클릭만
  currentLang = "en";
  updateSubtitle();
}

function subtitleUp(e) {
  currentLang = "ko";
  updateSubtitle();
}

subtitleBar.addEventListener("pointerdown", subtitleDown);
subtitleBar.addEventListener("pointerup", subtitleUp);
subtitleBar.addEventListener("pointercancel", subtitleUp);

// ------------------------------
// 전체화면 모드 처리
// ------------------------------
document.addEventListener("fullscreenchange", () => {
  const isFullscreen = document.fullscreenElement === video;

  if (isFullscreen) {
    // 전체화면 에서는 기본 자막 사용 (인터랙티브 기능 OFF)
    if (enTrack) enTrack.mode = "hidden";
    if (koTrack) koTrack.mode = "showing"; // 기본 한국어 자막
    subtitleBar.style.display = "none";
  } else {
    // 일반 화면
    if (enTrack) enTrack.mode = "hidden";
    if (koTrack) koTrack.mode = "hidden";
    subtitleBar.style.display = "flex";
    updateSubtitle();
  }
});

// ------------------------------
// 업로드 기능
// ------------------------------
uploadVideoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  video.src = URL.createObjectURL(file);
  video.load();
  video.play().catch(() => {});
});

uploadEnInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  trackEnEl.src = URL.createObjectURL(file);
  video.load();
  video.onloadedmetadata = initTracks;
});

uploadKoInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;
  trackKoEl.src = URL.createObjectURL(file);
  video.load();
  video.onloadedmetadata = initTracks;
});

// 첫 초기화
video.addEventListener("loadedmetadata", initTracks);
