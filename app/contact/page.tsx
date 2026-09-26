import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { InquiryForm } from "@/components/forms/InquiryForm";

export default function ContactPage() {
  return (
    <AppShell>
      <PageHeading
        title="이용문의"
        description="노무핏 도입이나 요금이 궁금하시면 아래에 담당자 연락처를 남겨주세요. 확인 후 안내해드립니다."
      />
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <InquiryForm />
      </div>
    </AppShell>
  );
}
