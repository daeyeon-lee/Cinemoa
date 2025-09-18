import { create } from 'zustand';
import { fundinginfo, movieinfo, theaterinfo } from '@/types/funding';

interface FundingStore {
  // 펀딩 정보
  fundinginfo: fundinginfo;

  // 영화 정보
  movieinfo: movieinfo;

  // 상영관 정보
  theaterinfo: theaterinfo;

  // Actions
  setFundingInfo: (data: fundinginfo) => void;
  setMovieInfo: (data: movieinfo) => void;
  setTheaterInfo: (data: theaterinfo) => void;
  reset: () => void;
}

export const useFundingStore = create<FundingStore>((set) => ({
  // 초기값
  fundinginfo: {
    title: '',
    content: '',
  },
  movieinfo: {
    categoryId: 0,
    videoName: '',
    posterUrl: '',
  },
  theaterinfo: {
    cinemaId: 0,
    screenId: 0,
    screenday: '',
    scrrenStartsOn: 0,
    scrrenEndsOn: 0,
    maxPeople: 0,
  },

  // Actions
  setFundingInfo: (data: fundinginfo) =>
    set({
      fundinginfo: data,
    }),

  setMovieInfo: (data: movieinfo) =>
    set({
      movieinfo: data,
    }),

  setTheaterInfo: (data: theaterinfo) =>
    set({
      theaterinfo: data,
    }),

  reset: () =>
    set({
      fundinginfo: {
        title: '',
        content: '',
      },
      movieinfo: {
        categoryId: 0,
        videoName: '',
        posterUrl: '',
      },
      theaterinfo: {
        cinemaId: 0,
        screenId: 0,
        screenday: '',
        scrrenStartsOn: 0,
        scrrenEndsOn: 0,
        maxPeople: 0,
      },
    }),
}));
