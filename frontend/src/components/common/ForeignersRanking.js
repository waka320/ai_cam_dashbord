import React, { useState, useEffect } from 'react';
import { Box, Typography, CircularProgress, useMediaQuery } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import theme from '../../theme/theme';

function ForeignersRanking() {
  const { selectedYear, selectedMonth, loading, dateChanging } = useCalendar();
  const [rankingData, setRankingData] = useState(null);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [error, setError] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');

  // 年度（R6など）を西暦（2024など）に変換
  const convertYearToAD = (yearLabel) => {
    if (!yearLabel) return '';
    
    // R6形式の場合（令和）
    const reiwaMatch = yearLabel.match(/R(\d+)/);
    if (reiwaMatch) {
      const reiwaYear = parseInt(reiwaMatch[1], 10);
      // 令和元年は2019年
      return 2019 + reiwaYear - 1;
    }
    
    // 既に西暦の場合はそのまま返す
    const adMatch = yearLabel.match(/(\d{4})/);
    if (adMatch) {
      return parseInt(adMatch[1], 10);
    }
    
    return yearLabel;
  };

  useEffect(() => {
    const fetchRanking = async () => {
      // 年と月が選択されていない場合は何もしない
      if (!selectedYear || !selectedMonth) {
        setRankingData(null);
        return;
      }

      // ローディング中や日付変更中は取得しない
      if (loading || dateChanging) {
        return;
      }

      setFetchLoading(true);
      setError(null);

      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/'; // eslint-disable-line no-undef
        const month = parseInt(selectedMonth);
        // 年度は指定せず、バックエンドで自動的に近い年度を選択
        const response = await fetch(
          `${baseUrl}api/foreigners/monthly-ranking?month=${month}&top_n=6`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (!response.ok) {
          // 404エラーの場合でも、エラーを表示せずにデータなしとして扱う
          if (response.status === 404) {
            console.warn('ForeignersRanking: ランキングデータが見つかりません');
            setRankingData(null);
            setError(null);
            return;
          }
          throw new Error(`ランキングデータの取得に失敗しました (${response.status})`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setRankingData(result.data);
        } else {
          throw new Error('データの形式が正しくありません');
        }
      } catch (err) {
        console.error('ForeignersRanking: Error fetching data:', err);
        // ネットワークエラーなどの場合のみエラーを表示
        if (err.message && !err.message.includes('404')) {
          setError(err.message);
        } else {
          setError(null);
        }
        setRankingData(null);
      } finally {
        setFetchLoading(false);
      }
    };

    // 少し遅延させて、メインのデータ取得が完了してから実行
    const timeoutId = setTimeout(() => {
      fetchRanking();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [selectedYear, selectedMonth, loading, dateChanging]);

  // 年と月が選択されていない場合は表示しない
  if (!selectedYear || !selectedMonth) {
    return null;
  }

  // ローディング中
  if (fetchLoading) {
    return (
      <Box
        sx={{
          px: 1,
          py: 0.5,
          mb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        <CircularProgress size={14} sx={{ color: theme.palette.primary.main }} />
      </Box>
    );
  }

  // エラー時
  if (error) {
    return null;
  }

  // データがない場合
  if (!rankingData || !rankingData.ranking || rankingData.ranking.length === 0) {
    return null;
  }

  return (
    <Box
      sx={{
        px: 1,
        py: 0.5,
        mb: 1,
      }}
    >
      <Typography
        sx={{
          fontSize: isMobile ? '0.7rem' : '0.75rem',
          fontWeight: 'bold',
          color: theme.palette.text.primary,
          mb: 0.5,
        }}
      >
        {convertYearToAD(rankingData.year)}年{rankingData.month_label}外国人宿泊割合
      </Typography>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flexWrap: 'wrap',
          fontSize: isMobile ? '0.7rem' : '0.75rem',
        }}
      >
        {rankingData.ranking.map((item, index) => (
          <Box
            key={index}
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.3,
              whiteSpace: 'nowrap',
            }}
          >
            <Typography
              component="span"
              sx={{
                fontSize: 'inherit',
                fontWeight: 'bold',
                color: theme.palette.primary.main,
              }}
            >
              {item.rank}.
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: 'inherit',
                color: theme.palette.text.primary,
              }}
            >
              {item.country}
            </Typography>
            <Typography
              component="span"
              sx={{
                fontSize: 'inherit',
                color: theme.palette.text.secondary,
              }}
            >
              {item.guests.toLocaleString()}人
            </Typography>
            {item.share_pct !== null && (
              <Typography
                component="span"
                sx={{
                  fontSize: 'inherit',
                  color: theme.palette.text.secondary,
                }}
              >
                ({item.share_pct}%)
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default ForeignersRanking;

