import React from 'react';
import { Container, Typography, Box, Paper, useMediaQuery } from '@mui/material';

const PrivacyPolicy = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
    <Box sx={{
      backgroundColor: 'rgba(249, 250, 251, 0.6)',
      borderRadius: isMobile ? '0' : '8px',
      padding: isMobile ? '8px 8px 16px' : '16px 24px 24px',
      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
      flex: '1 0 auto'
    }}>
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Paper elevation={1} sx={{ 
          p: 4, 
          bgcolor: 'white',
          color: 'text.primary'
        }}>
          <Typography variant="h4" component="h1" gutterBottom>
            プライバシーポリシー
          </Typography>
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" paragraph>
              本サイトでは、皆様のプライバシーを尊重し、個人情報の保護に努めています。
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              1. 取得する情報
            </Typography>
            <Typography variant="body1" paragraph>
              本サイトでは、利用状況の分析や機能向上のために、アクセス情報（IPアドレス、ブラウザの種類、参照元ページなど）を収集することがあります。
            </Typography>
            
            <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
              2. 情報の利用目的
            </Typography>
            <Typography variant="body1" paragraph>
              収集した情報は、サービスの改善・開発、利用状況の分析のためにのみ使用します。
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default PrivacyPolicy;
