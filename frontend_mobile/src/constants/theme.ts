/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    // Por que: Cor do texto principal no modo claro.
    text: '#000000',
    // Por que: Fundo limpo e suave no modo claro.
    background: '#ffffff',
    // Por que: Fundo secundário para elementos de card em vidro.
    backgroundElement: '#F0F0F3',
    // Por que: Fundo para abas e botões selecionados no modo claro.
    backgroundSelected: '#E0E1E6',
    // Por que: Texto de apoio secundário no modo claro.
    textSecondary: '#60646C',
    // Por que: Azul ciano espacial para destaques primários e links da Terra.
    primary: '#06b6d4',
    // Por que: Roxo neon para elementos secundários e links lunares.
    secondary: '#8b5cf6',
    // Por que: Verde esmeralda indicando conexões ativas ou sucesso na rede.
    success: '#10b981',
    // Por que: Vermelho vibrante indicando falhas críticas de rádio ou saldo insuficiente.
    danger: '#ef4444',
    // Por que: Amarelo âmbar para pacotes DTN em buffer local aguardando contato orbital.
    warning: '#f59e0b',
  },
  dark: {
    // Por que: Texto principal de alto contraste no modo escuro.
    text: '#ffffff',
    // Por que: Preto profundo simulando o espaço sideral.
    background: '#000000',
    // Por que: Elemento de card com transparência sutil para glassmorphism.
    backgroundElement: '#212225',
    // Por que: Elementos selecionados no modo escuro.
    backgroundSelected: '#2E3135',
    // Por que: Texto de telemetria secundária no modo escuro.
    textSecondary: '#B0B4BA',
    // Por que: Azul ciano espacial para botões de comandos primários da Terra.
    primary: '#06b6d4',
    // Por que: Roxo neon para comandos secundários lunares.
    secondary: '#8b5cf6',
    // Por que: Verde esmeralda indicando enlace operacional (UP) e pacotes entregues.
    success: '#10b981',
    // Por que: Vermelho vibrante para alertar sobre erros e blackouts críticos.
    danger: '#ef4444',
    // Por que: Amarelo âmbar para pacotes DTN enfileirados no buffer local (STORED).
    warning: '#f59e0b',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
