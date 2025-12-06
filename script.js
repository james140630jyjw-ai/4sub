const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const subtitleBar = document.getElementById("subtitle-bar");
const subtitleSpan = subtitleBar.querySelector("span");

const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("interactive subtitle bar loaded");

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

    if (!enTrack && (lang.startsWith("en") || label.includes("english"))) {
      enTrack = t;
    }
    if (!koTrack && (lang.startsWith("ko") || label.includes("korean"))) {
      koTrack = t;
    }
  }

  // 브라우저 기본 자막 렌더링은 끄고, JS에서만 사용
  if (enTrack) enTrack.mode = "hidden";
  if (koTrack) koTrack.mode = "hidden";

  if (enTrack) {
    enTrack.removeEventListener("cuechange", updateSubtitle);
    enTrack.addEventListener("cuechange", updateSubtitle);
  }
  if (koTrack) {
    koTrack.removeEventListener("cuechange", updateSubtitle);
    koTrack.addEventListener("cuechange", updateSubtitle);
  }

  updateSubtitle();
}

// ------------------------------
// 현재 언어에 맞게 자막 갱신
// ------------------------------
function updateSubtitle() {
  let track = currentLang === "en" ? enTrack : koTrack;
  if (!track) {
    subtitleSpan.innerHTML = "";
    return;
  }

  const cues = track.activeCues;
  if (!cues || cues.length === 0) {
    subtitleSpan.innerHTML = "";
    return;
  }

  const text = cues[0].text.replace(/\r\n|\r|\n/g, "<br>");
  subtitleSpan.innerHTML = text;
}

// ------------------------------
// 메타데이터 로딩 후 트랙 초기화
// ------------------------------
video.addEventListener("loadedmetadata", () => {
  initTracks();
});

// ------------------------------
// (옵션) 15초 티저 제한 – 필요 없으면 이 블록 삭제
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 자막 바 홀드: 영어 / 손 떼면 한국어
// ------------------------------
function subtitleDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  currentLang = "en";
  updateSubtitle();
}

function subtitleUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  currentLang = "ko";
  updateSubtitle();
}

// pointer 이벤트 + fallback 모두 걸어둔다 (맥/PC 호환)
subtitleBar.addEventListener("pointerdown", subtitleDown);
subtitleBar.addEventListener("pointerup", subtitleUp);
subtitleBar.addEventListener("pointercancel", subtitleUp);

subtitleBar.addEventListener("mousedown", subtitleDown);
subtitleBar.addEventListener("mouseup", subtitleUp);
subtitleBar.addEventListener("mouseleave", subtitleUp);

subtitleBar.addEventListener("touchstart", subtitleDown, { passive: false });
subtitleBar.addEventListener("touchend", subtitleUp, { passive: false });
subtitleBar.addEventListener("touchcancel", subtitleUp, { passive: false });

// ------------------------------
// 업로드 기능
// ------------------------------
uploadVideoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  video.src = url;
  video.load();
  video.play().catch(() => {});
});

function reloadTracksOnNextMetadata() {
  video.addEventListener("loadedmetadata", () => {
    initTracks();
  }, { once: true });
}

uploadEnInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackEnEl.src = url;
  video.load();
  reloadTracksOnNextMetadata();
});

uploadKoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackKoEl.src = url;
  video.load();
  reloadTracksOnNextMetadata();
});
