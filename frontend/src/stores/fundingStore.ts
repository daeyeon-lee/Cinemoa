import { create } from 'zustand';
import { CreateFundingParams } from '@/types/funding';

interface FundingStore {
  // 펀딩 정보
  title: string;
  description: string;

  // 영화 정보
  category: string;
  movieTitle: string;
  movieImage: string;

  // 상영관 정보
  cinemaId: number | null;
  screenday: string;
  scrrenStartsOn: number | null;
  scrrenEndsOn: number | null;
  participant: number;

  // Actions
  setFundingInfo: (data: { title: string; description: string }) => void;
  setMovieInfo: (data: { category: string; movieTitle: string; movieImage: string }) => void;
  setTheaterInfo: (data: {
    cinemaId: number;
    screenday: string;
    scrrenStartsOn: number;
    scrrenEndsOn: number;
    participant: number;
  }) => void;
  reset: () => void;
}

export const useFundingStore = create<FundingStore>((set) => ({
  // 초기값
  title: '',
  description: '',
  category: '',
  movieTitle: '',
  movieImage: '',
  cinemaId: null,
  screenday: '',
  scrrenStartsOn: null,
  scrrenEndsOn: null,
  participant: 1,

  // Actions
  setFundingInfo: (data) =>
    set({
      title: data.title,
      description: data.description,
    }),

  setMovieInfo: (data) =>
    set({
      category: data.category,
      movieTitle: data.movieTitle,
      movieImage: data.movieImage,
    }),

  setTheaterInfo: (data) =>
    set({
      cinemaId: data.cinemaId,
      screenday: data.screenday,
      scrrenStartsOn: data.scrrenStartsOn,
      scrrenEndsOn: data.scrrenEndsOn,
      participant: data.participant,
    }),

  reset: () =>
    set({
      title: '',
      description: '',
      category: '',
      movieTitle: '',
      movieImage: '',
      cinemaId: null,
      screenday: '',
      scrrenStartsOn: null,
      scrrenEndsOn: null,
      participant: 1,
    }),
}));
