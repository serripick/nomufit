---
name: deploy
description: Redeploy 노무핏(NomuFit) to its Vercel production URL (https://nomufit.vercel.app) after code changes. Use whenever the user asks to deploy, redeploy, push to Vercel, or "배포해줘"/"버셀에 올려줘" for this project.
---

# 노무핏 Vercel 재배포

이 프로젝트는 이미 Vercel에 연결되어 있습니다 (`risingjaya7-4309/nomufit`, https://nomufit.vercel.app). 계정 로그인과 프로젝트 링크, 환경변수 설정은 최초 1회만 필요하며 이미 완료되어 있습니다.

## 절차

1. 프로젝트 루트에서 배포 명령을 실행합니다.

   ```bash
   npx.cmd vercel deploy --prod --yes
   ```

   - Windows PowerShell의 실행 정책 때문에 `npx`(스크립트)가 `UnauthorizedAccess` 오류로 막힐 수 있습니다. 이때는 반드시 `npx.cmd`를 사용합니다 (`.cmd` 래퍼는 PowerShell 스크립트 실행 정책의 영향을 받지 않습니다).
   - 빌드에 1~2분 정도 걸립니다. 출력 마지막의 `"status": "ok"`와 `readyState: "READY"`를 확인하면 배포 성공입니다.

2. 배포 후 실제 브라우저로 https://nomufit.vercel.app (와 필요하면 `/apply`, `/payslip`, `/subsidies`, `/forms`)에 접속해 콘솔 에러가 없는지, 페이지가 정상 렌더링되는지 확인합니다.

3. 배포가 실패하면 로그에서 실패한 단계(설치/빌드/타입체크)를 확인합니다. 로컬에서 `npm run build`가 먼저 통과하는지 확인 후 재시도합니다.

## 환경변수 (이미 설정됨, 재설정 시에만 참고)

Production / Preview / Development 세 환경 모두에 아래 두 값이 등록되어 있습니다 (`.env.local`과 동일한 값):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

값을 추가/변경해야 하면:

```bash
echo "<값>" | npx.cmd vercel env add <이름> production
```

(preview, development에도 각각 따로 실행해야 합니다. 한 줄에 여러 환경을 동시에 지정하는 문법은 지원되지 않습니다.)

## 알아둘 점 (사용자에게 필요시 안내)

- **Vercel Hobby(무료) 요금제는 비상업적 개인 용도로 제한**됩니다. 로그인·결제를 붙여 실제 유료 서비스로 전환하는 시점엔 Pro 요금제 업그레이드가 필요합니다.
- **Supabase 무료 프로젝트는 7일간 미접속 시 자동 일시정지**됩니다 — 이 경우 배포 자체는 멀쩡해도 DB를 쓰는 기능(사업장 조회 등)이 에러가 납니다. Supabase 대시보드에서 수동 "Restore"가 필요합니다.
- 이 스킬은 이미 링크된 프로젝트를 **재배포**하는 용도입니다. 새 Vercel 프로젝트를 처음부터 만들어야 하는 상황(계정 변경, 프로젝트 삭제 후 재생성 등)이라면 `npx.cmd vercel link --yes --project nomufit`부터 다시 실행해야 합니다.
