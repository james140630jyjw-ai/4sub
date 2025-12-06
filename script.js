const video = document.getElementById("video");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player script loaded");

// 현재 동영상에서 EN/KO 트랙 찾기
function getTracks() {
  const tracks = video.textTracks;
  let en = null;
  let ko = null;

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    // language / label 둘 다 체크
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

// ----- 자막 표시 함수 -----
function showEnglish() {
  const { en, ko } = getTracks();
  console.log("→ EN", en, ko);
  if (en) en.mode = "showing";
  if (ko) ko.mode = "hidden"; // 숨기기
}

function showKorean() {
  const { en, ko } = getTracks();
  console.log("→ KO", en, ko);
  if (en) en.mode = "hidden";
  if (ko) ko.mode = "showing";
}

// 처음에는 한국어 자막
video.addEventListener("loadedmetadata", () => {
  showKorean();
});

// ----- 15초 티저 제한 -----
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ----- 자막 전환: pointer 이벤트 -----
function handlePointerDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return; // 왼쪽버튼만
  showEnglish();
}

function handlePointerUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showKorean();
}

document.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointerup", handlePointerUp);

// ----- 비디오 클릭으로 play/pause 토글만 막기 -----
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

  const url = URL.createObjectURL(file);
  const tracks = video.textTracks;
  for (let i = 0; i < tracks.length; i++) {
    if ((tracks[i].language || "").toLowerCase().startsWith("en")) {
      tracks[i].mode = "hidden";
    }
  }
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
