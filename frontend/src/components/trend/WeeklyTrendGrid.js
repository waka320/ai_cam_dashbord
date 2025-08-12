import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import theme from '../../theme/theme';

function WeeklyTrendGrid({ data, loading, isMobile }) {
  const colorPaletteContext = useColorPalette();
  
  // getColor関数の安全な取得
  const getColor = colorPaletteContext?.getColor || ((level) => {
    // フォールバック用のカラーパレット
    const fallbackColors = {
      1: '#e4f6d7', 2: '#eff6be', 3: '#f9f5a6', 4: '#ffee90', 5: '#ffd069',
      6: '#ffbd50', 7: '#feac42', 8: '#f98345', 9: '#f66846', 10: '#f25444'
    };
    return fallbackColors[level] || '#cccccc';
  });

  if (loading) {
    return (
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2, p: 2 }}>
        {[...Array(6)].map((_, index) => (
          <Card key={index} sx={{ minHeight: '100px' }}>
            <CardContent>
              <Skeleton variant="text" width="70%" height={24} />
              <Skeleton variant="rectangular" width="100%" height={40} sx={{ mt: 1 }} />
            </CardContent>
          </Card>
        ))}
      </Box>
    );
  }

  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '200px',
        p: 3
      }}>
        <Typography variant="body1" color="text.secondary">
          週ごとのデータがありません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        週ごとの混雑度傾向
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))', 
        gap: 2 
      }}>
        {data.map((weekData, index) => {
          const congestionLevel = weekData.congestion || 1;
          const backgroundColor = getColor(congestionLevel);
          
          return (
            <Card 
              key={weekData.week || index}
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[6],
                },
                border: weekData.highlighted ? `2px solid ${theme.palette.warning.main}` : 'none',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  第{weekData.week}週
                </Typography>

                {weekData.date_range && (
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {weekData.date_range}
                  </Typography>
                )}

                <Box
                  sx={{
                    width: '100%',
                    height: '50px',
                    backgroundColor: backgroundColor,
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 1
                  }}
                >
                  <Typography 
                    variant="h5" 
                    sx={{ 
                      color: 'white',
                      fontWeight: 'bold',
                      textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                    }}
                  >
                    {congestionLevel}
                  </Typography>
                </Box>

                {weekData.total_count && (
                  <Typography variant="caption" color="text.secondary">
                    {weekData.total_count.toLocaleString()}人
                  </Typography>
                )}

                {weekData.highlighted && weekData.highlight_reason && (
                  <Box sx={{ 
                    mt: 1, 
                    p: 1, 
                    backgroundColor: theme.palette.warning.light + '20',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.warning.light}`
                  }}>
                    <Typography variant="caption" color="warning.dark">
                      📍 {weekData.highlight_reason}
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

WeeklyTrendGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    week: PropTypes.number.isRequired,
    congestion: PropTypes.number.isRequired,
    total_count: PropTypes.number,
    date_range: PropTypes.string,
    highlighted: PropTypes.bool,
    highlight_reason: PropTypes.string,
  })),
  loading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default WeeklyTrendGrid;
