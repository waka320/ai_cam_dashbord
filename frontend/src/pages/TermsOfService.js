import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';

const TermsOfService = () => {
  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={1} sx={{ 
        p: 4, 
        bgcolor: 'white',  // 背景色を白に設定
        color: 'text.primary' // テキスト色を明示的に設定
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          利用規約
        </Typography>
        <Box sx={{ mt: 3 }}>
          <Typography variant="body1" paragraph>
            本サイトを利用される方は、以下の利用規約に同意したものとみなします。
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            1. 著作権について
          </Typography>
          <Typography variant="body1" paragraph>
            本サイトのコンテンツ（文章、画像、デザインなど）の著作権は、当サイトまたはコンテンツの提供者に帰属します。無断での複製、転載は禁止します。
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            2. 免責事項
          </Typography>
          <Typography variant="body1" paragraph>
            当サイトの情報は、高山市のオープンデータを元に作成していますが、その正確性を保証するものではありません。情報の利用によって生じたいかなる損害についても、当サイトは責任を負いません。
          </Typography>
          
          {/* 必要に応じて追加のセクションを実装 */}
        </Box>
      </Paper>
    </Container>
  );
};

export default TermsOfService;
