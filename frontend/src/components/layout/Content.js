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
import InfoIcon from '@mui/icons-material/Info';
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
                    p: 2,
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
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    justifyContent: 'space-between',
                    alignItems: isMobile ? 'center' : 'flex-start',
                    padding: isMobile ? '12px' : '16px',
                    borderBottom: '1px solid rgba(255,255,255,0.2)'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 0 }}>
                        <InfoIcon sx={{ mr: 1, fontSize: '1.2rem' }} />
                        <Typography variant="body2" fontWeight={600}>
                            製作・協力
                        </Typography>
                    </Box>
                    
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: isMobile ? 'center' : 'flex-end'
                    }}>
                        <Link
                            href="https://mdg.si.i.nagoya-u.ac.jp/"
                            color="inherit"
                            sx={{ 
                                "&:hover": { color: 'rgba(255,255,255,0.8)' },
                                mb: 0.5,
                                textDecoration: 'none',
                                borderBottom: '1px dotted rgba(255,255,255,0.5)'
                            }}
                        >
                            名古屋大学 安田・遠藤・浦田研究室
                        </Link>
                        <Link
                            href="https://www.city.takayama.lg.jp/shisei/1005252/1021045.html"
                            color="inherit"
                            sx={{ 
                                "&:hover": { color: 'rgba(255,255,255,0.8)' },
                                mb: 0.5,
                                textDecoration: 'none',
                                borderBottom: '1px dotted rgba(255,255,255,0.5)'
                            }}
                        >
                            飛騨高山DX推進官民連携プラットフォーム
                        </Link>
                        <Typography variant="body2">
                            NECソリューションイノベータ株式会社
                        </Typography>
                    </Box>
                </Box>
                
                <Box sx={{ 
                    p: 2, 
                    textAlign: 'center', 
                    backgroundColor: 'rgba(0,0,0,0.1)'
                }}>
                    <Link
                        href="#contact"
                        color="inherit"
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
                        ご意見・お問い合わせはこちらから
                    </Link>
                </Box>
            </Paper>
        );
    };

    return (
        <Box sx={{
            backgroundColor: 'rgba(249, 250, 251, 0.6)',
            borderRadius: isMobile ? '0' : '0 0 8px 8px',
            padding: isMobile ? '8px 8px 16px' : '16px 16px 24px',
            boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)'
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
                    flex: isMobile ? 'auto' : 2,
                    width: '100%'
                }}>
                    {renderVisualization()}
                </Box>
                <Box
                    sx={{
                        flex: isMobile ? 'auto' : 1,
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
