import { View, Text, StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    fontFamily: "NanumSquareRound",
    fontSize: 9,
    color: "#1e293b",
    padding: 28,
    lineHeight: 1.5,
  },
  title: { fontSize: 15, fontWeight: 700, textAlign: "center" },
  titleNote: { fontSize: 8.5, textAlign: "center", color: "#475569", marginTop: 6 },
  section: { borderWidth: 1, borderColor: "#cbd5e1", borderBottomWidth: 0 },
  sectionEnd: { borderBottomWidth: 1, borderColor: "#cbd5e1" },
  articleRow: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#cbd5e1" },
  articleRowFirst: { flexDirection: "row" },
  articleLabel: {
    width: 62,
    backgroundColor: "#f8fafc",
    borderRightWidth: 1,
    borderRightColor: "#cbd5e1",
    padding: 6,
    fontSize: 7.5,
    fontWeight: 700,
    textAlign: "center",
  },
  articleBody: { flex: 1, padding: 7, fontSize: 8.5 },
  clauseItem: { marginBottom: 2, fontSize: 8.5 },
  table: { borderWidth: 1, borderColor: "#cbd5e1", marginTop: 4 },
  tr: { flexDirection: "row" },
  th: {
    flex: 1,
    borderWidth: 0.5,
    borderColor: "#cbd5e1",
    backgroundColor: "#f8fafc",
    padding: 3,
    fontSize: 7.5,
    fontWeight: 700,
    textAlign: "center",
  },
  td: { flex: 1, borderWidth: 0.5, borderColor: "#cbd5e1", padding: 3, fontSize: 8 },
  tdNote: { color: "#64748b" },
  kvTable: { borderWidth: 1, borderColor: "#cbd5e1", borderRadius: 2 },
  kvHeading: {
    backgroundColor: "#f1f5f9",
    padding: 4,
    fontSize: 8,
    fontWeight: 700,
    borderBottomWidth: 1,
    borderColor: "#cbd5e1",
  },
  kvRow: { flexDirection: "row", borderTopWidth: 0.5, borderColor: "#e2e8f0" },
  kvLabel: { width: 56, backgroundColor: "#f8fafc", padding: 4, fontSize: 7.5, color: "#64748b" },
  kvValue: { flex: 1, padding: 4, fontSize: 8 },
  footerNote: { fontSize: 7, color: "#475569", marginTop: 14, lineHeight: 1.6 },
});

const CIRCLED_NUMERALS = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

const ISO_DATE_PATTERN = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;

/** react-pdf의 줄바꿈 로직은 하이픈(-)을 영어 단어처럼 break 지점으로 취급해서,
 * "2026-01-01부터" 같은 날짜+조사 조합이 줄 끝에서 날짜 중간에 쪼개질 수 있다. 줄바꿈이
 * 되지 않는 유니코드 하이픈은 이 폰트에 글리프가 없어 문자가 사라지므로, 문장 안에서는
 * 아예 하이픈이 없는 "2026년 1월 1일" 형식으로 바꿔 이 문제를 원천적으로 피한다. */
export function nb(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  const str = String(value);
  const match = str.match(ISO_DATE_PATTERN);
  if (!match) return str;
  const [, y, m, d] = match;
  return `${y}년 ${Number(m)}월 ${Number(d)}일`;
}

export function ArticleRow({
  number,
  title,
  first = false,
  children,
}: {
  number: number;
  title: string;
  first?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={first ? styles.articleRowFirst : styles.articleRow} wrap={false}>
      <View style={styles.articleLabel}>
        <Text>제{number}조</Text>
        <Text>{title}</Text>
      </View>
      <View style={styles.articleBody}>{children}</View>
    </View>
  );
}

export function ClauseList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((t, i) => (
        <Text key={i} style={styles.clauseItem}>
          {CIRCLED_NUMERALS[i] ?? `${i + 1}.`} {t}
        </Text>
      ))}
    </View>
  );
}

export function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvLabel}>{label}</Text>
      <Text style={styles.kvValue}>{value || "미입력"}</Text>
    </View>
  );
}

export function PartyBox({ title, rows }: { title: string; rows: { label: string; value: string }[] }) {
  return (
    <View style={styles.kvTable}>
      <Text style={styles.kvHeading}>{title}</Text>
      {rows.map((r) => (
        <KeyValueRow key={r.label} label={r.label} value={r.value} />
      ))}
    </View>
  );
}

export function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tr}>
        {headers.map((h) => (
          <Text key={h} style={styles.th}>
            {h}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View key={i} style={styles.tr}>
          {row.map((cell, j) => (
            <Text key={j} style={styles.td}>
              {cell}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}
