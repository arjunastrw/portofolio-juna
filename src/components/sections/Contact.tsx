import { useEffect, useRef, useState } from 'react';
import portfolio from '../../data/portfolio';
import Section from './Section';

export default function Contact() {
  const { email, linkedin, github } = portfolio.contact;
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const resetTimer = useRef<number>();

  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopyState('copied');
    } catch {
      setCopyState('failed');
    }
    window.clearTimeout(resetTimer.current);
    resetTimer.current = window.setTimeout(() => setCopyState('idle'), 2400);
  };

  const links = [
    { label: 'LinkedIn', href: linkedin },
    { label: 'GitHub', href: github },
  ];

  return (
    <Section id="contact" index="04" title="Contact" lede="Email is the fastest way to reach me.">
      <div className="grid gap-10 @3xl:grid-cols-12 @3xl:gap-8">
        <div className="@3xl:col-span-9">
          <a
            href={`mailto:${email}`}
            className="link-underline break-all font-serif text-[2rem] leading-[1.1] @md:text-[3rem] @3xl:text-[4.25rem]"
          >
            {email}
          </a>
          <div className="mt-6 flex items-center gap-4">
            <button
              type="button"
              onClick={copy}
              className="min-h-11 border border-rule px-4 font-mono text-xs text-muted transition-colors duration-200 hover:border-ink hover:text-ink active:translate-y-px"
            >
              Copy address
            </button>
            <p role="status" aria-live="polite" className="eyebrow">
              {copyState === 'copied' ? 'Copied to clipboard.' : copyState === 'failed' ? 'Copy failed. Select the address above instead.' : ''}
            </p>
          </div>
        </div>

        <ul className="grid content-start gap-1 @3xl:col-span-3">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex min-h-11 items-center justify-between border-b border-rule font-mono text-sm text-muted transition-colors duration-200 hover:text-ink"
              >
                {link.label}
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
