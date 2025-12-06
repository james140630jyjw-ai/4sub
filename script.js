const video = document.getElementById("video");
const trackEn = document.getElementById("track-en");
const trackKo = document.getElementById("track-ko");

let holding = false;

// 언어 전환 함수
function useEnglish() {
    trackEn.mode = "showing";
    trackKo.mode = "hidden";
}

function useKorean() {
    trackEn.mode = "hidden";
    trackKo.mode = "showing";
}

// 공통 pointer 이벤트로 통합 (모바일 + 데스크탑 완전 대응)
document.addEventListener("pointerdown", (e) => {
    holding = true;
    e.preventDefault();    // ← PC에서 pause 되는 문제 해결
    useEnglish();
});

document.addEventListener("pointerup", (e) => {
    holding = false;
    e.preventDefault();    // ← mouseup 충돌 방지
    useKorean();
});

// video 클릭 시 기본 클릭 동작 제거 (정지 방지)
video.addEventListener("pointerdown", (e) => {
    e.preventDefault();
});
video.addEventListener("pointerup", (e) => {
    e.preventDefault();
});

// 기본 자막: 한국어
useKorean();
