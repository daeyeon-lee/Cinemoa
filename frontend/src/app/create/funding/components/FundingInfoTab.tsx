'use client';

import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Link from 'next/link';
import { useFundingStore } from '@/stores/fundingStore';

const formSchema = z.object({
  title: z.string().min(1, '펀딩 제목을 입력해주세요'),
  summary: z.string().min(1, '한 줄 소개를 입력해주세요'),
  description: z.string().min(1, '상세 소개를 입력해주세요'),
});

// 명시적으로 펀딩 데이터 타입 정의
export interface FundingData {
  title: string;
  summary: string;
  description: string;
}

interface FundingInfoTabProps {
  onNext: (data: FundingData) => void;
  onPrev?: () => void;
}

export default function FundingInfoTab({ onNext, onPrev }: FundingInfoTabProps) {
  const { setFundingInfo } = useFundingStore();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      summary: '',
      description: '',
    },
  });

  // 다음 단계로 넘어가는 핸들러
  const handleNext = () => {
    form.handleSubmit((values) => {
      console.log('=== FundingInfoTab 제출 ===');
      console.log('입력된 값:', values);
      console.log('==========================');

      // Store에 저장
      setFundingInfo({
        title: values.title,
        description: values.description, // summary를 description으로 사용
      });

      // 명시적으로 FundingData 타입으로 변환
      const fundingData: FundingData = {
        title: values.title,
        summary: values.summary,
        description: values.description,
      };

      onNext(fundingData);
    })();
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <div className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                <FormLabel className="h5-b text-primary min-w-[200px] sm:pt-2">
                  펀딩 제목 <span className="text-Brand1-Primary">*</span>
                  <p className="text-p3 text-tertiary">상영회 제목을 적어주세요</p>
                </FormLabel>
                <div className="flex-1">
                  <FormControl>
                    <Input placeholder="프로젝트 제목을 입력해주세요" {...field} className="w-full" />
                  </FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <FormLabel className="h5-b text-primary min-w-[200px] sm:pt-2">
                  한 줄 소개 <span className="text-Brand1-Primary">*</span>
                  <p className="text-p3 text-tertiary">상영회 소개를 간단히 적어주세요.</p>
                </FormLabel>
                <div className="flex-1">
                  <FormControl>
                    <Input placeholder="프로젝트를 한 줄로 요약해주세요" {...field} />
                  </FormControl>
                  <FormMessage className="mt-1" />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                <FormLabel className="h5-b text-primary min-w-[200px] sm:pt-2">
                  상세 소개 <span className="text-Brand1-Primary">*</span>
                  <p className="text-p3 text-tertiary">상영회에 대해 자세히 설명해주세요.</p>
                </FormLabel>
                <div className="flex-1">
                  <FormControl>
                    <Textarea
                      placeholder="생성할 펀딩에 대해 자세히 설명해주세요"
                      {...field}
                      className="min-h-[135px] resize-none"
                    />
                  </FormControl>
                  <FormMessage className="mt-1 " />
                </div>
              </FormItem>
            )}
          />
          {/* 이전 다음 바튼 */}
          <div className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Button variant="tertiary" size="lg" className="w-full" onClick={onPrev}>
              이전
            </Button>
            <Button type="button" variant="brand1" size="lg" className="w-full" onClick={handleNext}>
              다음
            </Button>
          </div>
        </div>
      </Form>
    </div>
  );
}
