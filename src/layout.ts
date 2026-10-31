import { createContext, useContext } from 'react';

export type Layout = 'stage' | 'stack';

/** Which layout the sections render in: a narrow column over the 3D stage, or full-width stacked. */
export const LayoutContext = createContext<Layout>('stack');

export function useLayout(): Layout {
  return useContext(LayoutContext);
}
