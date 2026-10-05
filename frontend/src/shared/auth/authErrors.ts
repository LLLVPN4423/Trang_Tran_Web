const FIREBASE_AUTH_MESSAGES: Record<string, string> = {
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/user-disabled': 'Tài khoản đã bị vô hiệu hóa.',
  'auth/user-not-found': 'Email hoặc mật khẩu không đúng.',
  'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
  'auth/email-already-in-use': 'Email này đã được đăng ký.',
  'auth/weak-password': 'Mật khẩu phải có ít nhất 6 ký tự.',
  'auth/popup-closed-by-user': 'Đã đóng cửa sổ đăng nhập Google.',
  'auth/popup-blocked-by-browser': 'Trình duyệt chặn popup. Cho phép popup rồi thử lại.',
  'auth/cancelled-popup-request': 'Đang mở đăng nhập Google, vui lòng thử lại.',
  'auth/account-exists-with-different-credential':
    'Email đã đăng ký bằng phương thức khác. Hãy đăng nhập bằng email/mật khẩu.',
  'auth/operation-not-allowed': 'Đăng nhập Google chưa được bật trên Firebase Console.',
  'auth/unauthorized-domain':
    'Domain chưa được phép. Firebase Console → Authentication → Authorized domains → thêm trangtran-hair.pages.dev',
  'auth/operation-not-supported-in-this-environment':
    'Trình duyệt không hỗ trợ đăng nhập Google. Dùng Chrome/Safari hoặc email/mật khẩu.',
  'auth/web-storage-unsupported':
    'Trình duyệt chặn lưu phiên đăng nhập. Tắt chế độ ẩn danh hoặc dùng Chrome/Safari bình thường.',
  'auth/redirect-cancelled-by-user': 'Đã hủy đăng nhập Google.',
  'auth/redirect-operation-pending': 'Đang hoàn tất đăng nhập Google...',
}

export function getAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && /redirect_uri_mismatch|invalid_client|not allowed for this origin|OAuth 2.0 policy/i.test(error.message)) {
    return 'Google OAuth chưa cấu hình đủ cho mobile. Admin cần thêm redirect URI trong Google Cloud Console — chạy: node scripts/setup-google-oauth-mobile.js'
  }
  if (error instanceof Error && /database is closing\/hidden/i.test(error.message)) {
    return 'Đăng nhập Google trên điện thoại gặp lỗi. Hãy tải lại trang và thử lại, hoặc dùng email/mật khẩu.'
  }
  if (error && typeof error === 'object' && 'code' in error) {
    const code = String((error as { code: string }).code)
    if (FIREBASE_AUTH_MESSAGES[code]) return FIREBASE_AUTH_MESSAGES[code]
  }
  if (error instanceof Error && error.message) return error.message
  return 'Thao tác thất bại'
}
