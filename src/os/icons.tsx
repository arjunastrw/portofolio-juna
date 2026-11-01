import { Sprite, type Palette } from './sprite';

/**
 * 16×16 pixel icons in the classic 16-colour system palette. Adapted from the Retro OS
 * design in the Sovietwave library; globe, database, program and shortcut are new.
 */
export const WIN: Palette = {
  K: '#000000',
  W: '#FFFFFF',
  G: '#C0C0C0',
  L: '#DFDFDF',
  D: '#808080',
  N: '#000080',
  B: '#0000FF',
  T: '#008080',
  C: '#00FFFF',
  Y: '#FFFF00',
  O: '#808000',
  R: '#FF0000',
  M: '#800000',
  E: '#008000',
  V: '#00FF00',
};

const PAD = '................';

export const ICONS = {
  computer: [
    PAD,
    '.KKKKKKKKKKKKK..',
    '.KGGGGGGGGGGGKD.',
    '.KGKKKKKKKKKGKD.',
    '.KGKTTTTTTTKGKD.',
    '.KGKTCTTTTTKGKD.',
    '.KGKTTTTTTTKGKD.',
    '.KGKTTTTTTTKGKD.',
    '.KGWWWWWWWWWGKD.',
    '.KGGGGGGGGEGGKD.',
    '.KKKKKKKKKKKKKD.',
    '...DDKGGGKDDD...',
    '..KKKKKKKKKKKK..',
    '..KGGGGGGGGGGKD.',
    '..KWWWWWWWWWWKD.',
    '..KKKKKKKKKKKKD.',
  ],
  notepad: [
    '..KKKKKKKKK.....',
    '..KWWWWWWWKK....',
    '..KWWWWWWWKWK...',
    '..KWNNNNWWKKKK..',
    '..KWWWWWWWWWWK..',
    '..KWNNNNNNNWWK..',
    '..KWWWWWWWWWWK..',
    '..KWNNNNNNWWWK..',
    '..KWWWWWWWWWWK..',
    '..KWNNNNNNNWWK..',
    '..KWWWWWWWWWWK..',
    '..KWNNNNNWWWWK..',
    '..KWWWWWWWWWWK..',
    '..KWWWWWWWWWWK..',
    '..KKKKKKKKKKKK..',
    PAD,
  ],
  folder: [
    PAD,
    PAD,
    '..KKKKK.........',
    '.KYWYYYK........',
    'KYYYYYYYKKKKKKK.',
    'KWYYYYYYYYYYYYOK',
    'KYYYYYYYYYYYYYOK',
    'KYYYYYYYYYYYYYOK',
    'KYYYYYYYYYYYYYOK',
    'KYYYYYYYYYYYYYOK',
    'KYYYYYYYYYYYYYOK',
    'KYYYYYYYYYYYYYOK',
    'KOOOOOOOOOOOOOOK',
    'KKKKKKKKKKKKKKKK',
    PAD,
    PAD,
  ],
  properties: [
    PAD,
    '.KKKKKKKKKKKKKK.',
    '.KNNNNNNNNNNNNK.',
    '.KNWNNNNNNNGKNK.',
    '.KKKKKKKKKKKKKK.',
    '.KGGGGGGGGGGGGK.',
    '.KGKKKGGGGGGGGK.',
    '.KGKWKGKKKKKKGK.',
    '.KGKKKGGGGGGGGK.',
    '.KGGGGGGGGGGGGK.',
    '.KGKKKGGGGGGGGK.',
    '.KGKWKGKKKKKGGK.',
    '.KGKKKGGGGGGGGK.',
    '.KGGGGGGGGGGGGK.',
    '.KKKKKKKKKKKKKK.',
    PAD,
  ],
  mail: [
    PAD,
    PAD,
    PAD,
    'KKKKKKKKKKKKKKKK',
    'KWKWWWWWWWWWWKWK',
    'KWWKWWWWWWWWKWWK',
    'KWWWKWWWWWWKWWWK',
    'KWWWWKWWWWKWWWWK',
    'KWWWWWKKKKWWWWWK',
    'KWWWWWWWWWWWWWWK',
    'KWWWWWWWWWWWWWDK',
    'KWWWWWWWWWWWWDDK',
    'KKKKKKKKKKKKKKKK',
    PAD,
    PAD,
    PAD,
  ],
  globe: [
    '.....KKKKKK.....',
    '...KKBBEEBBKK...',
    '..KBBBEEEBBBBK..',
    '.KBBEEEEBBBEEBK.',
    '.KBEEEEEBBBEEEK.',
    'KBBEEEEBBBBBEEBK',
    'KBBBEEBBBBBBEBBK',
    'KBBBBEBBBBBBBBBK',
    'KBBBBBEEBBBBBBBK',
    'KBBBBEEEEEBBBBBK',
    '.KBBBEEEEEBBBBK.',
    '.KBBBBEEEBBBBBK.',
    '..KBBBBEEBBBBK..',
    '...KKBBBBBBKK...',
    '.....KKKKKK.....',
    PAD,
  ],
  database: [
    PAD,
    '...KKKKKKKKKK...',
    '..KWWWWWWWWWWK..',
    '..KGWWWWWWWWDK..',
    '..KKGGGGGGGDKK..',
    '..KGKKKKKKKKDK..',
    '..KGGGGGGGGGDK..',
    '..KGGGGGGGGGDK..',
    '..KKGGGGGGGDKK..',
    '..KGKKKKKKKKDK..',
    '..KGGGGGGGGGDK..',
    '..KGGGGGGGGGDK..',
    '..KKGGGGGGGDKK..',
    '...KKKKKKKKKK...',
    PAD,
    PAD,
  ],
  program: [
    PAD,
    '.KKKKKKKKKKKKKK.',
    '.KNNNNNNNNNNNNK.',
    '.KNNNNNNNNNNNNK.',
    '.KKKKKKKKKKKKKK.',
    '.KWWWWWWWWWWWWK.',
    '.KWWWWWWWWWWWWK.',
    '.KWDDDDDWWWWWWK.',
    '.KWWWWWWWWWWWWK.',
    '.KWDDDDDDDDWWWK.',
    '.KWWWWWWWWWWWWK.',
    '.KWDDDDWWWWWWWK.',
    '.KWWWWWWWWWWWWK.',
    '.KWWWWWWWWWWWWK.',
    '.KKKKKKKKKKKKKK.',
    PAD,
  ],
  info: [
    '.....KKKKKK.....',
    '...KKBBBBBBKK...',
    '..KBBBBWWBBBBK..',
    '.KBBBBBWWBBBBBK.',
    '.KBBBBBBBBBBBBK.',
    'KBBBBBWWWBBBBBBK',
    'KBBBBBBWWBBBBBBK',
    'KBBBBBBWWBBBBBBK',
    'KBBBBBBWWBBBBBBK',
    'KBBBBBBWWBBBBBBK',
    '.KBBBBBWWBBBBBK.',
    '.KBBBBWWWWBBBBK.',
    '..KBBBBBBBBBBK..',
    '...KKBBBBBBKK...',
    '.....KKKKKK.....',
    PAD,
  ],
} as const;

