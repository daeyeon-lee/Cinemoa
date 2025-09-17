import * as React from 'react';

import { cn } from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex h-max w-full rounded-[6px] bg-BG-1 px-3 py-2 text-p2 shadow-sm transition-colors placeholder:text-subtle placeholder:text-p2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-p2',
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Textarea.displayName = 'Textarea';

export { Textarea };
