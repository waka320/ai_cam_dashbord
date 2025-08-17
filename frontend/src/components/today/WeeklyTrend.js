import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import WeeklyCell from './WeeklyCell';

import PropTypes from 'prop-types';



const WeeklyTrend = ({ summaryData, getTodaysDate, isHistorical = false, isCompact = false }) => {
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    // 今日から前後2週間の7×2グリッドに調整する関数
    const adjustToTwoWeekGrid = (data, referenceDate) => {
        if (!data || data.length === 0) return [];
        
        const today = new Date(referenceDate);
        
        // 今日を含む2週間のデータを抽出（今日から前1週間 + 今日から後1週間）
        const twoWeeksData = [];
        
        // 今日から1週間前の日曜日を計算
        const todayDayOfWeek = today.getDay(); // 0=日曜日
        const startDate = new Date(today);
        startDate.setDate(today.getDate() - todayDayOfWeek - 7); // 1週間前の日曜日
        
        // 2週間分（14日）のデータを作成
        for (let i = 0; i < 14; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            const dateStr = currentDate.toISOString().split('T')[0];
            
            // 該当する日付のデータを検索
            const dayData = data.find(d => d.date === dateStr);
            
            if (dayData) {
                twoWeeksData.push(dayData);
            } else {
                // データがない場合は空のセルを作成
                twoWeeksData.push({
                    date: dateStr,
                    congestion_level: 0,
                    is_empty: true,
                    weather_info: null,
                    is_today: dateStr === referenceDate,
                    is_future: currentDate > today
                });
            }
        }
        
        return twoWeeksData;
    };
    
    // バックエンドから送られてくるデータ構造に合わせて修正
    const recentWeekData = summaryData?.data?.recent_week_daily_summary || [];
    const historicalData = summaryData?.data?.historical_daily_summary || [];
    
    // 詳細データから取得する場合の予備対応
    const extendedWeekData = summaryData?.data?.extended_week?.daily_data || [];
    const historicalDetailData = summaryData?.data?.historical_comparison?.daily_data || [];
    
    const weeksCount = summaryData?.data?.weeks_count || 3;
    
    const title = isHistorical 
        ? "去年" : "今年";
    
    // 表示するデータを決定（フォールバック対応）
    let displayData = [];
    if (isHistorical) {
        if (!summaryData?.data?.historical_data_available) {
            return (
                <Box sx={{ mb: 2 }}>
                    <Typography 
                        variant={isMobile ? "subtitle2" : "h6"} 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 0.3,
                            color: 'text.primary'
                        }}
                    >
                        {title}
                    </Typography>
                    
                    <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        backgroundColor: '#fff',
                        p: 2,
                        textAlign: 'center'
                    }}>
                        <Typography variant="body2" color="text.secondary">
                            去年のデータは利用できません
                        </Typography>
                    </Box>
                </Box>
            );
        }
        
        displayData = historicalData.length > 0 ? historicalData : historicalDetailData;
    } else {
        if (recentWeekData.length > 0) {
            displayData = recentWeekData;
        } else if (extendedWeekData.length > 0) {
            displayData = extendedWeekData.map(day => ({
                ...day,
                is_future: day.is_future || false
            }));
        }
    }
    
    // 今日から前後2週間の7×2グリッドに調整
    const todaysDate = getTodaysDate();
    // 去年データの場合は去年の今日を基準にする
    const referenceDate = isHistorical 
        ? new Date(new Date(todaysDate).setFullYear(new Date(todaysDate).getFullYear() - 1)).toISOString().split('T')[0]
        : todaysDate;
    const adjustedData = adjustToTwoWeekGrid(displayData, referenceDate);
    
    // 調整後のデータを使用
    const dailyData = adjustedData;
    
    console.log('WeeklyTrend debug:', {
        isHistorical,
        recentWeekData: recentWeekData,
        historicalData: historicalData,
        weeksCount: weeksCount,
        recentWeekLength: recentWeekData.length,
        historicalLength: historicalData.length,
        adjustedDataLength: dailyData.length,
        referenceDate: referenceDate
    });
        
    if (dailyData.length === 0) {
        return (
            <Box>
                <Typography 
                    variant={isMobile ? "subtitle2" : "h6"} 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 0.5,
                        color: 'text.primary'
                    }}
                >
                    {title}
                </Typography>
                
                <Box sx={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    backgroundColor: '#fff',
                    p: 2,
                    textAlign: 'center'
                }}>
                    <Typography variant="body2" color="text.secondary">
                        最近の週間データはまだ利用できません
                    </Typography>
                </Box>
            </Box>
        );
    }

    // 曜日ごとにグループ化してセクション表示（7×2グリッド）
    const groupedByWeek = [];
    for (let i = 0; i < dailyData.length; i += 7) {
        groupedByWeek.push(dailyData.slice(i, i + 7));
    }

    return (
        <Box>
            {!isCompact && (
                <Typography 
                    variant={isMobile ? "subtitle2" : "h6"} 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 0.5,
                        color: 'text.primary'
                    }}
                >
                    {title}
                </Typography>
            )}
            <Box sx={{ 
                maxWidth: isCompact ? '100%' : '800px', 
                margin: '0 auto', 
                border: '1px solid #ddd', 
                borderRadius: '8px', 
                overflow: 'hidden',
                width: '100%',
                position: 'relative'
            }}>
                {/* 曜日のヘッダー（日曜日始まり固定） */}
                <Box sx={{ 
                    display: 'flex', 
                    backgroundColor: '#f5f5f5', 
                    borderBottom: '1px solid #ddd'
                }}>
                    {['日', '月', '火', '水', '木', '金', '土'].map((dayName, index) => (
                        <Box key={index} sx={{ 
                            flex: 1, 
                            textAlign: 'center', 
                            padding: isCompact ? '1px' : (isMobile ? '1px' : '4px')
                        }}>
                            <Typography 
                                variant={isSmallMobile ? "bodyS" : "bodyM"} 
                                fontWeight="bold"
                                sx={{ 
                                    fontSize: isCompact 
                                        ? (isMobile ? '10px' : '12px') 
                                        : (isMobile ? '12px' : '14px')
                                }}
                            >
                                {dayName}
                            </Typography>
                        </Box>
                    ))}
                </Box>

                {/* 週単位でデータを表示（Calendar.jsスタイル） */}
                {groupedByWeek.map((week, rowIndex) => (
                    <Box key={rowIndex} sx={{ display: 'flex' }}>
                        {week.map((day, colIndex) => {
                            return (
                                <Box
                                    key={colIndex}
                                    sx={{
                                        flex: 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRight: colIndex !== 6 ? '1px solid #ddd' : undefined,
                                        borderBottom: rowIndex !== groupedByWeek.length - 1 ? '1px solid #ddd' : undefined,
                                        position: 'relative',
                                        cursor: 'default',
                                        height: isCompact 
                                            ? (isMobile ? (isSmallMobile ? '45px' : '50px') : '70px')
                                            : (isMobile ? (isSmallMobile ? '50px' : '55px') : '90px'),
                                        minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '50px',
                                    }}
                                >
                                    <WeeklyCell 
                                        day={day} 
                                        isCurrentYear={!isHistorical}
                                        getTodaysDate={getTodaysDate}
                                        isCompactMode={true}
                                        isUltraCompact={isCompact}
                                    />
                                </Box>
                            );
                        })}
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

WeeklyTrend.propTypes = {
    summaryData: PropTypes.shape({
        data: PropTypes.shape({
            recent_week_daily_summary: PropTypes.arrayOf(PropTypes.object),
            historical_daily_summary: PropTypes.arrayOf(PropTypes.object),
            historical_data_available: PropTypes.bool,
            historical_reference_date: PropTypes.string,
            weeks_count: PropTypes.number,
            extended_week: PropTypes.shape({
                daily_data: PropTypes.arrayOf(PropTypes.object)
            }),
            historical_comparison: PropTypes.shape({
                daily_data: PropTypes.arrayOf(PropTypes.object)
            })
        })
    }),
    getTodaysDate: PropTypes.func.isRequired,
    isHistorical: PropTypes.bool,
    isCompact: PropTypes.bool
};

export default WeeklyTrend;
