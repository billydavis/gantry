export type ThemeId = 'modern' | 'borland' | 'terminal' | 'nord' | 'dracula' | 'monokai' | 'onedark' | 'amber'
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
      text: '#1a1b1e', textMuted: '#868e96', heading: '#1a1b1e',
      accent: '#228be6', accentText: '#ffffff',
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
      success: '#33ff66', danger: '#ff5555',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#EAF4EA', sidebar: '#DCEEDC', surface: '#DCEEDC', border: '#B7D9BC',
      text: '#0B5D1E', textMuted: '#4C8C5A', heading: '#0B5D1E',
      accent: '#0B5D1E', accentText: '#EAF4EA',
      navActiveBg: '#C3E6C9', navActiveText: '#0B5D1E',
      success: '#0B5D1E', danger: '#8A1F1F',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'nord',
    name: 'Frostline',
    dark: {
      background: '#2e3440', sidebar: '#292e39', surface: '#3b4252', border: '#434c5e',
      text: '#eceff4', textMuted: '#9aa5b1', heading: '#eceff4',
      accent: '#88c0d0', accentText: '#2e3440',
      navActiveBg: '#3b4252', navActiveText: '#88c0d0',
      success: '#a3be8c', danger: '#bf616a',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
    light: {
      background: '#ECEFF4', sidebar: '#E5E9F0', surface: '#E5E9F0', border: '#D8DEE9',
      text: '#2E3440', textMuted: '#4C566A', heading: '#2E3440',
      accent: '#5E81AC', accentText: '#FFFFFF',
      navActiveBg: '#D8DEE9', navActiveText: '#5E81AC',
      success: '#6B8E4E', danger: '#953F46',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
  },
  {
    id: 'dracula',
    name: 'Nightshade',
    dark: {
      background: '#282a36', sidebar: '#21222c', surface: '#21222c', border: '#44475a',
      text: '#f8f8f2', textMuted: '#6272a4', heading: '#bd93f9',
      accent: '#bd93f9', accentText: '#282a36',
      navActiveBg: '#44475a', navActiveText: '#ff79c6',
      success: '#50fa7b', danger: '#ff5555',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#F8F8F2', sidebar: '#EFEFE9', surface: '#EFEFE9', border: '#D6D6CE',
      text: '#282A36', textMuted: '#6272A4', heading: '#6D42C9',
      accent: '#6D42C9', accentText: '#FFFFFF',
      navActiveBg: '#E2DCF5', navActiveText: '#6D42C9',
      success: '#1E9E4A', danger: '#C0392B',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'monokai',
    name: 'Canopy',
    dark: {
      background: '#272822', sidebar: '#1e1f1a', surface: '#1e1f1a', border: '#3e3d32',
      text: '#f8f8f2', textMuted: '#75715e', heading: '#a6e22e',
      accent: '#f92672', accentText: '#f8f8f2',
      navActiveBg: '#3e3d32', navActiveText: '#66d9ef',
      success: '#a6e22e', danger: '#f92672',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#F8F8F2', sidebar: '#EFEFE6', surface: '#EFEFE6', border: '#DBDACB',
      text: '#272822', textMuted: '#75715E', heading: '#6B8E23',
      accent: '#C41E5A', accentText: '#FFFFFF',
      navActiveBg: '#E3EDC9', navActiveText: '#5A7A1D',
      success: '#5A7A1D', danger: '#C41E5A',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
  {
    id: 'onedark',
    name: 'Graphite',
    dark: {
      background: '#282c34', sidebar: '#21252b', surface: '#21252b', border: '#3a3f4b',
      text: '#abb2bf', textMuted: '#6b717d', heading: '#d7dae0',
      accent: '#61afef', accentText: '#1c2128',
      navActiveBg: '#2c313a', navActiveText: '#61afef',
      success: '#98c379', danger: '#e06c75',
      fontFamily: FONT_UI, borderStyle: 'solid',
    },
    light: {
      background: '#FAFAFA', sidebar: '#F0F0F1', surface: '#F0F0F1', border: '#E5E5E6',
      text: '#383A42', textMuted: '#A0A1A7', heading: '#383A42',
      accent: '#4078F2', accentText: '#FFFFFF',
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
      success: '#FFB000', danger: '#FF6B35',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
    light: {
      background: '#F5E9D3', sidebar: '#EDDBB5', surface: '#EDDBB5', border: '#D2B37A',
      text: '#7A4A00', textMuted: '#A67C3D', heading: '#7A4A00',
      accent: '#7A4A00', accentText: '#F5E9D3',
      navActiveBg: '#E0C48A', navActiveText: '#7A4A00',
      success: '#7A4A00', danger: '#A13D1E',
      fontFamily: FONT_MONO, borderStyle: 'solid',
    },
  },
]

export function getTokens(themeId: ThemeId, colorScheme: ColorScheme): ThemeTokens {
  const def = THEMES.find(t => t.id === themeId) ?? THEMES[0]
  return colorScheme === 'dark' ? def.dark : def.light
}
