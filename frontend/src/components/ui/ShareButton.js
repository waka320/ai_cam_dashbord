import React, { useState } from 'react';
import PropTypes from 'prop-types'; // PropTypesをインポート
import { Button, Snackbar, Tooltip, IconButton, useMediaQuery } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useCalendar } from '../../contexts/CalendarContext';
import theme from '../../theme/theme';

function ShareButton({ variant = 'icon', size = 'medium' }) {
  const { selectedLocation, selectedAction, selectedYear, selectedMonth } = useCalendar();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // 現在のURLを取得し、クリップボードにコピーする関数
  const handleShare = () => {
    // 必要なパラメータがすべて揃っているか確認
    if (!selectedLocation || !selectedAction || !selectedYear || !selectedMonth) {
      return;
    }
    
    // 現在のベースURLを取得
    const baseUrl = window.location.origin + window.location.pathname;
    
    // URLパラメータを作成
    const params = new URLSearchParams();
    params.set('location', selectedLocation);
    params.set('action', selectedAction);
    params.set('year', selectedYear);
    params.set('month', selectedMonth);
    
    // 完全なURLを生成
    const shareableUrl = `${baseUrl}?${params.toString()}`;
    
    // Web Share APIが利用可能かチェック
    if (navigator.share && isMobile) {
      navigator.share({
        title: 'ダッシュボード共有',
        text: `${selectedYear}年${selectedMonth}月の${selectedLocation}データ`,
        url: shareableUrl,
      }).catch(err => {
        console.log('共有をキャンセルしました', err);
        // Web Share APIが失敗した場合はクリップボードにフォールバック
        copyToClipboard(shareableUrl);
      });
    } else {
      // Web Share APIが利用できない場合はクリップボードにコピー
      copyToClipboard(shareableUrl);
    }
  };
  
  // クリップボードにコピーする関数
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        // コピー成功時の通知表示
        setOpenSnackbar(true);
      })
      .catch(err => {
        console.error('クリップボードへのコピーに失敗しました:', err);
      });
  };
  
  // Snackbarを閉じる処理
  const handleCloseSnackbar = () => {
    setOpenSnackbar(false);
  };
  
  // ボタン無効化の条件
  const isDisabled = !selectedLocation || !selectedAction || !selectedYear || !selectedMonth;
  
  // ボタンかアイコンかでレンダリングを分ける
  return (
    <>
      {variant === 'button' ? (
        <Button
          variant="contained"
          startIcon={<ShareIcon />}
          onClick={handleShare}
          size={size}
          disabled={isDisabled}
          sx={{
            backgroundColor: 'white',
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
            },
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            borderRadius: '8px',
            height: '40px'
          }}
        >
          共有
        </Button>
      ) : (
        <Tooltip title={isDisabled ? "データが選択されていません" : "URLをコピー"}>
          <span>
            <IconButton
              onClick={handleShare}
              disabled={isDisabled}
              size={size}
              sx={{
                bgcolor: 'white', 
                color: theme.palette.primary.main,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
                '&:disabled': {
                  bgcolor: 'rgba(255, 255, 255, 0.6)',
                  color: 'rgba(0, 0, 0, 0.38)',
                },
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                borderRadius: '8px',
                width: size === 'small' ? '32px' : '40px',
                height: size === 'small' ? '32px' : '40px'
              }}
            >
              {isMobile ? <ShareIcon fontSize={size} /> : <ContentCopyIcon fontSize={size} />}
            </IconButton>
          </span>
        </Tooltip>
      )}
      
      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        message="URLをクリップボードにコピーしました"
      />
    </>
  );
}

// PropTypesによる型チェックを追加
ShareButton.propTypes = {
  variant: PropTypes.oneOf(['button', 'icon']), // 'button'または'icon'のみを許可
  size: PropTypes.oneOf(['small', 'medium', 'large']), // サイズは'small'/'medium'/'large'のみ許可
};

export default ShareButton;

