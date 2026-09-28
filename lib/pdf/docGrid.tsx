import { ReactNode } from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";

export const docStyles = StyleSheet.create({
  page: {
    fontFamily: "NanumSquareRound",
    fontSize: 9,
    color: "#1e293b",
    padding: 36,
    lineHeight: 1.6,
  },
  title: { fontSize: 15, fontWeight: 700, textAlign: "center", letterSpacing: 2 },
  table: { marginTop: 14, borderWidth: 1, borderColor: "#94a3b8" },
  row: { flexDirection: "row" },
  labelCell: {
    width: "18%",
    backgroundColor: "#f1f5f9",
    borderWidth: 0.5,
    borderColor: "#94a3b8",
    padding: 6,
    fontSize: 8,
    fontWeight: 700,
  },
  valueCell: { flex: 1, borderWidth: 0.5, borderColor: "#94a3b8", padding: 6, fontSize: 8.5 },
  paragraph: { marginTop: 10, fontSize: 8.5, lineHeight: 1.7 },
  numberedItem: { marginTop: 3, fontSize: 8.5, lineHeight: 1.6 },
  centerNote: { marginTop: 14, textAlign: "center", fontSize: 8.5 },
  signRow: { marginTop: 16, flexDirection: "row", gap: 20 },
  footerNote: { fontSize: 7, color: "#475569", marginTop: 16, lineHeight: 1.6 },
});

export function DocTitle({ children }: { children: ReactNode }) {
  return <Text style={docStyles.title}>{children}</Text>;
}

export function DocParagraph({ children }: { children: ReactNode }) {
  return <Text style={docStyles.paragraph}>{children}</Text>;
}

export function DocNumberedList({ items }: { items: string[] }) {
  return (
    <View>
      {items.map((t, i) => (
        <Text key={i} style={docStyles.numberedItem}>
          {i + 1}) {t}
        </Text>
      ))}
    </View>
  );
}

interface FieldSpec {
  label: string;
  value: ReactNode;
  span?: number;
}

/** DocTable의 react-pdf 버전. 행 배열을 그대로 받아 라벨/값 칸을 만든다.
 * span은 값 칸이 차지하는 컬럼 폭 배수(전체 폭 기준 비율 계산용)다. */
export function DocTable({ rows }: { rows: FieldSpec[][] }) {
  return (
    <View style={docStyles.table}>
      {rows.map((row, i) => (
        <View key={i} style={docStyles.row}>
          {row.map((f, j) => (
            <View key={j} style={{ flexDirection: "row", flex: f.span ?? 1 }}>
              <Text style={docStyles.labelCell}>{f.label}</Text>
              <Text style={docStyles.valueCell}>{f.value || ""}</Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}
