import { cookies } from "next/headers";
import { listBusinesses } from "@/lib/businesses/store";
import { listInquiries } from "@/lib/inquiries/store";
import { AppShell, PageHeading } from "@/components/layout/AppShell";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminBusinessList } from "./AdminBusinessList";
import { AdminInquiryList } from "./AdminInquiryList";

const ADMIN_COOKIE = "nomufit_admin";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const isAuthed = cookieStore.get(ADMIN_COOKIE)?.value === "1";

  if (!isAuthed) {
    return (
      <AppShell>
        <PageHeading
          title="관리자"
          description="사업장 전체 관리 화면입니다. 비밀번호가 필요합니다."
        />
        <div className="mx-auto max-w-sm px-4 py-10 sm:px-6">
          <AdminLoginForm />
        </div>
      </AppShell>
    );
  }

  const [businesses, inquiries] = await Promise.all([listBusinesses(), listInquiries()]);

  return (
    <AppShell>
      <PageHeading
        title="관리자"
        description="등록된 모든 사업장을 조회·승인·삭제하고, 정식 이용 문의를 확인할 수 있습니다. 이 화면은 검색·내비게이션에 노출되지 않습니다."
      />
      <div className="mx-auto max-w-4xl space-y-8 px-4 py-6 sm:px-6">
        <section>
          <h2 className="mb-3 text-sm font-bold text-slate-700">정식 이용 문의</h2>
          <AdminInquiryList inquiries={inquiries} />
        </section>
        <section>
          <h2 className="mb-3 text-sm font-bold text-slate-700">사업장 관리</h2>
          <AdminBusinessList businesses={businesses} />
        </section>
      </div>
    </AppShell>
  );
}
