"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { InquiryForm } from "@/components/forms/InquiryForm";

export default function ContactPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <PageHeading title="이용문의" description="불러오는 중입니다..." />
        </AppShell>
      }
    >
      <ContactPageContent />
    </Suspense>
  );
}

function ContactPageContent() {
  const searchParams = useSearchParams();
  const businessRegistrationNumber = searchParams.get("reg") ?? "";
  const businessName = searchParams.get("name") ?? "";

  return (
    <AppShell>
      <PageHeading
        title="이용문의"
        description="노무핏 도입이나 요금이 궁금하시면 아래에 담당자 연락처를 남겨주세요. 확인 후 안내해드립니다."
      />
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6">
        <InquiryForm
          businessRegistrationNumber={businessRegistrationNumber}
          businessName={businessName}
        />
      </div>
    </AppShell>
  );
}
