'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import type { UserInfo } from '@/types/mypage';

interface ProfileSectionProps {
  userInfo: UserInfo | null;
  isLoading: boolean;
}

export default function ProfileSection({ userInfo, isLoading }: ProfileSectionProps) {
  return (
    <div className="col-span-12 px-5 py-7 my-10 bg-BG-1 rounded-2xl flex flex-col justify-start items-start gap-6">
      {/* PC: 한 줄 레이아웃 */}
      <div className="hidden sm:flex w-full justify-between items-center">
        <div className="w-full flex flex-col justify-start items-start gap-2.5">
          <div className="flex justify-start items-center gap-6">
            <Avatar className="w-[72px] h-[72px] border border-slate-700">
              <AvatarImage src={userInfo?.profileImgUrl} />
              <AvatarFallback />
            </Avatar>
            <div className="flex-1 min-w-0 px-1 flex flex-col justify-center items-start gap-2.5">
              <div className="text-primary h3-b">
                {isLoading ? (
                  '로딩 중...'
                ) : (
                  <>
                    <span className="text-primary">안녕하세요, </span>
                    <span className="text-Brand2-Strong">{userInfo?.nickname || '사용자'}님</span>
                  </>
                )}
              </div>
              <div className="h-8 flex justify-start items-center gap-2 sm:gap-[14px]">
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:w-[120px] px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600"
                  onClick={() => alert('서비스 준비중입니다')}
                >
                  환불 계좌 수정
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className="flex-1 sm:w-[120px] px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600"
                  onClick={() => alert('서비스 준비중입니다')}
                >
                  결제 카드 등록
                </Button>
              </div>
            </div>
          </div>
        </div>
        <Button variant="secondary" size="sm" className="w-28 px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600" onClick={() => alert('서비스 준비중입니다')}>
          프로필 수정
        </Button>
      </div>

      {/* 모바일: 세로 레이아웃 */}
      <div className="w-full sm:hidden flex flex-col items-start gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="w-[52px] h-[52px] border border-slate-700">
            <AvatarImage src={userInfo?.profileImgUrl} />
            <AvatarFallback />
          </Avatar>
          <div className="flex flex-col">
            <span className="text-primary h6-b">안녕하세요, </span>
            <div className="text-Brand2-Strong h6-b">{isLoading ? '로딩 중...' : `${userInfo?.nickname || '사용자'}`}님</div>
          </div>
        </div>
        <div className="w-full flex flex-col gap-2">
          <Button variant="secondary" size="sm" className="w-full px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600" onClick={() => alert('서비스 준비중입니다')}>
            프로필 수정
          </Button>
          <Button variant="secondary" size="sm" className="w-full px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600" onClick={() => alert('서비스 준비중입니다')}>
            환불 계좌 수정
          </Button>
          <Button variant="secondary" size="sm" className="w-full px-3 py-1.5 bg-slate-700 text-primary p2-b rounded-md hover:bg-slate-600" onClick={() => alert('서비스 준비중입니다')}>
            결제 카드 등록
          </Button>
        </div>
      </div>
    </div>
  );
}
