import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider, 
  List, 
  ListItem, 
  ListItemText,
  ListItemIcon,
  Grid,
  useMediaQuery
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import PaletteIcon from '@mui/icons-material/Palette';

const HowToUse = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
    <Box sx={{
      backgroundColor: 'rgba(249, 250, 251, 0.6)',
      borderRadius: isMobile ? '0' : '8px',
      padding: isMobile ? '8px 8px 16px' : '16px 24px 24px',
      boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.05)',
      flex: '1 0 auto'
    }}>
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Paper elevation={1} sx={{ 
          p: 4, 
          bgcolor: 'white',
          color: 'text.primary'
        }}>
          <Typography variant="h4" component="h1" gutterBottom>
            目的ベースダッシュボードの使い方
          </Typography>
          
          <Typography variant="body1" paragraph sx={{ mb: 3 }}>
            目的ベースダッシュボードは、高山市のオープンデータ（まちなかにおける観光通行量調査データ）を活用し、
            事業者の目的に合わせたデータ可視化を提供するサービスです。本ガイドでは、ダッシュボードの基本的な使い方をご紹介します。
          </Typography>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={500}>
              基本的な使い方
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><TouchAppIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="1. やりたいことを選択する" 
                  secondary="画面上部の「やりたいことは...」から、あなたの目的に合ったオプションを選択します。例: 「店舗の定休日を検討したい」「イベントの開催日程を検討したい」など。"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><CalendarMonthIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="2. データの年月を選択する" 
                  secondary="表示したいデータの年と月を選択します。データは2021年から現在までの期間で利用可能です。"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><SettingsIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="3. 必要に応じて表示設定を調整する" 
                  secondary="データの見やすさを調整するために、カラーパレットの変更などができます。"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><ShareIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="4. 結果の共有" 
                  secondary="表示されたデータは、共有ボタンを使って他の方と共有することができます。"
                />
              </ListItem>
            </List>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={500}>
              グラフの種類と見方
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>カレンダー形式</Typography>
                  <Typography variant="body2">
                    月ごとのカレンダー表示で、日別の混雑状況が一目でわかります。色の濃さで混雑度を表現しています。
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>時間×曜日</Typography>
                  <Typography variant="body2">
                    曜日と時間帯ごとの混雑パターンを確認できます。週間の傾向を把握するのに適しています。
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>日付×時間</Typography>
                  <Typography variant="body2">
                    特定の日の時間帯別混雑状況を詳細に確認できます。一日の中での変動を把握するのに最適です。
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={500}>
              目的別の使い方ヒント
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><HelpOutlineIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="店舗の定休日検討" 
                  secondary="カレンダー形式で混雑度が低い日を定休日の候補として検討できます。赤や橙色の日は混雑しており、青や緑の日は比較的空いています。"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><HelpOutlineIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="営業時間の検討" 
                  secondary="日付×時間のヒートマップで、混雑する時間帯を特定し、営業時間の調整に活用できます。"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><HelpOutlineIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="イベント効果の確認" 
                  secondary="イベント開催日前後のデータを比較することで、イベントによる集客効果を確認できます。"
                />
              </ListItem>
            </List>
          </Box>
          
          <Divider sx={{ my: 3 }} />
          
          <Box>
            <Typography variant="h5" component="h2" gutterBottom fontWeight={500}>
              その他の機能
            </Typography>
            
            <List>
              <ListItem>
                <ListItemIcon><PaletteIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="カラーパレットの変更" 
                  secondary="お好みや見やすさに合わせて、ヒートマップの色調を変更できます。"
                />
              </ListItem>
              
              <ListItem>
                <ListItemIcon><ShareIcon color="primary" /></ListItemIcon>
                <ListItemText 
                  primary="データの共有" 
                  secondary="現在表示しているデータをURLで共有できます。受け取った方は同じデータを閲覧できます。"
                />
              </ListItem>
            </List>
          </Box>
          
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              ※本ダッシュボードは高山市のオープンデータを利用して作成しています。データは自動的にカメラで取得したものなので、実際の状況と異なる場合があります。意思決定の参考としてご利用ください。
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default HowToUse;
