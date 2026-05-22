import Link from "next/link";

export const metadata = {
  title: "사업자정보 | SELAH",
  description: "셀라(SELAH) 운영 사업자 정보",
};

export default function BusinessPage() {
  return (
    <main className="min-h-screen bg-white text-neutral-800">
      <div className="mx-auto max-w-3xl px-5 py-12 md:py-16">
        <div className="mb-8">
          <Link
            href="/"
            className="text-sm text-neutral-500 hover:text-neutral-800 transition"
          >
            ← 셀라로 돌아가기
          </Link>
        </div>

        <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-2">
          사업자정보
        </h1>
        <p className="text-sm text-neutral-500 mb-10">
          셀라(SELAH)를 운영하는 사업자 정보입니다.
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border border-neutral-200 p-6 md:p-8 bg-neutral-50/60">
            <dl className="grid grid-cols-1 gap-y-5 text-[15px]">
              <Row label="상호" value="아모브 (AMOV)" />
              <Row label="대표자" value="유상철" />
              <Row label="사업자등록번호" value="630-55-00908" />
              <Row label="사업장 소재지" value="서울시 금천구 한내로 69-54" />
              <Row
                label="이메일"
                value={
                  <a
                    href="mailto:hello@theamov.com"
                    className="underline hover:text-neutral-900"
                  >
                    hello@theamov.com
                  </a>
                }
              />
              <Row label="서비스명" value="셀라 (SELAH)" />
              <Row label="서비스 도메인" value="selah.amov.kr" />
            </dl>
          </div>

          <div className="rounded-xl border border-neutral-200 p-6 text-sm text-neutral-600 leading-relaxed">
            <p className="font-medium text-neutral-800 mb-2">서비스 안내</p>
            <p>
              셀라는 기독교 신앙에 기반한 AI 대화 서비스로, 현재 무료로 제공되고
              있습니다. 결제가 발생하지 않으므로 통신판매업 신고 의무에서
              제외됩니다. 향후 유료 서비스를 도입하는 경우 별도 공지 및 통신판매업
              신고 후 시행됩니다.
            </p>
          </div>

          <div className="rounded-xl border border-neutral-200 p-6 text-sm text-neutral-600 leading-relaxed">
            <p className="font-medium text-neutral-800 mb-2">고객 문의</p>
            <p>
              서비스 이용 문의, 의견 제안, 협업 제안 등은 아래 이메일로
              연락주세요.
              <br />
              <a
                href="mailto:hello@theamov.com"
                className="underline hover:text-neutral-900 mt-1 inline-block"
              >
                hello@theamov.com
              </a>
            </p>
          </div>

          <div className="text-sm text-neutral-500 pt-2">
            <p>
              관련 문서:{" "}
              <Link href="/terms" className="underline hover:text-neutral-800">
                이용약관
              </Link>{" "}
              ·{" "}
              <Link
                href="/privacy"
                className="underline hover:text-neutral-800"
              >
                개인정보처리방침
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[110px_1fr] md:grid-cols-[140px_1fr] gap-x-4">
      <dt className="text-sm text-neutral-500 pt-0.5">{label}</dt>
      <dd className="text-neutral-900">{value}</dd>
    </div>
  );
}
