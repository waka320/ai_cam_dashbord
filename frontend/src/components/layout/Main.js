import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { Routes, Route } from 'react-router-dom';
import PurposeDashboard from '../../pages/PurposeDashboard';
import FunctionDashboard from '../../pages/FunctionDashboard';
import TermsAndPrivacy from '../../pages/TermsAndPrivacy';
import Sitemap from '../../pages/Sitemap';
import HowToUse from '../../pages/HowToUse';

// ルートアクセス時のリダイレクトコンポーネント
const RootRedirect = () => {
  useEffect(() => {
    // ページリロード方式でのリダイレクト
    window.location.href = '/purpose';
  }, []);
  
  return <div>リダイレクト中...</div>;
};

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
        <Route path="/" element={<RootRedirect />} />
        <Route path="/purpose" element={<PurposeDashboard />} />
        <Route path="/function" element={<FunctionDashboard />} />
        <Route path="/terms" element={<TermsAndPrivacy />} />
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/how-to-use" element={<HowToUse />} />
      </Routes>
    </Box>
  );
};

export default Main;
