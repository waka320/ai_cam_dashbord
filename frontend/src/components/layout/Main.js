import React from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Content from './Content';
import PrivacyPolicy from '../../pages/PrivacyPolicy';
import TermsOfService from '../../pages/TermsOfService';
import Sitemap from '../../pages/Sitemap';

const Main = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
    <Box
      component="main"
      sx={{
        backgroundColor: 'rgba(249, 250, 251, 0.6)',
        borderRadius: isMobile ? '0' : '0 0 8px 8px',
        padding: isMobile ? '8px 8px 16px' : '16px 16px 24px',
        boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
        flex: '1 0 auto'
      }}
    >
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/sitemap" element={<Sitemap />} />
      </Routes>
    </Box>
  );
};

export default Main;
