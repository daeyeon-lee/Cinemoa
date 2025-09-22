'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import InformationIcon from '@/component/icon/infomrationIcon';
import { useGetCinemas, useGetCinemaDetail, useGetReservationTime } from '@/api/hooks/useCinemaQueries';
import { CinemaResponse } from '@/types/cinema';
import { createFunding } from '@/api/funding';
import { CalendarDemo } from '@/components/calenderdemo';
import { theaterinfo, fundinginfo, movieinfo, CreateFundingParams } from '@/types/funding';
import { useAuthStore } from '@/stores/authStore';
import { holdSeats } from '@/api/payment';

interface TheaterInfoTabProps {
  onNext: (data: { fundingId: number; amount: number }) => void;
  onPrev?: () => void;
  fundingData?: fundinginfo;
  movieData?: movieinfo;
  theaterData?: theaterinfo;
  fundingId?: number;
  amount?: number;
}

export default function TheaterInfoTab({ onNext, onPrev, fundingData, movieData, theaterData, fundingId, amount }: TheaterInfoTabProps) {
  // 상태 관리
  const { user } = useAuthStore();
  const [selectedDistrict, setSelectedDistrict] = useState<string>(''); // 선택된 구 (예: '강남구', '서초구')
  const [selectedTheater, setSelectedTheater] = useState<string>(''); // 선택된 영화관 ID (예: '90', '91')
  const [selectedTheaterName, setSelectedTheaterName] = useState<string>(''); // 선택된 영화관 이름 (예: 'CGV 강남', '메가박스 강남')
  const [selectedScreenName, setSelectedScreenName] = useState<string>(''); // 선택된 상영관 이름 (예: '01관', '02관')
  const [selectedScreenId, setSelectedScreenId] = useState<number | null>(null); // 선택된 상영관의 screenId
  const [selectedDate, setSelectedDate] = useState<string>(''); // 선택된 날짜 (예: '2025-01-15')
  const [selectedFeature, setSelectedFeature] = useState<string[]>([]); // 선택된 상영관 종류들 (예: ['IMAX', '4DX'])
  const [selectedStartTime, setSelectedStartTime] = useState<string>(''); // 대관 시작 시간 (예: '14:00', '19:00')
  const [selectedEndTime, setSelectedEndTime] = useState<string>(''); // 대관 종료 시간 (예: '18:00', '22:00')
  const [participantCount, setParticipantCount] = useState<number>(1); // 모집 인원수 (1~상영관 좌석 수)
  const [screenPrice, setScreenPrice] = useState<number>(0); // 선택된 상영관의 가격
  const [maxParticipants, setMaxParticipants] = useState<number>(1); // 상영관 최대 좌석 수
  const [selectedScreenFeatures, setSelectedScreenFeatures] = useState<string[]>([]); // 선택된 상영관의 feature들
  const [theaterList, setTheaterList] = useState<CinemaResponse[]>([]); // API에서 받아온 영화관 목록
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null); // 선택된 영화관의 고유 ID (상세 정보 조회용)
  const [perPersonAmount, setPerPersonAmount] = useState<number>(0); // 1인당 결제 금액

  // 다음 단계로 넘어가는 핸들러
  const handleNext = async () => {
    console.log('🚀 handleNext 함수 시작됨 (TheaterInfoTab)');
    // 전달받은 데이터 확인

    // 각각의 정보를 구조화해서 API 요청
    const theaterData: theaterinfo = {
      cinemaId: selectedCinemaId || 0,
      screenId: selectedScreenId || 0,
      screenday: selectedDate.split(' ')[0], // 요일 정보 제거하고 날짜만 전송 (YYYY-MM-DD)
      scrrenStartsOn: selectedStartTime ? parseInt(selectedStartTime.split(':')[0]) : 0,
      scrrenEndsOn: selectedEndTime ? parseInt(selectedEndTime.split(':')[0]) : 0,
      maxPeople: participantCount,
    };

    const completeData: CreateFundingParams = {
      userId: user?.userId || 0,
      content: fundingData?.content,
      title: fundingData?.title,
      categoryId: movieData?.categoryId,
      videoName: movieData?.videoName,
      videoContent: movieData?.videoContent,
      // posterUrl: movieData?.posterUrl,
      cinemaId: theaterData?.cinemaId || 0,
      screenId: theaterData?.screenId || 0,
      screenDay: theaterData?.screenday,
      screenStartsOn: theaterData?.scrrenStartsOn,
      screenEndsOn: theaterData?.scrrenEndsOn,
      maxPeople: theaterData?.maxPeople,
    };
    const posterUrl = movieData?.posterUrl;

    try {
      const result = await createFunding(completeData, posterUrl || '');
      const fundingId = result.data.fundingId;
      await holdSeats(fundingId, user?.userId || 0);
      alert('펀딩이 성공적으로 생성되었습니다!');

      // fundingId와 1인당 결제 금액을 함께 전달
      onNext({
        fundingId: fundingId,
        amount: perPersonAmount,
      });
    } catch (error) {
      console.error('에러:', error);
      alert('펀딩 생성에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // React Query
  const { data: cinemas, isLoading, error } = useGetCinemas('서울시', selectedDistrict === '전체' ? '' : selectedDistrict, selectedFeature);
  // 선택된 영화관의 상세 정보 조회
  const { data: cinemaDetail, isLoading: isDetailLoading } = useGetCinemaDetail(selectedCinemaId || 0);
  // 선택된 상영관의 예약 가능 시간 조회 (selectedDate가 있을 때만)
  const { data: reservationTime, isLoading: isReservationTimeLoading } = useGetReservationTime(selectedScreenId || 0, selectedDate);

  // API 응답 데이터를 영화관 목록으로 처리
  useEffect(() => {
    if (cinemas) {
      setTheaterList(cinemas as CinemaResponse[]);
    } else if (error) {
      setTheaterList([]);
    }
  }, [cinemas, error]);

  // 1인당 결제 금액 계산
  useEffect(() => {
    if (screenPrice > 0 && participantCount > 0) {
      const calculatedAmount = Math.ceil(screenPrice / participantCount / 10) * 10;
      setPerPersonAmount(calculatedAmount);
    } else {
      setPerPersonAmount(0);
    }
  }, [screenPrice, participantCount]);

  // 상영관 종류 목록
  const features = [
    { name: '일반', value: 'NORMAL' },
    { name: 'IMAX', value: 'IMAX' },
    { name: 'SCREENX', value: 'SCREENX' },
    { name: '4DX', value: 'FDX' }, // DB상 4dx는 FDX로 파라미터 보내야함
    { name: 'Dolby Atmos', value: 'DOLBY' },
    { name: '리클라이너', value: 'RECLINER' },
  ];

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

  // 상영관 종류 선택 핸들러
  const handleFeatureChange = (value: string) => {
    if (selectedFeature.includes(value)) {
      setSelectedFeature(selectedFeature.filter((f) => f !== value));
    } else {
      setSelectedFeature([...selectedFeature, value]);
    }
    // 다른 선택사항들 초기화
    setSelectedDistrict('');
    setSelectedTheater('');
    setSelectedTheaterName('');
    setSelectedScreenName('');
    setSelectedScreenId(null);
    setScreenPrice(0);
    setMaxParticipants(1);
    setSelectedScreenFeatures([]);
    setSelectedDate('');
    setParticipantCount(1); // 모집 인원수 초기화
  };

  // 구(district)선택 핸들러
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedTheater(''); // 영화관 초기화
    setSelectedTheaterName(''); // 영화관 이름 초기화
    setSelectedScreenName(''); // 상영관 초기화
    setSelectedScreenId(null); // 상영관 ID 초기화
    setScreenPrice(0); // 상영관 가격 초기화
    setMaxParticipants(1); // 최대 좌석 수 초기화
    setSelectedScreenFeatures([]); // 상영관 feature 초기화
    setSelectedDate(''); // 날짜 초기화
    setParticipantCount(1); // 모집 인원수 초기화
  };

  // 영화관 선택 핸들러
  const handleTheaterChange = (value: string) => {
    setSelectedTheater(value);
    setSelectedCinemaId(Number(value)); // 선택된 영화관 ID 저장

    // 선택된 영화관의 이름 찾아서 저장
    const selectedCinema = theaterList.find((theater) => theater.cinemaId === Number(value));
    setSelectedTheaterName(selectedCinema?.cinemaName || '');

    setSelectedScreenName(''); // 상영관 초기화
    setSelectedScreenId(null); // 상영관 ID 초기화
    setScreenPrice(0); // 상영관 가격 초기화
    setMaxParticipants(1); // 최대 좌석 수 초기화
    setSelectedScreenFeatures([]); // 상영관 feature 초기화
    setSelectedDate(''); // 날짜 초기화
    setParticipantCount(1); // 모집 인원수 초기화
  };

  // 상영관 선택 핸들러
  const handleHallChange = (value: string) => {
    setSelectedScreenName(value);

    // 선택된 상영관의 screenId, price, seats, features 찾기
    const selectedScreen = cinemaDetail?.screens?.find((screen) => screen.screenName === value);
    setSelectedScreenId(selectedScreen?.screenId || null);
    setScreenPrice(selectedScreen?.price || 0);
    setMaxParticipants(selectedScreen?.seats || 1); // 상영관 좌석 수 저장
    setParticipantCount(1); // 모집 인원수는 1로 초기화

    // 선택된 상영관의 feature 정보 저장
    if (selectedScreen) {
      const features: string[] = [];
      if (selectedScreen.imax) features.push('IMAX');
      if (selectedScreen.screenx) features.push('SCREENX');
      if (selectedScreen['4dx']) features.push('4DX');
      if (selectedScreen.dolby) features.push('DOLBY');
      if (selectedScreen.recliner) features.push('RECLINER');
      // 모든 feature가 false면 일반 상영관
      if (features.length === 0) features.push('NORMAL');

      setSelectedScreenFeatures(features);
    } else {
      setSelectedScreenFeatures([]);
    }

    setSelectedDate(''); // 날짜 초기화
    setSelectedStartTime(''); // 시작 시간 초기화
    setSelectedEndTime(''); // 종료 시간 초기화
  };

  // 연속된 시간 구간을 찾는 함수
  const getConsecutiveTimeSlots = (availableTime: number[]) => {
    if (!availableTime || availableTime.length === 0) return [];

    const sortedTime = [...availableTime].sort((a, b) => a - b);
    const slots: number[][] = [];
    let currentSlot = [sortedTime[0]];

    for (let i = 1; i < sortedTime.length; i++) {
      if (sortedTime[i] === sortedTime[i - 1] + 1) {
        // 연속된 시간이면 현재 슬롯에 추가
        currentSlot.push(sortedTime[i]);
      } else {
        // 연속되지 않으면 새로운 슬롯 시작
        slots.push(currentSlot);
        currentSlot = [sortedTime[i]];
      }
    }
    slots.push(currentSlot); // 마지막 슬롯 추가

    return slots;
  };

  // 선택된 시작시간이 포함된 연속 구간을 찾는 함수
  const getValidEndTimes = (startHour: number, availableTime: number[]) => {
    const consecutiveSlots = getConsecutiveTimeSlots(availableTime);

    // 시작시간이 포함된 구간 찾기
    const currentSlot = consecutiveSlots.find((slot) => slot.includes(startHour));
    if (!currentSlot) {
      return [];
    }

    // 시작시간 이후의 구간 내 시간들만 반환 (available_time 내에서만)
    const startIndex = currentSlot.indexOf(startHour);
    const remainingSlot = currentSlot.slice(startIndex + 1);

    return remainingSlot;
  };

  // 시작 시간 선택 핸들러
  const handleStartTimeChange = (value: string) => {
    // "14:00" 형식의 값을 그대로 저장
    setSelectedStartTime(value);
    setSelectedEndTime(''); // 종료 시간 초기화 (시작 시간이 바뀌면 종료 시간도 다시 선택해야 함)
  };

  // 모집인원수 증가 핸들러
  const handleIncreaseCount = () => {
    setParticipantCount((prev) => Math.min(prev + 1, maxParticipants));
  };

  // 모집인원수 감소 핸들러
  const handleDecreaseCount = () => {
    setParticipantCount((prev) => Math.max(prev - 1, 1));
  };

  // 선택된 상영관의 feature 정보를 한국어로 변환
  const getScreenFeatureNames = () => {
    return selectedScreenFeatures.map((feature) => {
      switch (feature) {
        case 'IMAX':
          return 'IMAX';
        case 'SCREENX':
          return 'SCREENX';
        case '4DX':
          return '4DX';
        case 'DOLBY':
          return 'Dolby Atmos';
        case 'RECLINER':
          return '리클라이너';
        case 'NORMAL':
          return '일반';
        default:
          return feature;
      }
    });
  };

  // 날짜 형식 변환 함수 (YYYY-MM-DD → YYYY.MM.DD (요일))
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';

    // 이미 요일이 포함되어 있는 경우 (예: "2025-01-15 수요일")
    if (dateString.includes(' ')) {
      const [dateOnly, dayOfWeek] = dateString.split(' ');
      // 요일을 축약형으로 변환 (수요일 → 수)
      const shortDayOfWeek = dayOfWeek.replace('요일', '');
      return `${dateOnly.replace(/-/g, '.')} ${shortDayOfWeek}`;
    }

    // 요일이 없는 경우 날짜에서 요일 계산
    const dateOnly = dateString.split(' ')[0];
    const date = new Date(dateOnly);
    const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
    const dayOfWeek = dayNames[date.getDay()];

    return `${dateOnly.replace(/-/g, '.')} ${dayOfWeek}`;
  };

  return (
    <div className="w-full space-y-8">
      <div className="flex flex-col gap-8 lg:flex-row w-full justify-center items-center">
        <div className="flex flex-col gap-12 w-full">
          {/* 상영관 종류 선택 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                상영관 종류 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
              {features.map((feature) => (
                <Button key={feature.value} variant={selectedFeature.includes(feature.value) ? 'brand1' : 'secondary'} size="sm" onClick={() => handleFeatureChange(feature.value)} className="h-10">
                  {feature.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 지역, 영화관 선택 */}
          <div className="flex flex-col gap-12 sm:flex-row  w-full">
            {/* 지역 선택 */}
            <div className="flex flex-col gap-2 w-full">
              <div className="space-y-1">
                <h4 className="h5-b text-primary">
                  지역 선택 <span className="text-Brand1-Primary">*</span>
                </h4>
              </div>
              <Select value={selectedDistrict} onValueChange={handleDistrictChange} disabled={selectedFeature.length === 0}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue placeholder={selectedFeature.length === 0 ? '상영관 종류를 먼저 선택해주세요' : '지역을 선택해주세요'} />
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
              <Select value={selectedTheater} onValueChange={handleTheaterChange} disabled={!selectedDistrict || isLoading || theaterList.length === 0}>
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
          </div>

          {/* 상영관, 대관 희망일 선택 */}
          <div className="flex flex-col gap-12 sm:flex-row w-full ">
            {/* 상영관 선택 */}
            <div className="flex flex-col gap-2 w-full">
              <div className="space-y-1">
                <h4 className="h5-b text-primary">
                  상영관 선택 <span className="text-Brand1-Primary">*</span>
                </h4>
              </div>
              <Select value={selectedScreenName} onValueChange={handleHallChange} disabled={!selectedTheater || isDetailLoading || !cinemaDetail?.screens || cinemaDetail.screens.length === 0}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue
                    placeholder={
                      isDetailLoading
                        ? '로딩 중...'
                        : !selectedTheater
                        ? '영화관을 먼저 선택해주세요'
                        : !cinemaDetail?.screens || cinemaDetail.screens.length === 0
                        ? '상영관 정보가 없습니다'
                        : '상영관을 선택해주세요'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const filteredScreens =
                      cinemaDetail?.screens?.filter((screen) => {
                        // 상영관도 선택된 feature 중 하나라도 만족하면 표시
                        if (selectedFeature.length === 0) return true;

                        return selectedFeature.some((feature) => {
                          switch (feature) {
                            case 'IMAX':
                              return screen.imax === true;
                            case 'SCREENX':
                              return screen.screenx === true;
                            case 'FDX':
                              return screen['4dx'] === true;
                            case 'DOLBY':
                              return screen.dolby === true;
                            case 'RECLINER':
                              return screen.recliner === true;
                            case 'NORMAL':
                              return screen.imax === false && screen.screenx === false && screen['4dx'] === false && screen.dolby === false && screen.recliner === false;
                            default:
                              return true;
                          }
                        });
                      }) || [];

                    return filteredScreens.map((screen) => (
                      <SelectItem key={screen.screenId} value={screen.screenName || ''}>
                        {screen.screenName}
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
            {/* 대관 희망일 선택 */}
            <div className="flex flex-col gap-2 w-full">
              <div className="space-y-1">
                <h4 className="h5-b text-primary">
                  대관 희망일 <span className="text-Brand1-Primary">*</span>
                </h4>
              </div>
              <CalendarDemo
                value={selectedDate}
                onChange={setSelectedDate}
                disabled={!selectedScreenName}
                min={new Date().toISOString().split('T')[0]} // 오늘부터 선택 가능
                placeholder={!selectedScreenName ? '상영관을 먼저 선택해주세요' : '대관 희망일을 선택해주세요'}
              />
              {selectedScreenName ? <p className="p2 text-Brand1-Primary">상영회는 대관 희망일의 7일 전까지 활성화됩니다.</p> : ''}
            </div>
          </div>

          {/* 대관 시작/종료 시간 선택 */}
          <div className="flex gap-3 sm:gap-12 w-full">
            {/* 대관 시작 시간 */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="space-y-1">
                <h4 className="h5-b text-primary">
                  대관 시작 시간 <span className="text-Brand1-Primary">*</span>
                </h4>
              </div>
              <Select value={selectedStartTime} onValueChange={handleStartTimeChange} disabled={!selectedDate || !selectedScreenId || isReservationTimeLoading}>
                <SelectTrigger className="w-full h-10">
                  <SelectValue
                    placeholder={
                      isReservationTimeLoading
                        ? '로딩 중...'
                        : !selectedDate
                        ? '날짜를 먼저 선택해주세요'
                        : !selectedScreenId
                        ? '상영관을 먼저 선택해주세요'
                        : !reservationTime?.available_time || reservationTime.available_time.length === 0
                        ? '예약 가능한 시간이 없습니다'
                        : '시작 시간을 선택해주세요'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {reservationTime?.available_time
                    ?.filter((hour) => {
                      // 시작시간은 최대 22시까지만 허용
                      if (hour > 22) return false;

                      // 오늘 날짜가 선택된 경우 현재 시간 이후만 표시
                      const dateOnly = selectedDate.split(' ')[0]; // 요일 정보 제거
                      if (dateOnly === new Date().toISOString().split('T')[0]) {
                        const currentHour = new Date().getHours();
                        if (hour <= currentHour) return false;
                      }

                      // 해당 시간에 대해 유효한 종료시간이 있는지 확인
                      const validEndTimes = getValidEndTimes(hour, reservationTime.available_time);
                      // 유효한 종료시간이 없는 경우 시작시간에서 제외
                      return validEndTimes.length > 0;
                    })
                    ?.map((hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    )) || []}
                </SelectContent>
              </Select>
            </div>

            {/* 대관 종료 시간 */}
            <div className="flex flex-col gap-2 flex-1 min-w-0">
              <div className="space-y-1">
                <h4 className="h5-b text-primary">
                  대관 종료 시간 <span className="text-Brand1-Primary">*</span>
                </h4>
              </div>
              <Select
                value={selectedEndTime}
                onValueChange={setSelectedEndTime}
                disabled={(() => {
                  const isDisabled = !selectedStartTime || !selectedScreenId || isReservationTimeLoading;
                  return isDisabled;
                })()}
              >
                <SelectTrigger className="w-full h-10">
                  <SelectValue
                    placeholder={
                      isReservationTimeLoading
                        ? '로딩 중...'
                        : !selectedStartTime
                        ? '시작 시간을 먼저 선택해주세요'
                        : !selectedScreenId
                        ? '상영관을 먼저 선택해주세요'
                        : !reservationTime?.available_time || reservationTime.available_time.length === 0
                        ? '예약 가능한 시간이 없습니다'
                        : '종료 시간을 선택해주세요'
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    if (!reservationTime?.available_time || !selectedStartTime) return [];

                    const startHour = parseInt(selectedStartTime.split(':')[0]);

                    const validEndTimes = getValidEndTimes(startHour, reservationTime.available_time);

                    // 오늘 날짜가 선택된 경우 현재 시간 이후만 표시
                    const filteredEndTimes = validEndTimes.filter((hour) => {
                      const dateOnly = selectedDate.split(' ')[0]; // 요일 정보 제거

                      if (dateOnly === new Date().toISOString().split('T')[0]) {
                        const currentHour = new Date().getHours();
                        return hour > currentHour;
                      }
                      return true;
                    });

                    return filteredEndTimes.map((hour) => (
                      <SelectItem key={hour} value={`${hour.toString().padStart(2, '0')}:00`}>
                        {`${hour.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        {/* 우측 카드 */}
        <div className="flex flex-col gap-4 w-full lg:w-[400px]">
          <div>
            <Card className="h-full p-0">
              <CardContent className="px-6 py-4 flex flex-col justify-center gap-4 h-max">
                <div className="flex flex-col justify-center items-center">
                  {selectedScreenFeatures.length > 0 && <div className="p1 text-tertiary text-center">{getScreenFeatureNames().join(', ')}</div>}
                  {selectedTheaterName && selectedScreenName ? (
                    <div className="p1-b text-primary text-center mt-1 break-keep">
                      {selectedTheaterName} {selectedScreenName}
                    </div>
                  ) : (
                    <div className="p1-b text-primary text-center mt-1">상영관을 선택해주세요</div>
                  )}
                  <div className="p2 text-tertiary text-center mt-1">
                    {selectedDate && selectedStartTime && selectedEndTime ? (
                      <>
                        <div>
                          {formatDateForDisplay(selectedDate)} {selectedStartTime} ~ {selectedEndTime}
                        </div>
                      </>
                    ) : (
                      '날짜와 시간을 선택해주세요'
                    )}
                  </div>
                </div>
                <Separator />
                {selectedScreenName ? (
                  <div className="w-full flex justify-between items-center">
                    <div className="p1-b text-tertiary">총 대관료</div>
                    <div className="p1-b text-primary">{screenPrice.toLocaleString()}원</div>
                  </div>
                ) : (
                  <div className="w-full flex justify-center items-center">
                    <div className="p1-b text-tertiary text-center">
                      상영관을 선택 시
                      <br />
                      대관료가 표시됩니다
                    </div>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-center">
                  <div className="p2-b text-tertiary">모집 인원 선택</div>
                  <div className="p2-b text-tertiary">
                    {participantCount} / {maxParticipants.toLocaleString()}석
                  </div>
                </div>
                <div className="flex justify-start items-center gap-2">
                  <Button variant="secondary" size="md" onClick={handleDecreaseCount} disabled={participantCount <= 1}>
                    -
                  </Button>
                  <Input
                    type="number"
                    value={participantCount}
                    onChange={(e) => {
                      const value = Number(e.target.value);
                      if (value >= 1 && value <= maxParticipants) {
                        setParticipantCount(value);
                      }
                    }}
                    className="flex-1 text-center border-BG-2 border-2 rounded-[8px]"
                    min="1"
                    max={maxParticipants}
                  />
                  <Button variant="secondary" size="md" onClick={handleIncreaseCount} disabled={participantCount >= maxParticipants}>
                    +
                  </Button>
                </div>
                <Separator />
                <div className="w-full flex justify-between items-center">
                  <div className="p1-b text-tertiary">1인당 티켓 가격</div>
                  <div className="h4-b text-Brand1-Strong">{perPersonAmount.toLocaleString()}원</div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-center items-start gap-2">
            <InformationIcon width={20} height={20} />
            <p className="p2 text-tertiary">펀딩은 승인 후 즉시 개설되며, 대관 신청일 7일 전까지 활성화됩니다.</p>
          </div>
        </div>
      </div>
      {/* 이전 다음 바튼 */}

      <div className="pt-4 flex justify-center gap-2">
        <Button variant="tertiary" size="lg" className="w-[138px] max-lg:w-full" onClick={onPrev}>
          이전
        </Button>
        <Button type="button" variant="brand1" size="lg" className="w-[138px] max-lg:w-full" onClick={handleNext}>
          상영회 생성하기
        </Button>
      </div>
    </div>
  );
}
