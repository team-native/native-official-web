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

현재 지원서와 문의 폼은 입력값을 확인한 뒤 사용자의 메일 앱을 여는 방식입니다. 별도의 서버나 데이터베이스에 지원 정보를 저장하지 않습니다.

실제 운영용으로 전환할 때는 다음 기능을 추가할 수 있습니다.

- 이메일 또는 소셜 로그인
- 회원가입과 이메일 인증
- 지원서 및 문의 내용 서버 저장
- 관리자 지원서 조회 및 상태 관리
- 합격·불합격 이메일 발송
- 개인정보 보관 기간에 따른 자동 삭제

## 배포

`main` 브랜치의 소스를 Vercel 프로젝트와 연결해 배포할 수 있습니다. `.env` 파일과 API 키는 GitHub에 올리지 않고 Vercel의 Environment Variables에 등록합니다.

`.next`, `dist`, `.vercel`, `node_modules` 등의 로컬 생성 파일은 Git에서 제외됩니다.

## 라이선스

이 저장소의 코드와 브랜드 에셋은 Native 팀 내부 프로젝트를 위해 관리됩니다.
