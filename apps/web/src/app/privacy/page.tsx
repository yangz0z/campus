import Link from 'next/link';
import CloseButton from '@/components/shared/CloseButton';

export const metadata = {
  title: '개인정보처리방침 | CampUs',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-screen-lg px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">개인정보처리방침</h1>
        <CloseButton />
      </div>

      <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
        <section>
          <p>
            CampUs(이하 &quot;서비스&quot;)는 캠핑 준비물 체크리스트를 생성·관리하고,
            계절별 준비물 추천, 템플릿 공유, 멤버별 역할 분담 등 캠핑 준비에 필요한 기능을
            제공하는 웹 애플리케이션입니다. 본 개인정보처리방침은 서비스가 이용자의 개인정보를
            어떻게 수집·이용·보관·파기하는지 설명합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">1. 개인정보의 수집 및 이용 목적</h2>
          <p>
            서비스는 다음의 목적을 위하여 개인정보를 처리합니다.
            처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며,
            이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>회원 가입 및 관리: 회원제 서비스 이용에 따른 본인확인, 개인 식별, 불량회원의 부정 이용 방지</li>
            <li>서비스 제공: 캠핑 체크리스트 생성·관리, 계절별 준비물 추천, 템플릿 공유, 멤버별 역할 분담 기능 제공</li>
            <li>서비스 개선: 신규 서비스 개발 및 기존 서비스 개선, 이용 통계 분석</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">2. 수집하는 개인정보 항목</h2>
          <h3 className="mb-2 text-[15px] font-semibold text-gray-800">가. 직접 수집 항목</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>필수항목: 이메일 주소, 닉네임</li>
            <li>선택항목: 프로필 이미지</li>
          </ul>
          <h3 className="mb-2 mt-4 text-[15px] font-semibold text-gray-800">나. Google 계정 연동 시 수집 항목</h3>
          <p>
            이용자가 Google 계정으로 로그인할 경우, Google로부터 다음 정보를 수신합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이름 (Google 계정에 등록된 표시 이름)</li>
            <li>이메일 주소 (Google 계정 이메일)</li>
            <li>프로필 사진 URL</li>
          </ul>
          <p className="mt-2">
            위 정보는 오직 회원 식별 및 로그인 처리 목적으로만 사용되며,
            그 외의 Google 사용자 데이터에는 접근하지 않습니다.
          </p>
          <h3 className="mb-2 mt-4 text-[15px] font-semibold text-gray-800">다. 자동 수집 항목</h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>서비스 이용 기록, 접속 로그, 쿠키, 접속 IP 정보, 기기 정보</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">3. Google 사용자 데이터의 처리</h2>
          <p>
            CampUs는 Google OAuth 2.0을 통해 로그인 기능을 제공하며,
            Google 사용자 데이터에 대해 다음과 같은 원칙을 준수합니다.
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>제한적 사용:</strong> Google로부터 수신한 데이터(이름, 이메일, 프로필 사진)는
              오직 서비스 내 회원 계정 생성 및 로그인 인증 목적으로만 사용됩니다.
            </li>
            <li>
              <strong>제3자 제공 금지:</strong> Google로부터 수신한 사용자 데이터를
              광고, 마케팅 또는 기타 목적으로 제3자에게 전달하거나 판매하지 않습니다.
            </li>
            <li>
              <strong>광고 목적 사용 금지:</strong> Google 사용자 데이터를
              광고 게재, 타겟팅, 리타겟팅 등 광고 관련 목적으로 사용하지 않습니다.
            </li>
            <li>
              <strong>데이터 보안:</strong> Google 사용자 데이터는 암호화된 통신(HTTPS)을 통해
              전송되며, 안전한 서버 환경에서 보관됩니다.
            </li>
            <li>
              <strong>연동 해제 및 삭제:</strong> 이용자는 언제든지 Google 계정 연동을 해제하고
              관련 데이터의 삭제를 요청할 수 있습니다.
              Google 계정 설정(myaccount.google.com)에서도 CampUs의 접근 권한을 철회할 수 있습니다.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">4. 개인정보의 보유 및 이용 기간</h2>
          <p>
            이용자의 개인정보는 원칙적으로 개인정보의 수집 및 이용목적이 달성되면 지체 없이 파기합니다.
            회원 탈퇴 시 해당 이용자의 개인정보는 즉시 삭제됩니다.
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
          <h2 className="mb-3 text-lg font-semibold text-gray-900">5. 개인정보의 제3자 제공</h2>
          <p>
            CampUs는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다.
            다만, 다음의 경우에는 예외로 합니다.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>이용자가 사전에 동의한 경우</li>
            <li>법령의 규정에 의하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">6. 개인정보의 파기 절차 및 방법</h2>
          <p>
            이용자의 개인정보는 목적이 달성된 후 별도의 DB로 옮겨져 내부 방침 및 기타 관련 법령에 의한
            일정 기간 저장된 후 파기됩니다. 전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을
            사용하여 삭제합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">7. 이용자의 권리와 행사 방법</h2>
          <p>이용자는 언제든지 다음의 권리를 행사할 수 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>자신의 개인정보 조회 및 수정</li>
            <li>회원 탈퇴(가입 해지) 요청</li>
            <li>개인정보 열람, 정정, 삭제, 처리정지 요구</li>
            <li>Google 계정 연동 해제 및 관련 데이터 삭제 요청</li>
          </ul>
          <p className="mt-2">
            위 요구사항은 서비스 내 설정 또는 이메일을 통해 처리할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">8. 개인정보의 안전성 확보 조치</h2>
          <p>CampUs는 이용자의 개인정보를 안전하게 관리하기 위해 다음과 같은 조치를 취하고 있습니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>개인정보의 암호화: 비밀번호 등 중요 정보는 암호화하여 저장·관리합니다.</li>
            <li>SSL/TLS 적용: 모든 데이터 전송 시 암호화된 통신(HTTPS)을 사용합니다.</li>
            <li>접근 제한: 개인정보를 처리하는 시스템에 대한 접근 권한을 최소화하고 관리합니다.</li>
            <li>정기 점검: 개인정보 보호를 위한 내부 관리 계획을 수립하고 정기적으로 점검합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">9. 쿠키의 사용</h2>
          <p>
            CampUs는 이용자에게 개별적인 맞춤 서비스를 제공하기 위해 쿠키를 사용합니다.
            이용자는 웹 브라우저의 옵션을 설정하여 모든 쿠키를 허용하거나, 쿠키가 저장될 때마다
            확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">10. 개인정보 보호책임자</h2>
          <p>
            CampUs는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한
            이용자의 불만처리 및 피해구제를 위하여 개인정보 보호책임자를 지정하고 있습니다.
          </p>
          <p className="mt-2">
            문의사항이 있으시면 서비스 내 문의 기능을 이용해 주시기 바랍니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">11. 개인정보처리방침 변경</h2>
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
