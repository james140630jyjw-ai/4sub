const video = document.getElementById("video");
const subtitleTouch = document.getElementById("subtitle-touch-overlay");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

// 자막 트랙 가져오기
function getTracks() {
  const tracks = video.textTracks;
  let en = null, ko = null;

  for (let t of tracks) {
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

// 메타데이터 로드 후 기본 한국어
video.addEventListener("loadedmetadata", () => showKorean());

// ===== 자막 터치 이벤트 (영상 아래 overlay만 처리) =====
function down(e) {
  if (e.button !== undefined && e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  showEnglish();
}

function up(e) {
  if (e.button !== undefined && e.button !== 0) return;
  e.preventDefault();
  e.stopPropagation();
  showKorean();
}

subtitleTouch.addEventListener("pointerdown", down);
subtitleTouch.addEventListener("pointerup", up);
subtitleTouch.addEventListener("pointercancel", up);

subtitleTouch.addEventListener("mousedown", down);
subtitleTouch.addEventListener("mouseup", up);
subtitleTouch.addEventListener("mouseleave", up);

subtitleTouch.addEventListener("touchstart", down, { passive: false });
subtitleTouch.addEventListener("touchend", up, { passive: false });
subtitleTouch.addEventListener("touchcancel", up, { passive: false });

// ===== 업로드 기능 =====
uploadVideoInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;
  video.src = URL.createObjectURL(file);
  video.load();
  video.play();
});

uploadEnInput.addEventListener("change", (e) => {
  const url = URL.createObjectURL(e.target.files[0]);
  document.getElementById("track-en").src = url;
  video.load();
});

uploadKoInput.addEventListener("change", (e) => {
  const url = URL.createObjectURL(e.target.files[0]);
  document.getElementById("track-ko").src = url;
  video.load();
});
