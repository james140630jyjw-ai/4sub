const video = document.getElementById("video");
const trackEn = document.getElementById("track-en");
const trackKo = document.getElementById("track-ko");

const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player script loaded");

// ----- 자막 표시 함수 -----
function showEnglish() {
  console.log("→ EN");
  trackEn.mode = "showing";
  trackKo.mode = "hidden";
}

function showKorean() {
  console.log("→ KO");
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

// ----- 자막 전환: pointer 이벤트 한 번에 처리 -----
function handlePointerDown(e) {
  // 마우스 오른쪽/가운데 버튼은 무시
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showEnglish();
}

function handlePointerUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showKorean();
}

document.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointerup", handlePointerUp);

// ----- 비디오 클릭으로 재생/일시정지 토글만 막기 -----
video.addEventListener("click", (e) => {
  e.preventDefault();
});

// ----- 업로드 기능 -----

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
