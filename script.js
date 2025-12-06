const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const subtitleTouchLayer = document.getElementById("subtitle-touch-layer");
const videoClickBlocker = document.getElementById("video-click-blocker");

// --------------------------------
// 자막 찾기
// --------------------------------
function getTracks() {
  const tracks = video.textTracks;
  let en = null, ko = null;

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const lang = (t.language || "").toLowerCase();
    const label = (t.label || "").toLowerCase();

    if (!en && (lang.startsWith("en") || label.includes("english"))) en = t;
    if (!ko && (lang.startsWith("ko") || label.includes("korean"))) ko = t;
  }
  return { en, ko };
}

// --------------------------------
// 자막 스위치
// --------------------------------
function showEnglish() {
  const { en, ko } = getTracks();
  if (en) en.mode = "showing";
  if (ko) ko.mode = "hidden";
  console.log("→ English");
}

function showKorean() {
  const { en, ko } = getTracks();
  if (en) en.mode = "hidden";
  if (ko) ko.mode = "showing";
  console.log("→ Korean");
}

// 기본 한국어
video.addEventListener("loadedmetadata", () => {
  showKorean();
});

// --------------------------------
// 자막 레이어 터치 (pointer 이벤트)
// --------------------------------
function subtitleDown(e) {
  e.preventDefault();
  e.stopPropagation();
  showEnglish();
}

function subtitleUp(e) {
  e.preventDefault();
  e.stopPropagation();
  showKorean();
}

subtitleTouchLayer.addEventListener("pointerdown", subtitleDown);
subtitleTouchLayer.addEventListener("pointerup", subtitleUp);
subtitleTouchLayer.addEventListener("pointercancel", subtitleUp);

// --------------------------------
// 영상 클릭 방지 (controls 제외)
// --------------------------------
videoClickBlocker.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
});

// --------------------------------
// Safari 멈춤 보정
// --------------------------------
video.addEventListener("pause", () => {
  const bottom = video.getBoundingClientRect().bottom;
  const clickY = window.lastClickY || 0;

  // 컨트롤 영역 클릭 시는 정상
  if (clickY > bottom - 60) return;

  // 그 외는 다시 재생 처리
  if (!video.ended) video.play().catch(() => {});
});

window.addEventListener("pointerdown", (e) => {
  window.lastClickY = e.clientY;
});

// --------------------------------
// 🔥 전체화면에서도 자막 스위치 작동시키기 위한 fullscreen 레이어
// --------------------------------
let fullscreenLayer = null;

function createFullscreenLayer() {
  const fsEl = document.fullscreenElement;
  if (!fsEl) return;

  fullscreenLayer = document.createElement("div");
  fullscreenLayer.style.position = "fixed";
  fullscreenLayer.style.left = "0";
  fullscreenLayer.style.right = "0";
  fullscreenLayer.style.bottom = "15%";
  fullscreenLayer.style.height = "30%";
  fullscreenLayer.style.zIndex = "999999";
  fullscreenLayer.style.pointerEvents = "auto";

  fullscreenLayer.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showEnglish();
  });

  fullscreenLayer.addEventListener("pointerup", (e) => {
    e.preventDefault();
    e.stopPropagation();
    showKorean();
  });

  document.body.appendChild(fullscreenLayer);
}

function removeFullscreenLayer() {
  if (fullscreenLayer) {
    fullscreenLayer.remove();
    fullscreenLayer = null;
  }
}

document.addEventListener("fullscreenchange", () => {
  if (document.fullscreenElement) {
    createFullscreenLayer();
  } else {
    removeFullscreenLayer();
  }
});
