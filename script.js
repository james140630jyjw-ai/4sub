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
  let en = null,
    ko = null;

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
// 자막 ON/OFF
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
// 15초 티저 제한 (원하면 유지, 필요 없으면 이 블록 삭제해도 됨)
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 자막 터치 레이어 (홀드 동안 영어, 떼면 한국어)
//  - 여기서만 이벤트를 비디오까지 안 보내도록 막는다
// ------------------------------
function subtitleDown(e) {
  // 오른쪽 클릭 무시
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
  // 구형 브라우저용 fallback
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
uploadVideoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  video.src = url;
  video.load();
  video.play().catch(() => {});
});

uploadEnInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackEnEl.src = url;
  video.load();
});

uploadKoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackKoEl.src = url;
  video.load();
});
