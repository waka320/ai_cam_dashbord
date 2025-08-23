import React from 'react';
import { Box, Typography, Card, CardContent, Button, Container, useMediaQuery, Grid } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import BusinessIcon from '@mui/icons-material/Business';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SEOComponent from '../components/common/SEOComponent';
import theme from '../theme/theme';

function LandingPage() {
    const navigate = useNavigate();
    const isMobile = useMediaQuery('(max-width:768px)');
    const isTablet = useMediaQuery('(min-width:769px) and (max-width:1024px)');

    const handlePurposeClick = () => {
        navigate('/purpose');
    };

    const handleFunctionClick = () => {
        navigate('/function');
    };

    return (
        <>
            <SEOComponent 
                title="高山市AIカメラデータダッシュボード | MDG遠藤・浦田研究室"
                description="高山市のAIカメラから取得した歩行者オープンデータを活用。観光地の混雑状況を可視化し、事業者の悩みを解決する2つのダッシュボードを提供します。"
                keywords="高山市,ダッシュボード,観光,混雑度,混雑状況,データ可視化,オープンデータ,データ分析,事業者支援,飛騨高山,MDG,遠藤・浦田研究室"
                url="https://ai-camera.lab.mdg-meidai.com"
            />
            <Container maxWidth="lg" sx={{ py: isMobile ? 3 : 6 }}>
                {/* ヘッダーセクション */}
                <Box sx={{ textAlign: 'center', mb: isMobile ? 4 : 6 }}>
                    <Typography 
                        variant="h3" 
                        component="h1" 
                        sx={{ 
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            mb: 2,
                            fontSize: isMobile ? '1.8rem' : isTablet ? '2.2rem' : '2.5rem'
                        }}
                    >
                        高山市AIカメラデータ
                    </Typography>
                    <Typography 
                        variant="h4" 
                        component="h2" 
                        sx={{ 
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            mb: 3,
                            fontSize: isMobile ? '1.4rem' : isTablet ? '1.6rem' : '1.8rem'
                        }}
                    >
                        データ活用ダッシュボード
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: theme.palette.text.secondary,
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.7,
                            fontSize: isMobile ? '0.95rem' : '1.1rem'
                        }}
                    >
                        高山市のAIカメラから取得した歩行者オープンデータを活用して、
                        観光地の混雑状況を可視化し、事業者の皆様の課題解決をサポートします。
                        <br />
                        あなたの目的に合わせて、最適なダッシュボードをお選びください。
                    </Typography>
                </Box>

                {/* ダッシュボード選択セクション */}
                <Grid container spacing={isMobile ? 3 : 4} justifyContent="center">
                    {/* 目的ベースダッシュボード */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            elevation={3}
                            sx={{ 
                                height: '100%',
                                borderRadius: '16px',
                                border: '2px solid rgba(74, 85, 104, 0.2)',
                                backgroundColor: '#ffffff',  // 明示的に白い背景を設定
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(74, 85, 104, 0.15)',
                                    borderColor: theme.palette.primary.main,
                                }
                            }}
                            onClick={handlePurposeClick}
                        >
                            <CardContent sx={{ p: isMobile ? 3 : 4, textAlign: 'center' }}>
                                <BusinessIcon 
                                    sx={{ 
                                        fontSize: isMobile ? '3rem' : '4rem',
                                        color: theme.palette.primary.main,
                                        mb: 2
                                    }} 
                                />
                                <Typography 
                                    variant="h5" 
                                    component="h3" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: theme.palette.primary.main,
                                        mb: 2,
                                        fontSize: isMobile ? '1.3rem' : '1.5rem'
                                    }}
                                >
                                    目的ベースダッシュボード
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: theme.palette.text.secondary,
                                        mb: 3,
                                        lineHeight: 1.6,
                                        fontSize: isMobile ? '0.9rem' : '1rem'
                                    }}
                                >
                                    「店舗の定休日を検討したい」「イベントの開催日程を決めたい」など、
                                    具体的な事業目的に応じた最適な分析を提供します。
                                </Typography>
                                <Box sx={{ mb: 3 }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: theme.palette.text.primary,
                                            fontWeight: 600,
                                            mb: 1
                                        }}
                                    >
                                        こんな方におすすめ：
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        • 事業運営の意思決定をしたい方
                                        <br />
                                        • 具体的な課題を解決したい方
                                        <br />
                                        • 初めてデータ分析を利用する方
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.5,
                                        px: 3,
                                        fontSize: '1rem'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handlePurposeClick();
                                    }}
                                >
                                    目的ベースを選択
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* 機能ベースダッシュボード */}
                    <Grid item xs={12} md={6}>
                        <Card 
                            elevation={3}
                            sx={{ 
                                height: '100%',
                                borderRadius: '16px',
                                border: '2px solid rgba(85, 60, 154, 0.2)',
                                backgroundColor: '#ffffff',  // 明示的に白い背景を設定
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                '&:hover': {
                                    transform: 'translateY(-4px)',
                                    boxShadow: '0 12px 24px rgba(85, 60, 154, 0.15)',
                                    borderColor: theme.palette.secondary.main,
                                }
                            }}
                            onClick={handleFunctionClick}
                        >
                            <CardContent sx={{ p: isMobile ? 3 : 4, textAlign: 'center' }}>
                                <AnalyticsIcon 
                                    sx={{ 
                                        fontSize: isMobile ? '3rem' : '4rem',
                                        color: theme.palette.secondary.main,
                                        mb: 2
                                    }} 
                                />
                                <Typography 
                                    variant="h5" 
                                    component="h3" 
                                    sx={{ 
                                        fontWeight: 700,
                                        color: theme.palette.secondary.main,
                                        mb: 2,
                                        fontSize: isMobile ? '1.3rem' : '1.5rem'
                                    }}
                                >
                                    機能ベースダッシュボード
                                </Typography>
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        color: theme.palette.text.secondary,
                                        mb: 3,
                                        lineHeight: 1.6,
                                        fontSize: isMobile ? '0.9rem' : '1rem'
                                    }}
                                >
                                    「カレンダー形式の混雑度が見たい」「月ごとの傾向を分析したい」など、
                                    様々な分析機能とビジュアライゼーションツールを自由に活用できます。
                                </Typography>
                                <Box sx={{ mb: 3 }}>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: theme.palette.text.primary,
                                            fontWeight: 600,
                                            mb: 1
                                        }}
                                    >
                                        こんな方におすすめ：
                                    </Typography>
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: theme.palette.text.secondary,
                                            fontSize: '0.85rem'
                                        }}
                                    >
                                        • データ分析に慣れている方
                                        <br />
                                        • 多角的な分析を行いたい方
                                        <br />
                                        • 研究・調査目的で利用する方
                                    </Typography>
                                </Box>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    endIcon={<ArrowForwardIcon />}
                                    sx={{
                                        borderRadius: '8px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        py: 1.5,
                                        px: 3,
                                        fontSize: '1rem'
                                    }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleFunctionClick();
                                    }}
                                >
                                    機能ベースを選択
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>

                {/* 追加情報セクション */}
                <Box sx={{ textAlign: 'center', mt: isMobile ? 6 : 8 }}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: theme.palette.text.secondary,
                            maxWidth: '600px',
                            mx: 'auto',
                            lineHeight: 1.6
                        }}
                    >
                        このダッシュボードは、名古屋大学大学院情報学研究科
                        メディア学講座（MDG）遠藤・浦田研究室が開発・提供しています。
                        <br />
                        高山市のオープンデータを活用し、地域の事業者様の課題解決を支援することを目的としています。
                    </Typography>
                </Box>
            </Container>
        </>
    );
}

export default LandingPage;
