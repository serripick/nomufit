import Link from "next/link";

export function InquiryNote({
  businessRegistrationNumber = "",
  businessName = "",
}: {
  businessRegistrationNumber?: string;
  businessName?: string;
}) {
  const params = new URLSearchParams();
  if (businessRegistrationNumber) params.set("reg", businessRegistrationNumber);
  if (businessName) params.set("name", businessName);
  const href = params.toString() ? `/contact?${params.toString()}` : "/contact";

  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-blue-50 px-4 py-3 text-sm print:hidden">
      <span className="text-slate-600">저장 문서 출력을 원하시면 이용문의를 남겨주세요.</span>
      <Link href={href} className="flex-shrink-0 font-semibold text-blue-600 hover:underline">
        이용문의 <span aria-hidden="true">→</span>
      </Link>
    </div>
  );
}
