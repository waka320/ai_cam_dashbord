import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#383947', // 黒系統のメインカラー
      light: '#565A6F',
      dark: '#242631',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#5C5F73', // 黒系統に合わせたセカンダリーカラー
      light: '#7C8093',
      dark: '#3F4254',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#f5f5f5',
      paper: '#343746',
    },
    text: {
      primary: '#212121',
      secondary: '#424242',
      disabled: '#757575',
      white: '#FFFFFF', // white は名前通り白のままにします
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


