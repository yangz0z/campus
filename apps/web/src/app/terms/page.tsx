import Link from 'next/link';
import CloseButton from '@/components/shared/CloseButton';

export const metadata = {
  title: '서비스 이용약관 | CampUs',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-screen-lg px-6 py-16">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">서비스 이용약관</h1>
        <CloseButton />
      </div>

      <div className="space-y-8 text-[15px] leading-relaxed text-gray-700">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제1조 (목적)</h2>
          <p>
            이 약관은 CampUs(이하 &quot;서비스&quot;)가 제공하는 캠핑 체크리스트 관리 및
            관련 서비스의 이용과 관련하여 서비스와 이용자 간의 권리, 의무 및 책임사항,
            기타 필요한 사항을 규정함을 목적으로 합니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제2조 (정의)</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>&quot;서비스&quot;란 CampUs가 제공하는 캠핑 체크리스트 관리, 템플릿 공유, 캠핑 정보 제공 등 관련 제반 서비스를 의미합니다.</li>
            <li>&quot;이용자&quot;란 이 약관에 따라 서비스가 제공하는 서비스를 받는 회원 및 비회원을 말합니다.</li>
            <li>&quot;회원&quot;이란 서비스에 회원등록을 한 자로서, 서비스가 제공하는 서비스를 이용할 수 있는 자를 말합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제3조 (약관의 효력 및 변경)</h2>
          <ul className="list-decimal space-y-1 pl-5">
            <li>이 약관은 서비스를 이용하고자 하는 모든 이용자에 대하여 그 효력을 발생합니다.</li>
            <li>서비스는 합리적인 사유가 발생할 경우 약관을 변경할 수 있으며, 변경된 약관은 적용일자 7일 전부터 공지합니다.</li>
            <li>이용자가 변경된 약관에 동의하지 않는 경우 서비스 이용을 중단하고 탈퇴할 수 있습니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제4조 (서비스의 제공)</h2>
          <p>서비스는 다음과 같은 서비스를 제공합니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>캠핑 체크리스트 생성 및 관리</li>
            <li>체크리스트 템플릿 제공 및 공유</li>
            <li>캠핑 관련 정보 제공</li>
            <li>기타 서비스가 정하는 서비스</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제5조 (회원가입)</h2>
          <ul className="list-decimal space-y-1 pl-5">
            <li>이용자는 서비스가 정한 가입 양식에 따라 회원정보를 기입한 후 이 약관에 동의한다는 의사표시를 함으로서 회원가입을 신청합니다.</li>
            <li>서비스는 전항과 같이 회원으로 가입할 것을 신청한 이용자 중 다음 각 호에 해당하지 않는 한 회원으로 등록합니다.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제6조 (회원 탈퇴 및 자격 상실)</h2>
          <ul className="list-decimal space-y-1 pl-5">
            <li>회원은 서비스에 언제든지 탈퇴를 요청할 수 있으며, 서비스는 즉시 회원탈퇴를 처리합니다.</li>
            <li>회원이 다음 각 호의 사유에 해당하는 경우 서비스는 회원자격을 제한 또는 정지시킬 수 있습니다.
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>가입 신청 시 허위 내용을 등록한 경우</li>
                <li>다른 사람의 서비스 이용을 방해하거나 정보를 도용하는 경우</li>
                <li>서비스를 이용하여 법령 또는 이 약관이 금지하는 행위를 하는 경우</li>
              </ul>
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제7조 (이용자의 의무)</h2>
          <p>이용자는 다음 행위를 하여서는 안 됩니다.</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>신청 또는 변경 시 허위내용의 등록</li>
            <li>타인의 정보 도용</li>
            <li>서비스에 게시된 정보의 변경</li>
            <li>서비스가 정한 정보 이외의 정보 등의 송신 또는 게시</li>
            <li>서비스 및 기타 제3자의 저작권 등 지적재산권에 대한 침해</li>
            <li>서비스 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제8조 (서비스의 중단)</h2>
          <p>
            서비스는 컴퓨터 등 정보통신설비의 보수점검, 교체 및 고장, 통신의 두절 등의 사유가
            발생한 경우에는 서비스의 제공을 일시적으로 중단할 수 있습니다.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">제9조 (면책조항)</h2>
          <ul className="list-decimal space-y-1 pl-5">
            <li>서비스는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</li>
            <li>서비스는 이용자의 귀책사유로 인한 서비스 이용의 장애에 대하여 책임을 지지 않습니다.</li>
            <li>서비스는 이용자가 서비스를 이용하여 기대하는 수익을 얻지 못한 것에 대하여 책임을 지지 않습니다.</li>
          </ul>
        </section>

        <section>
          <p className="text-sm text-gray-400">시행일: 2026년 4월 7일</p>
        </section>
      </div>

      <div className="mt-12 border-t border-gray-200 pt-6">
        <Link href="/privacy" className="text-sm text-primary-600 hover:underline">
          개인정보처리방침 보기 →
        </Link>
      </div>
    </div>
  );
}
