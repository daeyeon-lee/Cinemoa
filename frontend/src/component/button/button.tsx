interface ButtonProps {
  color: string;
  text: string;
  className?: string;
  size: string;
}

export default function Button({ color, text, className, size }: ButtonProps) {
  const sizeVariants = {
    lg: 'w-full h-12 text-base font-bold px-6',
    md: 'w-full h-10 text-sm font-semibold px-4',
    sm: 'w-full h-8 text-xs whitespace-nowrap px-4',
  };

  const colorVariants = {
    primary: 'bg-primary text-inverse font-semibold',
    secondary: 'bg-bg3 text-primary',
  };
  return (
    <button
      className={`cursor-pointer rounded-[100px]
            ${colorVariants[color as keyof typeof colorVariants]} 
            ${sizeVariants[size as keyof typeof sizeVariants]} ${className}`}
    >
      {text}
    </button>
  );
}
