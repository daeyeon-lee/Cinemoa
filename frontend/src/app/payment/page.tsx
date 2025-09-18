import Payment from './Payment';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';

export default function PaymentPage() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="brand1" size="lg" className="w-full">
          참여하기
        </Button>
      </DialogTrigger>
      <Payment />
    </Dialog>
  );
}
