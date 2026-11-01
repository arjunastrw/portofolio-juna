import { useEffect, useRef, useState } from 'react';
import portfolio from '../data/portfolio';
import { Icon } from '../os/icons';

export type CopyState = 'idle' | 'copied' | 'failed';

const COPY_MESSAGE: Record<CopyState, string> = {
  idle: 'Ready',
  copied: 'Address copied to clipboard.',
  failed: 'Copy failed. Select the address instead.',
};

/** Contact as a "New Message" window. The status bar reports the copy result. */
export default function Contact({ onCopyState }: { onCopyState: (s: CopyState) => void }) {
  const { email, linkedin, github } = portfolio.contact;
  const reset = useRef<number>();

  useEffect(() => () => window.clearTimeout(reset.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      onCopyState('copied');
    } catch {
      onCopyState('failed');
    }
    window.clearTimeout(reset.current);
    reset.current = window.setTimeout(() => onCopyState('idle'), 2400);
  };

  return (
    <>
      <div className="mail-toolbar">
        <a href={`mailto:${email}`} className="os-btn mail-tool">
          <Icon name="mail" scale={2} />
          Send
        </a>
        <button type="button" className="os-btn mail-tool" onClick={copy}>
          <Icon name="notepad" scale={2} />
          Copy address
        </button>
      </div>

      <dl className="mail-headers">
        <div>
          <dt className="os-chrome">To:</dt>
          <dd className="os-field">
            <a href={`mailto:${email}`} className="mail-address">
              {email}
            </a>
          </dd>
        </div>
      </dl>

      <div className="os-field mail-body">
        <h3 className="win-h3">Email is the fastest way to reach me.</h3>
        <p>Elsewhere:</p>
        <ul className="mail-links">
          {[
            { label: 'LinkedIn', href: linkedin },
            { label: 'GitHub', href: github },
          ].map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noopener noreferrer">
                {l.label}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export function ContactStatus({ state }: { state: CopyState }) {
  return (
    <span role="status" aria-live="polite">
      {COPY_MESSAGE[state]}
    </span>
  );
}
