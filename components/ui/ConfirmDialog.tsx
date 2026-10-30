'use client';
import { useCallback, useRef, useState } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  /** false renders the confirm button teal instead of red — for a
   * non-destructive confirmation that still deserves a pause. */
  danger?: boolean;
}

/**
 * A small promise-based replacement for window.confirm() — same call
 * shape (`if (await confirmDialog('Delete X?')) ...`), but a real styled
 * dialog instead of the browser's native one. Render the returned `dialog`
 * once near the top of the component that calls confirmDialog.
 */
export function useConfirmDialog() {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<(v: boolean) => void>();

  const confirmDialog = useCallback((opts: ConfirmOptions | string) => {
    setOptions(typeof opts === 'string' ? { message: opts } : opts);
    return new Promise<boolean>(resolve => { resolveRef.current = resolve; });
  }, []);

  const close = (result: boolean) => {
    resolveRef.current?.(result);
    setOptions(null);
  };

  const dialog = options ? (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4" onClick={() => close(false)}>
      <div onClick={e => e.stopPropagation()}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-2xl max-w-sm w-full p-6">
        <p className="font-bold text-gray-900 dark:text-white text-base mb-1.5">{options.title ?? 'Are you sure?'}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5">{options.message}</p>
        <div className="flex gap-2.5 justify-end">
          <button onClick={() => close(false)}
            className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            Cancel
          </button>
          <button onClick={() => close(true)}
            className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-colors ${options.danger === false ? 'bg-teal-600 hover:bg-teal-700' : 'bg-red-600 hover:bg-red-700'}`}>
            {options.confirmLabel ?? 'Delete'}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return { confirmDialog, dialog };
}
