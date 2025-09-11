import { Button } from '@/components/ui/button';

export default function Detail() {
  return (
    <div className="flex w-max px-4 py-2 gap-4">
      <Button variant="brand1" size="md" className="w-full rounded-[25px]">
        펀딩 소개
      </Button>
      <Button variant="tertiary" size="md" className="w-full rounded-[25px]">
        상영물 소개
      </Button>
      <Button variant="tertiary" size="md" className="w-full rounded-[25px]">
        영화관 정보
      </Button>
      <Button variant="tertiary" size="md" className="w-full rounded-[25px]">
        환불 및 위약 정보
      </Button>
    </div>
  );
}
