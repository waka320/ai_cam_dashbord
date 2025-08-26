import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SecurityIcon from '@mui/icons-material/Security';
import ArticleIcon from '@mui/icons-material/Article';
import BusinessIcon from '@mui/icons-material/Business';
import SEOComponent from '../components/common/SEOComponent';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Sitemap = () => {
  return (
    <>
      <SEOComponent 
        title="サイトマップ"
        description="高山市AIカメラデータを元にした目的ベースダッシュボードのサイトマップです。サイト内の全ページへのリンクをまとめています。"
        keywords="サイトマップ,ページ一覧,ナビゲーション,高山市,ダッシュボード,目的ベース,機能ベース"
        url="https://ai-camera.lab.mdg-meidai.com/sitemap"
      />
      <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={1} sx={{ 
        p: 4, 
        bgcolor: 'white',  // 背景色を白に設定
        color: 'text.primary' // テキスト色を明示的に設定
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          サイトマップ
        </Typography>
        <Box sx={{ mt: 3 }}>
          <List>
            
            <ListItem button component={RouterLink} to="/purpose">
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary="目的ベースダッシュボード" secondary="やりたいことから混雑度データを分析" />
            </ListItem>
            

            <ListItem button component={RouterLink} to="/privacy-policy">
              <ListItemIcon>
                <SecurityIcon />
              </ListItemIcon>
              <ListItemText primary="プライバシーポリシー" secondary="個人情報の取り扱いについて" />
            </ListItem>
            
            <ListItem button component={RouterLink} to="/terms">
              <ListItemIcon>
                <ArticleIcon />
              </ListItemIcon>
              <ListItemText primary="利用規約" secondary="サイト利用に関する規約" />
            </ListItem>
          </List>
        </Box>
      </Paper>
    </Container>
    </>
  );
};

export default Sitemap;
