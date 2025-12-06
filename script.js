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
// 15초 티저 제한 (원하면 유지)
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 🔥 자막 전환: "자막 터치 레이어"에서만 처리
//  - document / window 에는 어떤 pointer 이벤트도 안 건다
//  - 영상 컨트롤(재생/일시정지)은 브라우저 기본 동작 그대로
//  - 홀드/해제해도 비디오는 멈추지 않음
// ------------------------------
subtitleTouchLayer.addEventListener("pointerdown", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showEnglish();
});

subtitleTouchLayer.addEventListener("pointerup", (e) => {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showKorean();
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
