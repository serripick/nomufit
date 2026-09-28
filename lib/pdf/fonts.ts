import path from "path";
import { Font } from "@react-pdf/renderer";

let registered = false;

/** react-pdf는 폰트를 명시적으로 등록해야 한글이 깨지지 않는다. 나눔스퀘어라운드는
 * 네이버가 상업적 이용·재배포·임베딩을 허용하는 라이선스로 배포하는 폰트다. */
export function registerPdfFonts() {
  if (registered) return;
  const fontsDir = path.join(process.cwd(), "assets", "fonts");
  Font.register({
    family: "NanumSquareRound",
    fonts: [
      { src: path.join(fontsDir, "NanumSquareRound-Regular.otf"), fontWeight: 400 },
      { src: path.join(fontsDir, "NanumSquareRound-Bold.otf"), fontWeight: 700 },
    ],
  });
  // react-pdf의 기본 자동 하이픈 삽입은 영어 단어 기준이라, 날짜("2026-01-01부터")처럼
  // 공백 없이 긴 한글 혼합 문자열 중간에 불필요한 "-"를 잘못 끼워 넣는다. 단어를 항상
  // 통째로 취급하도록 콜백을 비활성화한다.
  Font.registerHyphenationCallback((word) => [word]);
  registered = true;
}
