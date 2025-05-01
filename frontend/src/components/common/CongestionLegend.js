// src/components/heatmap/CongestionLegend.js
import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';

const CongestionLegend = () => {
  const { getCellColor } = useColorPalette();
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

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
        混雑度の凡例:
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 0.5,
        justifyContent: isMobile ? 'center' : 'flex-start'
      }}>
        {[...Array(10)].map((_, i) => {
          const level = i + 1;
          return (
            <Box
              key={level}
              sx={{
                width: isSmallMobile ? '28px' : isMobile ? '30px' : '35px',
                height: isSmallMobile ? '28px' : isMobile ? '30px' : '35px',
                backgroundColor: getCellColor(level),
                color: level >= 7 ? '#fff' : 'inherit',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isSmallMobile ? '0.75rem' : isMobile ? '0.85rem' : '0.95rem',
                fontWeight: 'bold',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '4px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
              }}
            >
              {level}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default CongestionLegend;
