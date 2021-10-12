import 'styled-components/native';

declare module 'styled-components/native' {
  export interface DefaultTheme {
    text: string;
    background: string;
    placeholderText: string;
    inputBackground: string;
    secondaryText: string;
    secondary: string;
    accent: string;
    accentBackground: string;
    uiAccent: string;
    success: string;
    error: string;
    yellow: string;
    yellowBackground: string;
    green: string;
    greenBackground: string;
    notification: string;
    primary: string;
    card: string;
    border: string;
  }
}
