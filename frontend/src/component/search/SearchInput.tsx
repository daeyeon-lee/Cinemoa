import SearchIcon from '@/component/icon/searchIcon';

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export default function SearchInput({ placeholder, className }: SearchInputProps) {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        className="flex-1 h-8 bg-BG-1 text-white placeholder-tertiary placeholder-[12px]
            rounded-l-[8px] rounded-r-0
            focus:outline-none
            px-3 py-2"
      />
      {/* 검색 아이콘 */}
      <div className="bg-BG-1 h-8 flex items-center justify-center rounded-r-[8px] pr-3">
        <span className="cursor-pointer text-subtle">
          <SearchIcon stroke="#94A3B8" />
        </span>
      </div>
    </div>
  );
}
