const video = document.getElementById("video");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player script loaded");

// ----------------------------------------------------------
// ① 한국어 트랙을 동적으로 생성 (기본 자막 = 영어 보장)
// ----------------------------------------------------------
let trackKoEl = document.createElement("track");
trackKoEl.id = "track-ko";
trackKoEl.label = "Korean";
trackKoEl.kind = "subtitles";
trackKoEl.srclang = "ko";
trackKoEl.src = "sample/sample_ko.vtt";
video.appendChild(trackKoEl);

// 한국어 트랙 로딩 감시 (중요!)
trackKoEl.addEventListener("load", () => {
  console.log("한국어 트랙 로딩 완료");
});

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
  console.log("→ KO (attempt)");

  // 한국어 트랙이 아직 준비 안 됐으면 반복 체크
  if (!ko || ko.readyState !== 2) {
    console.log("KO track not ready yet, retrying…");
    setTimeout(showKorean, 50);
    return;
  }

  if (en) en.mode = "hidden";
  ko.mode = "showing";
}

// ----------------------------------------------------------
// 기본 자막 = 영어로 강제 (트랙 로딩까지 대기)
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
// pointer 이벤트 (자막 전환) → document 전체에서만 처리
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
// video 요소에서 pointer 차단 코드 제거 → 재생/일시정지 버튼 정상화
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
  trackKoEl.src = url; // 동적 생성된 한국어 트랙
  video.load();
});
