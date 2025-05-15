import React from 'react';
import { Container, Typography, Box, Paper, Divider, useMediaQuery, List, ListItem, ListItemText, Tabs, Tab } from '@mui/material';

const TermsAndPrivacy = () => {
  const isMobile = useMediaQuery('(max-width:768px)');
  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  
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
            利用規約・プライバシーポリシー
          </Typography>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="body1" >
              本規約は、名古屋大学 遠藤・浦田研究室（以下、「当研究室」といいます）と高山市との連携に基づき提供する「目的ベースダッシュボード」（以下、「本サービス」といいます）について、利用者による利用の一切について適用されるものです。本サービスの利用にあたっては本規約への同意を条件としますので、利用前に必ず本規約を確認のうえ、理解いただくようお願いします。
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
              <Tabs value={value} onChange={handleChange} aria-label="利用規約とプライバシーポリシータブ">
                <Tab label="利用規約" id="tab-0" aria-controls="tabpanel-0" />
                <Tab label="プライバシーポリシー" id="tab-1" aria-controls="tabpanel-1" />
              </Tabs>
            </Box>
            
            {/* 利用規約部分 */}
            <Box
              role="tabpanel"
              hidden={value !== 0}
              id="tabpanel-0"
              aria-labelledby="tab-0"
            >
              {value === 0 && (
                <>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      1. 本規約の適用範囲
                    </Typography>
                    <Typography variant="body1" >
                      利用者は、本サービスを利用する前に本規約に同意される必要があり、同意されない場合は、本サービスを利用いただけません。
                    </Typography>
                    <Typography variant="body1" >
                      当研究室では、利用者の了承を得ることなく本規約を変更する場合がございます。変更後の規約は、それが本サービスの画面に表示された時点で効力を発揮するものとします。本規約の変更後に本サービスを利用された場合は、変更後の規約に同意されたものとみなします。
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      2. サービス内容
                    </Typography>
                    <Typography variant="body1" >
                      本サービスは、当研究室と高山市との連携のもと、高山市のオープンデータを活用し、高山市商店街の事業者向けにデータダッシュボードを提供します。
                    </Typography>
                    <Typography variant="body1" >
                      データ取得のタイミング等の原因により、本サービス上での表示と実際の状況が異なる場合があります。
                    </Typography>
                    <Typography variant="body1" >
                      本サービスは無料で提供しますが、本サービスを利用する際に発生する通信料については利用者負担となります。
                    </Typography>
                    <Typography variant="body1" >
                      本サービスは地域DX推進プロジェクトの一環として構築したものであり、予告なく運用の中断や内容の変更等を行うことがあります。
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      3. 著作権について
                    </Typography>
                    <Typography variant="body1" >
                      本サービスのコンテンツ（文章、画像、デザインなど）の著作権は、当研究室または正当な権利を有する第三者に帰属します。無断での複製、転載は禁止します。
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      4. 免責事項
                    </Typography>
                    <Typography variant="body1" >
                      本サービスは地域DX推進プロジェクトの一環として構築したものであり、本サービスを利用するものとします。したがって、本サービスを利用してなされた行為やその結果生じた損害（第三者に対するものを含みます。以下同じ。）について、利用者が一切の責任を負うことに同意するものとします。
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスにより提供する一切の情報について、可用性、正確性、有用性、特定の目的に対する適合性等を保障しません。" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスの情報は、高山市のオープンデータを元に作成していますが、その正確性を保証するものではありません。" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスによって得た情報に基づいた利用者の判断により発生した一切の損害について、当研究室及び高山市はいかなる責任も負いません。" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスの変更や内容の欠陥等によって生じたあらゆる損害について理由の如何に関わらず当研究室及び高山市はいかなる責任も負いません。" />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      5. 禁止事項
                    </Typography>
                    <Typography variant="body1" >
                      利用者は、次に掲げる行為を行ってはならないものとします。利用者の違反行為により生じた損害は、その全てに関して賠償責任を負うものとします。
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスを当研究室が承認しない方法によって利用する行為" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスを商業・営利目的で利用する行為（当研究室の許可を得た場合を除く）" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスを構築するサーバー、ネットワークへ過負荷をかけたり、何らかの支障を及ぼしうる行為" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスで使用されているAPIを本サービス以外で利用する行為" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本規約または公序良俗に違反する行為" />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      6. ご利用環境について
                    </Typography>
                    <Typography variant="body1" >
                      本サービスの利用には特定のアプリは不要で、スマートフォンやPC、タブレット端末上のウェブブラウザで利用できます。本サービスはGoogle Chromeで動作確認をしています。
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
            
            {/* プライバシーポリシー部分 */}
            <Box
              role="tabpanel"
              hidden={value !== 1}
              id="tabpanel-1"
              aria-labelledby="tab-1"
            >
              {value === 1 && (
                <>
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      1. 管理者
                    </Typography>
                    <Typography variant="body1">
                      本サービス「目的ベースダッシュボード」は以下の事業者が提供・運営しています。
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="事業者名：名古屋大学 遠藤・浦田研究室" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="所在地：愛知県名古屋市千種区不老町" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="連絡先：xxx@xxx.nagoya-u.ac.jp（仮）" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="管理者：若松ゆうき" />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      2. 個人情報の定義
                    </Typography>
                    <Typography variant="body1" >
                      本ポリシーにおいて、「個人情報」とは、個人情報保護法に定義される個人情報、すなわち、生存する個人に関する情報であって、当該情報に含まれる氏名、生年月日、住所、電話番号、メールアドレスなどの記述等により特定の個人を識別できる情報を指します。
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      3. 取得する情報
                    </Typography>
                    <Typography variant="body1" >
                      本サービスでは、サービスの提供・改善のために、以下の情報を取得することがあります。
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="アクセス情報（IPアドレス、ブラウザの種類、参照元ページなど）" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="デバイス情報（OS、画面サイズなど）" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービス利用時の操作ログ（閲覧したページ、クリックした要素など）" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="Cookie（サービス利用状態の保持など）" />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      4. 情報の利用目的
                    </Typography>
                    <Typography variant="body1" >
                      取得した情報は、以下の目的のために利用します。
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスの提供・運営" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="本サービスの機能向上・改善" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="利用状況の分析・統計情報の作成（個人を特定できない形式でのみ実施）" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="地域DX推進に関する学術研究（個人を特定できない形式でのみ実施）" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="不正アクセスや不正利用防止のためのセキュリティ対策" />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      5. データの管理方法
                    </Typography>
                    <Typography variant="body1" >
                      当研究室は、取得した情報の管理において、以下の対策を講じています。
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="アクセス権限の制限・管理" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="セキュリティソフトウェアの導入" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="定期的なセキュリティ教育の実施" />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      6. 第三者提供について
                    </Typography>
                    <Typography variant="body1" >
                      当研究室は、以下の場合を除き、取得した情報を第三者に提供することはありません。
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="法令に基づく場合" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="人の生命、身体または財産の保護のために必要がある場合" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="公衆衛生の向上のために特に必要がある場合" />
                      </ListItem>
                    </List>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      7. Cookieの利用について
                    </Typography>
                    <Typography variant="body1" >
                      本サービスでは、サービス向上や利用状態の保持のためにCookieを使用しています。ブラウザの設定により、Cookieの受け入れを拒否することも可能ですが、一部のサービス機能が利用できなくなる場合があります。
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      8. ユーザーの権利
                    </Typography>
                    <Typography variant="body1" >
                      個人情報保護法に基づき、ユーザーには以下の権利があります。
                    </Typography>
                    <List sx={{ pl: 2 }}>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="権利１" />
                      </ListItem>
                      <ListItem sx={{ py: 0.5 }}>
                        <ListItemText primary="権利２" />
                      </ListItem>

                    </List>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      これらの権利行使をご希望の場合は、「1. 事業者情報」に記載の連絡先までご連絡ください。ご本人確認の上、法令の定めに従い対応いたします。なお、本サービスで収集する情報は主に統計的な利用状況であり、特定の個人を識別できる情報は最小限に留めております。
                    </Typography>
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                      9. プライバシーポリシーの変更
                    </Typography>
                    <Typography variant="body1" >
                      本ポリシーの内容は、法令の変更や本サービスの仕様変更等に伴い、予告なく変更される場合があります。変更があった場合は、本ウェブサイト上に変更後のポリシーを掲載します。
                    </Typography>
                  </Box>
                </>
              )}
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              制定日: 2025年5月11日<br />
              最終更新日: 2025年5月11日
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default TermsAndPrivacy;
