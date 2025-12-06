const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");
const subtitleTouchLayer = document.getElementById("subtitle-touch-layer");

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
// 15초 티저 제한
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 💬 자막 전환: 자막 터치 레이어에서만 처리
//  - 이벤트를 비디오로 보내지 않기 위해 stopPropagation + preventDefault
// ------------------------------
subtitleTouchLayer.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  showEnglish();
});

subtitleTouchLayer.addEventListener("pointerup", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  showKorean();
});

// ------------------------------
// 🎛 영상 클릭 제어:
//  - 첫 클릭(처음 중앙 재생 버튼)은 허용
//  - 맨 아래 컨트롤바 근처 클릭은 허용
//  - 그 외 영역 클릭은 "멈추지 않도록" 막기
// ------------------------------
video.addEventListener("click", (e) => {
  const rect = video.getBoundingClientRect();
  const clickY = e.clientY;

  // 대략 컨트롤바 높이를 60px 정도로 가정
  const isControlsZone = clickY > rect.bottom - 60;

  // 처음 재생(중앙 큰 재생 버튼)일 가능성:
  const isInitialClick = video.paused && video.currentTime === 0;

  if (isInitialClick || isControlsZone) {
    console.log("video click: allow (initial or controls)");
    // 브라우저 기본 동작(재생/일시정지)에 맡김
    return;
  }

  // 그 외 영역: 멈추지 않게 막기
  console.log("video click: prevent pause from surface");
  e.preventDefault();
  e.stopPropagation();

  // 혹시 이미 멈췄다면 다시 재생
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
