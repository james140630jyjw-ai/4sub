const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const subtitleTouchLayer = document.getElementById("subtitle-touch-layer");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player script loaded");

// 👉 자막 홀드를 방금 했는지 표시하는 플래그
let recentSubtitleHold = false;

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
// (옵션) 15초 티저 제한 – 필요 없으면 이 블록 삭제 가능
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 자막 레이어: 홀드 동안 영어, 떼면 한국어
// ------------------------------
function subtitleDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  recentSubtitleHold = true;      // ✅ 자막 홀드 시작
  showEnglish();
}

function subtitleUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  showKorean();

  // ✅ 잠깐 동안은 "자막 홀드 관련 클릭"으로 취급
  setTimeout(() => {
    recentSubtitleHold = false;
  }, 150); // 0.15초면 충분
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
// 🔥 video 클릭 보정
//   - 방금 전까지 자막 홀드였으면, video를 멈추지 못하게 막는다
// ------------------------------
video.addEventListener("click", (e) => {
  if (!recentSubtitleHold) return; // 일반 클릭은 그대로 두기

  // 자막 홀드에서 올라온 클릭 → 비디오 멈추지 않게 처리
  e.preventDefault();
  e.stopPropagation();

  // 혹시 이미 pause 상태로 들어갔다면 즉시 다시 play
  if (video.paused && !video.ended) {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
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
});

uploadKoInput?.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackKoEl.src = url;
  video.load();
});
