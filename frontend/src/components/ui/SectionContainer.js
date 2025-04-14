import React from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Paper, useMediaQuery } from '@mui/material';

/**
 * アプリケーション全体で再利用可能なセクションコンテナコンポーネント
 */
const SectionContainer = ({ 
  title,
  icon: Icon,
  children,
  maxWidth,
  withPaper = true,
  titleVariant,
  sx = {},
  paperSx = {}
}) => {
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
    <Box
      sx={{
        maxWidth: maxWidth || '100%',
        margin: '0 auto',
        mt: 2,
        px: isMobile ? 1 : 2,
        ...sx
      }}
    >
      {title && (
        <Typography
          variant={titleVariant || (isMobile ? "subtitle1" : "h6")}
          gutterBottom
          sx={{ 
            textAlign: isMobile ? 'center' : 'left',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {Icon && <Icon sx={{ fontSize: 'inherit' }} />}
          {title}
        </Typography>
      )}

      {withPaper ? (
        <Paper
          elevation={2}
          sx={{
            p: isMobile ? 1 : 2,
            borderRadius: '8px',
            overflow: 'hidden',
            ...paperSx
          }}
        >
          {children}
        </Paper>
      ) : (
        children
      )}
    </Box>
  );
};
SectionContainer.propTypes = {
  title: PropTypes.string,
  icon: PropTypes.elementType,
  children: PropTypes.node,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  withPaper: PropTypes.bool,
  titleVariant: PropTypes.string,
  sx: PropTypes.object,
  paperSx: PropTypes.object
};

export default SectionContainer;
