import React from 'react';
import { 
  Box, 
  Typography, 
  Link as MuiLink, 
  Container, 
  Divider, 
  useMediaQuery,
  IconButton,
  Tooltip
} from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import ArticleIcon from '@mui/icons-material/Article';
import MapIcon from '@mui/icons-material/Map';
// import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import theme from '../../theme/theme';

const Footer = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const isSmallMobile = useMediaQuery('(max-width:480px)');
  const navigate = useNavigate();

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // ページ遷移と同時にスクロールトップのハンドラー
  const handleLinkClick = (path) => (e) => {
    e.preventDefault();
    navigate(path);
    window.scrollTo(0, 0);  // 即時にスクロールをトップに戻す
  };

  return (
    <Box 
      component="footer" 
      sx={{ 
        backgroundColor: 'rgba(240, 242, 245, 0.8)',
        borderTop: '1px solid #e0e0e0',
        mt: 4,
        pt: 3,
        pb: 3,
        position: 'relative'
      }}
    >
      {/* ページ上部へ戻るボタン */}
      <Tooltip title="ページの先頭へ" arrow placement="top">
        <IconButton
          aria-label="ページの先頭へ戻る"
          onClick={scrollToTop}
          sx={{
            position: 'absolute',
            top: -20,
            right: 20,
            backgroundColor: 'white',
            boxShadow: 1,
            '&:hover': {
              backgroundColor: 'rgba(240, 242, 245, 0.9)',
            },
          }}
          size={isMobile ? "small" : "medium"}
        >
          <KeyboardArrowUpIcon />
        </IconButton>
      </Tooltip>
      
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
            <MuiLink 
              href="https://www.city.takayama.lg.jp/shisei/1000062/1004915/1012977/index.html"
              target="_blank" 
              rel="noopener noreferrer"
              aria-label="高山市のオープンデータ(まちなかにおける観光通行量調査データ)サイトを開く"
              sx={{ fontWeight: 500 }}
            >
              まちなかにおける観光通行量調査データ
            </MuiLink>
            )から作成しています。本ページを参考にしたいかなる損失も、責任は負いかねます。
          </Typography>
          <Typography 
            variant={isMobile ? "body2" : "body1"} 
            sx={{ opacity: 0.85 }}
          >
            データは自動的にカメラで取得したものなので、実際の状況と異なる場合があります。最新かつ正確な情報は、各公式サイトや施設にて直接ご確認ください。
          </Typography>
        </Box>

        <Divider sx={{ mb: 2 }} />
        
        {/* リンクとクレジットセクション - Gridの代わりにBoxで実装 */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: isMobile ? 2 : 3, sm: 4 }
          }}
        >
          <Box sx={{ 
            flex: '1 1 50%', 
            mb: isMobile ? 2 : 0 
          }}>
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
                <Typography variant="body2">
                  最終更新: 2025年5月
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <MuiLink 
                    href="mailto:nagoya.mdg.info@gmail.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    color="inherit"
                    aria-label="お問い合わせメールを開く"
                    sx={{ 
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' },
                      fontWeight: 500
                    }}
                  >
                    お問い合わせは nagoya.mdg.info@gmail.com まで
                  </MuiLink>
                </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            flex: '1 1 50%' 
          }}>
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
              <MuiLink 
                href="https://www.city.takayama.lg.jp/" 
                target="_blank" 
                rel="noopener noreferrer"
                display="block"
                color="inherit"
                aria-label="高山市公式ウェブサイトを開く"
                sx={{ 
                  mb: 1,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                高山市
              </MuiLink>
              <MuiLink 
                href="https://mdg.si.i.nagoya-u.ac.jp/" 
                target="_blank" 
                rel="noopener noreferrer"
                display="block" 
                color="inherit"
                aria-label="名古屋大学 遠藤・浦田研究室のウェブサイトを開く"
                sx={{ 
                  mb: 1, 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                名古屋大学 遠藤・浦田研究室
              </MuiLink>
              <MuiLink 
                href="https://www.city.takayama.lg.jp/shisei/1005252/1021045.html" 
                target="_blank" 
                rel="noopener noreferrer"
                display="block"
                color="inherit"
                aria-label="飛騨高山DX推進官民連携プラットフォームのページを開く"
                sx={{ 
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                飛騨高山DX推進官民連携プラットフォーム
              </MuiLink>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        {/* 法的情報と問い合わせ - Gridの代わりにBoxで実装 */}
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' }, 
            gap: { xs: isMobile ? 2 : 3, sm: 4 },
            mb: 2
          }}
        >
          <Box sx={{ 
            flex: '1 1 800%', 
          }}>
            <Box sx={{ 
              ml: 1,
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 0, sm: 3 },
              alignItems: { xs: 'flex-start', sm: 'center' }
            }}>
              
              {/* <RouterLink 
                to="/how-to-use" 
                onClick={handleLinkClick('/how-to-use')}
                style={{ 
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: isMobile ? '8px' : '0',
                  textDecoration: 'none'
                }}
                aria-label="使い方ガイドページへ"
              >
                <HelpOutlineIcon fontSize="small" style={{ marginRight: '4px', fontSize: '0.9rem' }} />
                使い方ガイド
              </RouterLink> */}
              
              <RouterLink 
                to="/terms" 
                onClick={handleLinkClick('/terms')}
                style={{ 
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: isMobile ? '8px' : '0',
                  textDecoration: 'none'
                }}
                aria-label="利用規約ページへ"
              >
                <ArticleIcon fontSize="small" style={{ marginRight: '4px', fontSize: '0.9rem' }} />
                利用規約プライバシーポリシー
              </RouterLink>
              
              <RouterLink 
                to="/sitemap" 
                onClick={handleLinkClick('/sitemap')}
                style={{ 
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  textDecoration: 'none'
                }}
                aria-label="サイトマップページへ"
              >
                <MapIcon fontSize="small" style={{ marginRight: '4px', fontSize: '0.9rem' }} />
                サイトマップ
              </RouterLink>
            </Box>
          </Box>
          
          <Box sx={{ 
            flex: '1 1 50%' 
          }}>
            {/* 右側セクションの内容がある場合はここに追加 */}
          </Box>
        </Box>
        
        {/* コピーライトセクション */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant={isSmallMobile ? "caption" : "body2"} sx={{ opacity: 0.7 }}>
            © 2025 Media&Design Group - 遠藤・浦田研究室
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
