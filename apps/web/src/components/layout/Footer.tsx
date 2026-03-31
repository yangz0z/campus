export default function Footer() {
  return (
    <footer className="border-t border-earth-200 bg-white">
      <div className="mx-auto max-w-screen-lg px-4 py-8 text-center">
        <p className="text-lg font-bold">
          <span className="text-primary-700">Camp</span>
          <span className="text-warm-500">Us</span>
        </p>
        <p className="mt-1 text-sm text-gray-400">
          캠핑 준비, 빠짐없이 챙기세요.
        </p>
        <p className="mt-4 text-xs text-gray-300">
          © {new Date().getFullYear()} Campus. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
