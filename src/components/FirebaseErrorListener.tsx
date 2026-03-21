'use client';
/**
 * @fileOverview Composant écoutant les erreurs de permission pour les afficher dans l'overlay Next.js.
 */

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';

export function FirebaseErrorListener() {
  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // Lancer l'erreur pour qu'elle soit capturée par l'overlay de développement de Next.js
      throw error;
    };

    errorEmitter.on('permission-error', handlePermissionError);

    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, []);

  return null;
}
