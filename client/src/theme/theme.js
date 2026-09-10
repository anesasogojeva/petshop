import { createTheme, alpha } from '@mui/material/styles';
import { colors, radius, shadows } from './tokens';

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary,
      dark: colors.primaryDark,
      light: colors.primaryLight,
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary,
      dark: colors.secondaryDark,
      light: colors.secondaryLight,
      contrastText: '#ffffff',
    },
    background: {
      default: colors.background,
      paper: colors.surface,
    },
    text: {
      primary: colors.textPrimary,
      secondary: colors.textSecondary,
    },
    divider: colors.border,
    success: { main: colors.success },
    warning: { main: colors.warning },
    error: { main: colors.error },
    info: { main: colors.info },
  },
  shape: {
    borderRadius: radius.md,
  },
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    h1: { fontSize: '2.25rem', fontWeight: 700 },
    h2: { fontSize: '1.875rem', fontWeight: 700 },
    h3: { fontSize: '1.5rem', fontWeight: 700 },
    h4: { fontSize: '1.375rem', fontWeight: 700 },
    h5: { fontSize: '1.125rem', fontWeight: 700 },
    h6: { fontSize: '1rem', fontWeight: 700 },
    subtitle1: { fontSize: '0.95rem', fontWeight: 600 },
    subtitle2: { fontSize: '0.85rem', fontWeight: 600, color: colors.textSecondary },
    body1: { fontSize: '0.95rem' },
    body2: { fontSize: '0.875rem', color: colors.textSecondary },
    caption: { fontSize: '0.75rem', color: colors.textSecondary },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
          paddingInline: 18,
          height: 40,
        },
        sizeSmall: {
          height: 34,
          paddingInline: 14,
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: shadows.sm,
        },
        elevation1: {
          boxShadow: shadows.sm,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          padding: '12px 16px',
          borderColor: colors.border,
          fontSize: '0.875rem',
          '@media (max-width:600px)': {
            padding: '8px 10px',
          },
        },
        head: {
          fontWeight: 700,
          color: colors.textPrimary,
          backgroundColor: colors.background,
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: alpha(colors.primary, 0.06),
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          borderRight: `1px solid ${colors.border}`,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: radius.md,
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: radius.sm,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.surface,
          color: colors.textPrimary,
          boxShadow: '0 1px 2px rgba(16,24,32,0.06)',
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },
  },
});

export default theme;
