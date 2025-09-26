'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Search, Image, AlertTriangle } from 'lucide-react';
import MovieIcon from '@/component/icon/movieIcon';
import SeriesIcon from '@/component/icon/seriesIcon';
import ConcertIcon from '@/component/icon/concertIcon';
import SportsIcon from '@/component/icon/sportsIcon';
import { TMDBMultiItem } from '@/types/tmdb';
import { searchMulti, getMediaTitle, getMediaDate, getMediaTypeKorean } from '@/api/tmdb';
import { getDetailSummary } from '@/api/funding';
import { useState, useRef, useEffect } from 'react';
import { useGetCategories } from '@/api/hooks/useCategoryQueries';
import { CategoryResponse } from '@/types/category';
import { movieinfo } from '@/types/funding';

interface MovieInfoTabProps {
  onNext: (data: movieinfo) => void;
  onPrev?: () => void;
}

export default function MovieInfoTab({ onNext, onPrev }: MovieInfoTabProps) {
  const { data: getCategories } = useGetCategories();

  const [categories, setCategories] = useState<CategoryResponse[]>([]); // 카테고리 목록을 저장하는 상태
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // 선택된 카테고리 ID를 저장하는 상태
  const [movieTitle, setMovieTitle] = useState(''); // 영화 제목을 저장하는 상태
  const [movieDescription, setMovieDescription] = useState(''); // 영화 설명을 저장하는 상태
  const [searchResults, setSearchResults] = useState<TMDBMultiItem[]>([]); // TMDB 검색 결과를 저장하는 상태
  const [isSearching, setIsSearching] = useState(false); // 검색 중인지 여부를 나타내는 상태
  const [selectedMovie, setSelectedMovie] = useState<TMDBMultiItem | null>(null); // 선택된 영화 정보를 저장하는 상태
  const [selectedMovieId, setSelectedMovieId] = useState<string>(''); // 선택된 영화의 ID를 저장하는 상태
  const [selectedImage, setSelectedImage] = useState<string>(''); // 선택된 이미지 URL을 저장하는 상태
  const [selectedFile, setSelectedFile] = useState<File | null>(null); // 업로드된 파일을 저장하는 상태
  const [isModalOpen, setIsModalOpen] = useState(false); // 검색 모달이 열려있는지 여부를 나타내는 상태
  const [searchQuery, setSearchQuery] = useState(''); // 검색어를 저장하는 상태
  const [categoryError, setCategoryError] = useState<string>(''); // 카테고리 선택 에러 메시지를 저장하는 상태
  const [titleError, setTitleError] = useState<string>(''); // 제목 입력 에러 메시지를 저장하는 상태
  const [descriptionError, setDescriptionError] = useState<string>(''); // 상영물 소개 에러 메시지를 저장하는 상태
  const [imageError, setImageError] = useState<string>(''); // 이미지 선택 에러 메시지를 저장하는 상태
  const [isAiSummaryModalOpen, setIsAiSummaryModalOpen] = useState(false); // AI 요약 모달 상태
  const [aiSummary, setAiSummary] = useState<string>(''); // AI 요약 내용
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false); // AI 요약 생성 중 상태
  const [displayedAiSummary, setDisplayedAiSummary] = useState<string>(''); // 타이핑 애니메이션용 AI 요약
  const [revealedChars, setRevealedChars] = useState<boolean[]>([]);
  const [aiSummaryError, setAiSummaryError] = useState<boolean>(false); // AI 요약 에러 상태

  // AI 요약 생성 함수
  const handleGenerateAiSummary = async () => {
    setIsGeneratingSummary(true);
    setDisplayedAiSummary(''); // 타이핑 애니메이션 초기화
    setRevealedChars([]); // 글자 애니메이션 상태 초기화
    setAiSummaryError(false); // 에러 상태 초기화

    try {
      // 현재 입력된 내용을 videoContent로 사용
      const videoContent = movieDescription;
      // console.log('videoContent', videoContent);

      // videoContent가 비어있으면 에러 처리
      if (!videoContent || videoContent.trim() === '') {
        throw new Error('요약할 내용이 없습니다. 상세 정보를 입력해주세요.');
      }

      // getDetailSummary API 호출
      const summaryResponse = await getDetailSummary(videoContent);
      // console.log('summaryResponse', summaryResponse);
      // API 응답에서 요약 텍스트 추출
      const aiGeneratedSummary = summaryResponse.data?.processedVideoContent || '요약을 생성할 수 없습니다.';

      setAiSummary(aiGeneratedSummary);
      setDisplayedAiSummary(aiGeneratedSummary);
      setIsGeneratingSummary(false);
      setAiSummaryError(false); // 성공 시 에러 상태 해제

      // 대각선 순차 애니메이션 시작
      const chars = Array.from(aiGeneratedSummary);
      const newRevealedChars = new Array(chars.length).fill(false);
      setRevealedChars(newRevealedChars);

      // 각 글자별로 순차적으로 나타나게 함
      chars.forEach((_, index) => {
        setTimeout(() => {
          setRevealedChars((prev) => {
            const updated = [...prev];
            updated[index] = true;
            return updated;
          });
        }, index * 18);
      });
    } catch (error) {
      console.error('AI 요약 생성 오류:', error);
      setIsGeneratingSummary(false);
      setAiSummaryError(true); // 에러 상태 설정
      // 에러 발생 시 사용자 친화적인 메시지 표시
      const errorMessage = '일시적으로 요약을 불러오지 못했어요. 잠시 후 다시 시도해 주세요.';
      setAiSummary(errorMessage);
      setDisplayedAiSummary(errorMessage);
    }
  }; // 각 글자의 애니메이션 상태
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null); // 검색 디바운싱을 위한 타이머 ref
  const fileInputRef = useRef<HTMLInputElement>(null); // 파일 입력 요소에 대한 ref

  useEffect(() => {
    if (getCategories) {
      setCategories(getCategories);
    }
  }, [getCategories]);

  const handleCategorySelect = (categoryId: string) => {
    // 카테고리 에러 메시지 초기화
    setCategoryError('');

    if (selectedCategoryId === categoryId) {
      // 이미 선택된 경우 제거
      setSelectedCategoryId('');
    } else {
      // 새로운 카테고리 선택 (전체에서 1개만 선택 가능)
      setSelectedCategoryId(categoryId);
    }
  };

  // TMDB Multi API 검색 함수
  const handleSearchMovies = async (query: string) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const result = await searchMulti(query);

      if (result.success && result.data) {
        setSearchResults(result.data.results);
      } else {
        console.error('API 오류:', result.error);
        setSearchResults([]);
      }
    } catch (error) {
      console.error('검색 중 오류 발생:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 실시간 검색을 위한 useEffect
  useEffect(() => {
    // 이전 타이머가 있다면 클리어
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 입력값이 있을 때만 검색
    if (searchQuery && searchQuery.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearchMovies(searchQuery);
      }, 1000); // 1초 후 검색
    } else {
      // 입력값이 없으면 검색 결과 초기화 및 로딩 상태 해제
      setSearchResults([]);
      setIsSearching(false);
    }

    // 컴포넌트 언마운트 시 타이머 클리어
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // 영화 선택 함수 (모달에서 호출)
  const handleMovieSelect = (movieId: string) => {
    const movie = searchResults.find((m) => m.id.toString() === movieId);
    if (movie) {
      setSelectedMovie(movie);
      setMovieTitle(getMediaTitle(movie));
      setMovieDescription(movie.overview);
      setSelectedMovieId(movieId);
      setTitleError(''); // 제목 에러 메시지 초기화
      setImageError(''); // 이미지 에러 메시지 초기화

      // 이미지 URL 설정
      if (movie.poster_path) {
        setSelectedImage(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
      } else {
        setSelectedImage('');
      }

      // 모달 닫기
      setIsModalOpen(false);
      setSearchQuery('');
      setSearchResults([]);
    }
  };

  // 모달 열릴 때 검색 결과 초기화
  const handleModalOpen = () => {
    setIsModalOpen(true);
    setSearchQuery('');
    setSearchResults([]);
  };

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImageError(''); // 이미지 에러 메시지 초기화
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // 파일 선택 트리거
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // 이미지 삭제 핸들러
  const handleImageDelete = () => {
    setSelectedImage('');
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // 유효성 검사 함수
  const isFormValid = () => {
    return selectedCategoryId && movieTitle.trim() && movieDescription.trim() && selectedImage;
  };

  // 다음 단계로 넘어가는 핸들러
  const handleNext = () => {
    // 에러 메시지 초기화
    setCategoryError('');
    setTitleError('');
    setDescriptionError('');
    setImageError('');

    let hasError = false;

    // 유효성 검사
    if (!selectedCategoryId) {
      setCategoryError('카테고리를 1개 선택해주세요.');
      hasError = true;
    }

    if (!movieTitle.trim()) {
      setTitleError('상영물 제목을 입력하거나 검색해주세요.');
      hasError = true;
    }

    if (!movieDescription.trim()) {
      setDescriptionError('상영물 소개를 입력해주세요.');
      hasError = true;
    }

    if (!selectedImage) {
      setImageError('상영물 이미지를 검색하거나 추가해주세요.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    const movieData: movieinfo = {
      categoryId: parseInt(selectedCategoryId), // 선택한 카테고리
      videoName: movieTitle, // 상영물 제목
      posterUrl: selectedImage, // 상영물 이미지 배너
      videoContent: movieDescription, // 상영물 설명
    };

    // console.log('movieData', movieData);
    // console.log('==============ㄴ==========');

    onNext(movieData);
  };

  return (
    <div className="space-y-8">
      {/* 카테고리 선택 */}
      <div className="space-y-3">
        <div className="space-y-1">
          <h4 className="h5-b text-primary">
            카테고리 선택하기 <span className="text-Brand1-Primary">*</span>
          </h4>
          <p className="p3 text-tertiary">전체 카테고리 중 1개만 선택해주세요.</p>
        </div>

        {/* 카테고리 섹션들 */}
        <div className="grid max-lg:grid-cols-1 grid-cols-2 gap-6 ">
          {categories.map((category) => (
            <div key={category.categoryId}>
              <div className="flex items-center mb-2 overflow-x-auto">
                {(() => {
                  const getIcon = (categoryName: string) => {
                    switch (categoryName) {
                      case '영화':
                        return MovieIcon;
                      case '시리즈':
                        return SeriesIcon;
                      case '공연':
                        return ConcertIcon;
                      case '스포츠 중계':
                        return SportsIcon;
                      default:
                        return MovieIcon;
                    }
                  };
                  const IconComponent = getIcon(category.categoryName);
                  return <IconComponent className="w-4 h-4 mr-1" />;
                })()}
                <h3 className="p2-b text-Brand1-Strong">{category.categoryName}</h3>
              </div>
              <div className="w-full flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide">
                {category.childCategories.map((item) => {
                  const categoryValue = item.categoryId.toString();
                  const isSelected = selectedCategoryId === categoryValue;
                  const isDisabled = selectedCategoryId !== '' && selectedCategoryId !== categoryValue;
                  return (
                    <Button
                      variant="outline"
                      key={item.categoryId}
                      size="sm"
                      textSize="sm"
                      onClick={() => handleCategorySelect(item.categoryId.toString())}
                      disabled={isDisabled}
                      className={`flex-1 rounded-[6px] p2-b ${
                        isSelected
                          ? 'text-Brand1-Strong border-Brand1-Strong hover:border-Brand1-Secondary'
                          : isDisabled
                          ? 'text-tertiary border-stroke-4 opacity-50 cursor-not-allowed'
                          : 'text-tertiary border-stroke-4 hover:border-stroke-2'
                      }`}
                    >
                      {item.categoryName}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
        {/* 카테고리 에러 메시지 */}
        {categoryError && <div className="text-Brand1-Primary p3 mt-2">{categoryError}</div>}
      </div>

      {/* 상영물 제목 및 이미지 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3 max-lg:space-y-6">
          <div className="space-y-1">
            <h4 className="h5-b text-primary">
              상영물 제목 <span className="text-Brand1-Primary">*</span>
            </h4>
            <p className="p3 text-tertiary">상영물 정보를 직접 입력하거나 상영물 검색 버튼을 통해 찾을 수 있습니다.</p>
          </div>
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="상영물 제목을 입력하거나 검색해주세요"
                value={movieTitle}
                onChange={(e) => {
                  setMovieTitle(e.target.value);
                  setTitleError(''); // 제목 에러 메시지 초기화
                }}
                className="flex-1 placeholder:text-p2-b"
              />
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={handleModalOpen} className="h-10 px-4">
                    <Search className="w-4 h-4 mr-2" />
                    상영물 검색
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
                  <DialogHeader className="self-stretch">
                    <DialogTitle>상영물 검색</DialogTitle>
                    <DialogDescription></DialogDescription>
                  </DialogHeader>
                  <div className="w-full space-y-4 min-h-[300px] max-h-[60vh] overflow-hidden">
                    <Input
                      placeholder="원하는 상영물 제목 2글자 이상 입력해주세요"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full border border-stroke-2 rounded-[6px] placeholder:text-p2-b"
                    />

                    {isSearching && (
                      <div className="flex items-center justify-center h-[300px]">
                        <div className="p1 text-tertiary flex items-center justify-center gap-3 rounded-[6px]">
                          <div className="w-6 h-6 border-2 h3-b border-Brand1-Primary border-t-transparent rounded-full animate-spin"></div>
                          검색 중...
                        </div>
                      </div>
                    )}

                    {/* 검색 결과 */}
                    {searchQuery && !isSearching && searchResults.length > 0 && (
                      <div className="max-h-[300px] overflow-y-auto scrollbar-hide space-y-2">
                        {searchResults.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 hover:bg-BG-2 border border-stroke-4 rounded-[6px] cursor-pointer"
                            onClick={() => handleMovieSelect(item.id.toString())}
                          >
                            {item.poster_path ? (
                              <img
                                src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                                alt={getMediaTitle(item)}
                                className="max-lg:h-full max-lg:object-contain w-12 h-16 object-cover rounded-[6px] flex-shrink-0"
                              />
                            ) : (
                              <div className="w-12 h-16 bg-BG-2 rounded-[6px] flex items-center justify-center flex-shrink-0">
                                <Image className="w-6 h-6 text-tertiary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="h6 text-primary max-lg:text-p2-b">
                                {getMediaTitle(item)}
                                {getMediaDate(item) ? ` (${getMediaDate(item)?.split('-')[0]})` : ''}
                              </div>
                              <div className="p3 text-primary max-lg:text-p3-b">{getMediaTypeKorean(item.media_type)}</div>
                              {item.overview && <div className="p3 text-tertiary mt-1 line-clamp-2 max-lg:text-caption1-b">{item.overview}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* 초기 상태 메시지 */}
                    {!searchQuery && !isSearching && (
                      <div className="p-6 rounded-[6px] text-center min-h-[300px] flex flex-col items-center justify-center">
                        <Search className="w-12 h-12 text-tertiary mx-auto mb-3" />
                        <p className="h4-b text-tertiary mb-1">상영물을 검색해보세요</p>
                        <p className="p2 text-tertiary">제목을 입력하면 자동으로 검색됩니다</p>
                      </div>
                    )}

                    {/* 검색 결과가 없을 때 */}
                    {searchQuery && !isSearching && searchResults.length === 0 && (
                      <div className="p-3 rounded-[6px] min-h-[300px] flex items-center justify-center">
                        <p className="p1-b text-tertiary text-center">"{searchQuery}"에 대한 검색 결과가 없습니다.</p>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {/* 제목 에러 메시지 */}
            {titleError && <div className="text-Brand1-Primary p3 mt-2">{titleError}</div>}
          </div>

          {/* 선택된 영화 정보 */}
          {selectedMovie && (
            <div className="mt-4 p-3 bg-BG-1 rounded-[6px]">
              <div className="flex items-center gap-3">
                {selectedMovie.poster_path ? (
                  <img src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`} alt={getMediaTitle(selectedMovie)} className="w-12 h-16 object-cover rounded-[6px]" />
                ) : (
                  <div className="w-12 h-16 bg-BG-2 rounded-[6px] flex items-center justify-center">
                    <Image className="w-6 h-6 text-tertiary" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="h6 text-primary">{getMediaTitle(selectedMovie)}</h4>
                  <p className="p3 text-primary">
                    {getMediaDate(selectedMovie) ? `${getMediaDate(selectedMovie)?.split('-')[0]} • ` : ''}
                    {getMediaTypeKorean(selectedMovie.media_type)}
                  </p>
                </div>
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    setSelectedMovie(null);
                    setMovieTitle('');
                    setMovieDescription('');
                    setSelectedImage('');
                    setSelectedFile(null);
                    setSelectedMovieId('');
                  }}
                >
                  변경
                </Button>
              </div>
            </div>
          )}

          {/* 상영물 상세 소개 */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="space-y-1">
                <h4 className="h5-b text-primary">
                  상영물 소개 <span className="text-Brand1-Primary">*</span>
                </h4>
                <p className="p3 text-tertiary">상영물에 대한 소개를 입력해주세요.</p>
              </div>
              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  setAiSummary(''); // AI 요약 초기화
                  setDisplayedAiSummary(''); // 타이핑 애니메이션 초기화
                  setRevealedChars([]); // 글자 애니메이션 상태 초기화
                  setIsAiSummaryModalOpen(true);
                }}
              >
                AI 요약
              </Button>
            </div>
            <Textarea
              placeholder="상영물에 대한 소개를 입력해주세요."
              value={movieDescription}
              onChange={(e) => {
                setMovieDescription(e.target.value);
                setDescriptionError(''); // 상영물 소개 에러 메시지 초기화
              }}
              className="min-h-[135px] resize-none"
            />
            {/* 상영물 소개 에러 메시지 */}
            {descriptionError && <div className="text-Brand1-Primary p3 mt-2">{descriptionError}</div>}
          </div>
        </div>

        {/* 상영물 이미지 */}
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="h5-b text-primary">
              상영물 이미지 <span className="text-Brand1-Primary">*</span>
            </h4>
            <p className="p3 text-tertiary">썸네일로 사용될 이미지를 업로드해주세요.</p>
          </div>
          <Card className="p-0">
            <CardContent className="h-[350px]">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
              {selectedImage ? (
                <div className="flex justify-between gap-3 max-sm:flex max-sm:justify-center">
                  <div className="flex flex-col gap-2 ">
                    <img src={selectedImage} alt="선택된 상영물 이미지" className="w-[200px] h-[280px] object-fill max-sm:w-full max-sm:object-fill rounded-[6px]" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="md" onClick={handleUploadClick} className="flex-1">
                        변경
                      </Button>
                      <Button variant="secondary" size="md" onClick={handleImageDelete} className="flex-1">
                        삭제
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 h-full max-sm:hidden">
                    <div className="bg-BG-1 border border-stroke-3 rounded-[6px] p-3 h-[325px] overflow-y-auto scrollbar-hide">
                      <div className="flex items-start gap-3 ">
                        <div className="w-6 h-6 rounded-full bg-Brand1-Primary flex justify-center items-center flex-shrink-0">
                          <span className="text-primary p1-b">!</span>
                        </div>
                        <p className="h6-b text-primary">이미지 업로드 안내</p>
                      </div>
                      <div className="space-y-1 mt-2">
                        <ul className="space-y-2 mt-4 max-sm:space-y-1">
                          <li className="p2 text-secondary">• 이미지는 1개 이상 필수로 업로드 해주세요.</li>
                          <li className="p2 text-secondary">• 상영물 검색 시 자동으로 이미지가 등록됩니다.</li>
                          <li className="p2 text-secondary">• 직접 이미지를 업로드할 수 있습니다.</li>
                          <li className="p2 text-secondary">
                            • 업로드 규격:
                            <ul className="ml-4 mt-1 space-y-0.5">
                              <li className="p2 text-tertiary">- 파일 형식: webp(권장), jpg, png</li>
                              <li className="p2 text-tertiary">- 용량: 5MB 이하</li>
                              <li className="p2 text-tertiary">- 사이즈: 가로 세로 각각 1,000px 이상</li>
                              <li className="p2 text-tertiary">- 비율: 1:1</li>
                            </ul>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-BG-2 rounded-[6px] transition-colors" onClick={handleUploadClick}>
                  <Upload className="w-11 h-11 text-tertiary mb-3" size={44} />
                  <p className="p2-b text-tertiary text-center mb-1">이미지는 1개 이상 필수로 업로드 해주세요.</p>
                  <p className="p2 text-subtle text-center">JPG, PNG, WEBP 파일을 지원합니다</p>
                </div>
              )}
            </CardContent>
          </Card>
          {/* 이미지 에러 메시지 */}
          {imageError && <div className="text-Brand1-Primary p3 mt-2">{imageError}</div>}
        </div>
      </div>
      {/* 이전 다음 바튼 */}
      <div className="pt-4 flex justify-center gap-2">
        <Button variant="tertiary" size="lg" className="w-[138px] max-lg:w-full" onClick={onPrev}>
          이전
        </Button>
        <Button type="button" variant="brand1" size="lg" className="w-[138px] max-lg:w-full" onClick={handleNext}>
          다음
        </Button>
      </div>

      {/* AI 요약 모달 */}
      <Dialog open={isAiSummaryModalOpen} onOpenChange={setIsAiSummaryModalOpen}>
        <DialogContent className="max-w-2xl overflow-y-auto">
          <DialogHeader className="self-stretch">
            <DialogTitle className="h4-b text-primary mb-2">AI 요약</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>

          <div className="w-full space-y-6">
            {selectedMovie ? (
              <>
                {/* 현재 상세 정보 섹션 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-stroke-3 rounded-full"></div>
                    <h4 className="h6-b text-primary">현재 상세 정보</h4>
                  </div>
                  <div className="group cursor-pointer transition-all duration-200">
                    <div className="bg-BG-1 border border-stroke-3 rounded-lg p-4 transition-all duration-200 hover:shadow-sm">
                      <div className="bg-BG-1 p-1 max-h-[120px] overflow-y-auto scrollbar-hide">
                        <p className="p1 max-lg:text-p2 text-secondary">{movieDescription || selectedMovie.overview || '상세 정보가 없습니다.'}</p>
                      </div>
                      <div className="mt-3 flex items-center justify-between">
                        <span className="p3-b text-tertiary">{(movieDescription || selectedMovie.overview || '').length}자</span>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setIsAiSummaryModalOpen(false);
                          }}
                        >
                          현재 내용 사용하기
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* AI 요약 섹션 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${aiSummary ? 'bg-Brand1-Primary' : 'bg-stroke-4'}`}></div>
                    <h4 className="h6-b text-primary">AI 요약</h4>
                  </div>

                  {!aiSummary ? (
                    <div className="bg-BG-2 rounded-lg p-8 text-center">
                      <p className="p2-b text-tertiary mb-4">AI가 핵심 내용을 요약해드립니다</p>
                      <Button onClick={handleGenerateAiSummary} disabled={isGeneratingSummary} size="sm" className="bg-Brand1-Primary hover:bg-Brand1-Secondary text-primary">
                        {isGeneratingSummary ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            생성 중...
                          </div>
                        ) : (
                          'AI 요약 생성'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="group cursor-pointer transition-all duration-200">
                      <div className="bg-BG-1 border border-stroke-3 rounded-lg p-4 transition-all duration-200 ">
                        <div className="p-1 max-h-[120px] overflow-y-auto scrollbar-hide">
                          {aiSummaryError ? (
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-Brand1-Primary flex-shrink-0 mt-0.5" />
                              <div className="p1 max-lg:text-p2 text-secondary">{displayedAiSummary}</div>
                            </div>
                          ) : (
                            <div className="p1 max-lg:text-p2 text-secondary !leading-[1.5] !tracking-tight whitespace-pre-wrap">
                            {Array.from(displayedAiSummary).map((char, index) => {
                              const delayMs = index * 10;
                              const style: React.CSSProperties = {
                                opacity: revealedChars[index] ? 1 : 0,
                                transform: revealedChars[index] ? 'translate(0,0)' : 'translate(10px,10px)',
                                transitionProperty: 'opacity, transform',
                                transitionDuration: '200ms',
                                transitionTimingFunction: 'cubic-bezier(0.22,1,0.36,1)',
                                transitionDelay: `${delayMs}ms`,
                              };
                              return (
                                <span key={`c-${index}`} style={style}>
                                  {char === ' ' ? '\u00A0' : char}
                                </span>
                              );
                            })}
                            </div>
                          )}
                        </div>
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="p3-b text-tertiary">{aiSummary.length}자</span>
                          </div>
                          <Button
                            variant="brand1"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setMovieDescription(aiSummary);
                              setDisplayedAiSummary(''); // 타이핑 애니메이션 초기화
                              setRevealedChars([]); // 글자 애니메이션 상태 초기화
                              setIsAiSummaryModalOpen(false);
                            }}
                          >
                            AI 요약 사용하기
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="p1-b text-tertiary mb-4">먼저 영화를 검색하고 선택해주세요.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsAiSummaryModalOpen(false);
                    setIsModalOpen(true);
                  }}
                >
                  영화 검색하기
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
