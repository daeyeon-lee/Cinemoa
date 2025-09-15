'use client';

export default function TheaterInfoTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="h4-b text-primary mb-4">영화관 정보</h3>
        <p className="p2 text-secondary">상영할 영화관에 대한 정보를 입력해주세요.</p>
      </div>

      <div className="bg-BG-1 p-6 rounded-lg">
        <p className="p2 text-tertiary text-center">영화관 정보 입력 폼이 여기에 표시됩니다.</p>
        <p className="p3 text-tertiary text-center mt-2">영화관 이름, 위치, 상영관 정보 등을 입력할 수 있습니다.</p>
      </div>
    </div>
  );
}
