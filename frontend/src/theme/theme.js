import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#F57C00', // オレンジに変更（元に戻す）
      light: '#FFB74D',
      dark: '#E65100',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5D4037', // 補色をオレンジに合わせて調整（茶色系）
      light: '#8D6E63',
      dark: '#3E2723',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#212121',
      secondary: '#757575',
      disabled: '#9E9E9E',
      white: '#FFFFFF',
    },
    error: {
      main: '#D32F2F',
    },
    warning: {
      main: '#FFA000',
    },
    info: {
      main: '#1976D2',
    },
    success: {
      main: '#388E3C',
    },
  },
  typography: {
    fontFamily: [
      'Noto Sans JP',
      'sans-serif',
      '-apple-system',
      'BlinkMacSystemFont',
      'Segoe UI',
      'Roboto',
      'Helvetica Neue',
      'Arial',
    ].join(','),
    h6: {
      fontWeight: 700,
      fontSize: '1.1rem',
    },
    bodyL: {
      fontSize: '1rem',
      fontWeight: 500,
    },
    bodyM: {
      fontSize: '0.95rem',
      fontWeight: 400,
    },
    labelL: {
      fontSize: '0.95rem',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 6,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 4,
        },
      },
    },
  },
});

export default theme;


