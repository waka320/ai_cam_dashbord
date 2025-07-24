import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import WeeklyCell from './WeeklyCell';
import { getDayOfWeekJapanese } from '../../utils/todayUtils';
import PropTypes from 'prop-types';

const WeeklyTrend = ({ summaryData, getTodaysDate, handleScroll, isHistorical = false, scrollRef }) => {
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
    
    const backgroundColor = isHistorical ? '#f0f8ff' : '#f5f5f5';
    
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
                width: '100%',
                maxWidth: '100%'
            }}>
                <Box 
                    sx={{ 
                        overflowX: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        '&::-webkit-scrollbar': {
                            height: '8px',
                            width: '8px'
                        },
                        '&::-webkit-scrollbar-track': {
                            backgroundColor: '#f1f1f1',
                            borderRadius: '4px'
                        },
                        '&::-webkit-scrollbar-thumb': {
                            backgroundColor: '#c1c1c1',
                            borderRadius: '4px'
                        }
                    }}
                    ref={scrollRef}
                    onScroll={() => handleScroll && handleScroll(scrollRef, [])}
                >
                    {/* 曜日ヘッダー（シンプル版） */}
                    <Box sx={{ 
                        display: 'flex', 
                        backgroundColor: backgroundColor, 
                        borderBottom: '1px solid #ddd',
                        width: 'fit-content',
                        minWidth: '100%'
                    }}>
                        {displayData.map((day) => (
                            <Box 
                                key={day.date}
                                sx={{ 
                                    minWidth: isMobile ? (isSmallMobile ? '50px' : '60px') : '70px',
                                    width: isMobile ? (isSmallMobile ? '50px' : '60px') : '70px',
                                    textAlign: 'center', 
                                    py: 0.5,
                                    borderRight: '1px solid #ddd',
                                    '&:last-child': { borderRight: 'none' },
                                    flexShrink: 0
                                }}
                            >
                                <Typography 
                                    variant="body2" 
                                    sx={{ 
                                        fontWeight: 'bold',
                                        fontSize: isMobile ? (isSmallMobile ? '8px' : '9px') : '10px'
                                    }}
                                >
                                    {getDayOfWeekJapanese(day.day_of_week)}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                    {/* データセル */}
                    <Box sx={{ 
                        display: 'flex',
                        width: 'fit-content',
                        minWidth: '100%'
                    }}>
                        {displayData.map((day) => (
                            <WeeklyCell 
                                key={day.date}
                                day={day} 
                                isCurrentYear={!isHistorical}
                                getTodaysDate={getTodaysDate}
                                isCompactMode={true}
                            />
                        ))}
                    </Box>
                </Box>
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
    handleScroll: PropTypes.func,
    isHistorical: PropTypes.bool,
    scrollRef: PropTypes.object
};

export default WeeklyTrend;
