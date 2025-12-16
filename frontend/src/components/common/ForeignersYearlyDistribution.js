import React, { useEffect, useMemo, useState } from 'react';
import { Box, Typography, CircularProgress, useMediaQuery, Paper, Button } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts';
import SectionContainer from '../ui/SectionContainer';
import { useCalendar } from '../../contexts/CalendarContext';

const FOREIGNERS_ALLOWED_YEARS = ['2023', '2024'];
const TOP_N = 300;
const DEFAULT_LINE_COUNT = 6;

const paletteColors = [
  '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#303f9f', '#1976d2',
  '#0288d1', '#0097a7', '#00796b', '#388e3c', '#689f38', '#afb42b',
  '#f9a825', '#f57c00', '#e64a19', '#5d4037', '#455a64', '#00897b',
  '#6d4c41', '#8d6e63', '#9e9d24', '#00695c', '#795548', '#3949ab',
];

const convertADToYear = (adYear) => {
  if (!adYear) return null;
  const yearNum = parseInt(adYear, 10);
  if (Number.isNaN(yearNum)) return null;
  return `R${yearNum - 2019 + 1}`;
};

const isUnknownCountry = (name) => {
  if (!name) return true;
  return String(name).includes('不明');
};

function ForeignersYearlyDistribution() {
  const { selectedYear } = useCalendar();
  const isMobile = useMediaQuery('(max-width:768px)');

  const [yearlyData, setYearlyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAllLines, setShowAllLines] = useState(false);

  const isYearAllowed = selectedYear && FOREIGNERS_ALLOWED_YEARS.includes(selectedYear);

  useEffect(() => {
    const fetchYearly = async () => {
      if (!isYearAllowed) {
        setYearlyData(null);
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
          `${baseUrl}api/foreigners/yearly-distribution?year=${encodeURIComponent(yearLabel)}&top_n=${TOP_N}`,
          { method: 'GET', headers: { 'Content-Type': 'application/json' } }
        );

        if (!response.ok) {
          if (response.status === 404) {
            setYearlyData(null);
            setError(null);
            return;
          }
          throw new Error(`データの取得に失敗しました (${response.status})`);
        }

        const result = await response.json();
        if (result.success && result.data) {
          setYearlyData(result.data);
        } else {
          throw new Error('データの形式が正しくありません');
        }
      } catch (err) {
        setError(err.message);
        setYearlyData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchYearly();
  }, [selectedYear, isYearAllowed]);

  const countries = useMemo(
    () => (yearlyData?.top_countries || []).filter((c) => !isUnknownCountry(c)),
    [yearlyData]
  );
  const countryTotals = useMemo(() => {
    const totals = yearlyData?.country_totals || {};
    const filtered = {};
    Object.keys(totals).forEach((key) => {
      if (!isUnknownCountry(key)) {
        filtered[key] = totals[key];
      }
    });
    return filtered;
  }, [yearlyData]);
  const yearTotalGuests = useMemo(
    () => Object.values(countryTotals).reduce((sum, v) => sum + (v || 0), 0),
    [countryTotals]
  );

  const visibleCountries = useMemo(() => {
    if (showAllLines) return countries;
    return countries.slice(0, DEFAULT_LINE_COUNT);
  }, [countries, showAllLines]);

  const colorMap = useMemo(() => {
    const map = {};
    let idx = 0;
    countries.forEach((country) => {
      map[country] = paletteColors[idx % paletteColors.length];
      idx += 1;
    });
    return map;
  }, [countries]);

  const graphData = useMemo(() => {
    const raw = yearlyData?.chart_data || [];
    if (!raw.length || !countries.length) return [];
    return raw.map((row) => {
      const out = {
        month: row.month,
        month_label: row.month_label,
      };
      countries.forEach((country) => {
        const guests = row[country] || 0;
        const total = row.total_guests || 0;
        out[country] = total ? Number(((guests / total) * 100).toFixed(2)) : 0;
      });
      return out;
    });
  }, [yearlyData, countries]);

  const rankingList = useMemo(
    () =>
      countries.map((country, index) => {
        const total = countryTotals[country] || 0;
        const share = yearTotalGuests ? (total / yearTotalGuests) * 100 : 0;
        return {
          rank: index + 1,
          country,
          total,
          sharePct: Number(share.toFixed(2)),
          color: colorMap[country],
        };
      }),
    [countries, countryTotals, yearTotalGuests, colorMap]
  );

  const renderTooltip = ({ active, payload, label }) => {
    if (!active || !payload || payload.length === 0) return null;
    return (
      <Paper sx={{ p: 1.2 }}>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((p) => {
          const country = p.dataKey;
          return (
            <Typography key={country} variant="body2" sx={{ color: p.color }}>
              {country}: {p.value}%
            </Typography>
          );
        })}
      </Paper>
    );
  };

  if (!isYearAllowed) return null;

  if (loading && !yearlyData) {
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

  if (!countries.length || !graphData.length) return null;

  return (
    <SectionContainer>
      <Paper elevation={1} sx={{ p: isMobile ? 2 : 3, borderRadius: '8px' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, mb: 1 }}>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', fontSize: isMobile ? '1rem' : '1.2rem' }}
          >
            {selectedYear}年 外国人宿泊者の年間分布（構成比%）
          </Typography>
          {countries.length > DEFAULT_LINE_COUNT && (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setShowAllLines((v) => !v)}
              sx={{ whiteSpace: 'nowrap' }}
            >
              {showAllLines ? `上位${DEFAULT_LINE_COUNT}件のみ` : `他${Math.max(0, countries.length - DEFAULT_LINE_COUNT)}件も表示`}
            </Button>
          )}
        </Box>

        <Box sx={{ minHeight: isMobile ? 320 : 360 }}>
          <ResponsiveContainer width="100%" height={isMobile ? 320 : 360}>
            <LineChart data={graphData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(0,0,0,0.08)" strokeDasharray="3 3" />
              <XAxis dataKey="month_label" tick={{ fontSize: isMobile ? 11 : 12 }} />
              <YAxis
                tick={{ fontSize: isMobile ? 11 : 12 }}
                unit="%"
                domain={[0, 'auto']}
              />
              <RechartsTooltip content={renderTooltip} />
              {visibleCountries.map((country) => (
                <Line
                  key={country}
                  type="monotone"
                  dataKey={country}
                  stroke={colorMap[country]}
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </Box>

        <Box sx={{ mt: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
            年間ランキング（合計）
          </Typography>
          <Box
            sx={{
              maxHeight: isMobile ? 260 : 320,
              overflow: 'auto',
              pr: 1,
            }}
          >
            {rankingList.map((item) => (
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
                    {item.country}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="body2">
                    {item.sharePct}%
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Paper>
    </SectionContainer>
  );
}

export default ForeignersYearlyDistribution;


