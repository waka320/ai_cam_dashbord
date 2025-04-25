import React from 'react';
import { Box, Typography } from '@mui/material';


// export const getCellColor = (congestion) => {
//     if (congestion === 1) return '#cfe4f0';
//     if (congestion === 2) return '#b3d1eb';
//     if (congestion === 3) return '#9bbfe1';
//     if (congestion === 4) return '#83add5';
//     if (congestion === 5) return '#699ecd';
//     if (congestion === 6) return '#fbcacc';
//     if (congestion === 7) return '#fa9699';
//     if (congestion === 8) return '#f97884';
//     if (congestion === 9) return '#f67a80';
//     if (congestion === 10) return '#f0545c';
//     return '#FFF';
// };

// 混雑度に応じた背景色を取得する関数
export const getCellColor = (congestion) => {
    if (congestion === 1) return '#e4f6d7';
    if (congestion === 2) return '#eff6be';
    if (congestion === 3) return '#f9f5a6';
    if (congestion === 4) return '#ffee90';
    if (congestion === 5) return '#ffd069';
    if (congestion === 6) return '#ffbd50';
    if (congestion === 7) return '#feac42';
    if (congestion === 8) return '#f98345';
    if (congestion === 9) return '#f66846';
    if (congestion === 10) return '#f25444';
    return '#FFF';
};

// // 混雑度に応じた背景色を取得する関数
// export const getCellColor = (congestion) => {
//     if (congestion === 1) return '#191970';
//     if (congestion === 2) return '#0047AB';
//     if (congestion === 3) return '#4A69BD';
//     if (congestion === 4) return '#6C8EBF';
//     if (congestion === 5) return '#B0C4DE';
//     if (congestion === 6) return '#FFB6C1';
//     if (congestion === 7) return '#FF7F7F';
//     if (congestion === 8) return '#CD5C5C';
//     if (congestion === 9) return '#B22222';
//     if (congestion === 10) return '#800000';
//     return '#FFF';
// };

// export const getCellColor = (congestion) => {
//     switch (congestion) {
//         case 10: return '#000000'; // 黒
//         case 9: return '#001433'; // 黒寄りの深い青
//         case 8: return '#002766'; // 深い青
//         case 7: return '#003A99'; // 濃い青
//         case 6: return '#004DCC'; // 鮮やかな青
//         case 5: return '#4A69BD'; // 中間青
//         case 4: return '#7F8EBE'; // 淡い青
//         case 3: return '#B0C4DE'; // 明るい青
//         case 2: return '#D0E0F0'; // 非常に淡い青
//         case 1: return '#FFFFFF'; // 白
//         default: return '#FFF'; // デフォルト（無効な値の場合）
//     }
// };

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
