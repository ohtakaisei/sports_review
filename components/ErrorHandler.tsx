'use client';

import { useEffect } from 'react';

/**
 * ブラウザ拡張機能やDevToolsによる無害なエラーをフィルタリング
 */
export default function ErrorHandler() {
  useEffect(() => {
    // 無視すべきエラーメッセージのパターン
    const ignoredErrors = [
      'message port closed',
      'extension context invalidated',
      'Receiving end does not exist',
    ];

    // 元のエラーハンドラーを保存
    const originalError = window.console.error;
    const originalWarn = window.console.warn;

    // エラーログをフィルタリング
    window.console.error = (...args: unknown[]) => {
      const message = String(args[0] || '');
      const shouldIgnore = ignoredErrors.some(pattern =>
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (!shouldIgnore) {
        originalError.apply(console, args);
      }
    };

    // 警告ログもフィルタリング
    window.console.warn = (...args: unknown[]) => {
      const message = String(args[0] || '');
      const shouldIgnore = ignoredErrors.some(pattern =>
        message.toLowerCase().includes(pattern.toLowerCase())
      );

      if (!shouldIgnore) {
        originalWarn.apply(console, args);
      }
    };

    // クリーンアップ関数
    return () => {
      window.console.error = originalError;
      window.console.warn = originalWarn;
    };
  }, []);

  // このコンポーネントは何もレンダリングしない
  return null;
}


