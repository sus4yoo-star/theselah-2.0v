# SELAH 2.0 GitHub + Netlify 배포 안내

## 1. GitHub에 올리기
1. GitHub에서 새 Repository를 만듭니다.
2. 이 압축파일을 풀고, 안의 프로젝트 파일 전체를 Repository에 업로드합니다.
3. `node_modules`, `.next`, `.env.local`은 올리지 마세요. `.gitignore`에 제외 처리되어 있습니다.

## 2. Netlify에서 GitHub 연결
1. Netlify > Add new site > Import an existing project
2. GitHub 선택
3. 방금 만든 Repository 선택
4. Build command: `npm run build`
5. Publish directory: `.next`

## 3. Netlify 환경변수
Netlify > Site configuration > Environment variables 에 아래 값을 추가하세요.

- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SECRETS_SCAN_ENABLED` = `false`

## 4. Supabase 설정
Supabase Authentication URL 설정에 Netlify 도메인을 추가하세요.

예:
- Site URL: `https://내사이트.netlify.app`
- Redirect URLs:
  - `https://내사이트.netlify.app/**`
  - `http://localhost:3000/**`

## 5. 이번 수정 내용
- Netlify 빌드 실패 원인이던 `src/app/not-found.tsx`를 안전한 404 페이지로 교체했습니다.
- GitHub 연결 배포용 `netlify.toml`을 정리했습니다.
- `.gitignore`, `.env.example`, 배포 안내 파일을 추가했습니다.
- `@netlify/plugin-nextjs`가 없으면 자동으로 devDependency에 포함되도록 정리했습니다.
