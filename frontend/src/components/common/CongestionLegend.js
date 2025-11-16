// src/components/heatmap/CongestionLegend.js
import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import { useCalendar } from '../../contexts/CalendarContext'; // 追加
import WeatherIcon from '../ui/WeatherIcon'; // 追加

const CongestionLegend = ({ showCalculationNote = false, legendType = 'calendar' }) => {
  const { getCellColor, getTextColor } = useColorPalette(); // getTextColorを追加
  const { selectedAction } = useCalendar(); // 現在のactionを取得
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  // 天気表示が必要なactionかどうかを判定
  const shouldShowWeather = selectedAction && (
    selectedAction.startsWith('cal_') || 
    selectedAction.startsWith('dti_') || 
    selectedAction.startsWith('wti_')
  );

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      mb: 3,
      mt: 2
    }}>
      <Typography 
        variant={isMobile ? "bodyM" : "bodyL"} 
        sx={{ 
          mb: 1, 
          fontWeight: 'bold',
          fontSize: isMobile ? '0.9rem' : '1rem'
        }}
      >
        {legendType === 'calendar' ? '混雑度の凡例（上：日付、下：混雑度）:' : '混雑度の凡例:'}
      </Typography>
      
      

      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 0.5,
        mb: 1.5
      }}>
        {Array.from({ length: Math.ceil(20 / 5) }, (_, rowIndex) => (
          <Box
            key={`legend-row-${rowIndex}`}
            sx={{ 
              display: 'flex', 
              gap: 0.5,
              justifyContent: 'flex-start'
            }}
          >
            {Array.from({ length: 5 }, (_, colIndex) => {
              const level = rowIndex * 5 + colIndex + 1;
              if (level > 20) return null;
              return (
                <Box
                  key={level}
                  sx={{
                    width: isSmallMobile ? '40px' : isMobile ? '45px' : '55px',
                    height: isSmallMobile ? '40px' : isMobile ? '45px' : '55px',
                    backgroundColor: getCellColor(level),
                    color: getTextColor(level),
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '4px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    gap: isSmallMobile ? '1px' : '2px'
                  }}
                >
                  {legendType === 'calendar' ? (
                    <>
                      <Box
                        sx={{
                          fontSize: isSmallMobile ? '8px' : isMobile ? '10px' : '12px',
                          lineHeight: '1',
                          fontWeight: '500',
                          textAlign: 'center'
                        }}
                      >
                        日にち
                      </Box>
                      <Box
                        sx={{
                          fontSize: isSmallMobile ? '18px' : isMobile ? '20px' : '22px',
                          fontWeight: 'bold',
                          lineHeight: '1',
                          textAlign: 'center'
                        }}
                      >
                        {level}
                      </Box>
                    </>
                  ) : (
                    <Box
                      sx={{
                        fontSize: isSmallMobile ? '16px' : isMobile ? '18px' : '20px',
                        fontWeight: 'bold',
                        lineHeight: '1',
                        textAlign: 'center'
                      }}
                    >
                      {level}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>
      
      {/* データなしの説明テキスト */}
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 1,
        ml: 0.5,
        justifyContent: 'flex-start'
      }}>
        <Box
          sx={{
            width: isSmallMobile ? '40px' : isMobile ? '45px' : '55px',
            height: isSmallMobile ? '40px' : isMobile ? '45px' : '55px',
            backgroundColor: '#e0e0e0',
            border: '1px solid rgba(0,0,0,0.1)',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isSmallMobile ? '1px' : '2px'
          }}
        >
          {legendType === 'calendar' ? (
            // カレンダー形式（日付＋ダッシュ）
            <>
              {/* 日付を上に表示 */}
              <Box
                sx={{
                  fontSize: isSmallMobile ? '8px' : isMobile ? '10px' : '12px',
                  lineHeight: '1',
                  color: '#666',
                  fontWeight: '500',
                  textAlign: 'center'
                }}
              >
                日にち
              </Box>
              
              {/* ダッシュを下に表示 */}
              <Box
                sx={{
                  fontSize: isSmallMobile ? '14px' : isMobile ? '16px' : '20px',
                  fontWeight: 'bold',
                  lineHeight: '1',
                  color: '#666',
                  textAlign: 'center'
                }}
              >
                -
              </Box>
            </>
          ) : (
            // ヒートマップ形式（ダッシュのみ）
            <Box
              sx={{
                fontSize: isSmallMobile ? '14px' : isMobile ? '16px' : '18px',
                fontWeight: 'bold',
                lineHeight: '1',
                color: '#666',
                textAlign: 'center'
              }}
            >
              -
            </Box>
          )}
        </Box>
        <Typography 
          variant={isSmallMobile ? "bodyS" : "bodyS"} 
          color="text.secondary"
        >
          データなし
        </Typography>
      </Box>
      
      {/* 計算方法の注記（必要に応じて表示） */}
      {showCalculationNote && (
        <Box sx={{ 
          mt: 1.5,
          p: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          borderRadius: '4px',
          border: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
          <Typography 
            variant="caption" 
            sx={{ 
              color: 'text.secondary',
              fontSize: isMobile ? '0.7rem' : '0.75rem',
              lineHeight: 1.3
            }}
          >
            ※ 歩行者が1人以上いる時間帯のデータのみで平均値を計算しています
          </Typography>
        </Box>
      )}
      {/* 天気情報の説明を追加（cal_、dti_、wti_のactionの場合のみ表示） */}
      {shouldShowWeather && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: 1,
          my: 1.5,
          p: 1,
          backgroundColor: 'rgba(33, 150, 243, 0.08)',
          borderRadius: '6px',
          border: '1px solid rgba(33, 150, 243, 0.2)'
        }}>
          <Typography 
            variant={isMobile ? "bodyS" : "bodyM"} 
            sx={{ 
              fontWeight: '500',
              color: 'text.primary',
              fontSize: isMobile ? '0.8rem' : '0.9rem'
            }}
          >
            天気情報: 
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WeatherIcon weather="晴れ" size="small" showTemp={false} />
            <WeatherIcon weather="曇り" size="small" showTemp={false} />
            <WeatherIcon weather="雨" size="small" showTemp={false} />
            <WeatherIcon weather="雪" size="small" showTemp={false} />
          </Box>
          <Typography 
            variant={isMobile ? "bodyS" : "bodyM"} 
            sx={{ 
              color: 'text.secondary',
              fontSize: isMobile ? '0.75rem' : '0.85rem'
            }}
          >
            各セルの下部に表示
          </Typography>
        </Box>
      )}
    </Box>
  );
};

// PropTypesの追加
CongestionLegend.propTypes = {
  showCalculationNote: PropTypes.bool,
  legendType: PropTypes.oneOf(['calendar', 'heatmap', 'trend'])
};

export default CongestionLegend;
