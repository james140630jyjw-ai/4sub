const video = document.getElementById("video");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player script loaded");

// ----------------------------------------------------------
// ① 한국어 트랙을 동적으로 생성 (기본 영어 보장)
// ----------------------------------------------------------
let trackKoEl = document.createElement("track");
trackKoEl.id = "track-ko";
trackKoEl.label = "Korean";
trackKoEl.kind = "subtitles";
trackKoEl.srclang = "ko";
trackKoEl.src = "sample/sample_ko.vtt";
video.appendChild(trackKoEl);

// ----------------------------------------------------------
// EN/KO 트랙 객체 찾기
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 맥북 pause 방지
// ----------------------------------------------------------
function keepPlaying() {
  if (video.paused && !video.ended) {
    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }
}

// ----------------------------------------------------------
// 자막 표시 함수
// ----------------------------------------------------------
function showEnglish() {
  const { en, ko } = getTracks();
  console.log("→ EN");
  if (en) en.mode = "showing";
  if (ko) ko.mode = "hidden";
}

function showKorean() {
  const { en, ko } = getTracks();
  console.log("→ KO");
  if (en) en.mode = "hidden";
  if (ko) ko.mode = "showing";
}

// ----------------------------------------------------------
// 기본 자막을 영어로 강제 (트랙 로딩 대기 포함)
// ----------------------------------------------------------
video.addEventListener("loadedmetadata", () => {
  function forceEnglish() {
    const { en, ko } = getTracks();
    if (en && ko && en.readyState === 2 && ko.readyState === 2) {
      showEnglish();
      console.log("기본 영어 자막 적용 완료");
    } else {
      setTimeout(forceEnglish, 50);
    }
  }
  forceEnglish();
});

// ----------------------------------------------------------
// 15초 티저 제한
// ----------------------------------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ----------------------------------------------------------
// (핵심 수정) pointer 이벤트는 오직 document에서만 처리
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// ⚠️ (중요) video 요소의 pointerdown/up/click 차단 코드 삭제됨
//     -> 재생/일시정지 버튼 정상 작동
// ----------------------------------------------------------

// ----------------------------------------------------------
// 업로드 기능
// ----------------------------------------------------------
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
  trackKoEl.src = url;
  video.load();
});
