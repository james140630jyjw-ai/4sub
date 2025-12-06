const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player script loaded");

let holdingSubtitle = false; // 지금 자막 홀드 중인지 여부

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
// (옵션) 15초 티저 제한
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 영상 클릭 중 "자막 구역"만 가로채기
//  - 아래쪽 40% 중에서, 맨 아래 40px(컨트롤바) 제외 영역을 자막 구역으로 사용
// ------------------------------
function isInSubtitleZone(e) {
  const rect = video.getBoundingClientRect();
  const y = e.clientY;

  // 비디오 바깥이면 false
  if (y < rect.top || y > rect.bottom) return false;

  const height = rect.height;
  const fromBottom = rect.bottom - y;

  const controlsHeight = 40;          // 대략 컨트롤바 높이
  const subtitleBandHeight = height * 0.4; // 아래쪽 40% 정도를 자막 영역 후보로

  // 컨트롤바 바로 위 ~ 아래쪽 40% 범위
  return fromBottom > controlsHeight && fromBottom < controlsHeight + subtitleBandHeight;
}

// pointerdown: 자막 구역이면 영어로 전환 + 기본 동작 막기
video.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  if (isInSubtitleZone(e)) {
    holdingSubtitle = true;
    e.preventDefault();
    e.stopPropagation();
    showEnglish();

    // 혹시 멈춰있었으면 재생 유지
    if (video.paused && !video.ended) {
      video.play().catch(() => {});
    }
  } else {
    holdingSubtitle = false;
    // 자막 구역이 아니면 브라우저 기본: 재생/일시정지, 드래그, 전체화면 등
  }
});

function handlePointerUp(e) {
  if (!holdingSubtitle) return;

  e.preventDefault();
  e.stopPropagation();
  holdingSubtitle = false;
  showKorean();
}

video.addEventListener("pointerup", handlePointerUp);
video.addEventListener("pointercancel", handlePointerUp);
video.addEventListener("pointerleave", handlePointerUp);

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
