const video = document.getElementById("video");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");
const subtitleBar = document.getElementById("subtitle-bar");

// PC/맥북 공통 안정 작동 — 자막 전환 기능
function getTracks() {
  const tracks = video.textTracks;
  let en = null;
  let ko = null;

  for (let i = 0; i < tracks.length; i++) {
    const t = tracks[i];
    const lang = (t.language || "").toLowerCase();
    const label = (t.label || "").toLowerCase();

    if (!en && (lang.startsWith("en") || label.includes("english"))) en = t;
    if (!ko && (lang.startsWith("ko") || label.includes("korean"))) ko = t;
  }
  return { en, ko };
}

function showEnglish() {
  const { en, ko } = getTracks();
  if (en) en.mode = "showing";
  if (ko) ko.mode = "hidden";
}

function showKorean() {
  const { en, ko } = getTracks();
  if (en) en.mode = "hidden";
  if (ko) ko.mode = "showing";
}

video.addEventListener("loadedmetadata", () => {
  showKorean();
});

// (옵션) 15초 티저 기능
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

/* ============================
   🔥 자막 바에서만 EN/KO 스위치
=============================== */
function subtitleDown(e) {
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

// pointer 이벤트 (최우선)
subtitleBar.addEventListener("pointerdown", subtitleDown);
subtitleBar.addEventListener("pointerup", subtitleUp);
subtitleBar.addEventListener("pointercancel", subtitleUp);

// mouse fallback
subtitleBar.addEventListener("mousedown", subtitleDown);
subtitleBar.addEventListener("mouseup", subtitleUp);
subtitleBar.addEventListener("mouseleave", subtitleUp);

// touch fallback (맥북 터치패드 대응)
subtitleBar.addEventListener("touchstart", subtitleDown, { passive: false });
subtitleBar.addEventListener("touchend", subtitleUp, { passive: false });
subtitleBar.addEventListener("touchcancel", subtitleUp, { passive: false });

/* ============================
   🔥 video 영역은 아무것도 막지 않음
   → 재생, 멈춤, 전체화면, 타임바 전부 정상 동작
=============================== */

/* ============================
   업로드 기능
=============================== */
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
  document.getElementById("track-en").src = url;
  video.load();
});

uploadKoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const url = URL.createObjectURL(file);
  document.getElementById("track-ko").src = url;
  video.load();
});
