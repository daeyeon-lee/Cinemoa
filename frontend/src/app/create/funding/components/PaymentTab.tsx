'use client';

export default function RefundInfoTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="h4-b text-primary mb-4">환불 및 위약 정보</h3>
        <p className="p2 text-secondary">환불 정책 및 위약금에 대한 정보를 입력해주세요.</p>
      </div>

      <div className="bg-BG-1 p-6 rounded-lg">
        <p className="p2 text-tertiary text-center">환불 정책 입력 폼이 여기에 표시됩니다.</p>
        <p className="p3 text-tertiary text-center mt-2">환불 조건, 위약금, 취소 정책 등을 입력할 수 있습니다.</p>
      </div>
    </div>
  );
}
