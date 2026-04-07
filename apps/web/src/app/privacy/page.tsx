import Link from 'next/link';

export const metadata = {
  title: '개인정보처리방침 | CampUs',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-screen-lg px-6 py-16">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">개인정보처리방침</h1>

      <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">1. 개인정보의 수집 및 이용 목적</h2>
          <p>
            CampUs(이하 &quot;서비스&quot;)는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
            이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지</li>
            <li>서비스 제공: 캠핑 체크리스트 관리, 캠핑장 정보 제공, 맞춤형 콘텐츠 제공</li>
            <li>서비스 개선: 신규 서비스 개발 및 기존 서비스 개선, 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">2. 수집하는 개인정보 항목</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>필수항목: 이메일 주소, 비밀번호, 닉네임</li>
            <li>선택항목: 프로필 이미지</li>
            <li>자동 수집 항목: 서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보, 기기 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">3. 개인정보의 보유 및 이용 기간</h2>
          <p>
            이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다.
            단, 관계법령의 규정에 의하여 보존할 필요가 있는 경우 일정 기간 동안 개인정보를 보관합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>계약 또는 청약철회 등에 관한 기록: 5년 (전자상거래법)</li>
            <li>대금결제 및 재화 등의 공급에 관한 기록: 5년 (전자상거래법)</li>
            <li>소비자의 불만 또는 분쟁처리에 관한 기록: 3년 (전자상거래법)</li>
            <li>표시/광고에 관한 기록: 6개월 (전자상거래법)</li>
            <li>웹사이트 방문 기록: 3개월 (통신비밀보호법)</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">4. 개인정보의 제3자 제공</h2>
          <p>
            CampUs는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
            다만, 이용자가 사전에 동의한 경우와 법령의 규정에 의한 경우에는 예외로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">5. 개인정보의 파기 절차 및 방법</h2>
          <p>
            이용자의 개인정보는 목적이 달성된 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 의한
            일정 기간 저장된 후 파기됩니다. 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을
            사용하여 삭제합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">6. 이용자의 권리와 행사 방법</h2>
          <p>
            이용자는 언제든지 자신의 개인정보를 조회하거나 수정할 수 있으며,
            가입 해지를 요청할 수 있습니다. 개인정보 열람, 정정, 삭제, 처리정지 요구는
            서비스 내 설정 또는 이메일을 통해 가능합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">7. 쿠키의 사용</h2>
          <p>
            CampUs는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다.
            이용자는 웹 브라우저의 옵션을 설정하여 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다
            확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">8. 개인정보 보호책임자</h2>
          <p>
            CampUs는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
            이용자의 불만처리 및 피해구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <p className="mt-2">
            문의사항이 있으시면 서비스 내 문의 기능을 이용해 주시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">9. 개인정보처리방침 변경</h2>
          <p>
            이 개인정보처리방침은 시행일로부터 적용되며, 법령 및 방침에 따른 변경내용의 추가,
            삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.
          </p>
          <p className="mt-4 text-sm text-gray-400">시행일: 2026년 4월 7일</p>
        </section>
      </div>

      <div className="mt-12 border-t border-gray-200 pt-6">
        <Link href="/terms" className="text-sm text-primary-600 hover:underline">
          서비스 이용약관 보기 →
        </Link>
      </div>
    </div>
  );
}
