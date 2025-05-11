import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const PrivacyPolicy = () => {
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={1} sx={{ 
        p: 4, 
        bgcolor: 'white',  // 背景色を白に設定
        color: 'text.primary' // テキスト色を明示的に設定
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
          
          {/* 必要に応じて追加のセクションを実装 */}
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
