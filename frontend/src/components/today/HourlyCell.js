import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import WeatherIcon from '../ui/WeatherIcon';
import PropTypes from 'prop-types';

const HourlyCell = ({ hourData, index, totalLength, isGrayCell = false }) => {
    const { getCellColor, getTextColor } = useColorPalette();
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    const cellColor = isGrayCell ? '#e0e0e0' : getCellColor(hourData.congestion);
    const textColor = isGrayCell ? '#666' : getTextColor(hourData.congestion);
    
    // セルの高さを低く設定
    const cellHeight = isMobile ? (isSmallMobile ? 36 : 40) : 44;
    
    return (
        <Box
            sx={{
                minWidth: isMobile ? (isSmallMobile ? '32px' : '42px') : '42px',
                width: isMobile ? (isSmallMobile ? '32px' : '42px') : '42px',
                height: `${cellHeight}px`,
                backgroundColor: cellColor,
                color: textColor,
                borderRight: index !== totalLength - 1 ? '1px solid #ddd' : 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative'
            }}
        >
            {/* メインコンテンツエリア */}
            <Box sx={{ 
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                <Typography 
                    sx={{ 
                        fontSize: isMobile ? (isSmallMobile ? '18px' : '20px') : '22px',
                        lineHeight: '1',
                        fontWeight: 'bold',
                        textAlign: 'center'
                    }}
                >
                    {hourData.congestion === 0 ? '-' : hourData.congestion}
                </Typography>
            </Box>
            
            {/* 天気情報エリア（右上に配置） */}
            {hourData.weather_info && hourData.weather_info.weather && hourData.weather_info.weather !== '-' && (
                <Box sx={{
                    position: 'absolute',
                    top: '1px',
                    right: '1px',
                    width: isSmallMobile ? '12px' : isMobile ? '14px' : '16px',
                    height: isSmallMobile ? '12px' : isMobile ? '14px' : '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                }}>
                    <WeatherIcon 
                        weather={hourData.weather_info.weather}
                        size="small"
                        showTemp={false}
                    />
                </Box>
            )}
        </Box>
    );
};

HourlyCell.propTypes = {
    hourData: PropTypes.shape({
        hour: PropTypes.number.isRequired,
        congestion: PropTypes.number.isRequired,
        count: PropTypes.number,
        weather_info: PropTypes.shape({
            weather: PropTypes.string,
            temperature: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
            humidity: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
        })
    }).isRequired,
    index: PropTypes.number.isRequired,
    totalLength: PropTypes.number.isRequired,
    isGrayCell: PropTypes.bool
};

export default HourlyCell;
