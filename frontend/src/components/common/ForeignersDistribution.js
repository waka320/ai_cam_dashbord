import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Box, Typography, CircularProgress, useMediaQuery, Paper } from '@mui/material';
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';
import { useCalendar } from '../../contexts/CalendarContext';
import SectionContainer from '../ui/SectionContainer';
import theme from '../../theme/theme';

const paletteColors = [
  '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#1976d2',
  '#0288d1', '#0097a7', '#00796b', '#388e3c', '#689f38', '#afb42b',
  '#f9a825', '#f57c00', '#e64a19', '#5d4037', '#455a64', '#00897b',
  '#6d4c41', '#8d6e63', '#9e9d24', '#00695c', '#795548', '#3949ab',
];
const FOREIGNERS_ALLOWED_YEARS = ['2023', '2024'];
const DEFAULT_FOREIGNERS_YEAR = '2024';
const UNKNOWN_LABEL = '未分類:不明';
const MIN_LABEL_PERCENT = 3; // 小さすぎるセグメントはラベルを表示しない

const formatCountryLabel = (item) => {
  if (!item) return '';
  const base = item.country || '未分類';
  if (base.includes('その他')) {
    return base.includes(':') ? base : (item.region ? `${item.region}:${base}` : base);
  }
  if (base === '未分類' && item.region) {
    return `${item.region}:${base}`;
  }
  return base;
};

const convertADToYear = (adYear) => {
  if (!adYear) return null;
  const yearNum = parseInt(adYear, 10);
  if (Number.isNaN(yearNum)) return null;
  return `R${yearNum - 2019 + 1}`;
};

