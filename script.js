const video = document.getElementById("video");
const subtitleTouch = document.getElementById("subtitle-touch-overlay");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle overlay script loaded");

// ==== 자막 트랙 찾기 ====
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

function showEnglish() {
  const { en, ko } = getTracks();
  console.log("→ EN", en, ko);
  if (en) en.mode = "showing";
  if (ko) ko.mode = "hidden";
}

function showKorean() {
  const { en, ko } = getTracks();
  console.log("→ KO", en, ko);
  if (en) en.mode = "hidden";
  if (ko) ko.mode = "showing";
}

// 메타데이터 로드 후 기본 한국어 자막
video.addEventListener("loadedmetadata", () => {
  showKorean();
});

// (옵션) 15초 티저 제한
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ==== 자막 터치 오버레이에서만 EN/KO 스위치 ====

// 공통 핸들러
function onSubtitleDown(e) {
  // 마우스: 왼쪽 버튼만
  if (e.button !== undefined && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation(); // 이벤트가 video까지 올라가지 않도록

  showEnglish();
}

function onSubtitleUp(e) {
  if (e.button !== undefined && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  showKorean();
}

// pointer 이벤트
subtitleTouch.addEventListener("pointerdown", onSubtitleDown);
subtitleTouch.addEventListener("pointerup", onSubtitleUp);
subtitleTouch.addEventListener("pointercancel", onSubtitleUp);

// mouse fallback
subtitleTouch.addEventListener("mousedown", onSubtitleDown);
subtitleTouch.addEventListener("mouseup", onSubtitleUp);
subtitleTouch.addEventListener("mouseleave", onSubtitleUp);

// touch fallback
subtitleTouch.addEventListener("touchstart", onSubtitleDown, { passive: false });
subtitleTouch.addEventListener("touchend", onSubtitleUp, { passive: false });
subtitleTouch.addEventListener("touchcancel", onSubtitleUp, { passive: false });

// ❗ video / document 에는 어떤 클릭/포인터 이벤트도 걸지 않는다.
//   → 재생 버튼, 타임라인, 전체화면 버튼 모두 브라우저 기본대로 동작.

// ==== 업로드 기능 ====

// 영상 업로드
uploadVideoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  video.src = url;
  video.load();
  video.play().catch(() => {});
});

// 영어 자막 업로드
uploadEnInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const el = document.getElementById("track-en");
  el.src = url;
  video.load();
});

// 한국어 자막 업로드
uploadKoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  const el = document.getElementById("track-ko");
  el.src = url;
  video.load();
});
