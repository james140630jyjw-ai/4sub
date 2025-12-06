const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const subtitleBox = document.getElementById("subtitle-overlay");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player (custom overlay) loaded");

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

  // 브라우저 기본 자막 렌더링은 끄기
  if (enTrack) enTrack.mode = "hidden";
  if (koTrack) koTrack.mode = "hidden";

  // cuechange 이벤트 한 번만 연결 (중복 연결돼도 문제는 없음)
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
    subtitleBox.innerHTML = "";
    return;
  }

  const cues = track.activeCues;
  if (!cues || cues.length === 0) {
    subtitleBox.innerHTML = "";
    return;
  }

  // 여러 줄 자막 지원 (줄바꿈 → <br>)
  const text = cues[0].text.replace(/\r\n|\r|\n/g, "<br>");
  subtitleBox.innerHTML = `<span>${text}</span>`;
}

// ------------------------------
// 기본: 메타데이터 로딩 후 트랙 초기화
// ------------------------------
video.addEventListener("loadedmetadata", () => {
  initTracks();
});

// ------------------------------
// (옵션) 15초 티저 제한 – 필요 없으면 삭제
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 자막 박스 홀드: 영어 / 손 떼면 한국어
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

if ("onpointerdown" in window) {
  subtitleBox.addEventListener("pointerdown", subtitleDown);
  subtitleBox.addEventListener("pointerup", subtitleUp);
  subtitleBox.addEventListener("pointercancel", subtitleUp);
} else {
  subtitleBox.addEventListener("mousedown", subtitleDown);
  subtitleBox.addEventListener("mouseup", subtitleUp);
  subtitleBox.addEventListener("mouseleave", subtitleUp);

  subtitleBox.addEventListener("touchstart", subtitleDown, { passive: false });
  subtitleBox.addEventListener("touchend", subtitleUp, { passive: false });
  subtitleBox.addEventListener("touchcancel", subtitleUp, { passive: false });
}

// ------------------------------
// 전체화면: 인터랙션 대신 한국어 기본 자막만
// ------------------------------
document.addEventListener("fullscreenchange", () => {
  const isFs = document.fullscreenElement === video;
  if (isFs) {
    // 전체화면: 브라우저 기본 자막 켜기 (한국어)
    if (enTrack) enTrack.mode = "hidden";
    if (koTrack) koTrack.mode = "showing";
    subtitleBox.style.display = "none";
  } else {
    // 일반 모드: 커스텀 자막만 사용
    if (enTrack) enTrack.mode = "hidden";
    if (koTrack) koTrack.mode = "hidden";
    subtitleBox.style.display = "flex";
    updateSubtitle();
  }
});

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

uploadEnInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackEnEl.src = url;
  video.load();
  // 새로운 자막 로딩 후 다시 트랙 초기화
  video.addEventListener("loadedmetadata", initTracks, { once: true });
});

uploadKoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackKoEl.src = url;
  video.load();
  video.addEventListener("loadedmetadata", initTracks, { once: true });
});
