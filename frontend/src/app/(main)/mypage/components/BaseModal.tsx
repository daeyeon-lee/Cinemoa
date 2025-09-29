import React from 'react';
import { Button } from '@/components/ui/button';
import CloseIcon from '../icon/CloseIcon';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  width = "w-80" 
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div 
        className="p-10 bg-slate-800 rounded-[35px] inline-flex justify-center items-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`${width} inline-flex flex-col justify-start items-start gap-6`}>
          {/* 헤더 */}
          <div className="self-stretch inline-flex justify-between items-center">
            <div className="flex justify-start items-center gap-2.5">
              <div className="text-white text-lg font-medium leading-7">{title}</div>
            </div>
            <Button onClick={onClose} variant="ghost" size="sm" className="relative p-1 h-auto">
              <CloseIcon />
            </Button>
          </div>

          {/* 컨텐츠 */}
          {children}
        </div>
      </div>
    </div>
  );
};

export default BaseModal;
