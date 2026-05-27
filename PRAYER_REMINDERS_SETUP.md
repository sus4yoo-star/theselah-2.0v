# 기도 리마인더 설정 가이드 (Selah/Manna 공통)

푸시 알림 기능을 켜려면 4단계 한 번 설정해주시면 돼요. 한 번 끝나면 사용자가
앱에서 토글만 켜는 걸로 동작합니다.

---

## 1단계 · VAPID 키 생성

VAPID는 누가 푸시를 보냈는지 브라우저가 검증하는 데 쓰는 키 한 쌍이에요.

**가장 쉬운 방법** — 온라인 생성기 사용:

1. https://vapidkeys.com 접속
2. **Generate Keys** 클릭
3. `Public Key` 와 `Private Key` 두 값을 메모해 둡니다

또는 로컬에서:

```bash
npx web-push generate-vapid-keys
```

⚠️ **Private Key는 절대 깃허브에 올리지 마세요.** 환경변수로만 사용합니다.

---

## 2단계 · Supabase 테이블 추가

Supabase 대시보드 → SQL Editor → **New query** → 아래 파일 내용 통째로
붙여넣고 **Run**:

```
supabase/migrations/20260527_prayer_reminders.sql
```

확인:
- `Table Editor`에 `push_subscriptions` 와 `prayer_reminders` 두 테이블이
  보여야 합니다
- 둘 다 RLS(Row Level Security)가 켜져 있어야 합니다 (자물쇠 아이콘 ✓)

---

## 3단계 · Netlify 환경변수 설정

Netlify → 사이트 → **Site configuration → Environment variables**에
아래 5개 추가:

| 키 | 값 |
|---|---|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 1단계의 **Public Key** |
| `VAPID_PUBLIC_KEY` | 1단계의 **Public Key** (위와 동일) |
| `VAPID_PRIVATE_KEY` | 1단계의 **Private Key** |
| `VAPID_SUBJECT` | `mailto:hello@amov.kr` (또는 본인 이메일) |
| `CRON_SECRET` | 아무 긴 랜덤 문자열 (예: `openssl rand -hex 32`) |

`SUPABASE_SERVICE_ROLE_KEY` 도 이미 있어야 합니다 (cron이 RLS 우회해서
모든 사용자 row 읽을 때 필요). Supabase 대시보드 → Project Settings →
API → `service_role` `secret` 키 복사.

**저장 후 반드시 "Clear cache and deploy site"** 한 번 — 환경변수는
다음 빌드부터 들어갑니다.

---

## 4단계 · Cron 설정

매 1~5분마다 `/api/cron/send-reminders` 를 호출하도록 외부 스케줄러
한 곳에 등록합니다.

### 옵션 A — cron-job.org (무료, 가장 쉬움)

1. https://cron-job.org 가입
2. **Create cronjob**
3. URL: `https://selah.theamov.com/api/cron/send-reminders` (또는 만나
   도메인)
4. Schedule: **Every minute** (또는 Every 5 minutes — 정확도와 비용의
   균형)
5. **Advanced** → **Request settings** → Custom HTTP Headers 추가:
   - Name: `x-cron-secret`
   - Value: 3단계의 `CRON_SECRET` 값과 동일
6. **Save**

### 옵션 B — Vercel Cron (Vercel에서 deploy 중일 때만)

`vercel.json` 에 추가:

```json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders?secret=<CRON_SECRET 값>",
      "schedule": "* * * * *"
    }
  ]
}
```

### 옵션 C — GitHub Actions

`.github/workflows/cron-reminders.yml` (이 zip에 동봉되어 있습니다)에
secret 값 채우기. GitHub repo → Settings → Secrets and variables →
Actions → New repository secret `CRON_SECRET`.

---

## 동작 확인 체크리스트

1. 위 4단계 완료 후 배포
2. 핸드폰에서 SELAH/MANNA 열기 (Chrome 또는 PWA 설치본)
3. 사이드바 → **기도 리마인더** 진입
4. **리마인더 켜기** 탭
5. 브라우저 알림 권한 허용
6. **지금 한 번 보내보기** 클릭
7. 핸드폰에 SELAH 알림이 떠야 합니다 ✓

만약 안 보인다면:
- Netlify Functions 로그에서 `/api/push/test` 응답 확인
- 브라우저 콘솔에서 `pushSupported()` 확인
- VAPID Public Key가 정확히 입력되었는지 확인 (앞뒤 공백, 줄바꿈 X)

---

## iOS 사용자에 대한 안내

iOS는 **PWA로 설치한 경우에만** 푸시 알림이 동작합니다 (iOS 16.4+).
Safari로 그냥 열어서는 알림이 오지 않아요. 사용자에게 "홈 화면에 추가"를
안내해주세요. 안드로이드 Chrome, 데스크톱 Chrome/Firefox/Edge는 별도
설치 없이도 동작합니다.

---

## 안전·프라이버시

- 푸시 메시지 본문에는 사용자의 **대화 내용이 절대 포함되지 않습니다**.
  매일 같은 격려 한 줄 (혹은 사용자가 직접 작성한 문구)만 보냅니다.
- 사용자가 "리마인더 끄기"를 누르면 device subscription 도 즉시 unsub
  하고 DB row 도 제거됩니다.
- 죽은 subscription (404/410)은 cron이 자동으로 청소합니다.
- 시간대는 사용자의 IANA TZ (예: Asia/Seoul)로 정확히 보정됩니다.

---

## 비용

- VAPID, Web Push 자체: 무료 (브라우저 표준)
- cron-job.org: 무료 (Every minute까지)
- Vercel Cron: Pro plan이어야 매분 호출 가능. Hobby는 hourly까지
- Supabase: 푸시 row가 작아서 무시할 수준
