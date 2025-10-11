export function Footer() {
  return (
    <footer className="mt-20 bg-white border-t py-8 text-center text-gray-600">
      <div className="max-w-5xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">
            © {new Date().getFullYear()} EV Battery Swap. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <a href="#" className="hover:text-green-600 transition-colors">
              Chính sách bảo mật
            </a>
            <a href="#" className="hover:text-green-600 transition-colors">
              Điều khoản sử dụng
            </a>
            <a href="#" className="hover:text-green-600 transition-colors">
              Liên hệ
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
