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

## Prettier 설치 및 설정 방법

1. 확장 설치

- 좌측 Extensions(⌘⇧X / Ctrl+Shift+X) → “Prettier - Code formatter” 설치

2. 사용자/워크스페이스 설정 열기

- Command Palette(⌘⇧P / Ctrl+Shift+P) → “Preferences: Open Settings (JSON)”

3. 아래 항목 추가 (권장 기본)

```
{
  // Prettier를 기본 포맷터로
  "editor.defaultFormatter": "esbenp.prettier-vscode",

  // 저장할 때 자동 포맷
  "editor.formatOnSave": true,

  // TypeScript, JSON 등에서도 강제
  "[javascript]": { "editor.formatOnSave": true },
  "[typescript]": { "editor.formatOnSave": true },
  "[json]":       { "editor.formatOnSave": true }
}
```

4. 프로젝트 전용 설정 파일(선택)

```
//.prettierrc
{
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "semi": true,
  "tabWidth: 2",
  "useTabs": false
}
```

루트에 .prettierrc 생성
→ 팀원이 동일 규칙을 쓰도록 Git 에 커밋
