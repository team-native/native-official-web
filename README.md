# Native Official Web

Native 개발팀의 공식 홈페이지입니다. 팀 소개, 주요 프로젝트, 개발 문화와 혜택, NativeLab, 지원 공고를 한곳에서 안내합니다.

- 홈페이지: https://native-web-eight.vercel.app
- GitHub: https://github.com/team-native/native-official-web

## 주요 기능

- Native 팀과 두 가지 핵심 브랜딩 소개
- BOOK-ON, HOPES, IT-DA 프로젝트 소개
- 개발 문화와 팀 혜택 안내
- iOS, Android, Front-End, Design, Back-End 지원 공고
- 포지션별 지원서 작성 화면
- 지원 및 NativeLab 프로젝트 문의 화면
- 데스크톱과 모바일 반응형 레이아웃
- NativeLab 별도 소개 페이지

## 페이지

| 경로 | 설명 |
| --- | --- |
| `/` | 팀 소개, 프로젝트, 개발 문화, 혜택, 지원 공고 |
| `/apply?role=iOS` | 선택한 포지션의 지원서 작성 |
| `/contact` | 지원 관련 문의 |
| `/contact?topic=프로젝트` | NativeLab 프로젝트 문의 |
| `/nativelab` | NativeLab 소개 |
| `/projects/[slug]` | 프로젝트 상세 소개 |
| `/admin/login` | 관리자 로그인 |
| `/admin` | 프로젝트·공고·지원서·문의 관리 |

## 기술 구성

- TypeScript
- React 19
- Next.js 16 호환 App Router
- vinext / Vite
- CSS 기반 반응형 디자인
- Vercel 배포

## 로컬 실행

Node.js 22.13 이상이 필요합니다.

```bash
git clone https://github.com/team-native/native-official-web.git
cd native-official-web
npm install
npm run dev
```

개발 서버가 출력한 로컬 주소로 접속하면 됩니다.

## 명령어

```bash
npm run dev       # 개발 서버 실행
npm run build     # 배포용 빌드 확인
npm run start     # 프로덕션 서버 실행
npm run lint      # 코드 검사
```

## 프로젝트 구조

```text
app/
├── page.tsx              # 메인 홈페이지
├── apply/page.tsx        # 지원서
├── contact/page.tsx      # 지원 및 프로젝트 문의
├── nativelab/page.tsx    # NativeLab 소개
├── layout.tsx            # 메타데이터와 공통 레이아웃
└── globals.css           # 전체 스타일과 반응형 규칙

public/
├── brand/                # 프로젝트 및 팀 심볼
└── *.png                 # 제품 화면과 홈페이지 이미지
```

## 지원서와 문의 전송

Supabase가 연결되면 지원서와 문의는 서버를 통해 데이터베이스에 저장되고 관리자 페이지에서 확인할 수 있습니다. 연결 전에는 기존 메일 앱 방식으로 동작합니다.

관리 페이지에서 다음 기능을 사용할 수 있습니다.

- 관리자 이메일·비밀번호 로그인
- 프로젝트 공개 여부와 상세 설명 관리
- 지원 공고 작성·수정·마감
- 지원서 검토 상태 관리
- 지원 및 NativeLab 문의 관리

## 관리자 서버 설정

1. Supabase 프로젝트를 생성합니다.
2. `supabase/migrations/202607210001_native_admin_cms.sql`을 SQL Editor에서 실행합니다.
3. Supabase Authentication에서 관리자 사용자를 생성합니다.
4. 마이그레이션 파일 마지막에 안내된 쿼리로 사용자를 `admin_users`에 등록합니다.
5. `.env.example`을 참고해 로컬과 Vercel에 아래 값을 등록합니다.

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

`SUPABASE_SERVICE_ROLE_KEY`는 서버에서만 사용하며 브라우저나 GitHub에 노출하면 안 됩니다.

## 배포

`main` 브랜치의 소스를 Vercel 프로젝트와 연결해 배포할 수 있습니다. `.env` 파일과 API 키는 GitHub에 올리지 않고 Vercel의 Environment Variables에 등록합니다.

`.next`, `dist`, `.vercel`, `node_modules` 등의 로컬 생성 파일은 Git에서 제외됩니다.

## 라이선스

이 저장소의 코드와 브랜드 에셋은 Native 팀 내부 프로젝트를 위해 관리됩니다.
