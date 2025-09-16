'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import InformationIcon from '@/component/icon/infomrationIcon';

export default function TheaterInfoTab() {
  // 상태 관리
  const [selectedDistrict, setSelectedDistrict] = useState<string>('');
  const [selectedTheater, setSelectedTheater] = useState<string>('');
  const [selectedHall, setSelectedHall] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [participantCount, setParticipantCount] = useState<number>(10);

  // 서울시 25개 구 목록 (가나다순)
  const district = [
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

  // 구 선택 핸들러
  const handleDistrictChange = (value: string) => {
    setSelectedDistrict(value);
    setSelectedTheater(''); // 영화관 초기화
    setSelectedHall(''); // 상영관 초기화
    setSelectedDate(''); // 날짜 초기화
  };

  // 영화관 선택 핸들러
  const handleTheaterChange = (value: string) => {
    setSelectedTheater(value);
    setSelectedHall(''); // 상영관 초기화
    setSelectedDate(''); // 날짜 초기화
  };

  // 상영관 선택 핸들러
  const handleHallChange = (value: string) => {
    setSelectedHall(value);
    setSelectedDate(''); // 날짜 초기화
  };

  // 모집인원수 증가 핸들러
  const handleIncreaseCount = () => {
    setParticipantCount((prev) => Math.min(prev + 1, 100));
  };

  // 모집인원수 감소 핸들러
  const handleDecreaseCount = () => {
    setParticipantCount((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="flex gap-12 w-full justify-center items-center">
      <div className="flex flex-col gap-12 w-full">
        {/* 지역, 영화관, 상영관 선택 */}
        <div className="flex gap-2 w-full">
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
            <Select value={selectedTheater} onValueChange={handleTheaterChange} disabled={!selectedDistrict}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder={!selectedDistrict ? '구를 먼저 선택해주세요' : '영화관을 선택해주세요'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cgv-gangnam">CGV 강남</SelectItem>
                <SelectItem value="cgv-yeoksam">CGV 역삼</SelectItem>
                <SelectItem value="lotte-gangnam">롯데시네마 강남</SelectItem>
                <SelectItem value="megabox-gangnam">메가박스 강남</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex gap-2 w-full items-end">
          {/* 상영관 선택 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                상영관 선택 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <Select value={selectedHall} onValueChange={handleHallChange} disabled={!selectedTheater}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder={!selectedTheater ? '영화관을 먼저 선택해주세요' : '상영관을 선택해주세요'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hall-1">1관</SelectItem>
                <SelectItem value="hall-2">2관</SelectItem>
                <SelectItem value="hall-3">3관</SelectItem>
                <SelectItem value="hall-4">4관</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* 날짜 선택 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                날짜 선택 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <Input
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              placeholder="날짜를 선택해주세요"
              className="w-full h-10"
              disabled={!selectedHall}
            />
          </div>
        </div>
        {/* 시간 선택 */}
        <div className="flex gap-2 w-full items-end">
          {/* 대관 시작 시간 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                대관 시작 시간 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <Select value={selectedStartTime} onValueChange={setSelectedStartTime} disabled={!selectedDate}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder={!selectedDate ? '날짜를 먼저 선택해주세요' : '시작 시간'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="14:00">14:00</SelectItem>
                <SelectItem value="15:00">15:00</SelectItem>
                <SelectItem value="16:00">16:00</SelectItem>
                <SelectItem value="17:00">17:00</SelectItem>
                <SelectItem value="18:00">18:00</SelectItem>
                <SelectItem value="19:00">19:00</SelectItem>
                <SelectItem value="20:00">20:00</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 대관 종료 시간 */}
          <div className="flex flex-col gap-2 w-full">
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                대관 종료 시간 <span className="text-Brand1-Primary">*</span>
              </h4>
            </div>
            <Select value={selectedEndTime} onValueChange={setSelectedEndTime} disabled={!selectedStartTime}>
              <SelectTrigger className="w-full h-10">
                <SelectValue placeholder={!selectedStartTime ? '시작 시간을 먼저 선택해주세요' : '종료 시간'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15:00">15:00</SelectItem>
                <SelectItem value="16:00">16:00</SelectItem>
                <SelectItem value="17:00">17:00</SelectItem>
                <SelectItem value="18:00">18:00</SelectItem>
                <SelectItem value="19:00">19:00</SelectItem>
                <SelectItem value="20:00">20:00</SelectItem>
                <SelectItem value="21:00">21:00</SelectItem>
                <SelectItem value="22:00">22:00</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      {/* 우측 카드 */}
      <div className="flex flex-col gap-4 w-[400px] ">
        <div>
          <Card className="h-full p-0 w-full">
            <CardContent className="px-6 py-4 flex flex-col justify-center gap-4 h-full">
              <div className="flex flex-col justify-center items-center">
                <div className="p1-b text-primary">CGV 강남 2관 Dolby Atmos</div>
                <div className="p2 text-tertiary">2025.10.19 (일) 14:00 ~ 18:00</div>
              </div>
              <Separator />
              <div className="w-full flex justify-between items-center">
                <div className="p1-b text-tertiary">총 대관료</div>
                <div className="p1-b text-primary">500,000원</div>
              </div>
              <Separator />
              <div className="p2-b text-primary">모집 인원수</div>
              <div className="flex justify-start items-center gap-2">
                <Button variant="secondary" size="md" onClick={handleDecreaseCount} disabled={participantCount <= 1}>
                  -
                </Button>
                <Input
                  type="number"
                  value={participantCount}
                  onChange={(e) => setParticipantCount(Number(e.target.value))}
                  className="flex-1 text-center border-BG-2 border-2 rounded-[8px]"
                  min="1"
                  max="100"
                />
                <Button variant="secondary" size="md" onClick={handleIncreaseCount} disabled={participantCount >= 100}>
                  +
                </Button>
              </div>
              <Separator />
              <div className="w-full flex justify-between items-center">
                <div className="p1-b text-tertiary">1인당 티켓 가격</div>
                <div className="h4-b text-Brand1-Strong">50,000원</div>
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="flex justify-center items-center gap-2">
          <InformationIcon />
          <p className="p2 text-tertiary">펀딩은 승인 후 즉시 개설되며, 대관 신청일 7일 전까지 활성화됩니다.</p>
        </div>
      </div>
    </div>
  );
}
