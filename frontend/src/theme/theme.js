import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#E86826',
        },
        secondary: {
            main: '#2196F3',
        },
        tertiary: {
            main: '#FFEB3B',
        },
        background: {
            default: '#FFFFFF',
        },
        text: {
            primary: '#000000',
            secondary: '#999999',
            white: '#FFFFFF',
            link: '#C65015',
        },
    },
    typography: {
        fontFamily: 'Noto Sans JP, sans-serif',

        // Body styles
        bodyLL: { fontSize: '20px', fontWeight: 400 },
        bodyL: { fontSize: '16px', fontWeight: 400 },
        bodyM: { fontSize: '14px', fontWeight: 400 },

        // Label styles
        labelL: { fontSize: '14px', fontWeight: 500 },
        labelM: { fontSize: '12px', fontWeight: 500 },

        // Supplementary styles
        supplementaryL: { fontSize: '12px', fontWeight: 400 },
        supplementaryM: { fontSize: '10px', fontWeight: 400 },

        // Button styles
        button: { fontSize: '16px', fontWeight: 700 },

        // Heading styles
        h1: {
            fontSize: '36px',
            fontWeight: 400,
            marginTop: '64px',
            marginBottom: '24px',
            '@media (max-width:600px)': {
                fontSize: '32px',
                fontWeight: 500,
            },
        },
        h2: {
            fontSize: '32px',
            fontWeight: 400,
            marginTop: '64px',
            marginBottom: '24px',
            '@media (max-width:600px)': {
                fontSize: '28px',
                fontWeight: 500,
            },
        },
        h3: {
            fontSize: '28px',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '24px',
            '@media (max-width:600px)': {
                fontSize: '24px',
                fontWeight: 500,
            },
        },
        h4: {
            fontSize: '24px',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '10px',
            '@media (max-width:600px)': {
                fontSize: '20px',
                fontWeight: 500,
            },
        },
        h5: {
            fontSize: '20px',
            fontWeight: 400,
            marginTop: '40px',
            marginBottom: '10px',
            '@media (max-width:600px)': {
                fontSize: '16px',
                fontWeight: 500,
            },
        }
    }
});

export default theme;


