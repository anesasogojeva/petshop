// Central design tokens for the app.
// Keep this in sync with ../CSS/tokens.css (plain-CSS pages read the same
// values via CSS custom properties since they don't go through MUI's theme).

export const colors = {
  primary: '#c58177',
  primaryDark: '#9e5d52',
  primaryLight: '#e8c4bb',
  secondary: '#2f4157',
  secondaryDark: '#22303f',
  secondaryLight: '#5b7086',
  background: '#f6f4f2',
  surface: '#ffffff',
  textPrimary: '#1f2933',
  textSecondary: '#5f6b76',
  border: '#e3dedb',
  success: '#2e7d32',
  warning: '#ed6c02',
  error: '#d32f2f',
  info: '#0288d1',
};

export const radius = {
  sm: 6,
  md: 10,
  lg: 14,
};

export const shadows = {
  sm: '0 1px 3px rgba(16, 24, 32, 0.08)',
  md: '0 4px 12px rgba(16, 24, 32, 0.10)',
};

export const drawerWidth = 260;
