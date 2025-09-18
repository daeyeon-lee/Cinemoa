'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import FundingIcon from '@/component/icon/fundingIcon';
import VoteIcon from '@/component/icon/voteIcon';
export default function Create() {
  const router = useRouter();
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleFundingStart = () => {
    if (!termsAgreed) {
      setShowError(true);
      return;
    }
    router.push('/create/funding');
  };

  const handleVoteStart = () => {
    if (!termsAgreed) {
      setShowError(true);
      return;
    }
    router.push('/create/vote');
  };

  return (
    <div className="px-2 sm:flex sm:justify-center sm:items-start min-h-screen pt-4 sm:pt-12">
      <Card className="flex flex-col gap-4 px-4 sm:px-6 max-w-[1000px] w-full">
        {/* 펀딩 상세 소개 */}
        <CardHeader className="max-sm:text-center">
          <CardTitle>상영회 만들기</CardTitle>
          <CardDescription>원하는 영화의 상영회를 직접 제안해보세요</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 ">
            <p className="h4-b text-Brand1-Primary">|</p>
            <h2 className="h4-b text-primary">신뢰 및 정책 확인</h2>
          </div>

          <div className="self-stretch w-full mt-4 px-3 sm:px-4 py-4 bg-inverse rounded-[12px] inline-flex flex-col justify-start items-start">
            <div className="self-stretch pb-[0.68px] flex flex-col justify-start items-start">
              <div className="self-stretch justify-center">
                <span className="p2 text-secondary">• 정산을 위해 </span>
                <span className="p2 text-Brand2-Primary">신분증 또는 사업자 등록증, 국내 은행 계좌</span>
                <span className="p2 text-secondary">를 준비해주세요.</span>
                <br />• 펀딩은 <span className="p2 text-Brand2-Primary">희망 대관 날짜의 7일 전까지 </span>
                <span className="p2 text-secondary">
                  활성화됩니다.
                  <br />• 펀딩이 실패하면 사전에 입력한{' '}
                </span>
                <span className="p2 text-Brand2-Primary">환불 계좌로 전액 환불</span>
                <span className="p2 text-secondary">
                  됩니다.
                  <br />• 대관한 장소는{' '}
                </span>
                <span className="p2 text-Brand2-Primary">책임감 있는 자세로 이용</span>
                <span className="p2 text-secondary">해주세요.</span>
              </div>
            </div>
          </div>
          <div className="flex justify-center items-center gap-1 mt-6 mb-2">
            <Input
              type="checkbox"
              id="terms-agreement"
              className="w-4 h-4"
              checked={termsAgreed}
              onChange={(e) => {
                setTermsAgreed(e.target.checked);
                if (e.target.checked) {
                  setShowError(false);
                }
              }}
            />
            <label htmlFor="terms-agreement" className="p2-b text-primary">
              위 내용에 동의합니다.
            </label>
          </div>
          {showError && (
            <div className="flex justify-center mt-2">
              <p className="text-Brand1-Primary p2-b">약관에 동의해주세요.</p>
            </div>
          )}
        </CardContent>

        <CardContent className="mt-8 sm:mt-14">
          <div className="flex items-center gap-2">
            <p className="h4-b text-Brand1-Primary">|</p>
            <h2 className="h4-b text-primary">프로젝트 생성 유형 선택</h2>
          </div>
          <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 sm:gap-4 mt-4">
            <Button variant="brand1" size="lg" className="w-full flex flex-col gap-1 sm:gap-2 py-4 sm:py-7 h-auto sm:h-full min-h-[100px] sm:min-h-[140px]" onClick={handleFundingStart}>
              <FundingIcon className="w-8 h-8 sm:w-12 sm:h-12" />
              <h4 className="h5-b sm:h4-b text-primary text-center">펀딩 바로 시작</h4>
              <p className="p3 sm:p2 text-primary text-center">
                즉시 펀딩을 개설하여
                <br />
                프로젝트를 시작합니다.
              </p>
            </Button>
            <Button variant="tertiary" size="lg" className="w-full flex flex-col gap-1 sm:gap-2 py-4 sm:py-7 h-auto sm:h-full min-h-[100px] sm:min-h-[140px] cursor-pointer" onClick={handleVoteStart}>
              <VoteIcon className="w-8 h-8 sm:w-12 sm:h-12" />
              <h4 className="h5-b sm:h4-b text-primary text-center">투표로 해볼래요</h4>
              <p className="p3 sm:p2 text-secondary text-center">
                펀딩 개설 전, 관심도를
                <br />
                먼저 확인합니다.
              </p>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
