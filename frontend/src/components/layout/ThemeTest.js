import React from 'react';
import { Box, Typography, Button, useMediaQuery } from '@mui/material';
import theme from '../../theme/theme';

function ThemeTest() {
    const isMobile = useMediaQuery('(max-width:768px)');

    return (
        <Box sx={{ 
            backgroundColor: theme.palette.background.default, 
            padding: isMobile ? '12px' : '20px'
        }}>
            {/* カラーパレットの確認 */}
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ marginBottom: '16px', color: theme.palette.text.primary }}>
                カラーパレット確認
            </Typography>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'row' : 'row',
                flexWrap: 'wrap',
                gap: '16px', 
                marginBottom: '32px',
                overflowX: isMobile ? 'auto' : 'visible',
                pb: isMobile ? 1 : 0,
                '::-webkit-scrollbar': {
                    height: '4px',
                },
                '::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                },
                '::-webkit-scrollbar-thumb': {
                    background: '#888',
                    borderRadius: '4px',
                },
            }}>
                {Object.entries(theme.palette).map(([key, value]) => (
                    typeof value === 'object' && value.main ? (
                        <Box key={key} sx={{ 
                            textAlign: 'center',
                            minWidth: isMobile ? '80px' : '100px',
                        }}>
                            <Box
                                sx={{
                                    width: isMobile ? '80px' : '100px',
                                    height: '50px',
                                    backgroundColor: value.main,
                                    borderRadius: '4px',
                                }}
                            />
                            <Typography variant={isMobile ? "bodyS" : "bodyM"} sx={{ marginTop: '8px' }}>
                                {key}
                            </Typography>
                            <Typography 
                                variant={isMobile ? "bodyS" : "bodyM"} 
                                sx={{ 
                                    color: theme.palette.text.secondary,
                                    fontSize: isMobile ? '10px' : 'inherit'
                                }}
                            >
                                {value.main}
                            </Typography>
                        </Box>
                    ) : null
                ))}
            </Box>

            <Box sx={{ backgroundColor: theme.palette.background.default, padding: isMobile ? '12px' : '20px' }}>
                {/* 見出しの確認 */}
                <Typography variant="h1" sx={{ color: theme.palette.primary.main }}>見出し L (h1)</Typography>
                <Typography variant="h2" sx={{ color: theme.palette.secondary.main }}>見出し M (h2)</Typography>
                <Typography variant="h3" sx={{ color: theme.palette.tertiary.main }}>見出し S (h3)</Typography>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary }}>見出し XS (h4)</Typography>
                <Typography variant="h5" sx={{ color: theme.palette.text.secondary }}>見出し XXS (h5)</Typography>

                {/* 本文スタイルの確認 */}
                <Typography variant="bodyLL" sx={{ color: theme.palette.text.primary }}>
                    本文 LLサイズ - テキスト例
                </Typography>
                <Typography variant="bodyL" sx={{ color: theme.palette.text.secondary }}>
                    本文 XLサイズ - テキスト例
                </Typography>

                {/* ラベルスタイルの確認 */}
                <Typography variant="labelL" sx={{ color: theme.palette.text.link }}>
                    ラベル L - テキスト例
                </Typography>
            </Box>

            {/* ボタンスタイルの確認 */}
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ marginTop: '32px', marginBottom: '16px', color: theme.palette.text.primary }}>
                ボタンスタイル確認
            </Typography>
            <Box sx={{ 
                display: 'flex', 
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? 2 : 1
            }}>
                <Button
                    variant="contained"
                    sx={{
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.text.white,
                        fontSize: theme.typography.button.fontSize,
                        fontWeight: theme.typography.button.fontWeight,
                        marginRight: isMobile ? 0 : '10px',
                        width: isMobile ? '100%' : 'auto',
                    }}
                >
                    プライマリボタン
                </Button>
                <Button
                    variant="outlined"
                    sx={{
                        borderColor: theme.palette.secondary.main,
                        color: theme.palette.secondary.main,
                        fontSize: theme.typography.button.fontSize,
                        fontWeight: theme.typography.button.fontWeight,
                        width: isMobile ? '100%' : 'auto',
                    }}
                >
                    セカンダリボタン
                </Button>
            </Box>
        </Box>
    );
}

export default ThemeTest;
