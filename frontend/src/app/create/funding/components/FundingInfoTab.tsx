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
import { useState } from 'react';

const formSchema = z.object({
  title: z.string().min(1, '펀딩 제목을 입력해주세요'),
  summary: z.string().min(1, '한 줄 소개를 입력해주세요'),
  description: z.string().min(1, '상세 소개를 입력해주세요'),
});

interface FundingInfoTabProps {
  onNext: (data: z.infer<typeof formSchema>) => void;
}

export default function FundingInfoTab({ onNext }: FundingInfoTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: 'onChange',
    defaultValues: {
      title: '',
      summary: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      console.log('펀딩 소개 데이터:', values);
      onNext(values);
    } catch (error) {
      console.error('폼 제출 에러:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    form.handleSubmit(onSubmit)(e);
  };

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-8">
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
            <Link href="/create" className="w-full">
              <Button variant="tertiary" size="lg" className="w-full">
                이전
              </Button>
            </Link>
            <Button type="submit" variant="brand1" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? '처리 중...' : '다음'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
