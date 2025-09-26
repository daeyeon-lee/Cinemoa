import { createContext, useContext, ReactNode } from 'react';
import type { FundingDetailData } from '@/types/fundingDetail';

type FundingDetailContextType = {
  data: FundingDetailData;
  userId?: string;
};

const FundingDetailContext = createContext<FundingDetailContextType | null>(null);

export const useFundingDetail = () => {
  const context = useContext(FundingDetailContext);
  if (!context) {
    throw new Error('useFundingDetail must be used within FundingDetailProvider');
  }
  return context;
};

export const FundingDetailProvider = ({ 
  children, 
  data, 
  userId 
}: { 
  children: ReactNode; 
  data: FundingDetailData; 
  userId?: string; 
}) => {
  return (
    <FundingDetailContext.Provider value={{ data, userId }}>
      {children}
    </FundingDetailContext.Provider>
  );
};
