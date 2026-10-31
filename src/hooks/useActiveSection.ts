import { useEffect, useState } from 'react';

/**
 * Returns the id of the section currently crossing the upper part of the viewport.
 * `key` re-attaches the observer when the section elements are re-mounted (layout switch).
 */
export function useActiveSection(ids: readonly string[], key?: string): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          setActive(visible[0].target.id);
        }
      },
      // A thin band near the top of the viewport decides which section is "current".
      { rootMargin: '-20% 0px -70% 0px' },
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [ids, key]);

  return active;
}
