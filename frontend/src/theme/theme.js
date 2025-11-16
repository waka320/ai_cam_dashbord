import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4A5568', // 目的ベース用（元の色調をベースにした青みがかったグレー）
      light: '#718096',
      dark: '#2D3748',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#553C9A', // グラフベース用（元の色調をベースにした紫みがかったグレー）
      light: '#805AD5',
      dark: '#44337A',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',  // カードの背景色を白に変更
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
    // 見出し
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      marginBottom: '0.5em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
      letterSpacing: '-0.005em',
      marginBottom: '0.5em',
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    h6: {
      fontWeight: 700,
      fontSize: '1.1rem',
      lineHeight: 1.4,
      marginBottom: '0.5em',
    },
    // 本文
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    // カスタムスタイル
    bodyL: {
      fontSize: '1rem',
      fontWeight: 500,
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    bodyM: {
      fontSize: '0.95rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.00938em',
    },
    bodyS: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.6,
      letterSpacing: '0.01071em',
    },
    bodyXS: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.01071em',
    },
    // ラベル
    labelL: {
      fontSize: '0.95rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    labelM: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    labelS: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.02857em',
    },
    // その他の機能的なテキストスタイル
    button: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.75,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontSize: '0.75rem',
      fontWeight: 400,
      lineHeight: 1.5,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontSize: '0.75rem',
      fontWeight: 500,
      lineHeight: 1.5,
      letterSpacing: '0.08333em',
      textTransform: 'uppercase',
    },
    subtitle1: {
      fontSize: '1.1rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
      letterSpacing: '0.00714em',
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
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#FFFFFF', // メニューの背景色を白に設定
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          color: '#212121', // メニュー項目のテキスト色を黒に設定
          '&:hover': {
            backgroundColor: '#F5F5F5', // ホバー時の背景色
          },
          '&.Mui-selected': {
            backgroundColor: '#E0E0E0', // 選択時の背景色
            '&:hover': {
              backgroundColor: '#D5D5D5', // 選択+ホバー時の背景色
            },
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          // 日本語テキストのためのスタイル調整
          wordBreak: 'break-word',
        },
        paragraph: {
          marginBottom: '1em',
        },
        gutterBottom: {
          marginBottom: '0.75em',
        },
      },
    },
  },
});

export default theme;


