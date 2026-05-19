# SELAH 2.1 Patch

이번 패치는 단순 채팅 저장이 아니라, 사용자별 “상담 메모리”를 프롬프트에 연결합니다.

## 바뀐 내용
- `src/lib/prompt.ts`
  - 깊이 있는 신앙상담 프롬프트 강화
  - 이전 대화 메모리 주입
  - 감정 분류 키워드 확장
- `src/lib/selah-memory.ts`
  - 사용자별 장기 메모리 로드/업데이트
  - OpenAI로 대화 후 메모리 요약 갱신
  - 테이블이 없어도 채팅이 깨지지 않도록 안전 처리
- `src/app/api/chat/route.ts`
  - Supabase 사용자 ID 기반 메모리 로드
  - 응답 완료 후 메모리 자동 최신화
- `src/components/chat/chat-app.tsx`
  - sessionId 전달
- `supabase/001_user_memories.sql`
  - Supabase SQL Editor에서 1회 실행할 메모리 테이블

## 반드시 해야 할 일
Supabase SQL Editor에서 아래 파일 내용을 실행하세요.

`supabase/001_user_memories.sql`

이 SQL을 실행하지 않아도 채팅은 작동하지만, 장기 메모리는 저장되지 않습니다.

## 권장 모델
속도 우선:
`OPENAI_MODEL=gpt-4o-mini`

깊이 우선:
`OPENAI_MODEL=gpt-4o`

현재 프롬프트는 gpt-4o-mini에서도 더 깊게 답하도록 조정되어 있습니다.
