import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import WeeklyCell from './WeeklyCell';
import { getDayOfWeekJapanese } from '../../utils/todayUtils';
import PropTypes from 'prop-types';



const WeeklyTrend = ({ summaryData, getTodaysDate, isHistorical = false, isCompact = false }) => {
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    // バックエンドから送られてくるデータ構造に合わせて修正
    const recentWeekData = summaryData?.data?.recent_week_daily_summary || [];
    const historicalData = summaryData?.data?.historical_daily_summary || [];
    
    // 詳細データから取得する場合の予備対応
    const extendedWeekData = summaryData?.data?.extended_week?.daily_data || [];
    const historicalDetailData = summaryData?.data?.historical_comparison?.daily_data || [];
    
    const weeksCount = summaryData?.data?.weeks_count || 3;
    
    console.log('WeeklyTrend debug:', {
        isHistorical,
        recentWeekData: recentWeekData,
        historicalData: historicalData,
        weeksCount: weeksCount,
        recentWeekLength: recentWeekData.length,
        historicalLength: historicalData.length,
    });
    
    const title = isHistorical 
        ? "前年" : "今年";
    
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
                            mb: 1.5,
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
                            前年のデータは利用できません
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
        
        if (displayData.length === 0) {
            return (
                <Box sx={{ mb: 2 }}>
                    <Typography 
                        variant={isMobile ? "subtitle2" : "h6"} 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 1.5,
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
    }

    // 曜日ごとにグループ化してセクション表示
    const groupedByWeek = [];
    for (let i = 0; i < displayData.length; i += 7) {
        groupedByWeek.push(displayData.slice(i, i + 7));
    }

    return (
        <Box sx={{ mb: isCompact ? 1 : 2 }}>
            {!isCompact && (
                <Typography 
                    variant={isMobile ? "subtitle2" : "h6"} 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 1.5,
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
                width: '100%'
            }}>
                {/* 曜日のヘッダー（実際のデータに基づく曜日表示） */}
                <Box sx={{ 
                    display: 'flex', 
                    backgroundColor: '#f5f5f5', 
                    borderBottom: '1px solid #ddd'
                }}>
                    {displayData.slice(0, 7).map((day, index) => (
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
                                {getDayOfWeekJapanese(day.day_of_week)}
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
                                            ? (isMobile ? (isSmallMobile ? '35px' : '40px') : '60px')
                                            : (isMobile ? (isSmallMobile ? '35px' : '40px') : '80px'),
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
