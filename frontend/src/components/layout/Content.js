import React from 'react';
import Inputs from '../common/Inputs';
import Calendar from '../common/Calendar';
import TimeHeatmap from '../common/TimeHeatmap';
import DateTimeHeatmap from '../common/DateTimeHeatmap';
import { Box, Typography, Link, useMediaQuery, Fade, CircularProgress, Paper } from '@mui/material';
import AISection from './AISection';
import theme from '../../theme/theme';
import { useCalendar } from '../../contexts/CalendarContext';
import SectionContainer from '../ui/SectionContainer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

function Content() {
    const { loading, error } = useCalendar();
    const isMobile = useMediaQuery('(max-width:768px)');
    
    // エラー表示
    const renderError = () => {
        if (!error) return null;
        
        return (
            <SectionContainer>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    backgroundColor: 'rgba(211, 47, 47, 0.05)',
                    borderRadius: '6px'
                }}>
                    <ErrorOutlineIcon color="error" sx={{ mr: 1 }} />
                    <Typography color="error" align="center" variant="body1">
                        {error}
                    </Typography>
                </Box>
            </SectionContainer>
        );
    };
    
    // ローディング表示
    const renderLoading = () => {
        if (!loading) return null;
        
        return (
            <Fade in={loading}>
                <Box sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    p: 3,
                    mb: 2,
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                }}>
                    <CircularProgress size={40} color="primary" sx={{ mb: 2 }} />
                    <Typography variant="body1" align="center" sx={{ fontWeight: 500 }}>
                        データを読み込んでいます...
                    </Typography>
                </Box>
            </Fade>
        );
    };
    
    // ビジュアライゼーションの表示
    // 各コンポーネント内部で表示条件をチェックするため、常に全てのコンポーネントを返す
    const renderVisualization = () => {
        return (
            <>
                <Calendar />
                <TimeHeatmap />
                <DateTimeHeatmap />
            </>
        );
    };

    // クレジットフッターの表示
    const renderCredits = () => {
        return (
            <Paper elevation={0} sx={{
                backgroundColor: theme.palette.primary.light,
                color: theme.palette.common.white,
                borderRadius: '8px',
                overflow: 'hidden',
                mb: 2
            }}>      
                <Box sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    backgroundColor: 'rgba(0,0,0,0.1)'
                }}>
                    <Link
                        href="https://docs.google.com/forms/d/e/1FAIpQLSeEalJjup-hR6BN6M8MfETrPn3is0i-5Rskxz_rkEZvI7mvFw/viewform?usp=header"
                        color="inherit"
                        target="_blank" 
                        sx={{
                            textDecoration: 'none',
                            fontWeight: 500,
                            fontSize: '0.9rem',
                            display: 'inline-flex',
                            alignItems: 'center',
                            '&:hover': {
                                textDecoration: 'underline',
                            },
                        }}
                    >
                        ご意見を聞かせてください
                    </Link>
                </Box>
            </Paper>
        );
    };

    return (
        <Box sx={{
            backgroundColor: 'rgba(249, 250, 251, 0.6)',
            borderRadius: isMobile ? '0' : '8px',
            padding: isMobile ? '8px 8px 16px' : '16px 24px 24px',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
            flex: '1 0 auto'
        }}>
            <Inputs />
            
            {renderError()}
            {renderLoading()}
            
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? 2 : 3
                }}
            >
                <Box sx={{ 
                    flex: isMobile ? 'auto' : '1 1 auto',  // 可能な限り拡大するが
                    width: '100%',
                    maxWidth: isMobile ? '100%' : 'calc(100% - 340px)', // AIセクション用に幅を確保（余白も含む）
                }}>
                    {renderVisualization()}
                </Box>
                <Box
                    sx={{
                        flex: isMobile ? 'auto' : '0 0 320px', // 幅を固定して縮小しないように
                        minWidth: isMobile ? 'auto' : '320px', // 最小幅も保証
                        width: isMobile ? '100%' : '320px',    // 明示的に幅を指定
                        display: 'flex',
                        flexDirection: 'column',
                    }}
                >
                    <AISection />
                    {renderCredits()}
                </Box>
            </Box>
        </Box>
    );
}

export default Content;
