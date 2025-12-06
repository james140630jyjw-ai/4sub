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

// ---- 영상이 멈춰 있으면 다시 재생시키는 함수 (맥북용 응급처치) ----
function keepPlaying() {
  if (video.paused && !video.ended) {
    const p = video.play();
    // 일부 브라우저에서 promise를 던질 수 있어서 안전하게 처리
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  }
}

// ----- 자막 표시 함수 -----
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

// 메타데이터 로드 후 기본은 한국어
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

// ----- 자막 전환 + 강제 재생: pointer 이벤트 -----
function handlePointerDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return; // 왼쪽 버튼만
  showEnglish();
  keepPlaying(); // 맥북에서 down 시점에 멈춰 있으면 재생
}

function handlePointerUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showKorean();
  keepPlaying(); // up 시점에도 한 번 더 재생
}

document.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointerup", handlePointerUp);

// ----- 비디오 기본 클릭 동작(play/pause 토글)만 막기 -----
function blockVideoPointer(e) {
  e.preventDefault(); // 기본 토글 끄기
}
video.addEventListener("pointerdown", blockVideoPointer);
video.addEventListener("pointerup", blockVideoPointer);
video.addEventListener("mousedown", blockVideoPointer);
video.addEventListener("mouseup", blockVideoPointer);
video.addEventListener("click", blockVideoPointer);

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
