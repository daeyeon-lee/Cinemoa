import { Suspense } from 'react';
import Search from './Search';

export default function Page() {
  return (
    <Suspense fallback={null /* or 로딩 UI */}>
      <Search />
    </Suspense>
  );
}
