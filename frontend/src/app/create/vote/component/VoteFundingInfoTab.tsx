'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { fundinginfo } from '@/types/funding';

const voteFormSchema = z.object({
  title: z.string().min(1, '투표 제목을 입력해주세요'),
  content: z.string().min(1, '투표 내용을 입력해주세요'),
});

// 명시적으로 투표 데이터 타입 정의
interface VoteFundingInfoTabProps {
  onNext: (data: fundinginfo) => void;
  onPrev?: () => void;
}

export default function VoteFundingInfoTab({ onNext, onPrev }: VoteFundingInfoTabProps) {
  const form = useForm<z.infer<typeof voteFormSchema>>({
    resolver: zodResolver(voteFormSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      content: '',
    },
  });

  // 다음 단계로 넘어가는 핸들러
  const handleNext = () => {
    form.handleSubmit((values) => {
      console.log('=== VoteFundingInfoTab 제출 ===');
      console.log('입력된 값:', values);
      console.log('==========================');

      // 명시적으로 fundinginfo 타입으로 변환
      const fundingData: fundinginfo = {
        title: values.title,
        content: values.content,
      };

      onNext(fundingData);
    })();
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <div className="space-y-12">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex ">
                <FormLabel className="h5-b text-primary w-[376px] sm:pt-2">
                  투표 제목 <span className="text-Brand1-Primary">*</span>
                  <p className="text-p3 text-tertiary">투표 제목을 적어주세요</p>
                </FormLabel>
                <div className="flex-1">
                  <FormControl>
                    <Input placeholder="투표 제목을 입력해주세요" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem className="flex">
                <FormLabel className="h5-b text-primary w-[376px] sm:pt-2">
                  투표 내용 <span className="text-Brand1-Primary">*</span>
                  <p className="text-p3 text-tertiary">투표 내용을 자세히 설명해주세요.</p>
                </FormLabel>
                <div className="flex-1">
                  <FormControl>
                    <Textarea placeholder="생성할 투표에 대해 자세히 설명해주세요" {...field} className="min-h-[135px] resize-none" />
                  </FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )}
          />
          {/* 이전 다음 바튼 */}
          <div className="pt-4 flex justify-center sm:flex-row gap-2 sm:gap-4">
            <Button variant="tertiary" size="lg" onClick={onPrev} className="w-[138px]">
              이전
            </Button>
            <Button type="button" variant="brand2" size="lg" onClick={handleNext} className="w-[138px]">
              다음
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
