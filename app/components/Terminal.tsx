'use client';

import { useState, useRef, useEffect } from 'react';

export default function Terminal() {
  const [input, setInput] = useState('');
  const [booting, setBooting] = useState(true);
  const [output, setOutput] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const bootLines = [
    '>> INITIALIZING NIGHT CITY INTERFACE...',
    '>> LINKING NEURAL PORT...',
    '>> CONNECTING TO GRID...',
    '>> AUTHENTICATION BYPASSED',
    '>> ACCESS GRANTED',
    '',
    'NIGHT CITY GRID ONLINE',
    'TYPE A COMMAND OR MESSAGE...',
  ];

  // Boot sequence: append each line one at a time
  useEffect(() => {
    let i = 0;

    const appendNextLine = () => {
      if (i < bootLines.length) {
        setOutput((prev) => [...prev, bootLines[i]]);
        i++;
        setTimeout(appendNextLine, 450);
      } else {
        setBooting(false);
        setTimeout(() => inputRef.current?.focus(), 300);
      }
    };

    appendNextLine();
  }, []);

  // Scroll to bottom whenever output changes
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [output, loading]);

  const runCommand = async () => {
    if (!input.trim()) return;

    const userCommand = input.trim().toLowerCase();
    setOutput((prev) => [...prev, `$ ${input}`]);
    setLoading(true);

    try {
      let endpoint = '';
      let query = '';

      if (userCommand.startsWith('scan ')) {
        const name = userCommand.replace('scan ', '');
        endpoint = `/scan`;
        query = `?name=${encodeURIComponent(name)}`;
      } else if (userCommand === 'augmentations') {
        endpoint = '/augmentations';
      } else if (userCommand === 'districts') {
        endpoint = '/districts/status';
      } else if (userCommand === 'news') {
        endpoint = '/news/latest';
      } else if (userCommand === 'sys') {
        endpoint = '/sys/info';
      } else if (userCommand === 'health') {
        endpoint = '/health';
      } else {
        throw new Error('unknown command');
      }

      const res = await fetch(`https://cyberpunk-terminal.onrender.com${endpoint}${query}`);
      const data = await res.json();

      setOutput((prev) => [...prev, JSON.stringify(data, null, 2)]);
    } catch {
      setOutput((prev) => [...prev, '⚠ UNKNOWN COMMAND OR NETWORK ERROR']);
    }

    setLoading(false);
    setInput('');
  };

  return (
    <div className="w-full max-w-3xl h-[80vh] bg-black border border-purple-500 shadow-[0_0_60px_#a855f7] p-4 font-mono text-green-400 flex flex-col rounded-lg relative overflow-hidden flicker">

      {/* Scanlines */}
      <div className="pointer-events-none absolute inset-0 z-20 scanlines
        bg-[repeating-linear-gradient(
          to_bottom,
          rgba(0,255,0,0.15) 0px,
          rgba(0,255,0,0.15) 1px,
          transparent 2px,
          transparent 4px
        )]
      " />

      {/* Output */}
      <div className="flex-1 overflow-y-auto space-y-2 relative z-10">
        {output.map((line, i) => (
          <div key={i} className="glitch block">
            {line}
          </div>
        ))}

        {loading && <div className="animate-pulse">processing...</div>}
        <div ref={terminalEndRef} />
      </div>

      {/* Input */}
      {!booting && (
        <div className="border-t border-purple-500 pt-2 flex gap-2 items-center relative z-10">
          <span>$</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runCommand()}
            className="flex-1 bg-transparent outline-none text-green-400 caret-green-400 placeholder-green-600"
            placeholder="type here..."
          />
          <span className="cursor">█</span>
        </div>
      )}
    </div>
  );
}
