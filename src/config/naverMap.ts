/**
 * 네이버 지도 NCP Client ID.
 *
 * - 로컬/토스 번들 제출: git에 올리지 않는 시크릿 파일에서 읽습니다.
 *   src/config/naverMap.clientId.secret.ts 파일을 만들고 아래처럼 export 하세요.
 *
 *   export const NAVER_MAP_CLIENT_ID = '여기에_NCP_클라이언트_ID';
 *
 *   naverMap.clientId.secret.example.ts 를 복사해 naverMap.clientId.secret.ts 로
 *   만든 뒤 값을 채우면 됩니다. .secret.ts 는 .gitignore 되어 있습니다.
 *
 * - 토스 제출용 빌드(CI 등): 환경변수 NAVER_MAP_CLIENT_ID 로 넣거나,
 *   빌드 전에 위 시크릿 파일을 생성해 두면 됩니다.
 */
function getNaverMapClientId(): string {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const secret = require('./naverMap.clientId.secret');
    return typeof secret?.NAVER_MAP_CLIENT_ID === 'string'
      ? secret.NAVER_MAP_CLIENT_ID
      : getPlaceholder();
  } catch {
    return getPlaceholder();
  }
}

function getPlaceholder(): string {
  if (
    typeof process !== 'undefined' &&
    process.env &&
    typeof process.env.NAVER_MAP_CLIENT_ID === 'string'
  ) {
    return process.env.NAVER_MAP_CLIENT_ID;
  }
  return 'YOUR_NAVER_MAP_CLIENT_ID';
}

export { getNaverMapClientId };
