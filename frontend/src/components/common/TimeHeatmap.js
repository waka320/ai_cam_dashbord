import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import CongestionLegend, { getCellColor } from './CongestionLegend';

// 日本語の曜日名に変換する関数
const getDayNameJa = (dayName) => {
    const dayMap = {
        'Monday': '月',
        'Tuesday': '火',
        'Wednesday': '水',
        'Thursday': '木',
        'Friday': '金',
        'Saturday': '土',
        'Sunday': '日'
    };
    return dayMap[dayName] || dayName;
};

// 時間帯別ヒートマップコンポーネント
const TimeHeatmap = () => {
    const { calendarData, selectedAction } = useCalendar();

    // calendarDataが空の場合は何も表示しない
    if (!calendarData || calendarData.length === 0) {
        return null;
    }

    // actionが"dti"または"dwe"で始まる場合のみ表示
    if (!selectedAction || !(selectedAction.startsWith('dti') || selectedAction.startsWith('dwe'))) {
        return null;
    }

    // 時間の範囲を定義（0-23時）
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // 曜日の並び順を調整（日曜始まり）
    const orderedDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const sortedData = [...calendarData].sort((a, b) => {
        return orderedDays.indexOf(a.day) - orderedDays.indexOf(b.day);
    });

    return (
        <Box sx={{ maxWidth: '800px', margin: '0 auto', mt: 4 }}>
            <Typography variant="h6" gutterBottom>
                時間帯別混雑度
            </Typography>
            
            <Paper elevation={2} sx={{ p: 2, borderRadius: '8px' }}>
                {/* 全体コンテナ */}
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                    {/* 時間帯のヘッダー行 */}
                    <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                        {/* 空のセル（左上角） */}
                        <Box sx={{ 
                            width: '50px', 
                            borderBottom: '1px solid #ddd',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                        </Box>
                        
                        {/* 時間帯ヘッダー */}
                        <Box sx={{ 
                            display: 'flex', 
                            flex: 1,
                            borderBottom: '1px solid #ddd'
                        }}>
                            {hours.map(hour => (
                                <Box 
                                    key={`hour-${hour}`} 
                                    sx={{ 
                                        flex: 1,
                                        textAlign: 'center', 
                                        borderRight: hour !== 23 ? '1px solid #ddd' : 'none',
                                        padding: '4px 0'
                                    }}
                                >
                                    <Typography variant="bodyS">
                                        {hour}
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Box>

                    {/* 曜日ごとの行 */}
                    {sortedData.map((dayData, index) => (
                        <Box 
                            key={`day-${index}`} 
                            sx={{ 
                                display: 'flex', 
                                flexDirection: 'row',
                                borderBottom: index !== sortedData.length - 1 ? '1px solid #ddd' : 'none' 
                            }}
                        >
                            {/* 曜日ラベル */}
                            <Box sx={{ 
                                width: '50px', 
                                borderRight: '1px solid #ddd',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: '4px 0'
                            }}>
                                <Typography variant="bodyM" fontWeight="bold">
                                    {getDayNameJa(dayData.day)}
                                </Typography>
                            </Box>
                            
                            {/* 時間ごとのセル */}
                            <Box sx={{ display: 'flex', flex: 1 }}>
                                {hours.map(hour => {
                                    const hourData = dayData.hours.find(h => h.hour === hour);
                                    const congestion = hourData ? hourData.congestion : 0;
                                    
                                    return (
                                        <Box 
                                            key={`${dayData.day}-${hour}`} 
                                            sx={{ 
                                                flex: 1,
                                                height: '48px',
                                                backgroundColor: getCellColor(congestion),
                                                color: congestion >= 8 ? 'white' : 'inherit',
                                                borderRight: hour !== 23 ? '1px solid #ddd' : 'none',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '4px'
                                            }}
                                        >
                                            <Typography variant="bodyS" fontWeight="bold">
                                                {congestion}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    ))}
                </Box>
            </Paper>

            {/* 共通の凡例コンポーネントを使用 */}
            <CongestionLegend />
        </Box>
    );
};

export default TimeHeatmap;
