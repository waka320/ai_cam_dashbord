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
        混雑度の凡例（上：混雑度、下：日付）:
      </Typography>
      <Box sx={{ 
        display: 'flex', 
        flexWrap: 'wrap', 
        gap: 0.5,
        justifyContent: isMobile ? 'center' : 'flex-start',
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
                position: 'relative'
              }}
            >
              {/* 混雑度を大きく表示 */}
              <Box
                sx={{
                  fontSize: isSmallMobile ? '14px' : isMobile ? '16px' : '20px',
                  fontWeight: 'bold',
                  lineHeight: '1'
                }}
              >
                {level}
              </Box>
              {/* サンプル日付を小さく表示（月/日形式） */}
              <Box
                sx={{
                  fontSize: isSmallMobile ? '8px' : '10px',
                  lineHeight: '1',
                  marginTop: '2px',
                  opacity: 0.8
                }}
              >
                {`月/日`}
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
        ml: isMobile ? 0 : 0.5,
        justifyContent: isMobile ? 'center' : 'flex-start'
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
            justifyContent: 'center'
          }}
        >
          {/* ダッシュ表示 */}
          <Box
            sx={{
              fontSize: isSmallMobile ? '14px' : isMobile ? '16px' : '20px',
              fontWeight: 'bold',
              lineHeight: '1',
              color: '#666'
            }}
          >
            -
          </Box>
          {/* サンプル日付（月/日形式） */}
          <Box
            sx={{
              fontSize: isSmallMobile ? '8px' : '10px',
              lineHeight: '1',
              marginTop: '2px',
              opacity: 0.8,
              color: '#666'
            }}
          >
            6/1
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
