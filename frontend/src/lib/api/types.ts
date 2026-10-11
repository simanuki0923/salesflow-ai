/**
 * Laravel API Resourceの単一データResponse。
 *
 * 例：
 *
 * {
 *   "data": {
 *     "id": 1,
 *     ...
 *   }
 * }
 */
export type ApiResourceResponse<T> = {
  data: T;
};

/**
 * Laravel Pagination Response。
 */
export type ApiCollectionResponse<T> = {
  data: T[];

  links: {
    first?: string | null;
    last?: string | null;
    prev?: string | null;
    next?: string | null;
  };

  meta: {
    current_page?: number;
    from?: number | null;
    last_page?: number;
    path?: string;
    per_page?: number;
    to?: number | null;
    total?: number;
  };
};

/**
 * Laravel Validation Error。
 *
 * 422 Responseの、
 *
 * {
 *   "message": "...",
 *   "errors": {
 *     "name": ["顧客名は必須です。"]
 *   }
 * }
 *
 * をTypeScriptで表現する。
 */
export type ApiValidationErrors =
  Record<string, string[]>;

/**
 * Laravel Error Response。
 */
export type ApiErrorResponse = {
  message?: string;
  errors?: ApiValidationErrors;
};