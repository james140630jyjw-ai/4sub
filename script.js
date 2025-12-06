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

// ----- 15초 티저 제한 (원하면 유지, 필요 없으면 이 블록 삭제 가능) -----
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ====== 🔥 여기부터 핵심: 자막 바에서만 EN/KO 스위치 ======

// 공통 핸들러 (pointer / mouse / touch 전부 이걸로 호출)
function subtitleDown(e) {
  // 마우스 오른쪽 버튼 등은 무시
  if (e.button !== undefined && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  showEnglish();
}

function subtitleUp(e) {
  if (e.button !== undefined && e.button !== 0) return;

  e.preventDefault();
  e.stopPropagation();

  showKorean();
}

// pointer 이벤트
subtitleBar.addEventListener("pointerdown", subtitleDown);
subtitleBar.addEventListener("pointerup", subtitleUp);
subtitleBar.addEventListener("pointercancel", subtitleUp);

// mouse fallback
subtitleBar.addEventListener("mousedown", subtitleDown);
subtitleBar.addEventListener("mouseup", subtitleUp);
subtitleBar.addEventListener("mouseleave", subtitleUp);

// touch fallback (맥북 트랙패드 제스처, 터치 스크린 등)
subtitleBar.addEventListener("touchstart", subtitleDown, { passive: false });
subtitleBar.addEventListener("touchend", subtitleUp, { passive: false });
subtitleBar.addEventListener("touchcancel", subtitleUp, { passive: false });

// ❗ 더 이상 document 전체나 video에 이벤트 안 건드림
//    → 영상 위/다른 곳 터치는 전부 브라우저 기본 동작 (재생/일시정지/전체화면) 그대로 유지됨

// ====== 업로드 기능 ======

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