export type IconName = keyof typeof ICONS;

/** Small white box with an arrow, laid over an icon to mark a shortcut. */
const SHORTCUT = ['KKKKKKKK', 'KWWWWWWK', 'KWWKKKWK', 'KWWWKKWK', 'KWWKWKWK', 'KWKWWWWK', 'KWWWWWWK', 'KKKKKKKK'];

export function Icon({
  name,
  scale = 2,
  className,
  label,
  shortcut = false,
}: {
  name: IconName;
  scale?: number;
  className?: string;
  label?: string;
  shortcut?: boolean;
}) {
  const icon = <Sprite rows={ICONS[name]} palette={WIN} scale={scale} className={className} label={label} />;
  if (!shortcut) return icon;
  return (
    <span className="os-icon-shortcut">
      {icon}
      <Sprite rows={SHORTCUT} palette={WIN} scale={scale} className="os-icon-shortcut-arrow" />
    </span>
  );
}

/** Title-bar control glyphs. */
export function CtrlGlyph({ kind }: { kind: 'min' | 'max' | 'restore' | 'close' }) {
  const rows: Record<typeof kind, string[]> = {
    min: ['........', '........', '........', '........', '........', '........', 'KKKKKK..', 'KKKKKK..'],
    max: ['KKKKKKKKK', 'KKKKKKKKK', 'K.......K', 'K.......K', 'K.......K', 'K.......K', 'K.......K', 'KKKKKKKKK'],
    restore: ['..KKKKKK', '..KKKKKK', '..K....K', 'KKKKKK.K', 'KKKKKK.K', 'K....KKK', 'K....K..', 'KKKKKK..'],
    close: ['KK....KK', '.KK..KK.', '..KKKK..', '...KK...', '..KKKK..', '.KK..KK.', 'KK....KK'],
  };
  return <Sprite rows={rows[kind]} palette={WIN} scale={1} />;
}
