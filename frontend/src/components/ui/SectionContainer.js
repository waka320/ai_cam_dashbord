import React from 'react';
import { Paper, Box } from '@mui/material';
import PropTypes from 'prop-types';

function SectionContainer({ children, title, noPadding, elevation }) {
  return (
    <Paper 
      elevation={elevation || 1} 
      sx={{ 
        marginBottom: '16px', 
        borderRadius: '8px',
        overflow: 'hidden',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
        backgroundColor: '#fff'
      }}
    >
      {title && (
        <Box 
          sx={{ 
            padding: '10px 16px', 
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            backgroundColor: '#f5f7f9',
            fontWeight: 600,
            fontSize: '1rem'
          }}
        >
          {title}
        </Box>
      )}
      <Box sx={{ padding: noPadding ? 0 : '16px' }}>
        {children}
      </Box>
    </Paper>
  );
}

SectionContainer.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  noPadding: PropTypes.bool,
  elevation: PropTypes.number
};

export default SectionContainer;
