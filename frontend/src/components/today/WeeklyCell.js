import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import { formatDateShort } from '../../utils/todayUtils';
import WeatherIcon from '../ui/WeatherIcon';
import PropTypes from 'prop-types';

const WeeklyCell = ({ day, isCurrentYear = true, getTodaysDate, isCompactMode = false, isUltraCompact = false }) => {
    const { getCellColor, getTextColor } = useColorPalette();
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    // 空のセルの場合の処理
    if (day.is_empty) {
        return (
            <Box 
                sx={{ 
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#f9f9f9',
                    border: '1px solid #eee',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
            </Box>
        );
    }

    
    const todaysDate = getTodaysDate();
    const isToday = day.date === todaysDate || day.is_today;
    const hasData = day.congestion_level > 0;
    const isFuture = day.is_future || false;
    
    // 今日からの日数を計算
    const today = new Date(todaysDate);
    const currentDay = new Date(day.date);
    const daysDiff = Math.round((currentDay - today) / (1000 * 60 * 60 * 24));
    
    // 相対的な日付ラベル（今年のデータの場合のみ）
    let dateLabel = '';
    if (isCurrentYear) {
        if (isToday || daysDiff === 0) dateLabel = '今日';
        else if (daysDiff === 1) dateLabel = '明日';
        else if (daysDiff === 2) dateLabel = '明後日';
        else if (daysDiff === 3) dateLabel = '3日後';
        else if (daysDiff === 4) dateLabel = '4日後';
        else if (daysDiff === 5) dateLabel = '5日後';
        else if (daysDiff === 6) dateLabel = '6日後';
        else if (daysDiff === 7) dateLabel = '7日後';
    } 

    // 未来の日付の場合の特別表示（明日以降）
    if (isFuture && isCurrentYear && daysDiff >= 1 && daysDiff <= 7) {
        let displayText = '';
        if (daysDiff === 1) displayText = '1日後';
        else if (daysDiff === 2) displayText = '2日後';
        else displayText = `${daysDiff}日後`;
        
        const labelColor = daysDiff <= 2 ? '#4caf50' : '#9e9e9e';
        
        return (
            <Box 
                sx={{ 
                    ...cellStyle,
                    backgroundColor: '#f9f9f9',
                    color: '#333',
                    border: `1px solid #ddd`,
                    borderTop: `1px solid #ddd`,
                    borderBottom: `1px solid #ddd`
                }}
            >
                {/* メインコンテンツエリア */}
                <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0px'
                }}>
                    <Typography 
                        sx={{
                            fontSize: isUltraCompact 
                                ? (isSmallMobile ? '12px' : '14px')
                                : (isCompactMode 
                                    ? (isSmallMobile ? '14px' : '16px') 
                                    : (isSmallMobile ? '16px' : isMobile ? '18px' : '20px')),
                            lineHeight: '1',
                            fontWeight: '500',
                            textAlign: 'center',
                            mb: 0
                        }}
                    >
                        {formatDateShort(day.date)}
                    </Typography>
                    
                    <Typography 
                        sx={{ 
                            fontSize: isUltraCompact
                                ? (isSmallMobile ? '10px' : '11px')
                                : (isCompactMode
                                    ? (isSmallMobile ? '12px' : '13px')
                                    : (isSmallMobile ? '14px' : isMobile ? '16px' : '18px')),
                            lineHeight: '1',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: labelColor
                        }}
                    >
                        {displayText}
                    </Typography>
                </Box>
                
                {/* 天気情報エリア */}
                {day.weather_info && (
                    <Box sx={{
                        width: '100%',
                        height: isUltraCompact ? '12px' : (isMobile ? '16px' : '20px'),
                        backgroundColor: 'rgba(255, 255, 255, 0.75)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        padding: '1px'
                    }}>
                        <WeatherIcon 
                            weather={day.weather_info.weather}
                            size="medium"
                            showTemp={false}
                        />
                        {day.weather_info.avg_temperature && (
                            <Typography 
                                sx={{ 
                                    fontSize: isUltraCompact ? '8px' : '10px',
                                    color: '#333',
                                    fontWeight: '600',
                                    lineHeight: '1'
                                }}
                            >
                                {Math.round(day.weather_info.avg_temperature)}°
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        );
    }

    // コンパクトモードのサイズ調整（Calendar.jsスタイルでは外側コンテナが制御）



    const cellStyle = {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isUltraCompact ? '0px' : (isCompactMode ? '1px' : (isSmallMobile ? '1px' : '2px')),
        position: 'relative',
        flexShrink: 0,
        padding: isUltraCompact ? (isMobile ? '4px 0px' : '0px') : (isMobile ? '5px 1px' : '2px')
    };

    // 今日のデータがない場合の特別表示
    if (isToday && !hasData) {
        return (
            <Box 
                sx={{ 
                    ...cellStyle,
                    backgroundColor: '#f5f5f5',
                    color: '#333',
                    border: '3px solid #1976d2',
                    borderTop: '3px solid #1976d2',
                    borderBottom: '3px solid #1976d2'
                }}
            >
                {/* メインコンテンツエリア */}
                <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0px'
                }}>
                    <Typography 
                        sx={{
                            fontSize: isUltraCompact 
                                ? (isSmallMobile ? '12px' : '14px')
                                : (isCompactMode 
                                    ? (isSmallMobile ? '14px' : '16px') 
                                    : (isSmallMobile ? '16px' : isMobile ? '18px' : '20px')),
                            lineHeight: '1',
                            fontWeight: '500',
                            textAlign: 'center',
                            mb: 0
                        }}
                    >
                        {formatDateShort(day.date)}
                    </Typography>
                    
                    <Typography 
                        sx={{ 
                            fontSize: isUltraCompact
                                ? (isSmallMobile ? '10px' : '12px')
                                : (isCompactMode
                                    ? (isSmallMobile ? '12px' : '14px')
                                    : (isSmallMobile ? '14px' : isMobile ? '16px' : '18px')),
                            lineHeight: '1',
                            fontWeight: 'bold',
                            textAlign: 'center',
                            color: '#1976d2'
                        }}
                    >
                        今日
                    </Typography>
                </Box>
                
                {/* 天気情報エリア */}
                {day.weather_info && (
                    <Box sx={{
                        width: '100%',
                        height: isUltraCompact ? '12px' : (isSmallMobile ? '14px' : isMobile ? '16px' : '20px'),
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isUltraCompact ? '1px' : '2px',
                        padding: '1px',
                        mt: isUltraCompact ? '1px' : '2px'
                    }}>
                        <WeatherIcon 
                            weather={day.weather_info.weather}
                            size={isUltraCompact ? "small" : "medium"}
                            showTemp={false}
                        />

                    </Box>
                )}
            </Box>
        );
    }

    // データがない場合のスタイル（未来の日付以外）
    if (!hasData && !isFuture) {
        return (
            <Box 
                sx={{ 
                    ...cellStyle,
                    backgroundColor: '#e0e0e0',
                    color: '#666'
                }}
            >
                {/* メインコンテンツエリア */}
                <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0px'
                }}>
                    <Typography 
                        sx={{
                            fontSize: isUltraCompact 
                                ? (isSmallMobile ? '12px' : '14px')
                                : (isCompactMode 
                                    ? (isSmallMobile ? '14px' : '16px') 
                                    : (isSmallMobile ? '16px' : isMobile ? '18px' : '20px')),
                            lineHeight: '1',
                            fontWeight: '500',
                            textAlign: 'center',
                            mb: 0
                        }}
                    >
                        {formatDateShort(day.date)}
                    </Typography>
                    
                    <Typography 
                        sx={{ 
                            fontSize: isUltraCompact
                                ? (isSmallMobile ? '10px' : '12px')
                                : (isCompactMode
                                    ? (isSmallMobile ? '12px' : '14px')
                                    : (isSmallMobile ? '14px' : isMobile ? '16px' : '18px')),
                            lineHeight: '1',
                            fontWeight: 'bold',
                            textAlign: 'center'
                        }}
                    >
                        {dateLabel || '-'}
                    </Typography>
                </Box>
                
                {/* 天気情報エリア */}
                {day.weather_info && (
                    <Box sx={{
                        width: '100%',
                        height: isUltraCompact ? '12px' : (isSmallMobile ? '14px' : isMobile ? '16px' : '20px'),
                        backgroundColor: 'rgba(255, 255, 255, 0.85)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: isUltraCompact ? '1px' : '2px',
                        padding: '1px',
                        mt: isUltraCompact ? '1px' : '2px'
                    }}>
                        <WeatherIcon 
                            weather={day.weather_info.weather}
                            size={isUltraCompact ? "small" : "medium"}
                            showTemp={false}
                        />

                    </Box>
                )}
            </Box>
        );
    }
    
    // データがある場合の通常表示
    const cellColor = getCellColor(day.congestion_level);
    const textColor = getTextColor(day.congestion_level);
    
    const isRelativeLabel = Boolean(dateLabel);
    return (
        <Box 
            sx={{ 
                ...cellStyle,
                backgroundColor: cellColor,
                color: textColor
            }}
        >
            {/* メインコンテンツエリア */}
            <Box sx={{ 
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: isUltraCompact ? '0px' : '1px'
            }}>
                <Typography 
                    sx={{
                        fontSize: isUltraCompact 
                            ? (isSmallMobile ? '10px' : '12px')
                            : (isCompactMode 
                                ? (isSmallMobile ? '12px' : '14px') 
                                : (isSmallMobile ? '14px' : isMobile ? '16px' : '18px')),
                        lineHeight: '1',
                        fontWeight: '500',
                        textAlign: 'center',
                        mb: 0
                    }}
                >
                    {formatDateShort(day.date)}
                </Typography>
                
                <Typography 
                    sx={{ 
                        fontSize: isUltraCompact
                            ? (isRelativeLabel ? (isSmallMobile ? '8px' : '9px') : (isSmallMobile ? '16px' : '20px'))
                            : (isCompactMode
                                ? (isRelativeLabel ? (isSmallMobile ? '10px' : '11px') : (isSmallMobile ? '20px' : '24px'))
                                : (isRelativeLabel ? (isSmallMobile ? '12px' : '14px') : (isMobile ? (isSmallMobile ? '24px' : '28px') : '38px'))),
                        lineHeight: '1',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}
                >
                    {dateLabel || day.congestion_level}
                </Typography>
            </Box>
            
            {/* 天気情報エリア */}
            {day.weather_info && (
                <Box sx={{
                    width: '100%',
                    height: isUltraCompact ? '12px' : (isSmallMobile ? '14px' : isMobile ? '16px' : '20px'),
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0px',
                    padding: '0px',
                    mt: '0px'
                }}>
                    <WeatherIcon 
                        weather={day.weather_info.weather}
                        size={isUltraCompact ? "medium" : "large"}
                        showTemp={false}
                    />
                </Box>
            )}
        </Box>
    );
};

WeeklyCell.propTypes = {
    day: PropTypes.shape({
        date: PropTypes.string.isRequired,
        congestion_level: PropTypes.number.isRequired,
        days_from_reference: PropTypes.number,
        is_today: PropTypes.bool,
        is_future: PropTypes.bool,
        is_empty: PropTypes.bool,
        weather_info: PropTypes.shape({
            weather: PropTypes.string,
            avg_temperature: PropTypes.number,
            temperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            humidity: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })
    }).isRequired,
    isCurrentYear: PropTypes.bool,
    getTodaysDate: PropTypes.func.isRequired,
    isCompactMode: PropTypes.bool,
    isUltraCompact: PropTypes.bool
};

export default WeeklyCell;
