import React from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, ListItemIcon } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import SecurityIcon from '@mui/icons-material/Security';
import ArticleIcon from '@mui/icons-material/Article';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const Sitemap = () => {
  return (
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
            <ListItem button component={RouterLink} to="/">
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="ホーム" secondary="メインダッシュボード" />
            </ListItem>
            {/* <ListItem button component={RouterLink} to="/how-to-use">
              <ListItemIcon>
                  <HelpOutlineIcon />
              </ListItemIcon>
              <ListItemText primary="使い方ガイド" secondary="目的ベースダッシュボードの使い方について" />
            </ListItem> */}
            
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
  );
};

export default Sitemap;
