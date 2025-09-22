import { createContext, useContext, ReactNode } from 'react';
import type { VoteDetailData } from '@/types/fundingDetail';

type VoteDetailContextType = {
  data: VoteDetailData;
  userId?: string;
};

const VoteDetailContext = createContext<VoteDetailContextType | null>(null);

export const useVoteDetail = () => {
  const context = useContext(VoteDetailContext);
  if (!context) {
    throw new Error('useVoteDetail must be used within VoteDetailProvider');
  }
  return context;
};

export const VoteDetailProvider = ({ 
  children, 
  data, 
  userId 
}: { 
  children: ReactNode; 
  data: VoteDetailData; 
  userId?: string; 
}) => {
  return (
    <VoteDetailContext.Provider value={{ data, userId }}>
      {children}
    </VoteDetailContext.Provider>
  );
};
