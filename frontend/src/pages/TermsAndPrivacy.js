import React, { useState } from 'react';
import { 
  Container, Typography, Box, Paper, Divider, useMediaQuery, Link,
  Accordion, AccordionSummary, AccordionDetails, Alert, Chip, Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import InfoIcon from '@mui/icons-material/Info';
import SEOComponent from '../components/common/SEOComponent';

const TermsAndPrivacy = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const [expanded, setExpanded] = useState(false);
  
  // アコーディオンの開閉状態を管理
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };
  
  // 特定のセクションへスクロール
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      <SEOComponent 
        title="利用規約・プライバシーポリシー"
        description="目的ベースダッシュボードの利用規約とプライバシーポリシーです。サービスを安全にご利用いただくための重要な情報を記載しています。"
        keywords="利用規約,プライバシーポリシー,個人情報保護,データ利用,高山市,オープンデータ"
        url="https://ai-camera.lab.mdg-meidai.com/terms"
      />
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
            利用規約・プライバシーポリシー
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" sx={{ mb: 2 }}>
              本規約は、名古屋大学 遠藤・浦田研究室（以下、「当研究室」といいます）が提供する「目的ベースダッシュボード」（以下、「本サービス」といいます）について、本サービスの利用者による利用の一切について適用されるものです。本サービスは、当研究室に所属する学生（若松勇希）が管理し、高山市が公開するオープンデータ「まちなかにおける観光通行量調査データ」を活用したデータ表示・分析サービスです。本サービスの利用にあたっては本規約への同意を条件としますので、利用前に必ず本規約を確認のうえ、理解いただくようお願いします。
            </Typography>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>更新情報:</strong> 制定日: 2025年5月11日 / 最終更新日: 2025年5月22日
              </Typography>
            </Alert>
          </Box>

          {/* 目次セクション - 背景色を明るく変更 */}
          <Paper variant="outlined" sx={{ 
            p: 2, 
            mb: 3, 
            bgcolor: '#f8f9fa',  // より明るい背景色に変更
            color: 'text.primary' // 文字色も明示的に指定
          }}>
            <Typography variant="h6" gutterBottom>
              目次
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Chip 
                label="利用規約" 
                color="primary" 
                variant="outlined" 
                onClick={() => scrollToSection('terms-section')}
                icon={<KeyboardArrowRightIcon />}
              />
              <Chip 
                label="プライバシーポリシー" 
                color="secondary" 
                variant="outlined" 
                onClick={() => scrollToSection('privacy-section')}
                icon={<KeyboardArrowRightIcon />}
              />
            </Box>
            
            <Typography variant="subtitle2" gutterBottom color="text.primary">
              利用規約
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: 1,
              bgcolor: '#f8f9fa' // 背景色をセクション全体に適用
            }}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                <Button 
                  key={`terms-${num}`}
                  size="small" 
                  variant="text" 
                  color="primary"
                  onClick={() => scrollToSection(`terms-${num}`)}
                  startIcon={<KeyboardArrowRightIcon fontSize="small" />}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textAlign: 'left',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)', // ボタンに微かな背景色
                    '&:hover': {
                      backgroundColor: 'rgba(25, 118, 210, 0.08)' // ホバー時の色
                    }
                  }}
                >
                  {num}. {getTermsSectionTitle(num)}
                </Button>
              ))}
            </Box>
            
            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }} color="text.primary">
              プライバシーポリシー
            </Typography>
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
              gap: 1,
              bgcolor: '#f8f9fa' // 背景色をセクション全体に適用
            }}>
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <Button 
                  key={`privacy-${num}`}
                  size="small" 
                  variant="text" 
                  color="secondary"
                  onClick={() => scrollToSection(`privacy-${num}`)}
                  startIcon={<KeyboardArrowRightIcon fontSize="small" />}
                  sx={{ 
                    justifyContent: 'flex-start', 
                    textAlign: 'left',
                    backgroundColor: 'rgba(255, 255, 255, 0.5)', // ボタンに微かな背景色
                    '&:hover': {
                      backgroundColor: 'rgba(156, 39, 176, 0.08)' // ホバー時の色
                    }
                  }}
                >
                  {num}. {getPrivacySectionTitle(num)}
                </Button>
              ))}
            </Box>
          </Paper>

          <Divider sx={{ my: 3 }} />

          {/* 利用規約セクション */}
          <Box id="terms-section" sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ 
              bgcolor: 'primary.main', 
              color: 'white', 
              p: 1.5, 
              borderRadius: 1 
            }}>
              利用規約
            </Typography>
            
            {/* 利用規約のアコーディオン - 詳細部分の背景色を明示的に設定 */}
            <Accordion 
              expanded={expanded === 'terms-1'} 
              onChange={handleAccordionChange('terms-1')}
              id="terms-1"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6" color="text.primary">1. 本規約の適用範囲</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  利用者は、本サービスを利用する前に本規約に同意する必要があり、同意しない場合は、本サービスを利用いただけません。
                </Typography>
                <Typography variant="body1">
                  当研究室では、利用者の了承を得ることなく本規約を変更する場合がございます。変更後の規約は、それが本サービスの画面に表示された時点で効力を発揮するものとします。本規約の変更後に本サービスを利用された場合は、変更後の規約に同意されたものとみなします。
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'terms-2'} 
              onChange={handleAccordionChange('terms-2')}
              id="terms-2"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">2. サービス内容とデータの出典</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  本サービスは、当研究室と高山市との連携のもと、高山市のオープンデータ「まちなかにおける観光通行量調査データ（駅前・上三之町・行神橋ほか）」（
                  <Link href="https://www.city.takayama.lg.jp/shisei/1000062/1004915/1012977/index.html" target="_blank" rel="noopener noreferrer">
                    https://www.city.takayama.lg.jp/shisei/1000062/1004915/1012977/index.html
                  </Link>
                  ）を活用し、高山市商店街の事業者向けにデータダッシュボードを提供します。本サービスが行うのはデータの表示と分析のみであり、元データの作成や収集は行っておりません。
                </Typography>
                
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>注意事項:</strong> データ取得のタイミング等の原因により、本サービス上での表示と実際の状況が異なる場合があります。また、元データは高山市の公開するシステムによる自動検出のため、特定状況（傘やマスクの着用など）においてカウント等ができない場合があることをご了承ください。
                  </Typography>
                </Alert>
                
                <Typography variant="body1" paragraph>
                  本サービスは無料で提供しますが、本サービスを利用する際に発生する通信料については利用者負担となります。
                </Typography>
                <Typography variant="body1" paragraph>
                  予告なく運用の中断や内容の変更等を行うことがあります。
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'terms-3'} 
              onChange={handleAccordionChange('terms-3')}
              id="terms-3"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">3. 著作権について</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1">
                  本サービスのコンテンツ（文章、画像、デザインなど）の著作権は、当研究室または正当な権利を有する第三者に帰属します。無断での複製、転載は禁止します。なお、本サービスで使用している高山市のオープンデータについては、高山市の利用規約に従います。
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'terms-4'} 
              onChange={handleAccordionChange('terms-4')}
              id="terms-4"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">4. 免責事項</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  本サービスを利用してなされた行為やその結果生じた損害（第三者に対するものを含みます。以下同じ。）について、利用者が一切の責任を負うことに同意するものとします。
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                  <li>
                    <Typography variant="body1">
                      本サービスにより提供する一切の情報について、可用性、正確性、有用性、特定の目的に対する適合性等を保障しません。
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービスの情報は、高山市のオープンデータを元に作成していますが、その正確性を保証するものではありません。
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービスによって得た情報に基づいた利用者の判断により発生した一切の損害について、当研究室及び高山市はいかなる責任も負いません。
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービスの変更や内容の欠陥等によって生じたあらゆる損害について理由の如何に関わらず当研究室及び高山市はいかなる責任も負いません。
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービスを通じて提供される分析結果やAIによる分析アドバイスの正確性について一切の保証をいたしません。
                    </Typography>
                  </li>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'terms-5'} 
              onChange={handleAccordionChange('terms-5')}
              id="terms-5"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">5. 禁止事項</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  利用者は、次に掲げる行為を行ってはならないものとします。利用者の違反行為により生じた損害は、その全てに関して賠償責任を本サービスの利用者が負うものとします。
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                  <li>
                    <Typography variant="body1">
                      本サービスを当研究室が承認しない方法によって利用する行為
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービスを複製して商業・営利目的で利用する行為
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービスを構築するサーバー、ネットワークへ過負荷をかけたり、何らかの支障を及ぼしうる行為
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービスで使用されているAPIを本サービス以外で利用する行為
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本規約または公序良俗に違反する行為
                    </Typography>
                  </li>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* 残りのアコーディオンも背景色を適用 */}
            <Accordion 
              expanded={expanded === 'terms-6'} 
              onChange={handleAccordionChange('terms-6')}
              id="terms-6"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">6. ご利用環境について</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1">
                  本サービスの利用には特定のアプリは不要で、スマートフォンやPC、タブレット端末上のウェブブラウザで利用できます。本サービスはGoogle Chromeで動作確認をしています。
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'terms-7'} 
              onChange={handleAccordionChange('terms-7')}
              id="terms-7"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">7. 名古屋大学学術データポリシーとの関係</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  本サービスは、名古屋大学学術データポリシー（
                  <Link href="https://icts.nagoya-u.ac.jp/ja/datapolicy/" target="_blank" rel="noopener noreferrer">
                    https://icts.nagoya-u.ac.jp/ja/datapolicy/
                  </Link>
                  ）に準拠して運営されています。名古屋大学学術データポリシーでは、学術活動によって産み出された知的成果を蓄積し社会に還元することを目的としており、本サービスもこの理念に基づき、高山市のオープンデータを活用して地域DX推進に貢献することを目指しています。
                </Typography>
                <Typography variant="body1">
                  本サービスで扱うデータは、名古屋大学学術データポリシーに定める「学術データ」に該当し、その管理・公開・利活用については同ポリシーの原則に従います。詳細な名古屋大学学術データポリシーは大学公式サイトでご確認いただけます。
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'terms-9'} 
              onChange={handleAccordionChange('terms-9')}
              id="terms-9"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">8. 地域DX推進プロジェクトとしての位置づけ</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1">
                  本サービスは、遠藤・浦田研究室が推進する「ICTを活用した産学官民協働による観光まちづくり」の一環として開発されたものであり、名古屋大学が推進する地域DX化の取り組みの実践例です。本サービスの開発・運用を通じて得られた知見は、地域社会のデジタル化推進に活用されます。
                </Typography>
              </AccordionDetails>
            </Accordion>

            
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* プライバシーポリシーセクション */}
          <Box id="privacy-section" sx={{ mb: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ 
              bgcolor: 'secondary.main', 
              color: 'white', 
              p: 1.5, 
              borderRadius: 1 
            }}>
              プライバシーポリシー
            </Typography>
            
            {/* プライバシーポリシーのアコーディオンも背景色を適用 */}
            <Accordion 
              expanded={expanded === 'privacy-1'} 
              onChange={handleAccordionChange('privacy-1')}
              id="privacy-1"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e3f2fd' },
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' },
                  borderRadius: '4px 4px 0 0',
                }}
              >
                <Typography variant="h6">1. 管理者</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  本サービス「目的ベースダッシュボード」は以下の管理者が提供・運営しています。
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                  <li>
                    <Typography variant="body1">
                      運営：名古屋大学 遠藤・浦田研究室
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      お問い合わせ：<Link href="mailto:nagoya.mdg.info@gmail.com" target="_blank" rel="noopener noreferrer">nagoya.mdg.info@gmail.com</Link>よりご連絡ください
                    </Typography>
                  </li>
                </Box>
              </AccordionDetails>
            </Accordion>

            {/* 以下、残りのプライバシーポリシーセクションも同様に背景色を指定 */}
            <Accordion 
              expanded={expanded === 'privacy-2'} 
              onChange={handleAccordionChange('privacy-2')}
              id="privacy-2"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">2. 個人情報の定義</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  本ポリシーにおいて、「個人情報」とは、個人情報保護法に定義される個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、メールアドレスなどの記述等により特定の個人を識別できる情報を指します。
                </Typography>
                <Alert severity="info">
                  <Typography variant="body2">
                    本サービスで利用する高山市のオープンデータには、個人を特定できる情報は含まれておりません。
                  </Typography>
                </Alert>
              </AccordionDetails>
            </Accordion>

            {/* 以下同様に残りのセクションも修正 */}
            <Accordion 
              expanded={expanded === 'privacy-3'} 
              onChange={handleAccordionChange('privacy-3')}
              id="privacy-3"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">3. 取得する情報</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  本サービスでは、サービスの提供・改善及び研究目的のために、以下の情報を取得することがあります。
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                  <li>
                    <Typography variant="body1">
                      アクセス情報（IPアドレス、ブラウザの種類、参照元ページなど）
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      デバイス情報（OS、画面サイズなど）
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービス利用時の操作ログ（閲覧したページ、クリックした要素など）
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      Cookie（サービス利用状態の保持など）
                    </Typography>
                  </li>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'privacy-4'} 
              onChange={handleAccordionChange('privacy-4')}
              id="privacy-4"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5', // 明るいグレーの背景色
                  '&:hover': { bgcolor: '#e3f2fd' }, // ホバー時はさらに色を変えて操作性向上
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' }, // 展開時の背景色
                  borderRadius: '4px 4px 0 0', // 上部の角を丸くする
                }}
              >
                <Typography variant="h6">4. 情報の利用目的</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1" paragraph>
                  取得した情報は、以下の目的のために利用します。
                </Typography>
                <Box component="ul" sx={{ pl: 4 }}>
                  <li>
                    <Typography variant="body1">
                      本サービスの提供・運営
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      本サービスの機能向上・改善
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      利用状況の分析・統計情報の作成（個人を特定できない形式でのみ実施）
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      地域DX推進に関する学術研究（個人を特定できない形式でのみ実施）
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      論文等の研究成果での利用（匿名化した上で）
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body1">
                      不正アクセスや不正利用防止のためのセキュリティ対策
                    </Typography>
                  </li>
                </Box>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'privacy-5'} 
              onChange={handleAccordionChange('privacy-5')}
              id="privacy-5"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e3f2fd' },
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' },
                  borderRadius: '4px 4px 0 0',
                }}
              >
                <Typography variant="h6">5. Cookieの利用について</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1">
                  本サービスでは、サービス向上や利用状態の保持のためにCookieを使用しています。ブラウザの設定により、Cookieの受け入れを拒否することも可能ですが、一部のサービス機能が利用できなくなる場合があります。
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion 
              expanded={expanded === 'privacy-6'} 
              onChange={handleAccordionChange('privacy-6')}
              id="privacy-6"
            >
              <AccordionSummary 
                expandIcon={<ExpandMoreIcon />}
                sx={{ 
                  bgcolor: '#f5f5f5',
                  '&:hover': { bgcolor: '#e3f2fd' },
                  '&.Mui-expanded': { bgcolor: '#e3f2fd' },
                  borderRadius: '4px 4px 0 0',
                }}
              >
                <Typography variant="h6">6. プライバシーポリシーの変更</Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ bgcolor: 'white', color: 'text.primary' }}>
                <Typography variant="body1">
                  本ポリシーの内容は、法令の変更や本サービスの仕様変更等に伴い、予告なく変更される場合があります。変更があった場合は、本ウェブサイト上に変更後のポリシーを掲載します。
                </Typography>
              </AccordionDetails>
            </Accordion>

            
          </Box>

          <Divider sx={{ my: 3 }} />

          {/* ページトップに戻るボタン */}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
            <Button 
              variant="outlined" 
              color="primary" 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              startIcon={<InfoIcon />}
            >
              ページの先頭に戻る
            </Button>
          </Box>

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Typography variant="body2" color="text.secondary">
              制定日: 2025年5月22日<br />
              最終更新日: 2025年5月22日
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
    </>
  );
};

// セクションタイトルを取得する関数
function getTermsSectionTitle(num) {
  const titles = {
    1: '本規約の適用範囲',
    2: 'サービス内容とデータの出典',
    3: '著作権について',
    4: '免責事項',
    5: '禁止事項',
    6: 'ご利用環境について',
    7: '名古屋大学学術データポリシー',
    8: '地域DX推進プロジェクト',
  };
  return titles[num] || `セクション${num}`;
}

function getPrivacySectionTitle(num) {
  const titles = {
    1: '管理者',
    2: '個人情報の定義',
    3: '取得する情報',
    4: '情報の利用目的',
    5: 'Cookieの利用について',
    6: 'プライバシーポリシーの変更',
  };
  return titles[num] || `セクション${num}`;
}

export default TermsAndPrivacy;
