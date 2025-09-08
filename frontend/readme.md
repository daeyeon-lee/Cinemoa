## 프론트엔드 예상 폴더구조
```
src/
├── app/
│   ├── layout.tsx        # 공통 레이아웃
│   ├── page.tsx          # 루트 경로 페이지
│   ├── auth/
│   │   └── page.tsx      # '/auth' 경로 페이지
│   ├── category/
│   │   ├── page.tsx      # '/category' 페이지
│   │   └── [id]/         # 동적 라우팅
│   │       └── page.tsx  # '/category/:id' 경로 
......
│   └── api/
│       └── route.ts      # API 엔드포인트
├── components/           # 재사용 가능한 컴포넌트
│   ├── Header.tsx
│   ├── Footer.tsx
│   └── Card.tsx
├── styles/               # 스타일 파일
│   ├── globals.css
│   └── layout.module.css
├── utils/                # 유틸리티 함수
│   ├── fetcher.ts
│   └── formatter.ts
├── lib/                  # 외부 라이브러리 설정
│   ├── mongodb.ts
│   └── firebase.ts
├── models/               # 데이터베이스 모델
│   ├── User.ts
│   └── Post.ts
├── public/               # 정적 파일
│   ├── images/
│   │   ├── logo.png
│   │   └── banner.jpg
│   └── favicon.ico
└── env/                  # 환경 변수 파일
```