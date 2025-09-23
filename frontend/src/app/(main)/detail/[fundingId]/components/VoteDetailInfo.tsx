// components/detail/FundingDetailInfo.jsx
"use client"; 

import React from "react"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Separator } from "@/components/ui/separator"; 
import { Media } from "../../../../../components/cards/primitives/Media"; 
import KakaoMap from "@/components/maps/KakaoMap"; 
import { Calendar as CalendarIcon, MapPin as LocationIcon } from "lucide-react"; 

import { useVoteDetail } from '@/contexts/VoteDetailContext';
import { formatKoreanDate } from '@/utils/dateUtils';
// 🟢 VoteDetailInfo: 상세 정보 섹션
export default function VoteDetailInfo() {
  // Context에서 데이터 가져오기
  const { data } = useVoteDetail();

  // ✅ data 구조 분해: 사용되는 필드만 추출
  const { funding, screening, cinema } = data || {};

  // ✅ 상영일(예시로 fundingEndsOn 사용) + 상영 시간 문자열 구성
  const screeningDateText = formatKoreanDate(funding?.fundingEndsOn);

  // ✅ 영화관 이름 및 어드레스(간단 합성)
  const cinemaName = cinema ? cinema.cinemaName : "-";
  const cinemaAddr =
    cinema && cinema.city && cinema.district
      ? `${cinema.city} ${cinema.district}`
      : "-";

  return (
    <section className="px-4">
      <div className="flex flex-col gap-12 mt-12">
        {/* ✅ 펀딩 소개 섹션 */}
        <Card id="funding-info" className="flex flex-col gap-4" variant="detail">
          <CardHeader>
            <CardTitle>수요 조사 소개</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 서버에서 내려주는 소개문(없으면 기본 안내) */}
            <p className="p">
              {funding?.content
                ? funding.content
                : "같이 영화 보실 분들 구합니다! 보고 싶은 영화를 상영관 대관으로 함께 즐겨요. 펀딩 성공을 위해 많은 참여 부탁드립니다."}
            </p>
          </CardContent>
        </Card>

        {/* ✅ 상영물 정보 + 영화관 정보 (2열 레이아웃, 모바일 1열) */}
        <div id="movie-info" className="flex flex-col md:flex-row w-full gap-8 md:items-stretch">
          {/* 상영물 정보 카드 */}
          <Card className="flex flex-col gap-4 w-full md:w-1/3" variant="detail">
            <CardHeader>
              <CardTitle>상영물 정보</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col flex-1">
              {/* 상영물 포스터/이미지 */}
              <div className="w-full">
                <Media
                  src={funding?.bannerUrl || "/images/image.png"} // ✅ 배너 없으면 기본 이미지
                  alt={screening?.videoName || "상영물 정보"}
                  aspect="4/3"
                  height={200}
                />
              </div>

              {/* 제목/설명 */}
              <div className="w-full flex flex-col gap-3 mt-6 flex-1">
                <h6 className="h6-b text-primary">
                  {screening?.videoName || "상영물 제목 미정"}
                </h6>
                {/* 스크롤 가능한 설명 영역 */}
                <div className="flex-1 overflow-y-auto max-h-[220px] scrollbar-hide">
                  <p className="p2 text-tertiary">
                    {/* 실제 설명 필드가 없다면 간단 안내 문구 */}
                    {screening?.videoContent
                      ? screening.videoContent
                      : "상영물 상세 설명은 준비 중입니다."}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 영화관 정보 카드 - 높이 기준 */}
          <Card id="theater-info" className="flex flex-col gap-4 w-full md:w-2/3 min-h-[400px]" variant="detail">
            <CardHeader>
              <CardTitle>영화관 정보</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 상단: 영화관명 */}
              <div className="flex items-center gap-4 mb-4">
                <p className="p1-b text-primary">{cinemaName}</p>
              </div>

              <Separator />

              {/* 상세 정보(상영일/시간/주소 + 지도) */}
              <div className="flex flex-col gap-4 w-full mt-4">
                <div className="flex flex-col gap-4">
                  {/* 상영일 */}
                  <div className="flex items-center gap-4">
                    <CalendarIcon />
                    <div>
                      <p className="p2 text-tertiary">상영일</p>
                      <p className="p1 text-primary">{screeningDateText || "-"}</p>
                    </div>
                  </div>

                  {/* 영화관 주소 */}
                  <div className="flex items-center gap-4">
                    <LocationIcon />
                    <div>
                      <p className="p2 text-ter티ary">영화관 주소</p>
                      <p className="p1 text-primary">{cinemaAddr}</p>
                    </div>
                  </div>
                </div>

                {/* 카카오맵: 영화관명 기준 검색 */}
                <div className="rounded-[6px] overflow-hidden">
                  <KakaoMap width="100%" height="300px" location={cinemaName} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
