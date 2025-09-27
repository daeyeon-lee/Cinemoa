'use client';

import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface EmptyStateCardProps {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  className?: string;
}

export default function EmptyStateCard({
  title,
  subtitle,
  buttonText,
  buttonLink,
  className = '',
}: EmptyStateCardProps) {
  const router = useRouter();

  return (
    <div className={`w-full flex justify-center items-center h-[400px] ${className}`}>
      <div className="flex flex-col justify-center items-center gap-4">
        <div className="text-center">
          <div className="text-slate-400 text-lg font-medium mb-2">{title}</div>
          <div className="text-slate-500 text-sm">{subtitle}</div>
        </div>
        <Button 
          onClick={() => router.push(buttonLink)} 
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          {buttonText}
        </Button>
      </div>
    </div>
  );
}
