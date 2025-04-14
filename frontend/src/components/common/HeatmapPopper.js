import React from 'react';
import PropTypes from 'prop-types';
import { Popper, Paper, Typography, useMediaQuery } from '@mui/material';

/**
 * ヒートマップセルクリック時に表示されるポップアップコンポーネント
 */
const HeatmapPopper = ({ open, anchorEl, text }) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');
  
  return (
    <Popper 
      open={open} 
      anchorEl={anchorEl}
      placement={isMobile ? "bottom" : "top"}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, isMobile ? 5 : 10],
          },
        },
        {
          name: 'preventOverflow',
          enabled: true,
          options: {
            boundary: document.body,
          },
        },
      ]}
      sx={{ zIndex: 1500 }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: isMobile ? 1.5 : 2, 
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          border: '1px solid #ddd',
          maxWidth: isMobile ? '180px' : '200px',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
          fontSize: isMobile ? (isSmallMobile ? '12px' : '14px') : undefined
        }}
      >
        <Typography variant={isMobile ? "bodyS" : "bodyM"} fontWeight="bold">
          {text}
        </Typography>
      </Paper>
    </Popper>
  );
};
HeatmapPopper.propTypes = {
  open: PropTypes.bool.isRequired,
  anchorEl: PropTypes.object,
  text: PropTypes.string.isRequired
};

export default HeatmapPopper;