function ForeignersDistribution() {
  const { selectedYear, selectedMonth, setSelectedYear } = useCalendar();
  const [rankingData, setRankingData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isYearAllowed = selectedYear && FOREIGNERS_ALLOWED_YEARS.includes(selectedYear);

  useEffect(() => {
    if (!selectedYear || !FOREIGNERS_ALLOWED_YEARS.includes(selectedYear)) {
      if (FOREIGNERS_ALLOWED_YEARS.includes(DEFAULT_FOREIGNERS_YEAR)) {
        setSelectedYear(DEFAULT_FOREIGNERS_YEAR);
      }
    }
  }, [selectedYear, setSelectedYear]);

  useEffect(() => {
    const fetchMonthlyRanking = async () => {
      if (!isYearAllowed || !selectedMonth) {
        setRankingData(null);
        setError(null);
        return;
      }
      const yearLabel = convertADToYear(selectedYear);
      if (!yearLabel) return;

      setLoading(true);
      setError(null);

      try {
        const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/'; // eslint-disable-line no-undef
        const response = await fetch(
          `${baseUrl}api/foreigners/monthly-ranking?month=${parseInt(selectedMonth, 10)}&year=${encodeURIComponent(
            yearLabel
          )}&top_n=50`,
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setRankingData(null);
            setError(null);
            return;
          }
          throw new Error(`データの取得に失敗しました (${response.status})`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setRankingData(result.data);
        } else {
          throw new Error('データの形式が正しくありません');
        }
      } catch (err) {
        setError(err.message);
        setRankingData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchMonthlyRanking();
  }, [selectedYear, selectedMonth, isYearAllowed]);

  const rankingList = useMemo(() => rankingData?.ranking || [], [rankingData]);
  const orderedRankingList = useMemo(() => {
    if (!rankingList) return [];
    const others = [];
    const unknowns = [];
    rankingList.forEach((item) => {
      const label = formatCountryLabel(item);
      if (label === UNKNOWN_LABEL) {
        unknowns.push(item);
      } else {
        others.push(item);
      }
    });
    // 不明系は表示しない
    return others;
  }, [rankingList]);
  const hasData = orderedRankingList.length > 0;
  const totalGuests = rankingData?.total_guests || 0;

  const colorMap = useMemo(() => {
    const map = {};
    let colorIndex = 0;
    orderedRankingList.forEach((item) => {
      const label = formatCountryLabel(item);
      if (label === UNKNOWN_LABEL) {
        map[item.country] = '#9e9e9e';
      } else {
        map[item.country] = paletteColors[colorIndex % paletteColors.length];
        colorIndex += 1;
      }
    });
    return map;
  }, [orderedRankingList]);

  const pieData = useMemo(
    () =>
      orderedRankingList.map((item) => {
        const share =
          item.share_pct ?? (totalGuests ? (item.guests / totalGuests) * 100 : 0);
        return {
          name: formatCountryLabel(item),
          value: parseFloat((share || 0).toFixed(2)),
          color: colorMap[item.country],
          country: item.country,
        };
      }),
    [orderedRankingList, totalGuests, colorMap]
  );

  const listItems = useMemo(
    () =>
      orderedRankingList.map((item, index) => ({
        ...item,
        displayName: formatCountryLabel(item),
        color: colorMap[item.country],
        rank: index + 1,
      })),
    [orderedRankingList, colorMap]
  );

  const selectedItem = useMemo(
    () => listItems.find((item) => item.country === selectedCountry) || null,
    [listItems, selectedCountry]
  );

  useEffect(() => {
    if (!listItems.some((item) => item.country === selectedCountry)) {
      setSelectedCountry(null);
    }
  }, [listItems, selectedCountry]);

  const handleSliceClick = useCallback(
    (_, index) => {
      const target = listItems[index];
      if (!target) return;
      setSelectedCountry((prev) => (prev === target.country ? null : target.country));
    },
    [listItems]
  );

  const renderPieLabel = useCallback(
    ({
      cx,
      cy,
      midAngle,
      innerRadius,
      outerRadius,
      percent,
      index,
    }) => {
      const pct = (percent || 0) * 100;
      if (pct * (isMobile ? 0.8 : 1) < MIN_LABEL_PERCENT) return null;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.7;
      const radian = Math.PI / 180;
      const x = cx + radius * Math.cos(-midAngle * radian);
      const y = cy + radius * Math.sin(-midAngle * radian);
      const label = pieData[index]?.name;
      if (!label) return null;
      return (
        <text
          x={x}
          y={y}
          fill="#fff"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
          style={{
            fontSize: isMobile ? 10 : 12,
            fontWeight: 600,
            textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          }}
        >
          {label}
        </text>
      );
    },
    [pieData, isMobile]
  );

  if (!isYearAllowed || !selectedMonth) {
    return null;
  }

  if (loading && !rankingData) {
    return (
      <SectionContainer>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
          <CircularProgress />
        </Box>
      </SectionContainer>
    );
  }

  if (error) {
    return (
      <SectionContainer>
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography color="error">{error}</Typography>
        </Box>
      </SectionContainer>
    );
  }

  if (!hasData) {
    return null;
  }

  const renderTooltip = ({ active, payload }) => {
    if (!active || !payload || payload.length === 0) return null;
    const entry = payload[0];
    return (
      <Paper sx={{ p: 1.2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {entry.name}
        </Typography>
        <Typography variant="body2">
          {entry.value}%
        </Typography>
      </Paper>
    );
  };

  const monthLabel = rankingData.month_label || `${parseInt(selectedMonth, 10)}月`;

  return (
    <SectionContainer>
      <Paper
        elevation={1}
        sx={{
          p: isMobile ? 2 : 3,
          borderRadius: '8px',
        }}
      >
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 'bold',
              fontSize: isMobile ? '1rem' : '1.2rem',
            }}
          >
            {selectedYear}年 {monthLabel} 外国人宿泊者の分布
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
          }}
        >
          <Box sx={{ flex: 1, minHeight: isMobile ? 360 : 420 }}>
            <ResponsiveContainer width="100%" height={isMobile ? 360 : 420}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  startAngle={90}
                  endAngle={-270}
                  outerRadius={isMobile ? 150 : 200}
                  innerRadius={isMobile ? 20 : 40}
                  paddingAngle={0}
                  label={renderPieLabel}
                  labelLine={false}
                  onClick={handleSliceClick}
                >
                  {pieData.map((entry) => {
                    const isSelected = selectedItem?.country === entry.country;
                    return (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke={isSelected ? theme.palette.common.white : 'transparent'}
                        strokeWidth={isSelected ? 2 : 1}
                        fillOpacity={selectedItem && !isSelected ? 0.6 : 1}
                        style={{ cursor: 'pointer' }}
                      />
                    );
                  })}
                </Pie>
                <RechartsTooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              国別一覧
            </Typography>
            <Box sx={{ maxHeight: isMobile ? 260 : 320, overflow: 'auto', pr: 1 }}>
              {listItems.map((item) => (
                <Box
                  key={item.country}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    py: 0.5,
                    px: 0.75,
                    borderBottom: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Typography variant="body2" sx={{ width: 32, fontWeight: 600 }}>
                    {item.rank}.
                  </Typography>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '999px',
                      backgroundColor: item.color,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {item.displayName}
                    </Typography>
                    <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                      {item.region || '地域不明'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2">
                      {item.share_pct != null ? `${item.share_pct}%` : '-'}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      </Paper>
    </SectionContainer>
  );
}

export default ForeignersDistribution;

