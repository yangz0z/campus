export default function Footer() {
  return (
    <footer className="site-footer border-t border-earth-200 bg-white mt-30">
      <div className="site-footer-inner mx-auto flex max-w-screen-lg items-center justify-between px-6 py-4">

        {/* 로고 */}
        <div className="site-footer-logo flex items-center gap-2">
          <svg
            width="16" height="15" viewBox="0 0 22 20" fill="none"
            className="site-footer-logo-icon text-primary-600"
            aria-hidden="true"
          >
            <path
              d="M11 1.5L20.5 17H1.5L11 1.5Z"
              stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"
            />
            <path
              d="M9 17v-3.2a2 2 0 014 0V17"
              stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"
            />
            <line
              x1="1" y1="17" x2="21" y2="17"
              stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"
            />
          </svg>
          <span className="site-footer-logo-wordmark text-[14px] font-black tracking-tight">
            <span className="site-footer-logo-camp text-primary-700">Camp</span>
            <span className="site-footer-logo-us text-warm-500">Us</span>
          </span>
          <span className="site-footer-tagline hidden text-[12px] text-gray-400 sm:inline">
            — 캠핑 준비, 빠짐없이 챙기세요.
          </span>
        </div>

        {/* 카피라이트 */}
        <p className="site-footer-copyright text-[12px] text-gray-300">
          © {new Date().getFullYear()} CampUs. All rights reserved.
        </p>

      </div>
    </footer>
  );
}
