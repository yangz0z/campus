'use client';

import { useCallback } from 'react';
import { useToast } from '@/components/ui/Toast';
import { extractApiError } from '@/lib/api-error';

type ActionResult<T> = { ok: true; data: T } | { ok: false };

export function useAction() {
  const { toast } = useToast();

  return useCallback(
    async <T>(action: () => Promise<T>, fallback = '요청에 실패했어요.'): Promise<ActionResult<T>> => {
      try {
        const data = await action();
        return { ok: true, data };
      } catch (e) {
        toast(extractApiError(e, fallback));
        return { ok: false };
      }
    },
    [toast],
  );
}
