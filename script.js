const video = document.getElementById("video");
const uploadVideo = document.getElementById("upload-video");
const uploadEn = document.getElementById("upload-en");
const uploadKo = document.getElementById("upload-ko");

let enTrack = null;
let koTrack = null;

// ------------------------------
// 1) 자막 트랙 초기화
// ------------------------------
function initTracks() {
  const tracks = video.textTracks;
  if (tracks.length < 2) {
    console.warn("Not enough text tracks");
    return;
  }

  enTrack = tracks[0]; // English
  koTrack = tracks[1]; // Korean

  // 기본은 한국어
  showKo();
}

function showEn() {
  if (!enTrack || !koTrack) return;
  enTrack.mode = "showing";
  koTrack.mode = "hidden";
}

function showKo() {
  if (!enTrack || !koTrack) return;
  enTrack.mode = "hidden";
  koTrack.mode = "showing";
}

// ------------------------------
// 2) 15초 티저 제한
// ------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ------------------------------
// 3) 업로드 기능
// ------------------------------
if (uploadVideo) {
  uploadVideo.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    video.src = URL.createObjectURL(file);
    video.load();
    video.play();
  });
}

if (uploadEn) {
  uploadEn.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const trackEl = document.getElementById("track-en");
    trackEl.src = URL.createObjectURL(file);
    video.load();
  });
}

if (uploadKo) {
  uploadKo.addEventListener("change", (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const trackEl = document.getElementById("track-ko");
    trackEl.src = URL.createObjectURL(file);
    video.load();
  });
}

// ------------------------------
// 4) 자막 홀드 전환 (PC + 모바일)
//    - 화면 아무 곳이나 눌러서 홀드 → 영어
//    - 손/마우스 떼면 → 한국어
// ------------------------------
function setupHoldEvents() {
  // PC용
  document.addEventListener("mousedown", () => {
    showEn();
  });

  document.addEventListener("mouseup", () => {
    showKo();
  });

  document.addEventListener("mouseleave", () => {
    showKo();
  });

  // 모바일용
  document.addEventListener(
    "touchstart",
    (e) => {
      showEn();
      // 기본 스크롤을 막고 싶으면 아래 주석 해제
      // e.preventDefault();
    },
    { passive: true }
  );

  document.addEventListener(
    "touchend",
    (e) => {
      showKo();
      // e.preventDefault();
    },
    { passive: true }
  );
}

// ------------------------------
// 5) 비디오 클릭으로 재생/멈춤되는 것 일부 완화
//    (완전 차단은 기기별로 불안정해서,
//     여기서는 자막에만 집중하고 브라우저 기본은 살려둔다)
// ------------------------------
video.addEventListener("click", (e) => {
  // 원하면 이걸 주석 처리하면,
  // 영상 탭해서 재생/멈춤하는 기본 동작이 다시 살아난다.
  // e.preventDefault();
  // e.stopPropagation();
});

// ------------------------------
// 6) 초기 실행
// ------------------------------
if (video.readyState >= 1) {
  initTracks();
} else {
  video.addEventListener("loadedmetadata", initTracks);
}

setupHoldEvents();
