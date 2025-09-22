// components/detail/FundingDetailInfo.jsx
"use client"; 

import React, { useState } from "react"; 
import { Button } from "@/components/ui/button"; 
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; 
import { Separator } from "@/components/ui/separator"; 
import { Media } from "../../../../../components/cards/primitives/Media"; 
import KakaoMap from "@/components/maps/KakaoMap"; 
import { Calendar as CalendarIcon, Clock as TimeIcon, MapPin as LocationIcon } from "lucide-react"; 

import { useVoteDetail } from '@/contexts/VoteDetailContext';
import { formatKoreanDate } from '@/utils/dateUtils';
type TabId = 'funding-info' | 'movie-info' | 'theater-info' | 'refund-info';

// 🟢 FundingDetailInfo: 상세 정보 섹션 (탭/스크롤 내비 + 소개/상영물/영화관/환불)
export default function VoteDetailInfo() {
  // Context에서 데이터 가져오기
  const { data } = useVoteDetail();
  // ✅ 상단 버튼(active 상태) 관리
  const [activeButton, setActiveButton] = useState("funding-info");

  // ✅ 버튼 클릭 시 active 상태 변경 + 해당 섹션으로 스크롤
  const handleButtonClick = (buttonId: TabId, targetId: TabId) => {
    setActiveButton(buttonId); // 버튼 활성화 상태 변경
    // 지정된 id의 섹션으로 부드럽게 스크롤 이동
    document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth" });
  };

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
    <section>
      {/* ✅ 네비게이션 버튼 행: 펀딩 소개 / 상영물 정보 / 영화관 정보 / 환불 및 위약 정보 */}
      <div className="flex flex-col gap-10 mt-10">
        <div className="flex px-4 py-2 gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <Button
            variant={activeButton === "funding-info" ? "brand2" : "subtle"} // ✅ 현재 탭과 일치하면 강조
            size="md"
            className="rounded-[25px] flex-shrink-0 whitespace-nowrap"
            onClick={() => handleButtonClick("funding-info", "funding-info")}
          >
            펀딩 소개
          </Button>
          <Button
            variant={activeButton === "movie-info" ? "brand2" : "subtle"}
            size="md"
            className="rounded-[25px] flex-shrink-0 whitespace-nowrap"
            onClick={() => handleButtonClick("movie-info", "movie-info")}
          >
            상영물 정보
          </Button>
          <Button
            variant={activeButton === "theater-info" ? "brand2" : "subtle"}
            size="md"
            className="rounded-[25px] flex-shrink-0 whitespace-nowrap"
            onClick={() => handleButtonClick("theater-info", "theater-info")}
          >
            영화관 정보
          </Button>
          <Button
            variant={activeButton === "refund-info" ? "brand2" : "subtle"}
            size="md"
            className="rounded-[25px] flex-shrink-0 whitespace-nowrap"
            onClick={() => handleButtonClick("refund-info", "refund-info")}
          >
            환불 및 위약 정보
          </Button>
        </div>

        {/* ✅ 펀딩 소개 섹션 */}
        <Card id="funding-info" className="flex flex-col gap-4 px-4" variant="detail">
          <CardHeader>
            <CardTitle>펀딩 소개</CardTitle>
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

        <Separator />

        {/* ✅ 상영물 정보 + 영화관 정보 (2열 레이아웃, 모바일 1열) */}
        <div id="movie-info" className="flex flex-col lg:flex-row w-full gap-4">
          {/* 상영물 정보 카드 */}
          <Card className="flex flex-col gap-4 w-full lg:w-1/3 min-h-[400px] px-4">
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
              <div className="w-full flex flex-col gap-2 mt-3">
                <h6 className="h6-b text-primary">
                  {screening?.videoName || "상영물 제목 미정"}
                </h6>
                <p className="p2 text-tertiary">
                  {/* 실제 설명 필드가 없다면 간단 안내 문구 */}
                  {screening?.videoName
                    ? screening.videoName
                    : "상영물 상세 설명은 준비 중입니다."}
                </p>
              </div>

              {/* 빈 공간 채우기 (카드 하단 붙이기용) */}
              <div className="flex-1" />
            </CardContent>
          </Card>

          {/* 영화관 정보 카드 */}
          <Card id="theater-info" className="flex flex-col gap-4 w-full lg:w-2/3 min-h-[400px] px-4">
            <CardHeader>
              <CardTitle>영화관 정보</CardTitle>
            </CardHeader>
            <CardContent>
              {/* 상단: 영화관명 / 상영관 특성 */}
              <div className="flex flex-col sm:flex-row sm:justify-between gap-2 sm:gap-0 mb-4">
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

        {/* ✅ 환불 및 위약 정보 */}
        <Card id="refund-info" className="flex flex-col gap-4 px-4" variant="detail">
          <CardHeader>
            <CardTitle>환불 및 위약 정보</CardTitle>
          </CardHeader>
          <CardContent>
            {/* 실제 정책은 BE에서 내려받아 바인딩 가능. 우선 기본 안내 제공 */}
            <ul className="space-y-3">
              <li>- 펀딩 마감 후에는 취소 및 환불이 불가합니다.</li>
              <li>- 결제 환불은 펀딩 마감일 7일 전까지만 가능합니다.</li>
              <li>- 환불 불가 기간의 요청은 처리되지 않습니다.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
