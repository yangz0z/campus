export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly apiMessage: string,
  ) {
    super(`API ${status}: ${apiMessage}`);
    this.name = 'ApiError';
  }
}

/** catch 블록의 unknown에서 표시할 메시지를 추출 */
export function extractApiError(e: unknown, fallback = '요청에 실패했어요.'): string {
  if (e instanceof ApiError) return e.apiMessage;
  return fallback;
}
