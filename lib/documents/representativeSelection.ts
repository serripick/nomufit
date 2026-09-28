interface VoterLike {
  name: string;
  birthDate: string;
}

/** 출력 후 수기로도 작성할 수 있도록, 입력된 인원이 적어도 표는 최소 10줄까지 빈 칸으로 채운다.
 * 화면 미리보기(클라이언트 컴포넌트)와 PDF(서버 전용) 양쪽에서 같이 쓰기 위해, useState를 쓰는
 * 문서 폼 컴포넌트 파일과 분리된 순수 함수로 둔다 — 그래야 서버 번들에 클라이언트 훅이 딸려
 * 들어가는 것을 피할 수 있다. */
export function padVoterRows<T extends VoterLike>(voters: T[], minRows = 10) {
  const rows = voters.map((v, i) => ({ index: i + 1, name: v.name, birthDate: v.birthDate }));
  for (let i = rows.length; i < minRows; i += 1) {
    rows.push({ index: i + 1, name: "", birthDate: "" });
  }
  return rows;
}
