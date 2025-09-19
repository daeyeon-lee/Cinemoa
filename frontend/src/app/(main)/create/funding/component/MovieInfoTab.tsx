'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Upload, Search, Image } from 'lucide-react';
import MovieIcon from '@/component/icon/movieIcon';
import SeriesIcon from '@/component/icon/seriesIcon';
import ConcertIcon from '@/component/icon/concertIcon';
import SportsIcon from '@/component/icon/sportsIcon';
import { TMDBMultiItem } from '@/types/tmdb';
import { searchMulti, getMediaTitle, getMediaDate, getMediaTypeKorean } from '@/api/tmdb';
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

    console.log('movieData', movieData);
    console.log('========================');

    onNext(movieData);
  };

  return (
    <div className="space-y-8">
      {/* 카테고리 선택 */}
      <div className="space-y-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="h5-b text-primary">
              카테고리 선택하기 <span className="text-Brand1-Primary">*</span>
            </h4>
            <p className="p3 text-tertiary">전체 카테고리 중 1개만 선택해주세요.</p>
          </div>

          {/* 카테고리 섹션들 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {categories.map((category) => (
              <div key={category.categoryId}>
                <div className="flex items-center mb-2">
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
                  <h3 className="text-sm sm:text-p2-b text-Brand1-Strong">{category.categoryName}</h3>
                </div>
                <div className="w-full flex flex-nowrap gap-2">
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
                        className={`flex-1 rounded-[6px] text-xs ${
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
      </div>

      {/* 상영물 제목 및 이미지 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
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
                className="flex-1"
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
                              <img src={`https://image.tmdb.org/t/p/w185${item.poster_path}`} alt={getMediaTitle(item)} className="w-12 h-16 object-cover rounded flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-16 bg-BG-2 rounded-[6px] flex items-center justify-center flex-shrink-0">
                                <Image className="w-6 h-6 text-tertiary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="h6 text-primary">
                                {getMediaTitle(item)}
                                {getMediaDate(item) ? ` (${getMediaDate(item)?.split('-')[0]})` : ''}
                              </div>
                              <div className="p3 text-primary">{getMediaTypeKorean(item.media_type)}</div>
                              {item.overview && <div className="p3 text-tertiary mt-1 line-clamp-2">{item.overview}</div>}
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
            <div className="space-y-1">
              <h4 className="h5-b text-primary">
                상영물 소개 <span className="text-Brand1-Primary">*</span>
              </h4>
              <p className="p3 text-tertiary">상영물에 대한 소개를 입력해주세요.</p>
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
                <div className="flex justify-between gap-3">
                  <div className="flex flex-col gap-2">
                    <img src={selectedImage} alt="선택된 상영물 이미지" className="w-[200px] h-[280px] object-cover rounded-[6px]" />
                    <div className="flex gap-2">
                      <Button variant="outline" size="md" onClick={handleUploadClick} className="flex-1">
                        변경
                      </Button>
                      <Button variant="secondary" size="md" onClick={handleImageDelete} className="flex-1">
                        삭제
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-BG-1 border border-stroke-3 rounded-[6px] p-8 h-full max-w-sm">
                      <div className="flex items-start gap-3 ">
                        <div className="w-6 h-6 rounded-full bg-Brand1-Primary flex justify-center items-center flex-shrink-0">
                          <span className="text-primary p1-b">!</span>
                        </div>
                        <p className="h6-b text-primary">이미지 업로드 안내</p>
                      </div>
                      <div className="space-y-1 mt-2">
                        <ul className="space-y-2 mt-4">
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
      <div className="pt-4 flex justify-center sm:flex-row gap-2 sm:gap-4">
        <Button variant="tertiary" size="lg" className="w-[138px]" onClick={onPrev}>
          이전
        </Button>
        <Button type="button" variant="brand1" size="lg" className="w-[138px]" onClick={handleNext}>
          다음
        </Button>
      </div>
    </div>
  );
}
