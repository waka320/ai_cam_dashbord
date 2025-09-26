import React from 'react';
import Calendar from '../components/common/Calendar';
import TimeHeatmap from '../components/common/TimeHeatmap';
import DateTimeHeatmap from '../components/common/DateTimeHeatmap';
import TodayDetails from '../components/common/TodayDetails';
import { Box, Typography, Button, useMediaQuery, Paper } from '@mui/material';
import AdviceSection from '../components/layout/AdviceSection';
import { useCalendar } from '../contexts/CalendarContext';
import SectionContainer from '../components/ui/SectionContainer';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import SEOComponent from '../components/common/SEOComponent';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import theme from '../theme/theme';

function PurposeDashboard() {
    const { 
        error, 
        selectedAction, 
        selectedLocation
    } = useCalendar();
    const isMobile = useMediaQuery('(max-width:768px)');
    
    const isInitialState = !selectedAction || (selectedAction && !selectedLocation);
    
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
    
    // 初期状態画面の表示
    const renderInitialState = () => {
        const needsAction = !selectedAction;
        const needsLocation = selectedAction && !selectedLocation;
        
        return (
            <SectionContainer>
                <Paper 
                    elevation={1} 
                    sx={{ 
                        borderRadius: '12px',
                        border: '2px solid rgba(74, 85, 104, 0.2)', // 目的ベース用のボーダー
                        backgroundColor: 'rgba(248, 249, 250, 0.98)', // 目的ベース用の薄いグレー背景
                        p: isMobile ? 2 : 3,
                        position: 'relative',
                        zIndex: 1002
                    }}
                >
                    {needsAction ? (
                        // 「やりたいこと」の選択を促す
                        <Box sx={{ textAlign: 'center' }}>
                            <ArrowUpwardIcon 
                                sx={{ 
                                    fontSize: isMobile ? '1.5rem' : '2rem',
                                    color: theme.palette.primary.main,
                                    mb: 1,
                                    animation: 'pulse 2s infinite'
                                }} 
                            />
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.primary.main,
                                    mb: 1,
                                    fontSize: isMobile ? '1rem' : '1.1rem'
                                }}
                            >
                                「やりたいこと」を選んでください
                            </Typography>
                        </Box>
                    ) : needsLocation ? (
                        // 「計測場所」の選択を促す
                        <Box sx={{ textAlign: 'center' }}>
                            <ArrowUpwardIcon 
                                sx={{ 
                                    fontSize: isMobile ? '1.5rem' : '2rem',
                                    color: theme.palette.success.main,
                                    mb: 1,
                                    animation: 'pulse 2s infinite'
                                }} 
                            />
                            <Typography 
                                variant="h6" 
                                sx={{ 
                                    fontWeight: 600,
                                    color: theme.palette.success.main,
                                    mb: 1,
                                    fontSize: isMobile ? '1rem' : '1.1rem'
                                }}
                            >
                                「計測場所」を選んでください
                            </Typography>
                            <Typography 
                                variant="body2" 
                                sx={{ 
                                    color: theme.palette.text.secondary,
                                    fontSize: isMobile ? '0.75rem' : '0.85rem'
                                }}
                            >
                                分析対象の場所を選択してください
                            </Typography>
                        </Box>
                    ) : null}
                </Paper>
                
                {/* アニメーションのCSS */}
                <style>
                    {`
                        @keyframes pulse {
                            0%, 100% {
                                transform: scale(1);
                                opacity: 1;
                            }
                            50% {
                                transform: scale(1.1);
                                opacity: 0.8;
                            }
                        }
                    `}
                </style>
            </SectionContainer>
        );
    };

    // ビジュアライゼーションの表示
    const renderVisualization = () => {
        // 初期状態（やりたいことまたは計測場所が未選択）の場合
        if (isInitialState) {
            return renderInitialState();
        }
        
        // 目的ベースのアクション別ビジュアライゼーション
        return (
            <>
                {/* 今日について詳しく知りたい */}
                {selectedAction === 'today_details' && <TodayDetails />}
                
                {/* カレンダー系のアクション */}
                {(selectedAction.startsWith('cal_') && selectedAction !== 'today_details') && <Calendar />}
                
                {/* 時間系のアクション */}
                {selectedAction.startsWith('wti_') && <TimeHeatmap />}
                
                {/* 日時系のアクション */}
                {selectedAction.startsWith('dti_') && <DateTimeHeatmap />}
            </>
        );
    };

    return (
        <>
            <SEOComponent 
                title="目的ベースダッシュボード | 高山市AIカメラデータ"
                description="高山市のAIカメラから取得した歩行者オープンデータを活用。観光地の混雑状況を可視化し、事業者に「やりたいこと」を与え、悩みを解決します。"
                keywords="高山市,ダッシュボード,観光,混雑度,混雑状況,データ可視化,オープンデータ,データ分析,事業者支援,飛騨高山,MDG,遠藤・浦田研究室,目的ベース"
                url="https://ai-camera.lab.mdg-meidai.com/purpose"
            />
            {/* 初期状態時の全画面オーバーレイ（ヘッダーと誘導カード以外を暗く） */}
            {isInitialState && (
                <Box sx={{
                    position: 'fixed',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    zIndex: 1000,
                    pointerEvents: 'none'
                }} />
            )}
            <Box sx={{
                backgroundColor: 'rgba(248, 249, 250, 0.3)', // 目的ベース用の薄いグレー背景
                borderRadius: isMobile ? '0' : '8px',
                padding: isMobile ? '6px 4px 12px' : '12px 8px 16px',
                boxShadow: 'inset 0 1px 3px rgba(74, 85, 104, 0.1)', // 目的ベースシャドウ
                flex: '1 0 auto',
                position: 'relative'
            }}>
                {renderError()}
                
                <Box 
                    sx={{ 
                        display: 'flex', 
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? 1 : 1.5
                    }}
                >
                    <Box sx={{ 
                        flex: isMobile ? 'auto' : '1 1 auto',
                        width: '100%',
                        maxWidth: isMobile ? '100%' : 'calc(100% - 325px)',
                    }}>
                        {renderVisualization()}
                    </Box>
                    <Box
                        sx={{
                            flex: isMobile ? 'auto' : '0 0 320px',
                            minWidth: isMobile ? 'auto' : '320px',
                            width: isMobile ? '100%' : '320px',
                            display: 'flex',
                            flexDirection: 'column',
                        }}
                    >
                        <AdviceSection />
                        {/* フィードバックボタン */}
                        <Box sx={{ mt: 2 }}>
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
                    </Box>
                </Box>
            </Box>
        </>
    );
}

export default PurposeDashboard;
