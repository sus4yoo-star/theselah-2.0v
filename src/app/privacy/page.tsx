import Link from "next/link";

export const metadata = {
  title: "개인정보처리방침 | SELAH",
  description: "셀라(SELAH) 개인정보처리방침",
};

export default function PrivacyPage() {
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
          개인정보처리방침
        </h1>
        <p className="text-sm text-neutral-500 mb-10">
          시행일: 2026년 5월 23일
        </p>

        <div className="prose prose-neutral max-w-none text-[15px] leading-relaxed space-y-8">
          <section>
            <p className="text-neutral-700">
              아모브(AMOV, 이하 &quot;회사&quot;)는 정보통신망 이용촉진 및 정보보호
              등에 관한 법률, 개인정보 보호법 등 관련 법령을 준수하며, 셀라(SELAH,
              이하 &quot;서비스&quot;) 이용자의 개인정보를 소중히 보호하기 위해 다음과
              같은 처리방침을 두고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제1조 (개인정보의 처리 목적)
            </h2>
            <p>회사는 다음의 목적을 위해 개인정보를 처리합니다.</p>
            <ol className="list-decimal pl-6 mt-2 space-y-1">
              <li>회원가입, 본인 확인, 회원 자격 유지 및 관리</li>
              <li>AI 대화 서비스 제공 및 사용자 맞춤화</li>
              <li>서비스 운영, 품질 개선, 신규 기능 개발</li>
              <li>법령 및 약관 위반 행위 방지, 분쟁 조정 및 민원 처리</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제2조 (수집하는 개인정보 항목)
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-300">
                    <th className="text-left py-2 pr-4 font-semibold">구분</th>
                    <th className="text-left py-2 font-semibold">항목</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4 align-top">회원가입 시 (필수)</td>
                    <td className="py-2">
                      이메일, 닉네임(또는 이름), 프로필 사진(소셜 로그인 제공
                      범위), 소셜 로그인 식별자
                    </td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4 align-top">서비스 이용 중</td>
                    <td className="py-2">
                      대화 내용, 사용자가 직접 업로드한 이미지·텍스트, 서비스
                      이용 기록
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top">자동 수집</td>
                    <td className="py-2">
                      접속 IP, 브라우저 정보, 기기 정보, 쿠키, 접속 로그
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제3조 (개인정보의 보유 및 이용기간)
            </h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                회원 정보: 회원 탈퇴 시까지 보유하며, 탈퇴 후 30일 동안 복구
                목적으로 보관한 뒤 영구 삭제합니다.
              </li>
              <li>
                대화 기록: 통신비밀보호법에 따라 최대 3년간 보관 후 삭제합니다.
              </li>
              <li>
                관련 법령에 따라 보존이 요구되는 경우 해당 법령이 정한 기간 동안
                보관합니다 (예: 전자상거래법, 통신비밀보호법 등).
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제4조 (개인정보의 제3자 제공)
            </h2>
            <p>
              회사는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
              다만 다음의 경우는 예외로 합니다.
            </p>
            <ol className="list-decimal pl-6 mt-2 space-y-1">
              <li>이용자가 사전에 동의한 경우</li>
              <li>
                법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와
                방법에 따라 수사기관의 요구가 있는 경우
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제5조 (개인정보 처리의 위탁)
            </h2>
            <p>
              회사는 안정적인 서비스 제공을 위해 다음과 같이 개인정보 처리
              업무를 위탁하고 있습니다.
            </p>
            <div className="overflow-x-auto mt-3">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="border-b border-neutral-300">
                    <th className="text-left py-2 pr-4 font-semibold">
                      수탁업체
                    </th>
                    <th className="text-left py-2 pr-4 font-semibold">
                      위탁 업무
                    </th>
                    <th className="text-left py-2 font-semibold">소재</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4 align-top">Supabase Inc.</td>
                    <td className="py-2 pr-4">
                      사용자 인증, 데이터베이스 호스팅
                    </td>
                    <td className="py-2">미국</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4 align-top">Anthropic PBC</td>
                    <td className="py-2 pr-4">AI 대화 응답 생성</td>
                    <td className="py-2">미국</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4 align-top">Google LLC</td>
                    <td className="py-2 pr-4">소셜 로그인 인증</td>
                    <td className="py-2">미국</td>
                  </tr>
                  <tr className="border-b border-neutral-100">
                    <td className="py-2 pr-4 align-top">Kakao Corp.</td>
                    <td className="py-2 pr-4">소셜 로그인 인증</td>
                    <td className="py-2">대한민국</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 align-top">Netlify Inc.</td>
                    <td className="py-2 pr-4">웹사이트 호스팅 및 배포</td>
                    <td className="py-2">미국</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              해외 수탁업체에 개인정보가 이전될 수 있으며, 본 처리방침의 동의를
              통해 이전에 대한 동의가 이루어집니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제6조 (정보주체의 권리·의무 및 행사방법)
            </h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                이용자는 언제든지 자신의 개인정보를 조회, 수정, 삭제, 처리정지를
                요청할 수 있습니다.
              </li>
              <li>
                권리 행사는 서비스 내 설정 메뉴 또는 아래 이메일로 요청할 수
                있으며, 회사는 지체 없이 조치하겠습니다.
              </li>
              <li>
                만 14세 미만 아동의 개인정보는 처리하지 않습니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제7조 (개인정보의 파기)
            </h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>
                회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가
                불필요하게 되었을 때 지체 없이 해당 개인정보를 파기합니다.
              </li>
              <li>
                전자적 파일 형태의 정보는 복구 및 재생할 수 없는 기술적
                방법으로 영구 삭제합니다.
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제8조 (개인정보의 안전성 확보 조치)
            </h2>
            <ol className="list-decimal pl-6 space-y-1">
              <li>전송 구간 암호화(HTTPS/TLS)</li>
              <li>저장 데이터 접근 권한 통제 (Supabase Row Level Security)</li>
              <li>비밀번호 미저장 (소셜 로그인만 사용)</li>
              <li>접속기록 보관 및 정기 점검</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제9조 (자동 수집 장치의 설치·운영 및 거부)
            </h2>
            <p>
              서비스는 사용자 경험 향상을 위해 쿠키 및 브라우저 로컬 스토리지를
              사용합니다. 이용자는 브라우저 설정을 통해 쿠키 저장을 거부할 수
              있으나, 이 경우 일부 서비스 이용에 제한이 있을 수 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제10조 (개인정보 보호책임자)
            </h2>
            <div className="rounded-lg border border-neutral-200 p-4 bg-neutral-50">
              <p className="text-sm">
                <strong>책임자:</strong> 유상철
                <br />
                <strong>소속:</strong> 아모브(AMOV)
                <br />
                <strong>이메일:</strong>{" "}
                <a
                  href="mailto:hello@theamov.com"
                  className="underline hover:text-neutral-900"
                >
                  hello@theamov.com
                </a>
              </p>
            </div>
            <p className="mt-3 text-sm text-neutral-600">
              개인정보 침해에 대한 신고나 상담이 필요한 경우 아래 기관에 문의할
              수 있습니다.
            </p>
            <ul className="list-disc pl-6 mt-2 text-sm text-neutral-600 space-y-0.5">
              <li>개인정보침해신고센터: privacy.kisa.or.kr / 국번없이 118</li>
              <li>개인정보보호위원회: pipc.go.kr</li>
              <li>대검찰청 사이버수사과: spo.go.kr</li>
              <li>경찰청 사이버수사국: ecrm.police.go.kr</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              제11조 (개인정보처리방침의 변경)
            </h2>
            <p>
              본 처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경 사항이
              있을 시 변경 사항의 시행 7일 전부터 공지합니다.
            </p>
          </section>

          <section className="border-t border-neutral-200 pt-6 mt-12">
            <h2 className="text-base font-semibold mb-2">부칙</h2>
            <p className="text-sm text-neutral-600">
              본 개인정보처리방침은 2026년 5월 23일부터 시행합니다.
            </p>
          </section>

          <section className="text-sm text-neutral-500 pt-4">
            <p>
              관련 문서:{" "}
              <Link href="/terms" className="underline hover:text-neutral-800">
                이용약관
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
