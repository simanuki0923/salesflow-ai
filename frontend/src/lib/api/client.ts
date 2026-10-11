import type {
  ApiErrorResponse,
  ApiValidationErrors,
} from "@/lib/api/types";

/**
 * Laravel API URL。
 *
 * .env.localが存在しない場合でも
 * ローカル開発できるようDefault値を用意する。
 */
const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "http://127.0.0.1:8000/api/v1"
).replace(/\/$/, "");

/**
 * Laravel APIからエラーが返った場合に
 * 使用する独自Error Class。
 *
 * HTTP StatusやValidation Errorを
 * React Component側でも利用できる。
 */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly validationErrors:
      ApiValidationErrors = {},
  ) {
    super(message);

    this.name = "ApiError";
  }
}

/**
 * Laravel REST APIへRequestする共通関数。
 *
 * Customer / Projectごとにfetch処理を
 * 重複して書かないために共通化する。
 */
export async function apiRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers =
    new Headers(init.headers);

  /**
   * LaravelへJSON Responseを要求する。
   *
   * Validation失敗時にもHTMLではなく
   * JSON 422 Responseを返してもらうため重要。
   */
  headers.set(
    "Accept",
    "application/json",
  );

  /**
   * Bodyが存在するRequestだけ
   * Content-TypeをJSONにする。
   */
  if (
    init.body !== undefined &&
    !headers.has("Content-Type")
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  const response = await fetch(
    `${API_BASE_URL}${path}`,
    {
      ...init,
      headers,

      /**
       * CRMでは更新後すぐ最新DBデータを
       * 表示したいためCacheしない。
       */
      cache: "no-store",
    },
  );

  /**
   * DELETE成功時の204には
   * Response Bodyが存在しない。
   */
  if (response.status === 204) {
    return undefined as T;
  }

  /**
   * HTTP Errorの場合。
   */
  if (!response.ok) {
    let errorBody: ApiErrorResponse = {};

    try {
      errorBody =
        (await response.json()) as ApiErrorResponse;
    } catch {
      // JSONでないError Responseの場合は
      // Default Messageを使用する。
    }

    throw new ApiError(
      response.status,
      errorBody.message ??
        `API request failed: ${response.status}`,
      errorBody.errors ?? {},
    );
  }

  return (await response.json()) as T;
}