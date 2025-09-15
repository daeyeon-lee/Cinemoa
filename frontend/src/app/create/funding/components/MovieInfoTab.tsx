'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, Search, Image } from 'lucide-react';
import MovieIcon from '@/component/icon/movieIcon';
import SeriesIcon from '@/component/icon/seriesIcon';
import ConcertIcon from '@/component/icon/concertIcon';
import SportsIcon from '@/component/icon/sportsIcon';
import { TMDBMultiItem } from '@/types/tmdb';
import { searchMulti, getMediaTitle, getMediaDate, getMediaTypeKorean } from '@/plugins/tmdb';
import Link from 'next/link';

// 카테고리 데이터
const categories = {
  movie: {
    title: '영화',
    icon: MovieIcon,
    items: ['액션', '공포/스릴러', '음악', '판타지/SF', '애니메이션', '기타'],
  },
  series: {
    title: '시리즈',
    icon: SeriesIcon,
    items: ['액션', '공포/스릴러', '음악', '판타지/SF', '애니메이션', '기타'],
  },
  performance: {
    title: '공연',
    icon: ConcertIcon,
    items: ['K-POP', 'POP', '클래식', '뮤지컬', '기타'],
  },
  sports: {
    title: '스포츠중계',
    icon: SportsIcon,
    items: ['축구', '야구', 'F1', 'E-스포츠', '기타'],
  },
};

