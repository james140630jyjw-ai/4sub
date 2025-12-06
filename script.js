const video = document.getElementById("video");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");
const subtitleBar = document.getElementById("subtitle-bar");

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

// ----- 15초 티저 제한 (원하면 유지, 필요 없으면 이 블록 삭제해도 됨) -----
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ----- 자막 전환: "자막 바"에서만 동작하게 -----
function handleSubtitleDown(e) {
  // 마우스 오른쪽 버튼 등은 무시
  if (e.type === "pointerdown" && e.pointerType === "mouse" && e.button !== 0) return;
  if (e.type === "mousedown" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  showEnglish();
}

function handleSubtitleUp(e) {
  if (e.type === "pointerup" && e.pointerType === "mouse" && e.button !== 0) return;
  if (e.type === "mouseup" && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  showKorean();
}

// 최신 브라우저: pointer 이벤트
if ("onpointerdown" in window) {
  subtitleBar.addEventListener("pointerdown", handleSubtitleDown);
  subtitleBar.addEventListener("pointerup", handleSubtitleUp);
  subtitleBar.addEventListener("pointercancel", handleSubtitleUp);
} else {
  // fallback: mouse / touch
  subtitleBar.addEventListener("mousedown", handleSubtitleDown);
  subtitleBar.addEventListener("mouseup", handleSubtitleUp);
  subtitleBar.addEventListener("mouseleave", handleSubtitleUp);

  subtitleBar.addEventListener("touchstart", handleSubtitleDown, { passive: false });
  subtitleBar.addEventListener("touchend", handleSubtitleUp, { passive: false });
  subtitleBar.addEventListener("touchcancel", handleSubtitleUp, { passive: false });
}

// ⚠️ 중요: 더 이상 document 전체나 video에 클릭/포인터 막는 코드 없음
// → 다른 곳 터치는 원래대로 재생/일시정지/전체화면 다 잘 동작함

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
