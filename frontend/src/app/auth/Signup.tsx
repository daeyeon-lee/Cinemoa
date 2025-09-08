export default function Signup() {
  return (
    <div className="flex flex-col items-center justify-center min-h-full pt-60 text-center">
      {/* 메인 콘텐츠 */}
      <div className="sm:w-[320px] flex flex-col items-center justify-center space-y-8 w-full">
        <h6 className="font-galmuri text-h6">모아, 보자, 씨네모아.</h6>
        <img src="/cinemoa_logo_long.png" alt="씨네모아" />
        <img src="/google_login_logo.png" alt="Google" />
      </div>

      {/* 배경 장식 요소 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-slate-800 rounded-full opacity-20"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-slate-700 rounded-full opacity-30"></div>
      </div>
    </div>
  );
}
