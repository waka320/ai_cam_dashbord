import React from 'react';
import Calendar from '../common/Calendar';
import TimeHeatmap from '../common/TimeHeatmap';
import DateTimeHeatmap from '../common/DateTimeHeatmap';
import { Box, Typography, Button, useMediaQuery, Fade, CircularProgress } from '@mui/material';
import AdviceSection from './AdviceSection';
import { useCalendar } from '../../contexts/CalendarContext';
import SectionContainer from '../ui/SectionContainer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SEOComponent from '../common/SEOComponent';

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

    // フィードバックボタンの表示
    const renderFeedbackButton = () => {
        return (
            <Box sx={{ mb: 2 }}>
                <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    href="https://docs.google.com/forms/d/e/1FAIpQLSeEalJjup-hR6BN6M8MfETrPn3is0i-5Rskxz_rkEZvI7mvFw/viewform?usp=header"
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                        py: 1.5,
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        '&:hover': {
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
                    }}
                >
                    ここをタップしてご意見をお聞かせください
                </Button>
            </Box>
        );
    };

    return (
        <>
            <SEOComponent 
                title="目的ベースダッシュボード"
                description="高山市のAIカメラから取得した歩行者オープンデータを活用。観光地の混雑状況を可視化し、事業者に「やりたいこと」を与え、悩みを解決します。"
                keywords="高山市,ダッシュボード,観光,混雑度,混雑状況,データ可視化,オープンデータ,データ分析,事業者支援,飛騨高山,MDG,遠藤・浦田研究室"
                url="https://ai-cam-dashbord.vercel.app"
            />
            <Box sx={{
                backgroundColor: 'rgba(249, 250, 251, 0.6)',
                borderRadius: isMobile ? '0' : '8px',
                padding: isMobile ? '8px 8px 16px' : '16px 24px 24px',
                boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
                flex: '1 0 auto'
            }}>
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
                    <AdviceSection />
                    {renderFeedbackButton()}
                </Box>
            </Box>
        </Box>
        </>
    );
}

export default Content;
