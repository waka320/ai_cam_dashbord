import React from 'react';
import Inputs from '../common/Inputs';
import Calendar from '../common/Calendar';
import TimeHeatmap from '../common/TimeHeatmap';
import DateTimeHeatmap from '../common/DateTimeHeatmap';
import { Box, Typography, Link, useMediaQuery } from '@mui/material';
import AISection from './AISection';
import theme from '../../theme/theme';
import { useCalendar } from '../../contexts/CalendarContext';

function Content() {
    const { selectedAction, loading, error } = useCalendar();
    const isMobile = useMediaQuery('(max-width:768px)');
    
    // 選択されたアクションに基づいて表示するビジュアライゼーションを決定
    const renderVisualization = () => {
        if (error) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="error">{error}</Typography>
                </Box>
            );
        }
        
        if (loading) {
            return (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography>Loading...</Typography>
                </Box>
            );
        }
        
        if (!selectedAction) return null;
        
        // 3つのコンポーネントを常に返すが、コンポーネント内部で表示条件を処理
        return (
            <>
                <Calendar />
                <TimeHeatmap />
                <DateTimeHeatmap />
            </>
        );
    };

    return (
        <>
            <Inputs />
            <Box 
                sx={{ 
                    display: 'flex', 
                    flexDirection: isMobile ? 'column' : 'row',
                    padding: isMobile ? '8px' : '16px'
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
                        marginTop: isMobile ? '16px' : 0,
                        marginLeft: isMobile ? 0 : '16px'
                    }}
                >
                    <AISection />
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        justifyContent: 'center', 
                        marginTop: '16px',
                        textAlign: isMobile ? 'center' : 'left'
                    }}>
                        <Typography variant={isMobile ? 'supplementaryS' : 'supplementaryM'} sx={{ color: theme.palette.text.secondary }}>
                            製作・協力<br />
                            <Link
                                href="https://mdg.si.i.nagoya-u.ac.jp/"
                                color="inherit"
                                sx={{ "&:hover": { color: theme.palette.text.link } }}
                                underline="hover"
                            >
                                名古屋大学 安田・遠藤・浦田研究室
                            </Link><br />
                            <Link
                                href="https://www.city.takayama.lg.jp/shisei/1005252/1021045.html"
                                color="inherit"
                                sx={{ "&:hover": { color: theme.palette.text.link } }}
                                underline="hover"
                            >
                                飛騨高山DX推進官民連携プラットフォーム
                            </Link><br />
                            NECソリューションイノベータ株式会社
                        </Typography>
                        <Typography
                            variant={isMobile ? 'bodyS' : 'bodyM'}
                            sx={{
                                color: theme.palette.text.white,
                                textDecoration: 'underline',
                                marginTop: isMobile ? '8px' : 0,
                                marginLeft: isMobile ? 0 : '8px',
                                '&:hover': {
                                    color: theme.palette.text.secondary,
                                },
                            }}
                        >
                            ご意見・お問い合わせはこちらから
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default Content;
