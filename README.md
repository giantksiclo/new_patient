# 치과 초진환자 문진표 시스템

이 프로젝트는 치과 초진환자를 위한 디지털 문진표 시스템입니다. 환자가 QR 코드를 스캔하여 문진표를 작성하면, 데이터가 자동으로 Google 스프레드시트에 저장됩니다.

## 주요 기능

- **환자용 문진표**: 큰 글씨와 직관적인 UI로 60대 이상 환자도 쉽게 사용 가능
- **QR 코드 생성**: 환자가 스캔할 수 있는 QR 코드 생성 및 인쇄
- **관리자 대시보드**: 제출된 문진표 데이터 확인 및 관리
- **Google 스프레드시트 연동**: 환자 데이터 자동 저장 (실제 구현 시 Google Sheets API 연동 필요)

## 기술 스택

- React
- TypeScript
- Tailwind CSS
- Vite
- React QR Code
- React Toastify

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 실제 구현 시 필요한 추가 작업

1. **Google Sheets API 연동**:
   - Google Cloud Console에서 프로젝트 생성
   - Google Sheets API 활성화
   - 서비스 계정 생성 및 키 발급
   - 백엔드 서비스 구현 (Node.js, Express 등)

2. **환경 변수 설정**:
   ```
   VITE_GOOGLE_SHEETS_ID=your_spreadsheet_id
   VITE_GOOGLE_API_KEY=your_api_key
   ```

3. **보안 강화**:
   - HTTPS 적용
   - 데이터 암호화
   - 접근 제어 구현

## 사용 방법

1. 관리자 화면에서 QR 코드 생성 버튼 클릭
2. 생성된 QR 코드를 인쇄하여 접수 데스크에 비치
3. 환자가 QR 코드를 스캔하여 문진표 작성
4. 제출된 데이터는 자동으로 Google 스프레드시트에 저장
5. 관리자 화면에서 제출된 데이터 확인 가능

## 라이센스

MIT