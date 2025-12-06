const video = document.getElementById("video");
const trackEnEl = document.getElementById("track-en");
const trackKoEl = document.getElementById("track-ko");

const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

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
// 맥북용: 멈추면 다시 재생
// ------------------------------
function keepPlaying() {
  if (video.paused && !video.ended) {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  }
}

// ------------------------------
// 자막 표시
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
// 영상 메타데이터 로드 후 기본 한국어
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
// 자막 전환: pointer 이벤트 (PC + 맥)
//  - 단, video 위에서 시작한 홀드는 완전히 무시
// ------------------------------
let holdFromVideo = false;

function isFromVideoTarget(e) {
  if (e.target === video) return true;
  if (e.target.closest && e.target.closest("video")) return true;
  return false;
}

function handlePointerDown(e) {
  // 마우스라면 왼쪽 버튼만
  if (e.pointerType === "mouse" && e.button !== 0) return;

  // 비디오 위에서 시작된 홀드는 무시 (재생/일시정지랑 안 싸우게)
  holdFromVideo = isFromVideoTarget(e);
  if (holdFromVideo) {
    console.log("pointerdown from video → ignore for subtitle switch");
    return;
  }

  showEnglish();
  keepPlaying();
}

function handlePointerUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;

  // 비디오에서 시작한 홀드였다면 그대로 무시
  if (holdFromVideo) {
    console.log("pointerup from video → ignore for subtitle switch");
    holdFromVideo = false;
    return;
  }

  showKorean();
  keepPlaying();
}

// 화면 전체에서 눌렀다/뗄 때 처리
document.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointerup", handlePointerUp);

// ------------------------------
// 업로드 기능
// ------------------------------

// 영상 업로드
uploadVideoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  video.src = url;
  video.load();
  video.play();
});

// 영어 자막 업로드
uploadEnInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackEnEl.src = url;
  video.load();
});

// 한국어 자막 업로드
uploadKoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  trackKoEl.src = url;
  video.load();
});
