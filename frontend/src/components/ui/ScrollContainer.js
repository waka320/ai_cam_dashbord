import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';

/**
 * 横スクロール可能なコンテナコンポーネント
 */
const ScrollContainer = ({ children, minWidth, sx = {} }) => {
  return (
    <Box
      sx={{
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        '&::-webkit-scrollbar': {
          height: '8px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#f1f1f1',
          borderRadius: '4px'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#c1c1c1',
          borderRadius: '4px'
        },
        ...sx
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minWidth: minWidth || 'auto'
        }}
      >
        {children}
      </Box>
    </Box>
)};

ScrollContainer.propTypes = {
  children: PropTypes.node,
  minWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sx: PropTypes.object
};

export default ScrollContainer;
