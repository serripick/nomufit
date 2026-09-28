// 0/O, 1/I/L처럼 전화로 불러줄 때 헷갈리는 문자는 제외한다.
const CHARS = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

export function generateTempPassword(length = 8): string {
  let result = "";
  for (let i = 0; i < length; i += 1) {
    result += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return result;
}
