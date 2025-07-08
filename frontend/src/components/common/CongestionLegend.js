// src/components/heatmap/CongestionLegend.js
import React from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useColorPalette } from '../../contexts/ColorPaletteContext';

const CongestionLegend = () => {
  const { getCellColor, getTextColor } = useColorPalette(); // getTextColorを追加
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
        混雑度の凡例（上：日付、下：混雑度）:
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 0.5,
        justifyContent: 'flex-start',
        mb: 1.5
      }}>
        {[...Array(10)].map((_, i) => {
          const level = i + 1;
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
              {/* 日付を上に中央揃えで表示 */}
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
              
              {/* 混雑度を下に中央揃えで表示 */}
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
            </Box>
          );
        })}
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
        </Box>
        <Typography 
          variant={isSmallMobile ? "bodyS" : "bodyS"} 
          color="text.secondary"
        >
          データなし
        </Typography>
      </Box>
    </Box>
  );
};

export default CongestionLegend;
