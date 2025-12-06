const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const subtitleTouchLayer = document.getElementById("subtitle-touch-layer");
const videoClickBlocker = document.getElementById("video-click-blocker");

// --------------------------------
// 자막 트랙 찾기
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
// 자막 ON/OFF
// --------------------------------
function showEnglish() {
  const { en, ko } = getTracks();
  if (en) en.mode = "showing";
  if (ko) ko.mode = "hidden";
}

function showKorean() {
  const { en, ko } = getTracks();
  if (en) en.mode = "hidden";
  if (ko) ko.mode = "showing";
}

// 기본 한국어
video.addEventListener("loadedmetadata", () => {
  showKorean();
});

// --------------------------------
//  자막 터치 레이어 (홀드 전용)
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
//  영상 클릭 차단 (controls 위를 제외한 전체)
// --------------------------------
videoClickBlocker.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();
});

// --------------------------------
//  Safari가 멈추지 않게 보정
// --------------------------------
video.addEventListener("pause", () => {
  const bottom = video.getBoundingClientRect().bottom;
  const clickY = window.lastClickY || 0;

  // 아래쪽 15% 영역에서 멈춘 건 정상
  if (clickY > bottom - 60) return;

  // 그 외는 멈추면 바로 재생
  if (!video.ended) video.play().catch(() => {});
});

window.addEventListener("pointerdown", (e) => {
  window.lastClickY = e.clientY;
});
