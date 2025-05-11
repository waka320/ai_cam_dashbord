import React from 'react';
import { Box, Typography, Link, Container, Grid, Divider, useMediaQuery } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import theme from '../../theme/theme';

const Footer = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');

  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: 'rgba(240, 242, 245, 0.8)',
        borderTop: '1px solid #e0e0e0',
        mt: 4,
        pt: 3,
        pb: 3
      }}
    >
      <Container maxWidth="lg">
        {/* 責任表示セクション */}
        <Box 
          sx={{ 
            backgroundColor: 'rgba(245, 245, 245, 0.9)',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            p: isMobile ? 2 : 3,
            mb: 3,
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
            <WarningAmberIcon 
              sx={{ 
                color: theme.palette.warning.main,
                mr: 1,
                fontSize: isMobile ? '1.2rem' : '1.5rem'
              }} 
            />
            <Typography 
              variant={isMobile ? "subtitle2" : "subtitle1"} 
              fontWeight="bold"
            >
              データ利用に関する注意事項
            </Typography>
          </Box>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            sx={{ opacity: 0.85, mb: 1.5 }}
          >
            ※本ページは、高山市のオープンデータ(
            <Link 
              href="https://www.city.takayama.lg.jp/shisei/1000062/1004915/1012977/index.html"
              target="_blank" 
              rel="noopener noreferrer"
              sx={{ fontWeight: 500 }}
            >
              まちなかにおける観光通行量調査データ
            </Link>
            )から作成しています。本ページを参考にした意思決定によるいかなる損失も、責任は負いかねます。
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            sx={{ opacity: 0.85 }}
          >
            データは自動的にカメラで取得したものなので、実際の状況と異なる場合があります。最新かつ正確な情報は、各公式サイトや施設にて直接ご確認ください。
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />
        
        {/* リンクとクレジットセクション */}
        <Grid container spacing={isMobile ? 2 : 4}>
          <Grid item xs={12} sm={6}>
            <Box sx={{ mb: isMobile ? 2 : 0 }}>
              <Typography 
                variant="subtitle2" 
                fontWeight="bold" 
                gutterBottom
                sx={{ display: 'flex', alignItems: 'center' }}
              >
                <InfoOutlinedIcon sx={{ mr: 1, fontSize: '1rem' }} />
                開発情報
              </Typography>
              <Box sx={{ ml: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <GitHubIcon sx={{ mr: 1, fontSize: '1rem' }} />
                  <Link 
                    href="https://github.com/waka320/ai_cam_dashbord" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="inherit"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                      fontWeight: 500
                    }}
                  >
                    GitHubリポジトリ
                  </Link>
                </Box>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  作成: <Link 
                    href="https://github.com/waka320" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="inherit"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                      fontWeight: 500
                    }}
                  >
                    @waka320
                  </Link>
                </Typography>
                <Typography variant="body2">
                  最終更新: 2025年5月
                </Typography>
              </Box>
            </Box>
          </Grid>
          
          <Grid item xs={12} sm={6}>
            <Typography 
              variant="subtitle2" 
              fontWeight="bold" 
              gutterBottom
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <InfoOutlinedIcon sx={{ mr: 1, fontSize: '1rem' }} />
              製作・協力
            </Typography>
            <Box sx={{ ml: 1 }}>
              <Link 
                href="https://www.city.takayama.lg.jp/" 
                target="_blank" 
                rel="noopener noreferrer"
                display="block"
                color="inherit"
                sx={{ 
                  mb: 1,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                高山市公式ウェブサイト
              </Link>
              <Link 
                href="https://mdg.si.i.nagoya-u.ac.jp/" 
                target="_blank" 
                rel="noopener noreferrer"
                display="block" 
                color="inherit"
                sx={{ 
                  mb: 1, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                名古屋大学 遠藤・浦田研究室
              </Link>
              <Link 
                href="https://www.city.takayama.lg.jp/shisei/1005252/1021045.html" 
                target="_blank" 
                rel="noopener noreferrer"
                display="block"
                color="inherit"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                飛騨高山DX推進官民連携プラットフォーム
              </Link>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />
        
        {/* コピーライトセクション */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant={isSmallMobile ? "caption" : "body2"} sx={{ opacity: 0.7 }}>
            © 2025 目的ベースダッシュボード - All rights reserved
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
