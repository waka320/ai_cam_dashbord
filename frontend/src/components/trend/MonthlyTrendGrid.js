import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Card, CardContent, Skeleton } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import theme from '../../theme/theme';

function MonthlyTrendGrid({ data, loading, isMobile }) {
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
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2, p: 2 }}>
        {[...Array(12)].map((_, index) => (
          <Card key={index} sx={{ minHeight: '100px' }}>
            <CardContent>
              <Skeleton variant="text" width="60%" height={24} />
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
          月ごとのデータがありません
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6" sx={{ mb: 3, fontWeight: 'bold' }}>
        月ごとの混雑度傾向
      </Typography>
      
      <Box sx={{ 
        display: 'grid', 
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: 2 
      }}>
        {data.map((monthData, index) => {
          const congestionLevel = monthData.congestion || 1;
          const backgroundColor = getColor(congestionLevel);
          
          return (
            <Card 
              key={monthData.month || index}
              sx={{ 
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: theme.shadows[6],
                },
                border: monthData.highlighted ? `2px solid ${theme.palette.warning.main}` : 'none',
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {monthData.month}月
                </Typography>

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

                {monthData.total_count && (
                  <Typography variant="caption" color="text.secondary">
                    {monthData.total_count.toLocaleString()}人
                  </Typography>
                )}

                {monthData.highlighted && monthData.highlight_reason && (
                  <Box sx={{ 
                    mt: 1, 
                    p: 1, 
                    backgroundColor: theme.palette.warning.light + '20',
                    borderRadius: 1,
                    border: `1px solid ${theme.palette.warning.light}`
                  }}>
                    <Typography variant="caption" color="warning.dark">
                      📍 {monthData.highlight_reason}
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

MonthlyTrendGrid.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    month: PropTypes.number.isRequired,
    congestion: PropTypes.number.isRequired,
    total_count: PropTypes.number,
    highlighted: PropTypes.bool,
    highlight_reason: PropTypes.string,
  })),
  loading: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

export default MonthlyTrendGrid;
