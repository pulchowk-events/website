'use client';
import { useState } from 'react';
import Btn from './Btn';

const COMMANDS = [
  'git clone pulchowk-events/aggregator',
  'node scripts/setup/index.js --demo',
  'node scripts/verify-source.js khalti',
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch { /* ignore */ }
        ta.remove();
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch { /* ignore */ }
  };
  return (
    <Btn glass onClick={onCopy} className="" >{copied ? 'Copied' : 'Copy'}</Btn>
  );
}

export default function OpenSource() {
  return (
    <section className="sec" data-fx="sq" id="oss">
      <div className="w sp2">
        <div>
          <h2>MIT. Fork it.</h2>
          <p className="s">Two repos. Deploy either alone.</p>
          <div style={{ display: 'flex', gap: 12, marginTop: 32, flexWrap: 'wrap' }}>
            <Btn href="https://github.com/pulchowk-events/website" target="_blank" rel="noopener">website</Btn>
            <Btn glass href="https://github.com/pulchowk-events/aggregator" target="_blank" rel="noopener">aggregator</Btn>
          </div>
        </div>
        <div className="term">
          {COMMANDS.map((cmd) => (
            <div key={cmd} className="cl">
              <span>{cmd}</span>
              <CopyButton text={cmd} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
