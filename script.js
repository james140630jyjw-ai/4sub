const video = document.getElementById("video");
const trackEn = document.getElementById("track-en");
const trackKo = document.getElementById("track-ko");

// 기본: 한국어 자막
function useEnglish() {
  trackEn.mode = "showing";
  trackKo.mode = "hidden";
}

function useKorean() {
  trackEn.mode = "hidden";
  trackKo.mode = "showing";
}

useKorean();

// ---- 15초 티저 제한 ----
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ---- 자막 전환: pointer 이벤트로 통합 ----
function handlePress(e) {
  // 왼쪽 버튼 / 터치만 처리
  if (e.button !== undefined && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();
  useEnglish();
}

function handleRelease(e) {
  if (e.button !== undefined && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();
  useKorean();
}

// 화면 어디서든 눌렀을 때/뗄 때 자막 전환
document.addEventListener("pointerdown", handlePress);
document.addEventListener("pointerup", handleRelease);

// ---- 비디오 자체의 클릭/마우스 이벤트 완전 차단 ----
["pointerdown", "pointerup", "mousedown", "mouseup", "click"].forEach(
  (eventName) => {
    video.addEventListener(eventName, (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }
);

// ---- 업로드 기능 유지 ----
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

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
