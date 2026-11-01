import { useEffect, useRef } from 'react';

/** "It's now safe to turn off your computer." Restart brings the desktop back. */
export function ShutdownScreen({ onRestart }: { onRestart: () => void }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    ref.current?.focus();
  }, []);

  return (
    <div className="os-shutdown" role="dialog" aria-modal="true" aria-labelledby="shutdown-title">
      <p id="shutdown-title" className="os-shutdown-text">
        It&rsquo;s now safe to turn off your computer.
      </p>
      <p className="os-shutdown-sub">Or don&rsquo;t. The portfolio is still here.</p>
      <button ref={ref} type="button" className="os-btn" onClick={onRestart}>
        Restart
      </button>
    </div>
  );
}
