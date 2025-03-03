import React from 'react';
import { Box, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid';
import theme from '../../theme/theme';
import { useCalendar } from '../../contexts/CalendarContext';

// カレンダーのデータ
// const calendarData = [
//     [null, null, null, null, null, { date: 1, congestion: 3 }, { date: 2, congestion: 3 }],
//     [
//         { date: 3, congestion: 5 },
//         { date: 4, congestion: 2 },
//         { date: 5, congestion: 1 },
//         { date: 6, congestion: 3 },
//         { date: 7, congestion: 2 },
//         { date: 8, congestion: 2 },
//         { date: 9, congestion: 6 },
//     ],
//     [
//         { date: 10, congestion: 5 },
//         { date: 11, congestion: 3 },
//         { date: 12, congestion: 1 },
//         { date: 13, congestion: 2 },
//         { date: 14, congestion: 4 },
//         { date: 15, congestion: 6 },
//         { date: 16, congestion: 9 },
//     ],
//     [
//         { date: 17, congestion: 8 },
//         { date: 18, congestion: 5 },
//         { date: 19, congestion: 6 },
//         { date: 20, congestion: 3 },
//         { date: 21, congestion: 4 },
//         { date: 22, congestion: 5 },
//         { date: 23, congestion: 7 },
//     ],
//     [
//         { date: 24, congestion: 8 },
//         { date: 25, congestion: 6 },
//         { date: 26, congestion: 4 },
//         { date: 27, congestion: 6 },
//         { date: 28, congestion: 7 },
//         { date: 29, congestion: 8 },
//         { date: 30, congestion: 10 },
//     ],
//     [
//         { date: 31, congestion: 9 },
//         null,
//         null,
//         null,
//         null,
//         null,
//         null,
//     ],
// ];


// 混雑度に応じた背景色を取得する関数
const getCellColor = (congestion) => {
    if (congestion == 2) return '#B3E5FC';
    if (congestion == 3) return '#64B5F6';
    if (congestion == 4) return '#B0E67E';
    if (congestion == 5) return '#FFEB3B';
    if (congestion == 6) return '#FFC107';
    if (congestion == 7) return '#FF9800';
    if (congestion == 8) return '#FF5722';
    if (congestion == 9) return '#F13900';
    if (congestion == 10) return '#CA3000';
    return '#FFF';
};

// カレンダーコンポーネント
const CalendarHeatmap = () => {
    const { calendarData } = useCalendar();
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

    // calendarDataが空の場合は何も表示しない
    if (!calendarData || calendarData.length === 0) {
        return null;
    }

    return (
        <Box sx={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {/* 曜日のヘッダー */}
            <Grid2 container sx={{ backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                {daysOfWeek.map((day, index) => (
                    <Grid2 item xs={1.71} key={index} sx={{ textAlign: 'center', padding: '10px' }}>
                        <Typography variant="bodyM" fontWeight="bold">
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

                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: cell ? getCellColor(cell.congestion) : '#fff',
                                color: cell && cell.congestion >= 8 ? theme.palette.text.white : 'inherit',
                                borderRight: colIndex !== 6 ? '1px solid #ddd' : undefined,
                                borderBottom: rowIndex !== calendarData.length - 1 ? '1px solid #ddd' : undefined,
                            }}
                        >
                            {cell && (
                                <Box sx={{ textAlign: 'center', padding: '10px' }}>
                                    <Typography variant="h3" sx={{ margin: '0px' }}>
                                        {cell.date}
                                    </Typography>
                                    <Typography variant="bodyM">混雑度: {cell.congestion}</Typography>
                                </Box>
                            )}
                        </Grid2>
                    ))}
                </Grid2>
            ))}
        </Box>
    );
};

export default CalendarHeatmap;
