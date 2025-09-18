/**
 * Cinema DTO
 * 
 * API에서 전달받는 cinema 객체의 타입 정의
 */

export interface CinemaDto {
  cinemaId: number;
  cinemaName: string;
  city: string;
  district: string;
}