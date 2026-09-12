/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Router berbasis hash yang ringan, tanpa dependensi baru (tidak menambah react-router),
 * agar setiap modul memiliki URL yang stabil dan bisa di-screenshot sebagai bukti
 * teknis (lihat Plan 1, Lampiran E - Bukti Teknis Tangkapan Layar Aplikasi).
 *
 * Format: #/<moduleId>[/<subPath>]
 * Contoh: #/b1/polda-riau  ->  moduleId = 'b1', subPath = 'polda-riau'
 */

import { useCallback, useEffect, useState } from 'react';

export interface HashRoute {
  moduleId: string;
  subPath: string | undefined;
}

function parseHash(rawHash: string, fallbackModuleId: string): HashRoute {
  const cleaned = rawHash.replace(/^#\/?/, '').trim();
  if (!cleaned) return { moduleId: fallbackModuleId, subPath: undefined };
  const [moduleId, ...rest] = cleaned.split('/');
  return {
    moduleId: moduleId || fallbackModuleId,
    subPath: rest.length > 0 ? rest.join('/') : undefined,
  };
}

function buildHash(moduleId: string, subPath?: string): string {
  return subPath ? `#/${moduleId}/${subPath}` : `#/${moduleId}`;
}

/**
 * Hook hash-routing. `defaultModuleId` dipakai saat hash kosong (mis. saat pertama kali dibuka).
 */
export function useHashRoute(defaultModuleId: string): [HashRoute, (moduleId: string, subPath?: string) => void] {
  const [route, setRoute] = useState<HashRoute>(() =>
    typeof window !== 'undefined'
      ? parseHash(window.location.hash, defaultModuleId)
      : { moduleId: defaultModuleId, subPath: undefined }
  );

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash(window.location.hash, defaultModuleId));
    window.addEventListener('hashchange', onHashChange);
    // Sinkronkan hash awal bila kosong, tanpa memicu entri histori baru.
    if (!window.location.hash) {
      window.history.replaceState(null, '', buildHash(defaultModuleId));
    }
    return () => window.removeEventListener('hashchange', onHashChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigate = useCallback((moduleId: string, subPath?: string) => {
    const nextHash = buildHash(moduleId, subPath);
    if (window.location.hash !== nextHash) {
      window.location.hash = nextHash;
    }
    // window.location.hash assignment sudah memicu 'hashchange', tapi set state langsung
    // juga supaya transisi terasa instan tanpa menunggu event loop.
    setRoute({ moduleId, subPath });
  }, []);

  return [route, navigate];
}
