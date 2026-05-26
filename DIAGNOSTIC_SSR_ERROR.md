# 셀라 SSR 에러 진단 가이드

`Application error: a server-side exception has occurred while loading
amov-selah2.netlify.app (see the server logs for more information).
Digest: 3400804897`

이 화면이 뜨는 이유는 Next.js Server Component 또는 middleware에서
처리되지 않은 예외가 발생했기 때문이에요. 셀라 코드와 만나 코드는 거의
동일한데 만나는 잘 작동하므로, **코드 자체의 문제가 아니라 셀라 사이트의
배포 환경 차이**일 가능성이 가장 큽니다.

## 이 zip에 들어간 즉시 처방

1. **`src/app/error.tsx` 추가** — 다음에 같은 일이 일어나면 흰 화면 대신
   "잠시 문제가 생겼어요" 화면이 보이고 "다시 시도" 버튼이 나옵니다.
   브라우저 콘솔에 진짜 에러 메시지가 찍혀서 디버깅 가능.

2. **`layout.tsx`의 cookies() 호출을 try/catch로 감쌌어요** — 쿠키 store
   접근에서 throw가 발생해도 한국어 fallback으로 페이지가 뜹니다.

## 그래도 같은 에러가 보이면 — 단계별 확인

### A. Netlify Function Logs 확인 (가장 중요)

1. https://app.netlify.com → 셀라 사이트 (`amov-selah2`)
2. 좌측 `Logs` → `Functions` 탭
3. 가장 최근 SSR 호출의 stack trace 확인
4. 가장 흔한 원인:
   - `Cannot read properties of undefined (reading 'xxx')` → 환경변수 누락
   - `Invalid URL` → `metadataBase`의 URL이 잘못됨
   - `NEXT_NOT_FOUND` → 라우팅 문제

### B. 환경변수 확인

`Site configuration` → `Environment variables`에 모두 있어야 합니다:

```
NEXT_PUBLIC_SUPABASE_URL          ← 셀라용 Supabase 프로젝트 URL
NEXT_PUBLIC_SUPABASE_ANON_KEY     ← 셀라용 Supabase anon key
SUPABASE_SERVICE_ROLE_KEY         ← 셀라용 (memory upsert에 필요)
ANTHROPIC_API_KEY                 ← Anthropic API 키
ANTHROPIC_MODEL                   ← (옵션) 비우면 claude-sonnet-4-6
```

**중요**: 셀라와 만나가 같은 Supabase 프로젝트를 공유하면 안 됩니다.
각자 자신의 프로젝트 URL과 키를 사용해야 합니다.

만나가 잘 되고 셀라가 안 되는 가장 흔한 원인은 **셀라 사이트에 위 변수
중 하나가 누락**이에요.

### C. 빌드 캐시 클리어

1. Netlify → `Deploys` 탭
2. `Trigger deploy` → **`Clear cache and deploy site`**

오래된 `node_modules`나 `.next` 캐시가 새 코드와 불일치를 일으키는 경우
이 한 번으로 해결됩니다.

### D. v2 zip이 실제로 배포됐는지 확인

새 파일들이 빌드 결과에 들어갔는지 확인:

1. 가장 최근 deploy 클릭
2. `Source` 보기 (Netlify가 받은 파일들)
3. 다음 파일들이 모두 있어야 합니다:
   - `src/lib/anthropic.ts`
   - `src/lib/feature-strings.ts`
   - `src/lib/crisis-detect.ts`
   - `src/components/font-size-provider.tsx`
   - `src/components/chat/font-size-control.tsx`
   - `src/components/chat/crisis-card.tsx`
   - `src/components/amov-footer.tsx`
   - `src/app/error.tsx`

한두 개라도 빠져 있으면 GitHub push가 누락된 거예요.

### E. 가장 흔히 놓치는 한 가지

`amov-selah2.netlify.app`이 셀라의 **현재 production 도메인이 아니라**
**과거 staging URL**이라면, Netlify가 새 도메인 (예: `selah.amov.kr`)으로
이미 옮겨갔는데 이 staging URL은 더 이상 deploy 받지 않는 상태일 수
있습니다. 그 경우 staging 사이트가 옛날 코드로 떠 있어서 새 패치가
아예 안 들어간 상태일 수 있어요. → **현재 사용하는 production 도메인
URL에서 다시 시도해 보세요.**

## 빠른 점검 한 줄

```bash
# 셀라 사이트 ID로 environment variables가 다 있는지 한눈에 확인
netlify env:list --site-id <셀라_site_id>
```
