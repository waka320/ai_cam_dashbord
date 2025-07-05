import React, { useState } from 'react';
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
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Chip,
  Card,
  CardMedia,
  CardContent,
  Alert,
  Tab,
  Tabs,
  IconButton,
  Tooltip,
  Link
} from '@mui/material';
import TouchAppIcon from '@mui/icons-material/TouchApp';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SettingsIcon from '@mui/icons-material/Settings';
import ShareIcon from '@mui/icons-material/Share';
import PaletteIcon from '@mui/icons-material/Palette';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import StarIcon from '@mui/icons-material/Star';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import LinkIcon from '@mui/icons-material/Link';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SEOComponent from '../components/common/SEOComponent';

// ダミー画像URL - 実際の実装では実際のスクリーンショット画像に置き換える
const dummyImageUrl = "https://via.placeholder.com/600x400?text=ダッシュボードスクリーンショット";

const HowToUse = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const [currentTab, setCurrentTab] = useState(0);
  
  
  // タブ切り替え
  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };
   
  
  return (
    <>
      <SEOComponent 
        title="使い方ガイド"
        description="目的ベースダッシュボードの詳しい使い方をご説明します。3つの簡単なステップで観光データを効果的に活用する方法を学びましょう。"
        keywords="高山市,ダッシュボード,使い方,ガイド,観光データ,活用方法,操作説明"
        url="https://ai-camera.lab.mdg-meidai.com/how-to-use"
      />
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
          {/* ヘッダー部分 */}
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 600 }}>
              目的ベースダッシュボードの使い方
            </Typography>
            
            <Typography variant="body1" paragraph sx={{ mb: 3, maxWidth: '800px', textAlign: 'center' }}>
              目的ベースダッシュボードは高山市のオープンデータを活用し、事業者の目的に合わせたデータ可視化を提供します。
              このガイドでは、効果的な使い方をご紹介します。
            </Typography>
            
            
            {/* タブナビゲーション */}
            <Tabs 
              value={currentTab} 
              onChange={handleTabChange} 
              variant={isMobile ? "scrollable" : "standard"}
              scrollButtons={isMobile ? "auto" : false}
              sx={{ mb: 2 }}
            >
              <Tab label="クイックスタート" />
              <Tab label="詳細ガイド" />
              <Tab label="よくある質問" />
            </Tabs>
          </Box>
          
          <Divider sx={{ my: 2 }} />
          
          {/* タブパネル1: クイックスタート */}
          {currentTab === 0 && (
            <>
              <Box sx={{ mb: 4 }}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  まずは3つの簡単なステップからはじめましょう！
                </Alert>
                
                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{backgroundColor:'white'}}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip label="STEP 1" color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6" component="h2">
                        やりたいことを選択する
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" paragraph>
                          画面上部の「やりたいことは...」から、あなたの目的に合ったオプションを選択します。
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          例: 「店舗の定休日を検討したい」「イベントの開催日程を検討したい」など
                        </Typography>
                      </Box>
                      <CardMedia
                        component="img"
                        image={dummyImageUrl}
                        alt="メニュー選択のスクリーンショット"
                        sx={{ width: isMobile ? '100%' : 220, height: 140, objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
                
                <Card sx={{ mb: 3 }}>
                  <CardContent sx={{backgroundColor:'white'}}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip label="STEP 2" color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6" component="h2">
                        データの年月を選択する
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" paragraph>
                          表示したいデータの年と月を選択します。データは2021年から現在までの期間で利用可能です。
                        </Typography>
                      </Box>
                      <CardMedia
                        component="img"
                        image={dummyImageUrl}
                        alt="年月選択のスクリーンショット"
                        sx={{ width: isMobile ? '100%' : 220, height: 140, objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent sx={{backgroundColor:'white'}}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip label="STEP 3" color="primary" sx={{ mr: 2 }} />
                      <Typography variant="h6" component="h2">
                        結果を確認・活用する
                      </Typography>
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" paragraph>
                          表示されたデータを確認し、必要に応じて表示設定を調整します。
                          分析結果は、URLリンクを使って他の方と共有することもできます。
                        </Typography>
                        <Button 
                          variant="contained" 
                          color="primary" 
                          endIcon={<ArrowForwardIcon />}
                          onClick={() => setCurrentTab(1)}
                          sx={{ mt: 1 }}
                        >
                          詳細ガイドを見る
                        </Button>
                      </Box>
                      <CardMedia
                        component="img"
                        image={dummyImageUrl}
                        alt="データ表示のスクリーンショット"
                        sx={{ width: isMobile ? '100%' : 220, height: 140, objectFit: 'cover', borderRadius: 1 }}
                      />
                    </Box>
                  </CardContent >
                </Card>
              </Box>
            </>
          )}
          
          {/* タブパネル2: 詳細ガイド */}
          {currentTab === 1 && (
            <>
              {/* 基本的な使い方セクション - アコーディオンで実装 */}
              <Accordion defaultExpanded sx={{backgroundColor: 'white'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="basic-usage-content"
                  id="basic-usage-header"
                >
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                    基本的な使い方
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                </AccordionDetails>
              </Accordion>
              
              {/* グラフの種類と見方セクション */}
              <Accordion defaultExpanded sx={{backgroundColor: 'white'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="graph-types-content"
                  id="graph-types-header"
                >
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                    グラフの種類と見方
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, height: '100%', bgcolor: 'rgba(232, 244, 253, 0.2)' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#0277bd' }}>カレンダー形式</Typography>
                        <CardMedia
                          component="img"
                          image={dummyImageUrl}
                          alt="カレンダー形式のサンプル"
                          sx={{ height: 120, mb: 1, objectFit: 'cover', borderRadius: 1 }}
                        />
                        <Typography variant="body2">
                          月ごとのカレンダー表示で、日別の混雑状況が一目でわかります。色の濃さで混雑度を表現しています。
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, height: '100%', bgcolor: 'rgba(237, 247, 237, 0.2)' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#2e7d32' }}>時間×曜日</Typography>
                        <CardMedia
                          component="img"
                          image={dummyImageUrl}
                          alt="時間×曜日のサンプル"
                          sx={{ height: 120, mb: 1, objectFit: 'cover', borderRadius: 1 }}
                        />
                        <Typography variant="body2">
                          曜日と時間帯ごとの混雑パターンを確認できます。週間の傾向を把握するのに適しています。
                        </Typography>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} md={4}>
                      <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1, height: '100%', bgcolor: 'rgba(253, 237, 237, 0.2)' }}>
                        <Typography variant="h6" gutterBottom sx={{ color: '#c62828' }}>日付×時間</Typography>
                        <CardMedia
                          component="img"
                          image={dummyImageUrl}
                          alt="日付×時間のサンプル"
                          sx={{ height: 120, mb: 1, objectFit: 'cover', borderRadius: 1 }}
                        />
                        <Typography variant="body2">
                          特定の日の時間帯別混雑状況を詳細に確認できます。一日の中での変動を把握するのに最適です。
                        </Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </AccordionDetails>
              </Accordion>
              
              {/* 目的別の使い方ヒントセクション */}
              <Accordion defaultExpanded sx={{backgroundColor: 'white'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="purpose-tips-content"
                  id="purpose-tips-header"
                >
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                    目的別の使い方ヒント
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem sx={{ bgcolor: 'rgba(232, 244, 253, 0.3)', mb: 1, borderRadius: 1 }}>
                      <ListItemIcon><StarIcon color="primary" /></ListItemIcon>
                      <ListItemText 
                        primary="店舗の定休日検討" 
                        secondary="カレンダー形式で混雑度が低い日を定休日の候補として検討できます。赤や橙色の日は混雑しており、青や緑の日は比較的空いています。"
                      />
                    </ListItem>
                    
                    <ListItem sx={{ bgcolor: 'rgba(237, 247, 237, 0.3)', mb: 1, borderRadius: 1 }}>
                      <ListItemIcon><StarIcon style={{color: '#2e7d32'}} /></ListItemIcon>
                      <ListItemText 
                        primary="営業時間の検討" 
                        secondary="日付×時間のヒートマップで、混雑する時間帯を特定し、営業時間の調整に活用できます。"
                      />
                    </ListItem>
                    
                    <ListItem sx={{ bgcolor: 'rgba(253, 237, 237, 0.3)', borderRadius: 1 }}>
                      <ListItemIcon><StarIcon style={{color: '#c62828'}} /></ListItemIcon>
                      <ListItemText 
                        primary="イベント効果の確認" 
                        secondary="イベント開催日前後のデータを比較することで、イベントによる集客効果を確認できます。"
                      />
                    </ListItem>
                    
                    {/* 活用事例セクション */}
                    <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                        活用事例：商店街の定休日最適化
                      </Typography>
                      <Typography variant="body2">
                        高山市の商店街では、カレンダー形式の混雑データを分析し、週ごとの混雑傾向を把握。
                        観光客が少ない水曜日を共通定休日としつつ、繁忙期は営業する柔軟な運用を実現したことで、
                        コスト削減と売上向上の両立に成功しました。
                      </Typography>
                    </Box>
                  </List>
                </AccordionDetails>
              </Accordion>
              
              {/* その他の機能セクション */}
              <Accordion sx={{backgroundColor: 'white'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="other-features-content"
                  id="other-features-header"
                >
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                    その他の機能
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
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
                      <Tooltip title="URLをコピーする" arrow>
                        <IconButton size="small" sx={{ ml: 1 }}>
                          <LinkIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
              
              {/* トラブルシューティングセクション */}
              <Accordion sx={{backgroundColor: 'white'}}>
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  aria-controls="troubleshooting-content"
                  id="troubleshooting-header"
                >
                  <Typography variant="h5" component="h2" sx={{ fontWeight: 500 }}>
                    トラブルシューティング
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <List>
                    <ListItem>
                      <ListItemIcon><ErrorOutlineIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="データが表示されない場合" 
                        secondary="選択した期間にデータがない可能性があります。別の年月を選択してみてください。それでも解決しない場合はブラウザのキャッシュをクリアして再読み込みしてみましょう。"
                      />
                    </ListItem>
                    
                    <ListItem>
                      <ListItemIcon><ErrorOutlineIcon color="error" /></ListItemIcon>
                      <ListItemText 
                        primary="グラフの色が見にくい場合" 
                        secondary="設定メニューからカラーパレットを変更すると、コントラストの高い配色に切り替えることができます。"
                      />
                    </ListItem>
                  </List>
                </AccordionDetails>
              </Accordion>
            </>
          )}
          
          {/* タブパネル3: よくある質問 */}
          {currentTab === 2 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h5" component="h2" gutterBottom fontWeight={500}>
                よくある質問
              </Typography>
              
              <Accordion sx={{backgroundColor: 'white'}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>どのくらいの期間のデータが利用できますか？</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    2021年から現在までのデータが利用可能です。データは定期的に更新されており、最新のトレンドを把握することができます。
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{backgroundColor: 'white'}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>表示されるデータはリアルタイムですか？</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    データは毎月更新されています。リアルタイムではありませんが、最近のトレンドや季節変動を確認するには十分な頻度です。
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{backgroundColor: 'white'}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>データはどのように収集されていますか？</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    高山市内に設置されたカメラによる自動カウントシステムで人流データを収集しています。
                    プライバシーに配慮し、個人を特定できる情報は含まれていません。
                  </Typography>
                </AccordionDetails>
              </Accordion>
              
              <Accordion sx={{backgroundColor: 'white'}}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>データの信頼性はどの程度ですか？</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Typography>
                    カメラによる自動計測のため、100%の精度ではありませんが、傾向を把握するには十分な信頼性があります。
                    ただし、天候や特別なイベントなどの影響で実際の状況とは異なる場合があります。
                  </Typography>
                </AccordionDetails>
              </Accordion>
            </Box>
          )}
          
          <Divider sx={{ my: 3 }} />
          
          {/* フィードバックセクション */}
        <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <Typography variant="h5" component="h2" gutterBottom fontWeight={500} >
            フィードバックをお寄せください
          </Typography>
          <Typography variant="body1" paragraph sx={{ maxWidth: '600px', mb: 3 }}>
            いただいたご意見・ご感想は、サービスの改善と今後の研究開発に活用させていただきます。
          </Typography>
          <Link
            href="https://docs.google.com/forms/d/e/1FAIpQLSeEalJjup-hR6BN6M8MfETrPn3is0i-5Rskxz_rkEZvI7mvFw/viewform?usp=header"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#1976d2',
              color: 'white',
              py: 1.5,
              px: 3,
              borderRadius: 2,
              fontWeight: 500,
              textDecoration: 'none',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: '#0d5baa',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
              },
            }}
          >
            <FeedbackIcon sx={{ mr: 1 }} />
            ここをタップしてご意見を聞かせてください
          </Link>
        </Box>
          
          <Box sx={{ mt: 4, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              本ダッシュボードは高山市のオープンデータを利用して作成しています。データは自動的にカメラで取得したものであるため、実際の状況と異なる場合があります。意思決定の参考としてご利用ください。
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
    </>
  );
};

export default HowToUse;
