'use client';

import Terminal from './components/Terminal';
import Scanlines from './components/Scanlines';

export default function Home() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center relative">
      <Scanlines />
      <Terminal />
    </main>
  );
}
