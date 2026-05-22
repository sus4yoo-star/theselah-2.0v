import Link from "next/link";

export const metadata = {
  title: "이용약관 | SELAH",
  description: "셀라(SELAH) 서비스 이용약관",
};

export default function TermsPage() {
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
          이용약관
        </h1>
        <p className="text-sm text-neutral-500 mb-10">
          시행일: 2026년 5월 23일
        </p>

        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed space-y-8">
          <section>
            <h2 className="text-lg font-semibold mt-0 mb-3">제1조 (목적)</h2>
            <p>
              본 약관은 아모브(AMOV, 이하 &quot;회사&quot;)가 제공하는
              셀라(SELAH, 이하 &quot;서비스&quot;)의 이용과 관련하여 회사와
              이용자 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제2조 (정의)</h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                &quot;서비스&quot;란 회사가 제공하는 셀라(SELAH) 웹·모바일
                플랫폼 및 관련 일체의 서비스를 의미합니다.
              </li>
              <li>
                &quot;이용자&quot;란 본 약관에 동의하고 서비스를 이용하는 자를
                말합니다.
              </li>
              <li>
                &quot;회원&quot;이란 서비스에 회원가입을 완료한 이용자를
                말합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제3조 (약관의 효력 및 변경)
            </h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                본 약관은 서비스 화면에 게시하거나 기타 방법으로 이용자에게
                공지함으로써 효력이 발생합니다.
              </li>
              <li>
                회사는 관련 법령을 위배하지 않는 범위에서 본 약관을 개정할 수
                있으며, 약관을 개정할 경우 적용일자 및 개정 사유를 명시하여
                현행 약관과 함께 적용일자 7일 전부터 공지합니다. 다만 이용자에게
                불리한 변경의 경우 30일 전부터 공지합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제4조 (서비스의 성격)</h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                셀라는 기독교 신앙에 기반한 영적 동행 및 위로를 목적으로 하는
                AI 기반 대화 서비스입니다.
              </li>
              <li>
                회사는 무료로 서비스를 제공하며, 향후 유료 기능을 도입할 경우
                별도로 공지합니다.
              </li>
              <li>
                회사는 서비스의 품질 향상 및 운영상의 필요에 따라 서비스의
                내용을 변경하거나 일시 중단할 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제5조 (회원가입 및 자격)
            </h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                이용자는 Google 또는 Kakao 계정을 통해 회원가입을 신청할 수
                있습니다.
              </li>
              <li>
                만 14세 미만의 아동은 회원가입을 할 수 없습니다.
              </li>
              <li>
                회사는 다음 각 호에 해당하는 경우 회원가입을 거절하거나 사후에
                회원 자격을 박탈할 수 있습니다.
                <ul className="list-disc pl-6 mt-1 space-y-0.5">
                  <li>타인의 정보를 도용하여 가입한 경우</li>
                  <li>허위 정보를 기재한 경우</li>
                  <li>본 약관에 위배되는 행위를 한 경우</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제6조 (회원의 의무)</h2>
            <p>회원은 다음 행위를 하여서는 안 됩니다.</p>
            <ol className="list-decimal pl-6 mt-2 space-y-1">
              <li>타인의 정보를 도용하거나 허위 정보를 등록하는 행위</li>
              <li>
                서비스를 통해 얻은 정보를 무단으로 복제·배포·상업적으로 이용하는
                행위
              </li>
              <li>
                서비스의 운영을 방해하거나 서버에 부담을 주는 행위
              </li>
              <li>
                타인을 모욕, 협박, 명예훼손하거나 공서양속에 반하는 내용을
                입력하는 행위
              </li>
              <li>관련 법령에 위반되는 행위</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제7조 (서비스 이용 제한 및 회원 탈퇴)
            </h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                회원은 언제든지 서비스 내 설정을 통해 회원 탈퇴를 요청할 수
                있습니다.
              </li>
              <li>
                회원 탈퇴 시 회원의 개인정보 및 대화 기록은 탈퇴일로부터 30일
                이후 영구 삭제됩니다. 30일 이내에는 복구 요청이 가능합니다.
              </li>
              <li>
                회사는 회원이 본 약관을 위반하거나 서비스의 정상적인 운영을
                방해한 경우, 사전 통보 후 서비스 이용을 제한하거나 회원 자격을
                해지할 수 있습니다.
              </li>
            </ol>
          </section>

          <section>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-5">
              <h2 className="text-lg font-semibold mb-3 text-amber-900">
                제8조 (면책 및 책임의 한계)
              </h2>
              <ol className="list-decimal pl-6 space-y-2 text-amber-900/90">
                <li>
                  <strong>본 서비스는 의료, 심리, 법률, 신학 상담을 대체하지
                  않습니다.</strong> 셀라는 AI 기반의 영적 동반 도구로서, 진단,
                  치료, 처방, 신학적 권위를 가진 답변을 제공하지 않습니다.
                </li>
                <li>
                  심각한 정신적·신체적 어려움을 겪고 있다면, 즉시 전문가의
                  도움을 받으시기 바랍니다.
                  <ul className="list-disc pl-6 mt-1 space-y-0.5 text-sm">
                    <li>자살예방상담전화: 1393 (24시간)</li>
                    <li>정신건강위기상담: 1577-0199</li>
                    <li>응급상황: 119</li>
                  </ul>
                </li>
                <li>
                  회사는 AI가 생성한 응답의 정확성, 완전성, 신학적 적합성에 대해
                  보증하지 않으며, 이용자는 본인의 판단과 책임 하에 서비스를
                  이용합니다.
                </li>
                <li>
                  회사는 천재지변, 통신장애, 제3자 서비스(Google, Kakao,
                  Supabase, Anthropic 등)의 장애 등 회사의 합리적 통제 범위를
                  벗어난 사유로 인한 손해에 대해 책임을 지지 않습니다.
                </li>
              </ol>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">제9조 (분쟁의 해결)</h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                본 약관에 관한 분쟁은 대한민국 법률에 따라 해결합니다.
              </li>
              <li>
                서비스 이용과 관련하여 회사와 이용자 간에 발생한 분쟁에 대한
                관할 법원은 민사소송법에 따른 관할 법원으로 합니다.
              </li>
            </ol>
          </section>

          <section className="border-t border-neutral-200 pt-6 mt-12">
            <h2 className="text-base font-semibold mb-2">부칙</h2>
            <p className="text-sm text-neutral-600">
              본 약관은 2026년 5월 23일부터 시행합니다.
            </p>
          </section>

          <section className="text-sm text-neutral-500 pt-4">
            <p>
              관련 문서:{" "}
              <Link href="/privacy" className="underline hover:text-neutral-800">
                개인정보처리방침
              </Link>{" "}
              ·{" "}
              <Link href="/business" className="underline hover:text-neutral-800">
                사업자정보
              </Link>
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
