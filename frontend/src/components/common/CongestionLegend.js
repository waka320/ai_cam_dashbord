import React from 'react';
import { Box, Typography } from '@mui/material';

// 混雑度に応じた背景色を取得する関数
export const getCellColor = (congestion) => {
    if (congestion === 1) return '#FFF';
    if (congestion === 2) return '#E2F4FD';
    if (congestion === 3) return '#C9ECFD';
    if (congestion === 4) return '#FAEA79';
    if (congestion === 5) return '#FCE93A';
    if (congestion === 6) return '#FFC008';
    if (congestion === 7) return '#F0934A';
    if (congestion === 8) return '#EB6441';
    if (congestion === 9) return '#EA4035';
    if (congestion === 10) return '#D32D1F';
    return '#FFF';
};

// 混雑度の凡例コンポーネント
const CongestionLegend = () => {
    return (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Typography variant="bodyS" mr={1}>混雑度:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(level => (
                    <Box 
                        key={`legend-${level}`}
                        sx={{ 
                            width: '24px', 
                            height: '24px', 
                            backgroundColor: getCellColor(level),
                            color: level >= 8 ? 'white' : 'inherit',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mr: 0.5,
                            mb: 0.5,
                            border: '1px solid #ddd'
                        }}
                    >
                        <Typography variant="bodyXS">{level}</Typography>
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default CongestionLegend;
