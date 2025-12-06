const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const subtitleTouchLayer = document.getElementById("subtitle-touch-layer");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player script loaded");

// ------------------------------
// 자막 트랙 찾기
// ------------------------------
function getTracks() {
  const tracks = video.textTracks;
  let en = null;
  let ko = null;

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const lang = (t.language || "").toLowerCase();
    const label = (t.label || "").toLowerCase();

    if (!en && (lang.startsWith("en") || label.includes("english"))) {
      en = t;
    }
    if (!ko && (lang.startsWith("ko") || label.includes("korean"))) {
      ko = t;
    }
  }
  return { en, ko };
}

// ------------------------------
// 자막 스위치
// ------------------------------
function showEnglish() {
  const { en, ko } = getTracks();
  if (en) en.mode = "showing";
  if (ko) ko.mode = "hidden";
  console.log("→ EN");
}

function showKorean() {
  const { en, ko } = getTracks();
  if (en) en.mode = "hidden";
  if (ko) ko.mode = "showing";
  console.log("→ KO");
}

// 기본 한국어
video.addEventListener("loadedmetadata", () => {
  showKorean();
});

// ------------------------------
// (옵션) 15초 티저 제한 – 필요 없으면 이 블록 삭제해도 됨
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 자막 레이어: 홀드 동안 영어, 떼면 한국어
//  - 비디오에는 이벤트 안 가게 막아서 재생/일시정지에 영향을 안 줌
// ------------------------------
function subtitleDown(e) {
  // 마우스 오른쪽 버튼 등은 무시
  if (e.pointerType === "mouse" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();
  showEnglish();
}

function subtitleUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();
  showKorean();
}

if ("onpointerdown" in window) {
  subtitleTouchLayer.addEventListener("pointerdown", subtitleDown);
  subtitleTouchLayer.addEventListener("pointerup", subtitleUp);
  subtitleTouchLayer.addEventListener("pointercancel", subtitleUp);
} else {
  // 구형 브라우저 fallback
  subtitleTouchLayer.addEventListener("mousedown", subtitleDown);
  subtitleTouchLayer.addEventListener("mouseup", subtitleUp);
  subtitleTouchLayer.addEventListener("mouseleave", subtitleUp);

  subtitleTouchLayer.addEventListener("touchstart", subtitleDown, { passive: false });
  subtitleTouchLayer.addEventListener("touchend", subtitleUp, { passive: false });
  subtitleTouchLayer.addEventListener("touchcancel", subtitleUp, { passive: false });
}

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
});

uploadKoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackKoEl.src = url;
  video.load();
});
