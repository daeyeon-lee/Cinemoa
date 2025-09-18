'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InformationIcon from '@/component/icon/infomrationIcon';
import { useGetCinemas, useGetCinemaDetail } from '@/api/hooks/useCinemaQueries';
import { CinemaResponse } from '@/types/cinema';
import { creatVoteFunding } from '@/api/vote';
import { CalendarDemo } from '@/components/calenderdemo';
import { VoteTheaterinfo, VoteFundinginfo, VoteMovieinfo, CreateVoteFundingParams } from '@/types/vote';

interface TheaterInfoTabProps {
  onNext: (data: VoteTheaterinfo) => void;
  onPrev?: () => void;
  fundingData?: VoteFundinginfo;
  movieData?: VoteMovieinfo;
}

export default function TheaterInfoTab({ onNext, onPrev, fundingData, movieData }: TheaterInfoTabProps) {
  // 상태 관리
  const [selectedDistrict, setSelectedDistrict] = useState<string>(''); // 선택된 구 (예: '강남구', '서초구')
  const [selectedTheater, setSelectedTheater] = useState<string>(''); // 선택된 영화관 ID (예: '90', '91')
  const [selectedScreenName, setSelectedScreenName] = useState<string>(''); // 선택된 상영관 이름 (예: '01관', '02관')
  const [selectedScreenId, setSelectedScreenId] = useState<number | null>(null); // 선택된 상영관의 screenId
  const [selectedStartDate, setSelectedStartDate] = useState<string>(''); // 선택된 시작 날짜 (예: '2025-01-15')
  const [selectedEndDate, setSelectedEndDate] = useState<string>(''); // 선택된 종료 날짜 (예: '2025-01-20')
  const [selectedFeature, setSelectedFeature] = useState<string[]>([]); // 선택된 상영관 종류들 (예: ['IMAX', '4DX'])
  const [selectedScreenFeatures, setSelectedScreenFeatures] = useState<string[]>([]); // 선택된 상영관의 feature들
  const [theaterList, setTheaterList] = useState<CinemaResponse[]>([]); // API에서 받아온 영화관 목록
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null); // 선택된 영화관의 고유 ID (상세 정보 조회용)

  // 다음 단계로 넘어가는 핸들러
  const handleNext = async () => {
    // 전달받은 데이터 확인
    console.log('=== TheaterInfoTab 데이터 확인 ===');
    console.log('fundingData:', fundingData);
    console.log('movieData:', movieData);
    console.log('=====================================');

    // 각각의 정보를 구조화해서 API 요청
    const theaterData: VoteTheaterinfo = {
      cinemaId: selectedCinemaId || 0,
      screenMinDate: selectedStartDate,
      screenMaxDate: selectedEndDate,
    };

    const completeData: CreateVoteFundingParams = {
      userId: 1,
      content: fundingData?.content,
      title: fundingData?.title,
      categoryId: movieData?.categoryId,
      videoName: movieData?.videoName,
      posterUrl: movieData?.posterUrl,
      cinemaId: selectedCinemaId || 0,
      screenMinDate: selectedStartDate,
      screenMaxDate: selectedEndDate,
    };

    try {
      const result = await creatVoteFunding(completeData);
      console.log('=== 펀딩 생성 성공 ===');
      console.log('응답:', result);
      alert('펀딩이 성공적으로 생성되었습니다!');
      // 성공 시 다른 페이지로 이동하거나 초기화
    } catch (error) {
      console.error('=== 펀딩 생성 실패 ===');
      console.error('에러:', error);
      alert('펀딩 생성에 실패했습니다. 다시 시도해주세요.');
    }

    onNext(theaterData);
  };

  // React Query
  const { data: cinemas, isLoading, error } = useGetCinemas('서울시', selectedDistrict === '전체' ? '' : selectedDistrict, selectedFeature);
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
    setSelectedScreenName('');
    setSelectedScreenId(null);
    setSelectedScreenFeatures([]);
    setSelectedStartDate('');
    setSelectedEndDate('');
  };

  // 구(district)선택 핸들러
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedTheater(''); // 영화관 초기화
    // 영화관 이름 초기화
    setSelectedScreenName(''); // 상영관 초기화
    setSelectedScreenId(null); // 상영관 ID 초기화
    setSelectedScreenFeatures([]); // 상영관 feature 초기화
    setSelectedStartDate(''); // 시작 날짜 초기화
    setSelectedEndDate(''); // 종료 날짜 초기화
  };

  // 영화관 선택 핸들러
  const handleTheaterChange = (value: string) => {
    setSelectedTheater(value);
    setSelectedCinemaId(Number(value)); // 선택된 영화관 ID 저장

    setSelectedScreenName(''); // 상영관 초기화
    setSelectedScreenId(null); // 상영관 ID 초기화
    setSelectedScreenFeatures([]); // 상영관 feature 초기화
    setSelectedStartDate(''); // 시작 날짜 초기화
    setSelectedEndDate(''); // 종료 날짜 초기화
  };

  // 상영관 선택 핸들러
  const handleHallChange = (value: string) => {
    setSelectedScreenName(value);

    // 선택된 상영관의 screenId와 features 찾기
    const selectedScreen = cinemaDetail?.screens?.find((screen) => screen.screenName === value);
    setSelectedScreenId(selectedScreen?.screenId || null);

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

    setSelectedStartDate(''); // 시작 날짜 초기화
    setSelectedEndDate(''); // 종료 날짜 초기화
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

  return (
    <div className="w-full space-y-8">
      <div className="flex gap-12 w-full justify-center items-center">
        <div className="flex flex-col gap-12 w-full">
          {/* 상영관 종류 선택 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                상영관 종류 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <Button key={feature.value} variant={selectedFeature.includes(feature.value) ? 'brand2' : 'secondary'} size="sm" onClick={() => handleFeatureChange(feature.value)} className="h-10">
                  {feature.name}
                </Button>
              ))}
            </div>
          </div>

          {/* 지역, 영화관, 상영관 선택 */}
          <div className="flex gap-2 w-full">
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
          </div>
          <div className="flex gap-2 w-full items-end">
            {/* 시작 날짜, 우측 날짜 선택 */}
            <div className="flex flex-col gap-2 w-full">
              <div className="space-y-1">
                <h4 className="h5-b text-primary">
                  시작 날짜 선택 <span className="text-Brand1-Primary">*</span>
                </h4>
              </div>
              <CalendarDemo
                value={selectedStartDate}
                onChange={setSelectedStartDate}
                disabled={!selectedScreenName}
                min={new Date().toISOString().split('T')[0]} // 오늘 이후 날짜만 선택 가능
                placeholder="시작 날짜를 선택해주세요"
              />
            </div>
            <div className="flex flex-col gap-2 w-full">
              <div className="space-y-1">
                <h4 className="h5-b text-primary">
                  종료 날짜 선택 <span className="text-Brand1-Primary">*</span>
                </h4>
              </div>
              <CalendarDemo
                value={selectedEndDate}
                onChange={setSelectedEndDate}
                disabled={!selectedScreenName || !selectedStartDate}
                min={selectedStartDate || new Date().toISOString().split('T')[0]} // 시작 날짜 이후만 선택 가능
                placeholder="종료 날짜를 선택해주세요"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-start items-start gap-2">
        <InformationIcon width={20} height={20} />
        <p className="p2 text-tertiary">투표는 생성 후 5일간 진행되며 이후 펀딩 생성 여부를 선택할 수 있습니다.</p>
      </div>
      {/* 이전 다음 바튼 */}

      <div className="pt-4 flex justify-center sm:flex-row gap-2 sm:gap-4">
        <Button variant="tertiary" size="lg" className="w-[138px]" onClick={onPrev}>
          이전
        </Button>
        <Button type="button" variant="brand2" size="lg" className="w-[138px]" onClick={handleNext}>
          다음
        </Button>
      </div>
    </div>
  );
}
