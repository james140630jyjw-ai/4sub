const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

const subtitleTouchLayer = document.getElementById("subtitle-touch-layer");
const videoClickBlocker = document.getElementById("video-click-blocker");

console.log("subtitle player script loaded");

// ------------------------------
// EN / KO TextTrack 찾기
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
// 자막 표시 함수
// ------------------------------
function showEnglish() {
  const { en, ko } = getTracks();
  console.log("→ EN");
  if (en) en.mode = "showing";
  if (ko) ko.mode = "hidden";
}

function showKorean() {
  const { en, ko } = getTracks();
  console.log("→ KO");
  if (en) en.mode = "hidden";
  if (ko) ko.mode = "showing";
}

// ------------------------------
// 기본 자막: 한국어
// ------------------------------
video.addEventListener("loadedmetadata", () => {
  showKorean();
});

// ------------------------------
// 15초 티저 제한 (원래 있던 기능 유지)
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// ⛔ 영상 클릭 차단 레이어 활성/비활성
//  - 처음(0초, 아직 재생 전)에는 비활성화 → 중앙 재생 버튼 클릭 가능
//  - 재생이 시작되면 pointerEvents = 'auto' → 영상 위 클릭은 비디오에 안 닿음
//  - 0초로 돌아와서 멈췄을 때만 다시 비활성화
// ------------------------------
video.addEventListener("play", () => {
  videoClickBlocker.style.pointerEvents = "auto";
  console.log("video play → click blocker ON");
});

video.addEventListener("pause", () => {
  if (video.currentTime === 0) {
    videoClickBlocker.style.pointerEvents = "none";
    console.log("video pause at 0 → click blocker OFF");
  }
});

// ------------------------------
// 💬 자막 전환: 자막 터치 레이어에서만 처리
//  - Safari 호환을 위해 pointer + mouse + touch 모두 지원
//  - 여기서 이벤트를 비디오로 보내지 않기 위해 stopPropagation + preventDefault
// ------------------------------
function subtitleHoldDown(e) {
  // 오른쪽 클릭 등은 무시
  if (e.type === "pointerdown" || e.type === "pointerup") {
    if (e.pointerType === "mouse" && e.button !== 0) return;
  }

  e.preventDefault();
  e.stopPropagation();

  showEnglish();
}

function subtitleHoldUp(e) {
  if (e.type === "pointerdown" || e.type === "pointerup") {
    if (e.pointerType === "mouse" && e.button !== 0) return;
  }

  e.preventDefault();
  e.stopPropagation();

  showKorean();
}

// 최신 브라우저: pointer 이벤트 우선 사용
if ("onpointerdown" in window) {
  subtitleTouchLayer.addEventListener("pointerdown", subtitleHoldDown);
  subtitleTouchLayer.addEventListener("pointerup", subtitleHoldUp);
  subtitleTouchLayer.addEventListener("pointercancel", subtitleHoldUp);
} else {
  // 구형 브라우저 / 일부 Safari 대응: mouse + touch
  subtitleTouchLayer.addEventListener("mousedown", subtitleHoldDown);
  subtitleTouchLayer.addEventListener("mouseup", subtitleHoldUp);
  subtitleTouchLayer.addEventListener("mouseleave", subtitleHoldUp);

  subtitleTouchLayer.addEventListener("touchstart", subtitleHoldDown, { passive: false });
  subtitleTouchLayer.addEventListener("touchend", subtitleHoldUp, { passive: false });
  subtitleTouchLayer.addEventListener("touchcancel", subtitleHoldUp, { passive: false });
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
  video.play();
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
