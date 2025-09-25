'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InformationIcon from '@/component/icon/infomrationIcon';
import { useGetCinemas, useGetCinemaDetail, useGetCinemasByDistrict } from '@/api/hooks/useCinemaQueries';
import { CinemaResponse } from '@/types/cinema';
import { creatVoteFunding } from '@/api/vote';
import { CalendarDemo } from '@/components/calenderdemo';
import { VoteTheaterinfo, VoteFundinginfo, VoteMovieinfo, CreateVoteFundingParams } from '@/types/vote';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';

interface TheaterInfoTabProps {
  onNext: (data: VoteTheaterinfo) => void;
  onPrev?: () => void;
  fundingData?: VoteFundinginfo;
  movieData?: VoteMovieinfo;
}

export default function TheaterInfoTab({ onNext, onPrev, fundingData, movieData }: TheaterInfoTabProps) {
  // 상태 관리
  const { user } = useAuthStore();
  const router = useRouter();
  const [selectedDistrict, setSelectedDistrict] = useState<string>(''); // 선택된 구 (예: '강남구', '서초구')
  const [selectedTheater, setSelectedTheater] = useState<string>(''); // 선택된 영화관 ID (예: '90', '91')
  // 투표 기능에서는 상영관 선택이 없음
  const [selectedStartDate, setSelectedStartDate] = useState<string>(''); // 선택된 시작 날짜 (예: '2025-01-15')
  const [selectedEndDate, setSelectedEndDate] = useState<string>(''); // 선택된 종료 날짜 (예: '2025-01-20')
  const [selectedScreenFeatures, setSelectedScreenFeatures] = useState<string[]>([]); // 선택된 상영관의 feature들
  const [theaterList, setTheaterList] = useState<CinemaResponse[]>([]); // API에서 받아온 영화관 목록
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null); // 선택된 영화관의 고유 ID (상세 정보 조회용)

  // 다음 단계로 넘어가는 핸들러
  const handleNext = async () => {
    // 전달받은 데이터 확인
    // console.log('=== TheaterInfoTab 데이터 확인 ===');
    // console.log('fundingData:', fundingData);
    // console.log('movieData:', movieData);
    // console.log('=====================================');

    // 각각의 정보를 구조화해서 API 요청
    const theaterData: VoteTheaterinfo = {
      cinemaId: selectedCinemaId || 0,
      screenMinDate: selectedStartDate.split(' ')[0], // 요일 정보 제거하고 날짜만 전송 (YYYY-MM-DD)
      screenMaxDate: selectedEndDate.split(' ')[0], // 요일 정보 제거하고 날짜만 전송 (YYYY-MM-DD)
    };

    const completeData: CreateVoteFundingParams = {
      userId: user?.userId || 0,
      content: fundingData?.content,
      title: fundingData?.title,
      categoryId: movieData?.categoryId,
      videoName: movieData?.videoName,
      videoContent: movieData?.videoContent,
      // posterUrl: movieData?.posterUrl,
      cinemaId: selectedCinemaId || 0,
      screenMinDate: selectedStartDate.split(' ')[0], // 요일 정보 제거하고 날짜만 전송 (YYYY-MM-DD)
      screenMaxDate: selectedEndDate.split(' ')[0], // 요일 정보 제거하고 날짜만 전송 (YYYY-MM-DD)
    };
    const posterUrl = movieData?.posterUrl;
    try {
      const result = await creatVoteFunding(completeData, posterUrl || '');
      console.log('=== 펀딩 생성 성공 ===');
      // console.log('응답:', result);

      // 성공 alert 표시 후 홈으로 이동
      alert('투표가 성공적으로 생성되었습니다!');
      router.push('/');
    } catch (error) {
      alert('투표 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // React Query
  const { data: cinemas, isLoading, error } = useGetCinemasByDistrict('서울시', selectedDistrict);
  // 선택된 영화관의 상세 정보 조회
  const { data: cinemaDetail, isLoading: isDetailLoading } = useGetCinemaDetail(selectedCinemaId || 0);

  // API 응답 데이터를 영화관 목록으로 처리
  useEffect(() => {
    if (cinemas) {
      setTheaterList(cinemas as CinemaResponse[]);
    } else if (error) {
      setTheaterList([]);
    }
  }, [cinemas, error]);

  // 서울시 25개 구 목록
  const district = [
    { name: '전체', value: '전체' },
    { name: '강남구', value: '강남구' },
    { name: '강동구', value: '강동구' },
    { name: '강북구', value: '강북구' },
    { name: '강서구', value: '강서구' },
    { name: '관악구', value: '관악구' },
    { name: '광진구', value: '광진구' },
    { name: '구로구', value: '구로구' },
    { name: '금천구', value: '금천구' },
    { name: '노원구', value: '노원구' },
    { name: '도봉구', value: '도봉구' },
    { name: '동대문구', value: '동대문구' },
    { name: '동작구', value: '동작구' },
    { name: '마포구', value: '마포구' },
    { name: '서대문구', value: '서대문구' },
    { name: '서초구', value: '서초구' },
    { name: '성동구', value: '성동구' },
    { name: '성북구', value: '성북구' },
    { name: '송파구', value: '송파구' },
    { name: '양천구', value: '양천구' },
    { name: '영등포구', value: '영등포구' },
    { name: '용산구', value: '용산구' },
    { name: '은평구', value: '은평구' },
    { name: '종로구', value: '종로구' },
    { name: '중구', value: '중구' },
    { name: '중랑구', value: '중랑구' },
  ];

  // 구(district)선택 핸들러
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedTheater(''); // 영화관 초기화
    setSelectedStartDate(''); // 시작 날짜 초기화
    setSelectedEndDate(''); // 종료 날짜 초기화
  };

  // 영화관 선택 핸들러
  const handleTheaterChange = (value: string) => {
    setSelectedTheater(value);
    setSelectedCinemaId(Number(value)); // 선택된 영화관 ID 저장

    // 투표 기능에서는 상영관 선택이 없으므로 날짜만 초기화
    setSelectedStartDate(''); // 시작 날짜 초기화
    setSelectedEndDate(''); // 종료 날짜 초기화
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-8 lg:flex-row w-full justify-center items-center">
        <div className="flex flex-col gap-12 w-full">
          {/* 지역 선택 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                지역 선택 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <Select value={selectedDistrict} onValueChange={handleDistrictChange}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder="지역을 선택해주세요" />
              </SelectTrigger>
              <SelectContent>
                {district.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 영화관 선택 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                영화관 선택 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <Select value={selectedTheater} onValueChange={handleTheaterChange} disabled={!selectedDistrict || selectedDistrict === '' || isLoading || theaterList.length === 0}>
              <SelectTrigger className="w-full h-10">
                <SelectValue
                  placeholder={isLoading ? '로딩 중...' : !selectedDistrict ? '지역을 먼저 선택해주세요' : theaterList.length === 0 ? '해당 조건의 영화관이 없습니다' : '영화관을 선택해주세요'}
                />
              </SelectTrigger>
              <SelectContent>
                {theaterList.map((theater) => (
                  <SelectItem key={theater.cinemaId} value={theater.cinemaId?.toString() || ''}>
                    {theater.cinemaName || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 대관 예정 기간 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                대관 예정 기간 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <div className="flex gap-3 w-full">
              <div className="flex-1 min-w-0">
                <CalendarDemo
                  value={selectedStartDate}
                  onChange={(date) => {
                    setSelectedStartDate(date);

                    if (date) {
                      // 시작일로부터 5일 후 계산
                      const startDate = new Date(date.split(' ')[0]); // "2024-01-15 (월)" -> "2024-01-15"
                      const endDate = new Date(startDate);
                      endDate.setDate(startDate.getDate() + 5);

                      const year = endDate.getFullYear();
                      const month = String(endDate.getMonth() + 1).padStart(2, '0');
                      const day = String(endDate.getDate()).padStart(2, '0');
                      const dayOfWeek = endDate.toLocaleDateString('ko-KR', { weekday: 'short' });

                      setSelectedEndDate(`${year}-${month}-${day} (${dayOfWeek})`);
                    } else {
                      setSelectedEndDate('');
                    }
                  }}
                  disabled={!selectedTheater}
                  min={new Date().toISOString().split('T')[0]} // 오늘 이후 날짜만 선택 가능
                  placeholder={!selectedTheater ? '상영관을 먼저 선택해주세요' : '시작일을 선택해주세요'}
                />
              </div>

              <div className="flex-1 min-w-0">
                <CalendarDemo
                  value={selectedEndDate}
                  onChange={() => {}} // 종료일은 자동 설정되므로 변경 불가
                  disabled={true} // 항상 비활성화 (읽기 전용)
                  placeholder={!selectedStartDate ? '시작일 선택 시 자동 설정됩니다' : '종료일 (시작일 + 5일)'}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-start items-start gap-2">
        <InformationIcon width={20} height={20} />
        <p className="p2 text-tertiary">수요조사는 생성 후 5일간 진행되며 이후 펀딩 생성 여부를 선택할 수 있습니다.</p>
      </div>
      {/* 이전 다음 바튼 */}

      <div className="pt-4 flex justify-center gap-2">
        <Button variant="tertiary" size="lg" className="w-[138px] max-lg:w-full" onClick={onPrev}>
          이전
        </Button>
        <Button type="button" variant="brand2" size="lg" className="w-[138px] max-lg:w-full" onClick={handleNext}>
          다음
        </Button>
      </div>
    </div>
  );
}
