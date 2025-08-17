import React, { useRef } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import HourlyCell from './HourlyCell';
import { formatDateJapanese } from '../../utils/todayUtils';
import PropTypes from 'prop-types';

const HourlyDetails = ({ todayData, handleScroll }) => {
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    const yesterdayScrollRef = useRef(null);
    const lastYearScrollRef = useRef(null);
    
    if (!todayData?.data) {
        return null;
    }
    
    const yesterdayEntry = todayData.data.yesterday_hourly;
    const lastYearEntry = todayData.data.last_year_today_hourly;
    
    if (!yesterdayEntry?.data_available && !lastYearEntry?.data_available) {
        return (
            <Box sx={{ 
                textAlign: 'center', 
                py: 4,
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '1px solid #ddd'
            }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                    時間別の詳細データは利用できません
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    過去データ（上記の週間動向）をご参照ください
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            {/* 昨日のデータ */}
            {yesterdayEntry?.data_available && (
                <Box sx={{ mb: 0.5 }}>
                    <Typography 
                        variant="body1"
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 0.25,
                            color: 'text.primary',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}
                    >
                        昨日 - {formatDateJapanese(yesterdayEntry.date)}
                    </Typography>
                    
                    <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '100%',
                        height: 'fit-content',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box 
                            sx={{ 
                                overflowX: 'auto',
                                WebkitOverflowScrolling: 'touch',
                                height: 'auto',
                                flex: 'none',
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
                            ref={yesterdayScrollRef}
                            onScroll={() => handleScroll(yesterdayScrollRef, [lastYearScrollRef])}
                        >
                            {/* 時間帯ヘッダー */}
                            <Box sx={{ 
                                display: 'flex',
                                backgroundColor: '#f5f5f5',
                                borderBottom: '1px solid #ddd',
                                width: 'fit-content',
                                minWidth: '100%',
                                flex: 'none'
                            }}>
                                {yesterdayEntry.hourly_congestion.map((hourData, index) => (
                                    <Box 
                                        key={`hour-header-${hourData.hour}`} 
                                        sx={{ 
                                            minWidth: isMobile ? (isSmallMobile ? '32px' : '42px') : '42px',
                                            width: isMobile ? (isSmallMobile ? '32px' : '42px') : '42px',
                                            textAlign: 'center', 
                                            padding: isMobile ? '4px 2px' : '6px 2px',
                                            borderRight: index !== yesterdayEntry.hourly_congestion.length - 1 ? '1px solid #ddd' : 'none',
                                            flexShrink: 0,
                                            height: isMobile ? (isSmallMobile ? '34px' : '38px') : '38px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography 
                                            variant={isSmallMobile ? "bodyS" : "bodyM"}
                                            fontWeight="bold"
                                            sx={{
                                                fontSize: isMobile ? (isSmallMobile ? '12px' : '14px') : '16px'
                                            }}
                                        >
                                            {hourData.hour}時
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            
                            {/* データセル */}
                            <Box sx={{ 
                                display: 'flex',
                                width: 'fit-content',
                                minWidth: '100%',
                                flex: 'none',
                                height: 'auto'
                            }}>
                                {yesterdayEntry.hourly_congestion.map((hourData, index) => (
                                    <HourlyCell 
                                        key={hourData.hour}
                                        hourData={hourData} 
                                        index={index} 
                                        totalLength={yesterdayEntry.hourly_congestion.length} 
                                        isGrayCell={hourData.congestion === 0}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}
            
            {/* 去年同日のデータ */}
            {lastYearEntry?.data_available && (
                <Box sx={{ mb: 0.25 }}>
                    <Typography 
                        variant="body1"
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 0.25,
                            color: 'text.primary',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                        }}
                    >
                        去年の同じ日 - {formatDateJapanese(lastYearEntry.date)}
                    </Typography>
                    
                    <Box sx={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '8px', 
                        overflow: 'hidden',
                        width: '100%',
                        maxWidth: '100%',
                        height: 'fit-content',
                        display: 'flex',
                        flexDirection: 'column'
                    }}>
                        <Box 
                            sx={{ 
                                overflowX: 'auto',
                                WebkitOverflowScrolling: 'touch',
                                height: 'auto',
                                flex: 'none',
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
                            ref={lastYearScrollRef}
                            onScroll={() => handleScroll(lastYearScrollRef, [yesterdayScrollRef])}
                        >
                            {/* 時間帯ヘッダー */}
                            <Box sx={{ 
                                display: 'flex',
                                backgroundColor: '#f5f5f5',
                                borderBottom: '1px solid #ddd',
                                width: 'fit-content',
                                minWidth: '100%',
                                flex: 'none'
                            }}>
                                {lastYearEntry.hourly_congestion.map((hourData, index) => (
                                    <Box 
                                        key={`hour-header-${hourData.hour}`} 
                                        sx={{ 
                                            minWidth: isMobile ? (isSmallMobile ? '32px' : '42px') : '42px',
                                            width: isMobile ? (isSmallMobile ? '32px' : '42px') : '42px',
                                            textAlign: 'center', 
                                            padding: isMobile ? '4px 2px' : '6px 2px',
                                            borderRight: index !== lastYearEntry.hourly_congestion.length - 1 ? '1px solid #ddd' : 'none',
                                            flexShrink: 0,
                                            height: isMobile ? (isSmallMobile ? '34px' : '38px') : '38px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography 
                                            variant={isSmallMobile ? "bodyS" : "bodyM"}
                                            fontWeight="bold"
                                            sx={{
                                                fontSize: isMobile ? (isSmallMobile ? '12px' : '14px') : '16px'
                                            }}
                                        >
                                            {hourData.hour}時
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            
                            {/* データセル */}
                            <Box sx={{ 
                                display: 'flex',
                                width: 'fit-content',
                                minWidth: '100%',
                                flex: 'none',
                                height: 'auto'
                            }}>
                                {lastYearEntry.hourly_congestion.map((hourData, index) => (
                                    <HourlyCell 
                                        key={hourData.hour}
                                        hourData={hourData} 
                                        index={index} 
                                        totalLength={lastYearEntry.hourly_congestion.length} 
                                        isGrayCell={hourData.congestion === 0}
                                    />
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

HourlyDetails.propTypes = {
    todayData: PropTypes.shape({
        data: PropTypes.shape({
            yesterday_hourly: PropTypes.shape({
                data_available: PropTypes.bool,
                date: PropTypes.string,
                hourly_congestion: PropTypes.arrayOf(PropTypes.object)
            }),
            last_year_today_hourly: PropTypes.shape({
                data_available: PropTypes.bool,
                date: PropTypes.string,
                hourly_congestion: PropTypes.arrayOf(PropTypes.object)
            })
        })
    }),
    handleScroll: PropTypes.func.isRequired
};

export default HourlyDetails;
