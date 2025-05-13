import React from 'react';
import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import Content from './Content';
import TermsAndPrivacy from '../../pages/TermsAndPrivacy';
import Sitemap from '../../pages/Sitemap';
import HowToUse from '../../pages/HowToUse';

const Main = () => {
  return (
    <Box
      component="main"
      sx={{
        flex: '1 0 auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Routes>
        <Route path="/" element={<Content />} />
        <Route path="/terms" element={<TermsAndPrivacy />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/how-to-use" element={<HowToUse />} />
      </Routes>
    </Box>
  );
};

export default Main;
