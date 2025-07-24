import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import PropTypes from 'prop-types';

const HourlyCell = ({ hourData, index, totalLength, isGrayCell = false }) => {
    const { getCellColor, getTextColor } = useColorPalette();
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    const cellColor = isGrayCell ? '#e0e0e0' : getCellColor(hourData.congestion);
    const textColor = isGrayCell ? '#666' : getTextColor(hourData.congestion);
    
    return (
        <Box
            sx={{
                minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                height: isMobile ? (isSmallMobile ? '40px' : '45px') : '45px',
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
            <Typography 
                sx={{ 
                    fontSize: isMobile ? (isSmallMobile ? '16px' : '18px') : '20px',
                    lineHeight: '1',
                    fontWeight: 'bold',
                    textAlign: 'center'
                }}
            >
                {hourData.congestion === 0 ? '-' : hourData.congestion}
            </Typography>
            
            {/* 天気情報を下部に表示 */}
            {hourData.weather_info && hourData.weather_info.weather && hourData.weather_info.weather !== '-' && (
                <Typography 
                    sx={{ 
                        fontSize: '8px',
                        lineHeight: '1',
                        position: 'absolute',
                        bottom: '2px',
                        textAlign: 'center',
                        opacity: 0.8
                    }}
                >
                    {hourData.weather_info.weather}
                </Typography>
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
