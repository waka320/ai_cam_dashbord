import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import { formatDateJapanese, formatDateShort, getDayOfWeekJapanese } from '../../utils/todayUtils';
import WeatherIcon from '../ui/WeatherIcon';
import PropTypes from 'prop-types';

const TodaySummary = ({ summaryData, getTodaysDate }) => {
    const { getCellColor, getTextColor } = useColorPalette();
    const isMobile = useMediaQuery('(max-width:768px)');
    
    const todaysDate = getTodaysDate();
    const recentWeekData = summaryData?.data?.recent_week_daily_summary || [];
    const todaySummary = recentWeekData.find(day => day.date === todaysDate || day.is_today);
    
    console.log('TodaySummary: Today summary check:', {
        todaysDate,
        todaySummary,
        recentWeekData: recentWeekData
    });
    
    // 今日のデータがない場合の表示
    if (!todaySummary || todaySummary.congestion_level === 0) {
        // 今日の日付情報を作成
        const today = new Date(todaysDate);
        const dayOfWeek = today.toLocaleDateString('ja-JP', { weekday: 'short' }).replace('曜日', '');
        const isWeekend = today.getDay() === 0 || today.getDay() === 6;
        
        return (
            <Box sx={{ mb: 3 }}>
                <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    gutterBottom 
                    sx={{ 
                        fontWeight: 'bold', 
                        mb: 2,
                        color: 'text.primary'
                    }}
                >
                    {formatDateJapanese(todaysDate)} の概要
                </Typography>
                
                <Box sx={{ 
                    maxWidth: '500px', 
                    border: '3px solid #1976d2', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    backgroundColor: '#fff'
                }}>
                    <Box sx={{ 
                        display: 'flex',
                        alignItems: 'center',
                        p: 2,
                        gap: 2
                    }}>
                        <Box
                            sx={{
                                width: isMobile ? '80px' : '100px',
                                height: isMobile ? '80px' : '100px',
                                backgroundColor: '#f5f5f5',
                                color: '#1976d2',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: '2px solid #1976d2',
                                borderRadius: '4px',
                                gap: '2px',
                                position: 'relative'
                            }}
                        >
                            {/* 今日ラベル */}
                            <Box 
                                sx={{ 
                                    position: 'absolute', 
                                    top: '-2px', 
                                    right: '-2px',
                                    backgroundColor: '#1976d2',
                                    color: 'white',
                                    padding: '1px 4px',
                                    borderRadius: '2px',
                                    fontSize: '0.6rem',
                                    fontWeight: 'bold'
                                }}
                            >
                                今日
                            </Box>
                            
                            <Typography 
                                sx={{
                                    fontSize: isMobile ? '12px' : '14px',
                                    lineHeight: '1',
                                    fontWeight: '500',
                                    textAlign: 'center'
                                }}
                            >
                                {formatDateShort(todaysDate)}
                            </Typography>
                            <Typography 
                                sx={{ 
                                    fontSize: isMobile ? '20px' : '24px',
                                    lineHeight: '1',
                                    fontWeight: 'bold',
                                    textAlign: 'center'
                                }}
                            >
                                今日
                            </Typography>
                        </Box>
                        
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                今日のデータ
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                {isWeekend ? "休日" : "平日"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {getDayOfWeekJapanese(dayOfWeek)}曜日
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                データはまだ利用できません
                            </Typography>
                        </Box>
                    </Box>
                </Box>
            </Box>
        );
    }
    
    const cellColor = getCellColor(todaySummary.congestion_level);
    const textColor = getTextColor(todaySummary.congestion_level);
    
    return (
        <Box sx={{ mb: 3 }}>
            <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                gutterBottom 
                sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    color: 'text.primary'
                }}
            >
                {formatDateJapanese(todaysDate)} の概要
            </Typography>
            
            <Box sx={{ 
                maxWidth: '500px', 
                border: '3px solid #1976d2', 
                borderRadius: '8px', 
                overflow: 'hidden',
                backgroundColor: '#fff'
            }}>
                <Box sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    p: 2,
                    gap: 2
                }}>
                    <Box
                        sx={{
                            width: isMobile ? '80px' : '100px',
                            height: isMobile ? '80px' : '100px',
                            backgroundColor: cellColor,
                            color: textColor,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #1976d2',
                            borderRadius: '4px',
                            gap: '2px',
                            position: 'relative'
                        }}
                    >
                        {/* 今日ラベル */}
                        <Box 
                            sx={{ 
                                position: 'absolute', 
                                top: '-2px', 
                                right: '-2px',
                                backgroundColor: '#1976d2',
                                color: 'white',
                                padding: '1px 4px',
                                borderRadius: '2px',
                                fontSize: '0.6rem',
                                fontWeight: 'bold'
                            }}
                        >
                            今日
                        </Box>
                        
                        <Typography 
                            sx={{
                                fontSize: isMobile ? '12px' : '14px',
                                lineHeight: '1',
                                fontWeight: '500',
                                textAlign: 'center'
                            }}
                        >
                            {formatDateShort(todaySummary.date)}
                        </Typography>
                        <Typography 
                            sx={{ 
                                fontSize: isMobile ? '32px' : '40px',
                                lineHeight: '1',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }}
                        >
                            {todaySummary.congestion_level}
                        </Typography>
                    </Box>
                    
                    <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                            混雑レベル {todaySummary.congestion_level}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                            {todaySummary.is_weekend ? "休日" : "平日"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {getDayOfWeekJapanese(todaySummary.day_of_week)}曜日
                        </Typography>
                        
                        {/* 天気情報の表示 */}
                        {todaySummary.weather_info && (
                            <Box sx={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: 1, 
                                mt: 1,
                                flexWrap: 'wrap'
                            }}>
                                <WeatherIcon 
                                    weather={todaySummary.weather_info.weather}
                                    size="large"
                                    showTemp={false}
                                />

                                {todaySummary.weather_info.weather && (
                                    <Typography 
                                        variant="body2" 
                                        sx={{ 
                                            color: 'text.secondary',
                                            fontSize: '0.8rem'
                                        }}
                                    >
                                        {todaySummary.weather_info.weather}
                                    </Typography>
                                )}
                            </Box>
                        )}
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

TodaySummary.propTypes = {
    summaryData: PropTypes.shape({
        data: PropTypes.shape({
            recent_week_daily_summary: PropTypes.arrayOf(PropTypes.shape({
                date: PropTypes.string.isRequired,
                congestion_level: PropTypes.number.isRequired,
                is_weekend: PropTypes.bool,
                day_of_week: PropTypes.string,
                is_today: PropTypes.bool
            }))
        })
    }),
    getTodaysDate: PropTypes.func.isRequired
};

export default TodaySummary;
