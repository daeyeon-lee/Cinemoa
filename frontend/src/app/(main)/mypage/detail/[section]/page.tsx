import MyPageDetail from '../MyPageDetail';

interface PageProps {
  params: {
    section: string;
  };
}

export default async function Page({ params }: PageProps) {
  const { section } = await params;

  // 유효한 섹션인지 확인
  const validSections = ['proposals', 'participated', 'liked'];
  if (!validSections.includes(section)) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">페이지를 찾을 수 없습니다</h1>
          <p className="text-slate-400">요청하신 페이지가 존재하지 않습니다.</p>
        </div>
      </div>
    );
  }

  return <MyPageDetail section={section as 'proposals' | 'participated' | 'liked'} />;
}
