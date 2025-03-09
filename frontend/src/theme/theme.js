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
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                '.markdown-body': {
                    fontSize: '14px',
                    lineHeight: '1.4',
                    margin: '0',
                    padding: '0',
                    '& h1, & h2, & h3, & h4, & h5, & h6': {
                        margin: '0.5em 0 0.3em',
                        lineHeight: '1.2',
                        fontWeight: 500,
                    },
                    '& h1': {
                        fontSize: '1.6em',
                    },
                    '& h2': {
                        fontSize: '1.4em',
                    },
                    '& h3': {
                        fontSize: '1.2em',
                    },
                    '& h4': {
                        fontSize: '1.1em',
                    },
                    '& h5, & h6': {
                        fontSize: '1em',
                    },
                    '& p': {
                        margin: '0.3em 0',
                    },
                    '& ul, & ol': {
                        margin: '0.3em 0',
                        paddingLeft: '1.5em',
                    },
                    '& li': {
                        margin: '0.1em 0',
                    },
                    '& table': {
                        borderCollapse: 'collapse',
                        width: '100%',
                        margin: '0.5em 0',
                    },
                    '& th, & td': {
                        border: '1px solid #ddd',
                        padding: '0.3em 0.5em',
                        textAlign: 'left',
                    },
                    '& th': {
                        backgroundColor: '#f5f5f5',
                    },
                    '& blockquote': {
                        borderLeft: '3px solid #ddd',
                        margin: '0.5em 0',
                        padding: '0 0.5em',
                        color: '#666',
                    },
                    '& code': {
                        backgroundColor: '#f5f5f5',
                        padding: '0.1em 0.3em',
                        borderRadius: '3px',
                        fontSize: '0.9em',
                    },
                    '& pre': {
                        backgroundColor: '#f5f5f5',
                        padding: '0.5em',
                        borderRadius: '3px',
                        overflow: 'auto',
                        margin: '0.5em 0',
                    },
                    '& pre code': {
                        backgroundColor: 'transparent',
                        padding: 0,
                    },
                },
            },
        },
    },
});

export default theme;


