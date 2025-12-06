const video = document.getElementById("video");
const trackEn = document.getElementById("track-en");
const trackKo = document.getElementById("track-ko");

const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

// ----- 자막 표시 함수 -----
function showEnglish() {
  trackEn.mode = "showing";
  trackKo.mode = "hidden";
}

function showKorean() {
  trackEn.mode = "hidden";
  trackKo.mode = "showing";
}

// 처음에는 한국어 자막
showKorean();

// ----- 15초 티저 제한 -----
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ----- 자막 전환: 마우스 / 터치 -----

// 마우스를 누르고 있을 때 → 영어
window.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return; // 왼쪽 버튼만
  showEnglish();
});

// 마우스를 뗄 때 → 한국어
window.addEventListener("mouseup", (e) => {
  if (e.button !== 0) return;
  showKorean();
});

// 터치 시작 → 영어
window.addEventListener("touchstart", () => {
  showEnglish();
});

// 터치 끝 → 한국어
window.addEventListener("touchend", () => {
  showKorean();
});

// 비디오를 클릭해도 재생/일시정지 토글이 안 되게 막기
video.addEventListener("click", (e) => {
  e.preventDefault();
});

// ----- 업로드 기능 유지 -----

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

  trackEn.src = URL.createObjectURL(file);
  video.load();
});

// 한국어 자막 업로드
uploadKoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  trackKo.src = URL.createObjectURL(file);
  video.load();
});
