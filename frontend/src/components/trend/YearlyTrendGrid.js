import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import theme from '../../theme/theme';

function YearlyTrendGrid({ data, loading, isMobile }) {
  const colorPaletteContext = useColorPalette();
  
  // コンテキストの存在チェックとデバッグ
  console.log('ColorPalette Context:', colorPaletteContext);
  
  // getColor関数の安全な取得
  const getColor = colorPaletteContext?.getColor || ((level) => {
    // フォールバック用のカラーパレット
    const fallbackColors = {
      1: '#e4f6d7',
      2: '#eff6be', 
      3: '#f9f5a6',
      4: '#ffee90',
      5: '#ffd069',
      6: '#ffbd50',
      7: '#feac42',
      8: '#f98345',
      9: '#f66846',
      10: '#f25444'
    };
    return fallbackColors[level] || '#cccccc';
  });

  // デバッグ用のコンソール出力
  console.log('YearlyTrendGrid Debug:', {
    data,
    loading,
    dataType: typeof data,
    isArray: Array.isArray(data),
    dataLength: data?.length,
    firstItem: data?.[0],
    getColorFunction: typeof getColor
  });

  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 2, p: 2 }}>
        {[...Array(5)].map((_, index) => (
          <Card key={index} sx={{ minHeight: '120px' }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={28} />
              <Skeleton variant="text" width="40%" height={20} sx={{ mt: 1 }} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 2 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  // データの存在チェックを修正
  if (!data || !Array.isArray(data) || data.length === 0) {
    console.log('YearlyTrendGrid: No data available', { data, isArray: Array.isArray(data), length: data?.length });
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        p: 3
      }}>
        <Typography variant="body1" color="text.secondary">
          年ごとのデータがありません
        </Typography>
      </Box>
    );
  }

  console.log('YearlyTrendGrid: Rendering with data:', data);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        年ごとの混雑度傾向
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: 3 
      }}>
        {data.map((yearData, index) => {
          // 混雑度レベルの安全な取得
          const congestionLevel = yearData.congestion || 1;
          const backgroundColor = getColor(congestionLevel);
          
          return (
            <Card 
              key={yearData.year || index}
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: theme.shadows[8],
                },
                border: yearData.highlighted ? `2px solid ${theme.palette.warning.main}` : 'none',
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
                    {yearData.year}年
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: 'text.secondary',
                      fontSize: '0.8rem'
                    }}
                  >
                    {yearData.total_count?.toLocaleString()}人
                  </Typography>
                </Box>

                {/* 混雑度レベル表示 */}
                <Box sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  mb: 2
                }}>
                  <Box
                    sx={{
                      width: '100%',
                      height: '60px',
                      backgroundColor: backgroundColor,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      position: 'relative',
                      overflow: 'hidden',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 25%, transparent 25%, transparent 75%, rgba(255,255,255,0.1) 75%, rgba(255,255,255,0.1))',
                        backgroundSize: '20px 20px',
                      }
                    }}
                  >
                    <Typography 
                      variant="h4" 
                      sx={{ 
                        color: 'white',
                        fontWeight: 'bold',
                        textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                        zIndex: 1
                      }}
                    >
                      {congestionLevel}
                    </Typography>
                  </Box>
                </Box>

                {/* 天気情報 */}
                {yearData.weather_info && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'grey.50', borderRadius: 2 }}>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                      年間の傾向
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                      {yearData.weather_info.weather && (
                        <Typography variant="body2">
                          主な天気: {yearData.weather_info.weather}
                        </Typography>
                      )}
                      {yearData.weather_info.avg_temperature !== undefined && (
                        <Typography variant="body2">
                          平均気温: {yearData.weather_info.avg_temperature}°C
                        </Typography>
                      )}
                    </Box>
                    {yearData.weather_info.total_rain !== undefined && (
                      <Typography variant="body2">
                        年間降水量: {yearData.weather_info.total_rain}mm
                      </Typography>
                    )}
                  </Box>
                )}

                {/* ハイライト理由 */}
                {yearData.highlighted && yearData.highlight_reason && (
                  <Box sx={{ 
                    mt: 2, 
                    p: 1.5, 
                    backgroundColor: theme.palette.warning.light + '20',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.warning.light}`
                  }}>
                    <Typography variant="caption" color="warning.dark">
                      📍 {yearData.highlight_reason}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
}

YearlyTrendGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    year: PropTypes.number.isRequired,
    congestion: PropTypes.number.isRequired,
    total_count: PropTypes.number.isRequired,
    highlighted: PropTypes.bool,
    highlight_reason: PropTypes.string,
    weather_info: PropTypes.object,
  })),
  loading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default YearlyTrendGrid;