export default function MovieInfoTab() {
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDescription, setMovieDescription] = useState('');
  const [searchResults, setSearchResults] = useState<TMDBMultiItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<TMDBMultiItem | null>(null);
  const [selectedMovieId, setSelectedMovieId] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategorySelect = (categoryKey: string, item: string) => {
    const categoryValue = `${categoryKey}-${item}`;

    if (selectedCategory === categoryValue) {
      // 이미 선택된 경우 제거
      setSelectedCategory('');
    } else {
      // 새로운 카테고리 선택
      setSelectedCategory(categoryValue);
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

  // 영화 선택 함수 (Select에서 호출)
  const handleMovieSelect = (movieId: string) => {
    const movie = searchResults.find((m) => m.id.toString() === movieId);
    if (movie) {
      setSelectedMovie(movie);
      setMovieTitle(getMediaTitle(movie));
      setMovieDescription(movie.overview);
      setSelectedMovieId(movieId);

      // 이미지 URL 설정
      if (movie.poster_path) {
        setSelectedImage(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
      } else {
        setSelectedImage('');
      }

      // 검색 결과 초기화 (드롭다운 숨기기)
      setSearchResults([]);
    }
  };

  // 실시간 검색을 위한 useEffect
  useEffect(() => {
    // 이전 타이머가 있다면 클리어
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // 입력값이 있을 때만 검색
    if (movieTitle && movieTitle.trim().length > 0) {
      searchTimeoutRef.current = setTimeout(() => {
        handleSearchMovies(movieTitle);
      }, 1000); // 1초 후 검색
    } else {
      // 입력값이 없으면 검색 결과 초기화
      setSearchResults([]);
      setSelectedMovieId('');
      setSelectedMovie(null);
      setMovieDescription('');
    }

    // 컴포넌트 언마운트 시 타이머 클리어
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [movieTitle]);

  // 파일 선택 핸들러
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
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

  // 검색 결과 초기화
  const clearSearchResults = () => {
    setSearchResults([]);
    setSelectedMovieId('');
    setSelectedMovie(null);
    setMovieTitle('');
    setMovieDescription('');
    setSelectedImage('');
    setSelectedFile(null);
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
            {Object.entries(categories).map(([key, category]) => (
              <div key={key}>
                <div className="flex items-center mb-2">
                  <category.icon className="w-4 h-4 mr-1" />
                  <h3 className="text-sm sm:text-p2-b text-Brand1-Primary">{category.title}</h3>
                </div>
                <div className="w-full flex flex-nowrap gap-2">
                  {category.items.map((item) => {
                    const categoryValue = `${key}-${item}`;
                    const isSelected = selectedCategory === categoryValue;
                    const isDisabled = selectedCategory !== '' && selectedCategory !== categoryValue;
                    return (
                      <Button
                        variant="outline"
                        key={item}
                        size="sm"
                        textSize="sm"
                        onClick={() => handleCategorySelect(key, item)}
                        disabled={isDisabled}
                        className={`flex-1 rounded-[6px] text-xs ${
                          isSelected
                            ? 'text-Brand1-Strong border-Brand1-Strong hover:border-Brand1-Secondary'
                            : isDisabled
                            ? 'text-tertiary border-stroke-4 opacity-50 cursor-not-allowed'
                            : 'text-tertiary border-stroke-4 hover:border-stroke-2'
                        }`}
                      >
                        {item}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 상영물 제목 및 이미지 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="h5-b text-primary">
              상영물 제목 <span className="text-Brand1-Primary">*</span>
            </h4>
            <p className="p3 text-tertiary">상영물 제목을 입력해주세요.</p>
          </div>
          <div className="space-y-2">
            <Input
              placeholder="상영물 제목을 입력해주세요 (입력하면 자동 검색됩니다)"
              value={movieTitle}
              onChange={(e) => setMovieTitle(e.target.value)}
              className="w-full"
            />
            {isSearching && (
              <div className="p3 text-tertiary flex items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 p2 border-Brand1-Primary border-t-transparent rounded-full animate-spin"></div>
                검색 중...
              </div>
            )}
          </div>

          {/* 검색 결과 드롭다운 */}
          {movieTitle && movieTitle.trim().length > 0 && !isSearching && searchResults.length > 0 && (
            <div className="mt-2 rounded-[6px] bg-BG-1 max-h-[200px] overflow-y-auto scrollbar-hide">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 p-3 hover:bg-BG-2 border-b border-stroke-4 last:border-b-0"
                >
                  {item.poster_path ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${item.poster_path}`}
                      alt={getMediaTitle(item)}
                      className="w-8 h-12 object-cover rounded flex-shrink-0"
                    />
                  ) : (
                    // 이미지 없으면 기본 이미지
                    <div className="w-8 h-12 bg-BG-2 rounded-[6px] flex items-center justify-center flex-shrink-0">
                      <Image className="w-5 h-5 text-tertiary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="h6 text-primary">
                      {getMediaTitle(item)} ({getMediaDate(item)?.split('-')[0]})
                    </div>
                    <div className="p3 text-primary">{getMediaTypeKorean(item.media_type)}</div>
                  </div>
                  <Button
                    variant="brand1"
                    size="sm"
                    onClick={() => handleMovieSelect(item.id.toString())}
                    className="flex-shrink-0"
                  >
                    선택
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* 검색 결과가 없을 때 */}
          {movieTitle && movieTitle.trim().length > 0 && !isSearching && searchResults.length === 0 && (
            <div className="mt-4 p-3 border border-stroke-3 rounded-[6px]">
              <p className="p1-b text-tertiary text-center">"{movieTitle}"에 대한 검색 결과가 없습니다.</p>
            </div>
          )}

          {/* 선택된 영화 정보 */}
          {selectedMovie && (
            <div className="mt-4 p-3 bg-BG-2 rounded-[6px] ">
              <div className="flex items-center gap-3">
                {selectedMovie.poster_path ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${selectedMovie.poster_path}`}
                    alt={getMediaTitle(selectedMovie)}
                    className="w-12 h-16 object-cover rounded-[6px]"
                  />
                ) : (
                  <div className="w-12 h-16 bg-BG-2 rounded-[6px] flex items-center justify-center">
                    <Image className="w-6 h-6 text-tertiary" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="h6 text-primary">{getMediaTitle(selectedMovie)}</h4>
                  <p className="p3 text-primary">
                    {getMediaDate(selectedMovie)?.split('-')[0]} • {getMediaTypeKorean(selectedMovie.media_type)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <h4 className="h5-b text-primary">
              상영물 이미지 <span className="text-Brand1-Primary">*</span>
            </h4>
            <p className="p3 text-tertiary">이미지를 업로드해주세요.</p>
          </div>
          <Card className="px-0">
            <CardContent className="h-[280px] flex items-center justify-center ">
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
              {selectedImage ? (
                <div className="flex items-center justify-between w-full h-full">
                  <img
                    src={selectedImage}
                    alt="선택된 상영물 이미지"
                    className="max-w-full max-h-[200px] object-contain rounded-[6px]"
                  />
                  <div className="flex flex-col items-center gap-3">
                    <Button variant="outline" size="sm" onClick={handleUploadClick} className="ml-3">
                      변경
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleImageDelete} className="ml-3">
                      삭제
                    </Button>
                  </div>
                </div>
              ) : (
                <div
                  className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-BG-2 rounded-[6px] transition-colors"
                  onClick={handleUploadClick}
                >
                  <Upload className="w-11 h-11 text-tertiary mb-3" size={44} />
                  <p className="p2 text-primary text-center mb-1">이미지를 업로드하거나 드래그하세요</p>
                  <p className="p2 text-primary text-center">JPG, PNG 파일을 지원합니다</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* 상영물 상세 소개 */}
      <div className="space-y-3">
        <h4 className="h5-b text-primary">상영물 상세 소개</h4>
        <Textarea
          placeholder="상영물에 대한 소개를 입력해주세요."
          value={movieDescription}
          onChange={(e) => setMovieDescription(e.target.value)}
          className="min-h-[112px]"
        />
      </div>
      <div className="pt-4 flex flex-col sm:flex-row gap-2 sm:gap-4">
        <Link href="/create" className="w-full">
          <Button variant="tertiary" size="lg" className="w-full">
            이전
          </Button>
        </Link>
        <Button type="submit" variant="brand1" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? '처리 중...' : '다음'}
        </Button>
      </div>
    </div>
  );
}
