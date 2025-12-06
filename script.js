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

// ---- 영상 멈춤 방지 (맥북용)
function keepPlaying() {
  if (video.paused && !video.ended) {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  }
}

// ----- 자막 표시 함수
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

// ***** 기본 자막을 진짜 영어로 강제하는 안정 버전 *****
video.addEventListener("loadedmetadata", () => {
  const attemptDefault = () => {
    const { en, ko } = getTracks();
    if (en && ko && en.readyState === 2 && ko.readyState === 2) {
      showEnglish();
      console.log("기본 영어 자막 적용 완료");
    } else {
      // 트랙이 아직 초기화 중이면 조금 후에 다시 시도
      setTimeout(attemptDefault, 50);
    }
  };
  attemptDefault();
});

// ----- 15초 티저 제한
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ----- 자막 전환 + 강제 재생
function handlePointerDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showKorean();
  keepPlaying();
}

function handlePointerUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showEnglish();
  keepPlaying();
}

document.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointerup", handlePointerUp);

// ----- 비디오 기본 토글(play/pause)만 막기
function blockVideoPointer(e) {
  e.preventDefault();
}
video.addEventListener("pointerdown", blockVideoPointer);
video.addEventListener("pointerup", blockVideoPointer);
video.addEventListener("mousedown", blockVideoPointer);
video.addEventListener("mouseup", blockVideoPointer);
video.addEventListener("click", blockVideoPointer);

// ----- 업로드 기능
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
  const el = document.getElementById("track-en");
  el.src = url;
  video.load();
});

uploadKoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const url = URL.createObjectURL(file);
  const el = document.getElementById("track-ko");
  el.src = url;
  video.load();
});
