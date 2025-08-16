import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, CircularProgress, useMediaQuery, LinearProgress } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import { useCalendar } from '../../contexts/CalendarContext';
import AnalysisInfoButton from '../ui/AnalysisInfoButton';
import CongestionLegend from '../common/CongestionLegend';

function YearlyTrendGrid({ data, loading, isMobile }) {
  const { getCellColor, getTextColor } = useColorPalette();
  const { selectedLocation, shouldShowCalculationNote } = useCalendar();
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  // 場所名の取得（ファイル名部分のみ）
  const getPlaceName = () => {
    if (!selectedLocation) return 'default';
    const parts = selectedLocation.split('/');
    const filename = parts[parts.length - 1];
    return filename.replace('.csv', '');
  };

  if (loading) {
    return (
      <Box sx={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        mt: 2, 
        px: isMobile ? 1 : 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            年ごとの混雑度傾向
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px',
          flexDirection: 'column',
          gap: 2,
          border: '1px solid #ddd',
          borderRadius: '8px',
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
        }}>
          <CircularProgress 
            size={48}
            thickness={4}
            sx={{ color: '#383947' }}
          />
          <Typography variant="h6" color="primary" fontWeight="bold">
            データを読み込み中...
          </Typography>
          <Box sx={{ width: '300px', mt: 1 }}>
            <LinearProgress 
              variant="indeterminate"
              sx={{
                height: 4,
                borderRadius: 2,
                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                '& .MuiLinearProgress-bar': {
                  borderRadius: 2,
                  backgroundColor: '#383947',
                }
              }}
            />
          </Box>
        </Box>
      </Box>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ 
        maxWidth: '100%', 
        margin: '0 auto', 
        mt: 2, 
        px: isMobile ? 1 : 2
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            sx={{ textAlign: isMobile ? 'center' : 'left' }}
          >
            年ごとの混雑度傾向
          </Typography>
          <AnalysisInfoButton 
            analysisType="yearTrend"
            place={getPlaceName()}
          />
        </Box>
        
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '200px',
          border: '1px solid #ddd',
          borderRadius: '8px',
          p: 3
        }}>
          <Typography variant="body1" color="text.secondary">
            年ごとのデータがありません
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ 
      maxWidth: '100%', 
      margin: '0 auto', 
      mt: 2, 
      px: isMobile ? 1 : 2
    }}>
      {/* ヘッダー部分 - Calendar.jsと同じスタイル */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
        <Typography 
          variant={isMobile ? "subtitle1" : "h6"} 
          sx={{ textAlign: isMobile ? 'center' : 'left' }}
        >
          年ごとの混雑度傾向
        </Typography>
        
        <AnalysisInfoButton 
          analysisType="yearTrend"
          place={getPlaceName()}
        />
      </Box>

      {/* メインコンテナ */}
      <Box sx={{ 
        border: '1px solid #ddd', 
        borderRadius: '8px', 
        overflow: 'hidden',
        width: '100%'
      }}>
        {/* データグリッド */}
        <Box sx={{ p: isMobile ? 1 : 1.5 }}>
          <Box sx={{ 
            display: 'grid', 
            gridTemplateColumns: isMobile ? 
              (isSmallMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)') : 
              'repeat(auto-fit, minmax(140px, 1fr))', 
            gap: isMobile ? 1 : 1.5 
          }}>
            {data.map((yearData, index) => {
              const congestionLevel = yearData.congestion || 1;
              const backgroundColor = getCellColor(congestionLevel);
              const textColor = getTextColor(congestionLevel);
              
              return (
                <Box 
                  key={yearData.year || index}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    backgroundColor: congestionLevel === 0 ? '#e0e0e0' : backgroundColor,
                    borderRadius: '4px',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    overflow: 'hidden',
                    height: isMobile ? (isSmallMobile ? '70px' : '80px') : '90px',
                    position: 'relative',
                    cursor: 'default'
                  }}
                >
                  {/* メインコンテンツエリア */}
                  <Box sx={{ 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: isSmallMobile ? '4px' : '6px',
                    p: 1,
                    color: congestionLevel === 0 ? '#666' : textColor,
                  }}>
                    {/* 年表示 - Calendar.jsと同じサイズ */}
                    <Typography 
                      sx={{
                        fontSize: isSmallMobile ? '14px' : isMobile ? '16px' : '18px',
                        lineHeight: '1',
                        fontWeight: '500',
                        textAlign: 'center',
                        color: congestionLevel === 0 ? '#666' : textColor,
                      }}
                    >
                      {yearData.year}年
                    </Typography>
                    
                    {/* 混雑度表示 - Calendar.jsと同じサイズ */}
                    <Typography 
                      sx={{ 
                        fontSize: isMobile ? (isSmallMobile ? '28px' : '32px') : '36px',
                        lineHeight: '1',
                        fontWeight: 'bold',
                        textAlign: 'center',
                        color: congestionLevel === 0 ? '#666' : 'inherit',
                      }}
                    >
                      {congestionLevel === 0 ? '-' : congestionLevel}
                    </Typography>
                  </Box>

                  {/* ハイライト表示 */}
                  {yearData.highlighted && (
                    <Box sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      width: 8,
                      height: 8,
                      backgroundColor: '#ff9800',
                      borderRadius: '50%',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
                    }} />
                  )}
                </Box>
              );
            })}
          </Box>
        </Box>
      </Box>

      {/* レジェンド */}
      <Box sx={{ mt: 2 }}>
        <CongestionLegend 
          showCalculationNote={shouldShowCalculationNote()} 
          legendType="trend" 
        />
      </Box>
    </Box>
  );
}

YearlyTrendGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    year: PropTypes.number.isRequired,
    congestion: PropTypes.number.isRequired,
    total_count: PropTypes.number,
    highlighted: PropTypes.bool,
    highlight_reason: PropTypes.string,
    weather_info: PropTypes.object,
  })),
  loading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default YearlyTrendGrid;
