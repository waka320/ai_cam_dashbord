import React from 'react';
import { Box, Typography } from '@mui/material';
import theme from '../../theme/theme';
import { useCalendar } from '../../contexts/CalendarContext';

// 混雑度に応じた背景色を取得する関数
const getCellColor = (congestion) => {
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

// カレンダーコンポーネント
const CalendarHeatmap = () => {
    const { calendarData } = useCalendar();
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

    // calendarDataが空の場合は何も表示しない
    if (!calendarData || calendarData.length === 0) {
        return null;
    }
    console.log(calendarData)

    return (
        <Box sx={{ maxWidth: '800px', margin: '0 auto', border: '1px solid #ddd', borderRadius: '8px', overflow: 'hidden' }}>
            {/* 曜日のヘッダー */}
            <Box sx={{ display: 'flex', backgroundColor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
                {daysOfWeek.map((day, index) => (
                    <Box key={index} sx={{ flex: 1, textAlign: 'center', padding: '10px' }}>
                        <Typography variant="bodyM" fontWeight="bold">
                            {day}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* カレンダーのセル */}
            {calendarData.map((week, rowIndex) => (
                <Box key={rowIndex} sx={{ display: 'flex' }}>
                    {week.map((cell, colIndex) => (
                        <Box
                            key={colIndex}
                            sx={{
                                flex: 1,
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
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default CalendarHeatmap;
