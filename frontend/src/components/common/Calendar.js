import React from 'react';
import { Box,Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid';

// カレンダーのデータ
const calendarData = [
    [null, null, null, null, null, { date: 1, congestion: 3 }, { date: 2, congestion: 3 }],
    [
        { date: 3, congestion: 5 },
        { date: 4, congestion: 2 },
        { date: 5, congestion: 1 },
        { date: 6, congestion: 3 },
        { date: 7, congestion: 2 },
        { date: 8, congestion: 2 },
        { date: 9, congestion: 6 },
    ],
    [
        { date: 10, congestion: 5 },
        { date: 11, congestion: 3 },
        { date: 12, congestion: 1 },
        { date: 13, congestion: 2 },
        { date: 14, congestion: 4 },
        { date: 15, congestion: 6 },
        { date: 16, congestion: 9 },
    ],
    [
        { date: 17, congestion: 8 },
        { date: 18, congestion: 5 },
        { date: 19, congestion: 6 },
        { date: 20, congestion: 3 },
        { date: 21, congestion: 4 },
        { date: 22, congestion: 5 },
        { date: 23, congestion: 7 },
    ],
];


// 混雑度に応じた背景色を取得する関数
const getCellColor = (congestion) => {
    if (congestion <= 1) return '#e0f7fa';
    if (congestion <= 3) return '#b2ebf2';
    if (congestion <= 5) return '#80deea';
    if (congestion <= 7) return '#4dd0e1';
    if (congestion <= 9) return '#26c6da';
    return '#00acc1';
};

// カレンダーコンポーネント
const CalendarHeatmap = () => {
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

    return (
        <Box sx={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {/* 曜日のヘッダー */}
            <Grid2 container sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                {daysOfWeek.map((day, index) => (
                    <Grid2 item xs={1.71} key={index} sx={{ textAlign: 'center', padding: '10px' }}>
                        <Typography variant="subtitle1" fontWeight="bold">
                            {day}
                        </Typography>
                    </Grid2>
                ))}
            </Grid2>

            {/* カレンダーのセル */}
            {calendarData.map((week, rowIndex) => (
                <Grid2 container key={rowIndex}>
                    {week.map((cell, colIndex) => (
                        <Grid2
                            item
                            xs={1.71}
                            key={colIndex}
                            sx={{
                                height: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: cell ? getCellColor(cell.congestion) : '#fff',
                                borderRight: colIndex !== 6 ? '1px solid #ddd' : undefined,
                                borderBottom: rowIndex !== calendarData.length - 1 ? '1px solid #ddd' : undefined,
                            }}
                        >
                            {cell && (
                                <>
                                    <Typography variant="body2" fontWeight="bold">
                                        {cell.date}
                                    </Typography>
                                    <Typography variant="caption">混雑度: {cell.congestion}</Typography>
                                </>
                            )}
                        </Grid2>
                    ))}
                </Grid2>
            ))}
        </Box>
    );
};

export default CalendarHeatmap;
