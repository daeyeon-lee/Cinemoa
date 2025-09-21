import React from 'react';
import { CineCardVertical } from '@/components/cards/CineCardVertical';
import { CineCardHorizontal } from '@/components/cards/CineCardHorizontal';
import type { ListCardData } from '@/components/cards/CineCardVertical';

interface CardGridProps {
  data: any[];
  convertToCardData: (item: any) => ListCardData;
  onCardClick: (fundingId: number) => void;
  onVoteClick: (id: number) => void;
}

const CardGrid: React.FC<CardGridProps> = ({ 
  data, 
  convertToCardData, 
  onCardClick, 
  onVoteClick
}) => {
  return (
    <div className="flex flex-wrap gap-4">
      {data.map((item, index) => (
        <div key={`${item.funding?.fundingId || index}`} className="w-full sm:w-[177.6px]">
          {/* PC/태블릿: 세로 카드 */}
          <div className="hidden sm:block">
            <CineCardVertical
              data={convertToCardData(item)}
              onCardClick={onCardClick}
              onVoteClick={onVoteClick}
            />
          </div>
          {/* 모바일: 가로 카드 */}
          <div className="block sm:hidden w-full">
            <CineCardHorizontal
              data={convertToCardData(item)}
              onCardClick={onCardClick}
              onVoteClick={onVoteClick}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default CardGrid;
