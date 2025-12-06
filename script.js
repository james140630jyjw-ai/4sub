const video = document.getElementById("video");
const uploadVideoInput = document.getElementById("upload-video");
const uploadEnInput = document.getElementById("upload-en");
const uploadKoInput = document.getElementById("upload-ko");

console.log("subtitle player script loaded");

// ----------------------------------------------------------
// ① 한국어 트랙을 동적으로 생성해서 HTML 뒤에 붙인다
//    → 기본 선택은 절대로 영어가 됨 (브라우저 규칙 100% 우회)
// ----------------------------------------------------------
let trackKoEl = document.createElement("track");
trackKoEl.id = "track-ko";
trackKoEl.label = "Korean";
trackKoEl.kind = "subtitles";
trackKoEl.srclang = "ko";
trackKoEl.src = "sample/sample_ko.vtt";
video.appendChild(trackKoEl);

// ----------------------------------------------------------
// EN/KO 트랙 객체 가져오기
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// 맥북에서 pointer 이벤트로 pause 되는 문제 방지
// ----------------------------------------------------------
function keepPlaying() {
  if (video.paused && !video.ended) {
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {});
    }
  }
}

// ----------------------------------------------------------
// 자막 표시 함수
// ----------------------------------------------------------
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

// ----------------------------------------------------------
// ② 기본 자막 = 영어 (트랙 로드 완료까지 반복 체크)
// ----------------------------------------------------------
video.addEventListener("loadedmetadata", () => {
  function forceEnglish() {
    const { en, ko } = getTracks();

    if (en && ko && en.readyState === 2 && ko.readyState === 2) {
      showEnglish();  // ← 기본 영어
      console.log("기본 영어 자막 적용 완료");
    } else {
      setTimeout(forceEnglish, 50);
    }
  }
  forceEnglish();
});

// ----------------------------------------------------------
// ③ 15초 티저 제한
// ----------------------------------------------------------
video.addEventListener("timeupdate", () => {
  if (video.currentTime > 15) {
    video.pause();
    video.currentTime = 0;
  }
});

// ----------------------------------------------------------
// ④ 자막 전환 + 강제 재생
// ----------------------------------------------------------
function handlePointerDown(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showKorean();   // 누르는 동안 한국어
  keepPlaying();
}

function handlePointerUp(e) {
  if (e.pointerType === "mouse" && e.button !== 0) return;
  showEnglish();  // 손 떼면 영어
  keepPlaying();
}

document.addEventListener("pointerdown", handlePointerDown);
document.addEventListener("pointerup", handlePointerUp);

// ----------------------------------------------------------
// ⑤ 비디오 클릭으로 재생/정지되지 않게 막기
// ----------------------------------------------------------
function blockVideoPointer(e) {
  e.preventDefault();
}

video.addEventListener("pointerdown", blockVideoPointer);
video.addEventListener("pointerup", blockVideoPointer);
video.addEventListener("mousedown", blockVideoPointer);
video.addEventListener("mouseup", blockVideoPointer);
video.addEventListener("click", blockVideoPointer);

// ----------------------------------------------------------
// ⑥ 업로드 기능
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
