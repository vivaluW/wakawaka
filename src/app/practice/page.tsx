'use client';

import { useEffect } from 'react';
import JapanesePractice from '@/components/JapanesePractice';
import { loadGrammarPoints } from '@/lib/grammarLoader';

export default function Practice() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">日语练习</h1>
        <JapanesePractice loadGrammarPoints={loadGrammarPoints} />
      </div>
    </main>
  );
}
