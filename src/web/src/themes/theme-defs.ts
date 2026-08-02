export type ThemeId =
  | 'modern' | 'borland' | 'terminal' | 'afterglow' | 'synthwave' | 'monokai' | 'onedark' | 'amber'
  | 'solarized' | 'gruvbox' | 'catppuccin' | 'rosepine'
export type ColorScheme = 'dark' | 'light'

export interface ThemeTokens {
  background: string
  sidebar: string
  surface: string
  border: string
  text: string
  textMuted: string
  heading: string
  accent: string
  accentText: string
  navActiveBg: string
  navActiveText: string
  success: string
  danger: string
  fontFamily: string
  borderStyle: 'solid' | 'outset'
}

export interface ThemeDef {
  id: ThemeId
  name: string
  dark: ThemeTokens
  light: ThemeTokens
}

const FONT_UI = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
const FONT_MONO = '"Cascadia Code", Consolas, "Courier New", monospace'

export const THEMES: ThemeDef[] = [
  {
    id: 'modern',
    name: 'Default',
    dark: {
      background: '#1a1b1e', sidebar: '#141517', surface: '#25262b', border: '#2c2e33',
      text: '#c1c2c5', textMuted: '#909296', heading: '#f1f3f5',
      accent: '#339af0', accentText: '#06131f',
      navActiveBg: '#1c3a5e', navActiveText: '#74c0fc',
      success: '#37b24d', danger: '#f03e3e',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
    light: {
      background: '#ffffff', sidebar: '#f8f9fa', surface: '#f8f9fa', border: '#e9ecef',
      text: '#1a1b1e', textMuted: '#6b7178', heading: '#1a1b1e',
      accent: '#1971c2', accentText: '#ffffff',
      navActiveBg: '#e7f5ff', navActiveText: '#1971c2',
      success: '#40c057', danger: '#e03131',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
  },
  {
    id: 'borland',
    name: 'Cobalt DOS',
    dark: {
      background: '#0000AA', sidebar: '#0000AA', surface: '#000080', border: '#C0C0C0',
      text: '#C0C0C0', textMuted: '#C0C0C0', heading: '#FFFF00',
      accent: '#00FFFF', accentText: '#0000AA',
      navActiveBg: '#C0C0C0', navActiveText: '#0000AA',
      success: '#00AA00', danger: '#AA0000',
      fontFamily: FONT_MONO, borderStyle: 'outset',
    },
    light: {
      background: '#F0F0F0', sidebar: '#F0F0F0', surface: '#FFFFFF', border: '#808080',
      text: '#000080', textMuted: '#33336B', heading: '#800000',
      accent: '#008080', accentText: '#FFFFFF',
      navActiveBg: '#C0C0C0', navActiveText: '#000080',
      success: '#008000', danger: '#AA0000',
      fontFamily: FONT_MONO, borderStyle: 'outset',
    },
  },
  {
    id: 'terminal',
    name: 'Phosphor',
    dark: {
      background: '#0a0f0a', sidebar: '#060906', surface: '#060906', border: '#1f3d24',
      text: '#33ff66', textMuted: '#1f9e42', heading: '#a6ffb8',
      accent: '#33ff66', accentText: '#0a0f0a',
      navActiveBg: '#12261a', navActiveText: '#a6ffb8',
      success: '#8aff80', danger: '#ff5555',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#EAF4EA', sidebar: '#DCEEDC', surface: '#DCEEDC', border: '#B7D9BC',
      text: '#0B5D1E', textMuted: '#3b6e46', heading: '#0B5D1E',
      accent: '#0B5D1E', accentText: '#EAF4EA',
      navActiveBg: '#C3E6C9', navActiveText: '#0B5D1E',
      success: '#1c7a33', danger: '#8A1F1F',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'afterglow',
    name: 'Afterglow',
    dark: {
      background: '#1c1c1c', sidebar: '#141414', surface: '#262626', border: '#3a3a3a',
      text: '#e8e8e8', textMuted: '#969696', heading: '#f5f0e8',
      accent: '#ff8c42', accentText: '#1c1c1c',
      navActiveBg: '#3a2a1a', navActiveText: '#ff8c42',
      success: '#9ccc65', danger: '#ff5f56',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#f7f3ec', sidebar: '#efe8db', surface: '#efe8db', border: '#d8cdb8',
      text: '#3a3530', textMuted: '#6b6358', heading: '#2a2620',
      accent: '#a84f16', accentText: '#f7f3ec',
      navActiveBg: '#f0dcc0', navActiveText: '#a84f16',
      success: '#4f7a2e', danger: '#b8362a',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'synthwave',
    name: 'Synthwave',
    dark: {
      background: '#241b2f', sidebar: '#1a1225', surface: '#2d2140', border: '#443465',
      text: '#f4eff8', textMuted: '#9a8fc2', heading: '#ff7edb',
      accent: '#03edf9', accentText: '#1a1225',
      navActiveBg: '#3a2b57', navActiveText: '#ff7edb',
      success: '#72f1b8', danger: '#fe4450',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#fdf3fb', sidebar: '#f7e6f5', surface: '#f7e6f5', border: '#e3c2e0',
      text: '#4a2e57', textMuted: '#745784', heading: '#c2158a',
      accent: '#056b7d', accentText: '#fdf3fb',
      navActiveBg: '#f3d6ee', navActiveText: '#b3168f',
      success: '#167a56', danger: '#d81b3f',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'monokai',
    name: 'Canopy',
    dark: {
      background: '#272822', sidebar: '#1e1f1a', surface: '#1e1f1a', border: '#3e3d32',
      text: '#f8f8f2', textMuted: '#948f76', heading: '#a6e22e',
      accent: '#f92672', accentText: '#141410',
      navActiveBg: '#3e3d32', navActiveText: '#66d9ef',
      success: '#a6e22e', danger: '#ff4444',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#F8F8F2', sidebar: '#EFEFE6', surface: '#EFEFE6', border: '#DBDACB',
      text: '#272822', textMuted: '#68644f', heading: '#4c6519',
      accent: '#C41E5A', accentText: '#FFFFFF',
      navActiveBg: '#E3EDC9', navActiveText: '#5A7A1D',
      success: '#5A7A1D', danger: '#d62828',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'onedark',
    name: 'Graphite',
    dark: {
      background: '#282c34', sidebar: '#21252b', surface: '#21252b', border: '#3a3f4b',
      text: '#abb2bf', textMuted: '#9198a6', heading: '#d7dae0',
      accent: '#61afef', accentText: '#1c2128',
      navActiveBg: '#2c313a', navActiveText: '#61afef',
      success: '#98c379', danger: '#e06c75',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
    light: {
      background: '#FAFAFA', sidebar: '#F0F0F1', surface: '#F0F0F1', border: '#E5E5E6',
      text: '#383A42', textMuted: '#5c6370', heading: '#383A42',
      accent: '#3568d4', accentText: '#FFFFFF',
      navActiveBg: '#E5E5E6', navActiveText: '#4078F2',
      success: '#50A14F', danger: '#E45649',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
  },
  {
    id: 'amber',
    name: 'Amber',
    dark: {
      background: '#1a0f00', sidebar: '#120b00', surface: '#120b00', border: '#4d3300',
      text: '#FFB000', textMuted: '#B37700', heading: '#FFD470',
      accent: '#FFB000', accentText: '#1a0f00',
      navActiveBg: '#2e1c00', navActiveText: '#FFD470',
      success: '#ffcb4d', danger: '#FF6B35',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#F5E9D3', sidebar: '#EDDBB5', surface: '#EDDBB5', border: '#D2B37A',
      text: '#7A4A00', textMuted: '#7d5b26', heading: '#7A4A00',
      accent: '#7A4A00', accentText: '#F5E9D3',
      navActiveBg: '#E0C48A', navActiveText: '#7A4A00',
      success: '#9c6b12', danger: '#A13D1E',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'solarized',
    name: 'Sundial',
    dark: {
      background: '#002b36', sidebar: '#001e27', surface: '#073642', border: '#0a4e5e',
      text: '#839496', textMuted: '#8aa0ac', heading: '#93a1a1',
      accent: '#1c6ea4', accentText: '#f5f9e8',
      navActiveBg: '#0b4a5c', navActiveText: '#67cbc0',
      success: '#859900', danger: '#dc322f',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#fdf6e3', sidebar: '#f3ecd3', surface: '#f3ecd3', border: '#d8cfb4',
      text: '#4d5f66', textMuted: '#586e75', heading: '#073642',
      accent: '#1c6ea4', accentText: '#fdf6e3',
      navActiveBg: '#dde8ea', navActiveText: '#1c6ea4',
      success: '#5b6b00', danger: '#c41e1a',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'gruvbox',
    name: 'Terracotta',
    dark: {
      background: '#282828', sidebar: '#1d2021', surface: '#3c3836', border: '#504945',
      text: '#ebdbb2', textMuted: '#b3a591', heading: '#fbf1c7',
      accent: '#fe8019', accentText: '#282828',
      navActiveBg: '#4a3728', navActiveText: '#fe8019',
      success: '#b8bb26', danger: '#ff6b57',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#fbf1c7', sidebar: '#f2e5bc', surface: '#ebdbb2', border: '#bdae93',
      text: '#3c3836', textMuted: '#6b5f54', heading: '#282828',
      accent: '#af3a03', accentText: '#fbf1c7',
      navActiveBg: '#f0d3a0', navActiveText: '#af3a03',
      success: '#6b660c', danger: '#9d0006',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'catppuccin',
    name: 'Petal',
    dark: {
      background: '#1e1e2e', sidebar: '#181825', surface: '#313244', border: '#45475a',
      text: '#cdd6f4', textMuted: '#a6adc8', heading: '#f5e0dc',
      accent: '#cba6f7', accentText: '#1e1e2e',
      navActiveBg: '#3a3350', navActiveText: '#cba6f7',
      success: '#a6e3a1', danger: '#f38ba8',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
    light: {
      background: '#eff1f5', sidebar: '#e6e9ef', surface: '#e6e9ef', border: '#ccd0da',
      text: '#4c4f69', textMuted: '#5c5f77', heading: '#4c4f69',
      accent: '#8839ef', accentText: '#eff1f5',
      navActiveBg: '#e8ddfb', navActiveText: '#8839ef',
      success: '#2f7a1f', danger: '#d20f39',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
  },
  {
    id: 'rosepine',
    name: 'Rosewood',
    dark: {
      background: '#191724', sidebar: '#16141f', surface: '#1f1d2e', border: '#403d52',
      text: '#e0def4', textMuted: '#908caa', heading: '#ebbcba',
      accent: '#c4a7e7', accentText: '#191724',
      navActiveBg: '#2d2a45', navActiveText: '#c4a7e7',
      success: '#9ccfd8', danger: '#eb6f92',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
    light: {
      background: '#faf4ed', sidebar: '#f2e9e1', surface: '#f2e9e1', border: '#dfdad9',
      text: '#575279', textMuted: '#666284', heading: '#575279',
      accent: '#7a5f96', accentText: '#faf4ed',
      navActiveBg: '#efe2f5', navActiveText: '#7a5f96',
      success: '#3f7883', danger: '#9c4a63',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
  },
]

export function getTokens(themeId: ThemeId, colorScheme: ColorScheme): ThemeTokens {
  const def = THEMES.find(t => t.id === themeId) ?? THEMES[0]
  return colorScheme === 'dark' ? def.dark : def.light
}
