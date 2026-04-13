import Link from 'next/link';
import Image from 'next/image';
import { ROUTES } from '@/constants/routes';

export default function Footer() {
  return (
    <footer className="site-footer border-t border-earth-200 bg-white mt-30">
      <div className="site-footer-inner mx-auto flex max-w-screen-lg flex-col items-center gap-3 px-6 py-4 sm:flex-row sm:justify-between">

        {/* 로고 */}
        <div className="site-footer-logo flex items-center gap-2">
          <Image
            src="/campus_logo_icon.png"
            alt="CampUs 로고"
            width={80}
            height={22}
            className="h-5 w-auto"
          />
          <span className="site-footer-tagline text-[12px] text-gray-400">
            — 캠핑 준비, 빠짐없이 챙기세요.
          </span>
        </div>

        {/* 링크 & 카피라이트 */}
        <div className="flex items-center gap-4">
          <nav className="site-footer-links flex gap-3">
            <Link href={ROUTES.PRIVACY} className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
              개인정보처리방침
            </Link>
            <Link href={ROUTES.TERMS} className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors">
              이용약관
            </Link>
          </nav>
          <p className="site-footer-copyright text-[12px] text-gray-300">
            © {new Date().getFullYear()} CampUs
          </p>
        </div>

      </div>
    </footer>
  );
}
