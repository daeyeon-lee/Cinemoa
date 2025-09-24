export default function Footer() {
  return (
    <footer className="bg-BG-1 px-4 py-10 mt-10 pb-[160px] lg:pb-10">
      <div className="flex flex-col items-center justify-center gap-2">
        <p className="p3-b text-tertiary">SSAFY Cinemoa 프로젝트</p>
        <p className="caption1 text-tertiary">이용약관 | 개인정보 처리방침 | 판매 및 환불 | 법적 고지</p>
        <div className="flex flex-col items-center justify-center">
          <p className="caption2 text-tertiary text-center">Resource:9 | Cinemoa | 대표자명: 구자원(Resource Koo) | 주소: 서울 강남구 테헤란로 212 | 전화: 010-0000-0000</p>
          <p className="caption2 text-tertiary">사업자등록번호: 000-00-0000 | 호스팅 서비스 제공: Cinemoa Inc. </p>
        </div>
        <p className="caption2 text-tertiary">Copyright © 2025 Cinemoa. All rights reserved.</p>
      </div>
    </footer>
  );
}
