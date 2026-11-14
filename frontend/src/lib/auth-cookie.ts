/**
 * Laravel Sanctum Personal Access Tokenを
 * Next.js側で保持するHttpOnly Cookie名。
 *
 * Browser JavaScriptからTokenを直接参照せず、
 * Next.js Serverだけが読み取る。
 */
export const AUTH_TOKEN_COOKIE_NAME =
  "salesflow_access_token";
