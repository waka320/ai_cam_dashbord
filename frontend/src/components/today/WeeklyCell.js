import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import { formatDateShort } from '../../utils/todayUtils';
import PropTypes from 'prop-types';

const WeeklyCell = ({ day, isCurrentYear = true, getTodaysDate, isCompactMode = false }) => {
    const { getCellColor, getTextColor } = useColorPalette();
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
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
                <Typography 
                    sx={{
                        fontSize: isCompactMode 
                            ? (isSmallMobile ? '8px' : '9px') 
                            : (isSmallMobile ? '11px' : isMobile ? '13px' : '15px'),
                        lineHeight: '1',
                        fontWeight: '500',
                        textAlign: 'center',
                        mb: 0.5
                    }}
                >
                    {formatDateShort(day.date)}
                </Typography>
                
                <Typography 
                    sx={{ 
                        fontSize: isCompactMode
                            ? (isSmallMobile ? '10px' : '11px')
                            : (isSmallMobile ? '12px' : isMobile ? '14px' : '16px'),
                        lineHeight: '1',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: labelColor
                    }}
                >
                    {displayText}
                </Typography>
            </Box>
        );
    }

    // コンパクトモードのサイズ調整
    const cellWidth = isCompactMode 
        ? (isMobile ? (isSmallMobile ? '50px' : '60px') : '70px')
        : (isMobile ? (isSmallMobile ? '70px' : '85px') : '100px');
    
    const cellHeight = isCompactMode
        ? (isMobile ? (isSmallMobile ? '65px' : '75px') : '85px')
        : (isMobile ? (isSmallMobile ? '75px' : '85px') : '95px');



    const cellStyle = {
        minWidth: cellWidth,
        width: cellWidth,
        borderRight: '1px solid #ddd',
        '&:last-child': { borderRight: 'none' },
        height: cellHeight,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: isSmallMobile ? '1px' : '2px',
        position: 'relative',
        border: '1px solid #ddd',
        borderTop: '1px solid #ddd',
        borderBottom: '1px solid #ddd',
        flexShrink: 0
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
                <Typography 
                    sx={{
                        fontSize: isCompactMode 
                            ? (isSmallMobile ? '8px' : '9px') 
                            : (isSmallMobile ? '11px' : isMobile ? '13px' : '15px'),
                        lineHeight: '1',
                        fontWeight: '500',
                        textAlign: 'center',
                        mb: 0.5
                    }}
                >
                    {formatDateShort(day.date)}
                </Typography>
                
                <Typography 
                    sx={{ 
                        fontSize: isCompactMode
                            ? (isSmallMobile ? '10px' : '11px')
                            : (isSmallMobile ? '12px' : isMobile ? '14px' : '16px'),
                        lineHeight: '1',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: '#1976d2'
                    }}
                >
                    今日
                </Typography>
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
                <Typography 
                    sx={{
                        fontSize: isCompactMode 
                            ? (isSmallMobile ? '8px' : '9px') 
                            : (isSmallMobile ? '11px' : isMobile ? '13px' : '15px'),
                        lineHeight: '1',
                        fontWeight: '500',
                        textAlign: 'center',
                        mb: 0.5
                    }}
                >
                    {formatDateShort(day.date)}
                </Typography>
                
                <Typography 
                    sx={{ 
                        fontSize: isCompactMode
                            ? (isSmallMobile ? '14px' : '16px')
                            : (isSmallMobile ? '16px' : isMobile ? '20px' : '24px'),
                        lineHeight: '1',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}
                >
                    {dateLabel || '-'}
                </Typography>
            </Box>
        );
    }
    
    // データがある場合の通常表示
    const cellColor = getCellColor(day.congestion_level);
    const textColor = getTextColor(day.congestion_level);
    
    return (
        <Box 
            sx={{ 
                ...cellStyle,
                backgroundColor: cellColor,
                color: textColor
            }}
        >
            <Typography 
                sx={{
                    fontSize: isCompactMode 
                        ? (isSmallMobile ? '8px' : '9px') 
                        : (isSmallMobile ? '11px' : isMobile ? '13px' : '15px'),
                    lineHeight: '1',
                    fontWeight: '500',
                    textAlign: 'center',
                    mb: 0.5
                }}
            >
                {formatDateShort(day.date)}
            </Typography>
            
            <Typography 
                sx={{ 
                    fontSize: isCompactMode
                        ? (isSmallMobile ? '16px' : '18px')
                        : (isMobile ? (isSmallMobile ? '22px' : '26px') : '30px'),
                    lineHeight: '1',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}
            >
                {dateLabel || day.congestion_level}
            </Typography>
        </Box>
    );
};

WeeklyCell.propTypes = {
    day: PropTypes.shape({
        date: PropTypes.string.isRequired,
        congestion_level: PropTypes.number.isRequired,
        days_from_reference: PropTypes.number,
        is_today: PropTypes.bool,
        is_future: PropTypes.bool
    }).isRequired,
    isCurrentYear: PropTypes.bool,
    getTodaysDate: PropTypes.func.isRequired,
    isCompactMode: PropTypes.bool
};

export default WeeklyCell;
