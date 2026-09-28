import localFont from "next/font/local";

/** 앱 전체 기본 서체. PDF 임베딩에도 같은 폰트 파일(assets/fonts)을 재사용한다
 * (lib/pdf/fonts.ts) — 상업적 이용·재배포가 자유로운 나눔스퀘어라운드. */
export const nanumSquareRound = localFont({
  src: [
    { path: "../assets/fonts/NanumSquareRound-Light.otf", weight: "300", style: "normal" },
    { path: "../assets/fonts/NanumSquareRound-Regular.otf", weight: "400", style: "normal" },
    { path: "../assets/fonts/NanumSquareRound-Bold.otf", weight: "700", style: "normal" },
    { path: "../assets/fonts/NanumSquareRound-ExtraBold.otf", weight: "800", style: "normal" },
  ],
  variable: "--font-nanum-square-round",
  display: "swap",
});
