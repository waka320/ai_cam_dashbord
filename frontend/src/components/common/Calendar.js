import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import theme from '../../theme/theme';
import { useCalendar } from '../../contexts/CalendarContext';
import CongestionLegend, { getCellColor } from './CongestionLegend';

// カレンダーコンポーネント
const CalendarHeatmap = () => {
    const { calendarData, selectedAction, loading } = useCalendar();
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];

    // ローディング中の表示
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
            </Box>
        );
    }

    // calendarDataが空の場合は何も表示しない
    if (!calendarData || calendarData.length === 0) {
        return null;
    }

    // actionが"cal"で始まる場合のみ表示
    if (!selectedAction || !selectedAction.startsWith('cal')) {
        return null;
    }

    // データが期待する形式でない場合の処理を追加
    if (!Array.isArray(calendarData) || !calendarData.every(row => Array.isArray(row))) {
        console.error("Invalid data format for Calendar:", calendarData);
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Typography variant="body1" color="error">
                    データ形式が正しくありません。別のアクションを選択してください1。
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
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
            <CongestionLegend />
        </Box>
    );
};

export default CalendarHeatmap;
