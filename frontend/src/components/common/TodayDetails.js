import React, { useState, useEffect } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import SectionContainer from '../ui/SectionContainer';
import CongestionLegend from './CongestionLegend';
import AnalysisInfoButton from '../ui/AnalysisInfoButton';

const TodayDetails = () => {
    const { selectedAction, selectedLocation, loading } = useCalendar();
    const { getCellColor, getTextColor } = useColorPalette();
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    const [todayData, setTodayData] = useState(null);
    const [summaryData, setSummaryData] = useState(null);
    const [error, setError] = useState('');
    const [fetchLoading, setFetchLoading] = useState(false);

    // 今日の日付を取得（YYYY-MM-DD形式）
    const getTodaysDate = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // 日付を日本風にフォーマット（2025/7/16(水)）
    const formatDateJapanese = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const dayOfWeek = ['日', '月', '火', '水', '木', '金', '土'][date.getDay()];
        return `${year}/${month}/${day}(${dayOfWeek})`;
    };

    // 曜日を日本語に変換
    const getDayOfWeekJapanese = (dayOfWeekEng) => {
        const dayMap = {
            'Mon': '月',
            'Tue': '火', 
            'Wed': '水',
            'Thu': '木',
            'Fri': '金',
            'Sat': '土',
            'Sun': '日'
        };
        return dayMap[dayOfWeekEng] || dayOfWeekEng;
    };

    // 短縮日付フォーマット（7/16）
    const formatDateShort = (dateString) => {
        const date = new Date(dateString);
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${month}/${day}`;
    };

    // 場所名をAPIで使用する形式に変換
    const getApiLocation = (location) => {
        if (!location) return '';
        const locationMap = {
            'omotesando': 'omotesando',
            'yottekan': 'yottekan',
            'honmachi4': 'honmachi4',
            'honmachi3': 'honmachi3',
            'honmachi2': 'honmachi2',
            'kokubunjidori': 'kokubunjidori',
            'yasukawadori': 'yasukawadori',
            'jinnya': 'jinnya',
            'nakabashi': 'nakabashi',
            'old-town': 'old-town',
            'station': 'station',
            'gyouzinbashi': 'gyouzinbashi'
        };
        return locationMap[location] || location;
    };

    // 場所名を日本語で表示
    const getLocationDisplayName = (location) => {
        const locationMap = {
            'omotesando': '表参道',
            'yottekan': 'よって館しもちょう',
            'honmachi4': '本町4丁目商店街',
            'honmachi3': '本町3丁目商店街',
            'honmachi2': '本町2丁目商店街',
            'kokubunjidori': '国分寺通り 第二商店街',
            'yasukawadori': 'やすかわ通り商店街',
            'jinnya': '高山陣屋前交差点',
            'nakabashi': '中橋',
            'old-town': '古い町並',
            'station': '駅前',
            'gyouzinbashi': '行神橋'
        };
        return locationMap[location] || location;
    };

    // データを取得
    useEffect(() => {
        const fetchTodayData = async () => {
            if (!selectedLocation) return;

            setFetchLoading(true);
            setError('');
            
            try {
                const apiLocation = getApiLocation(selectedLocation);
                const todaysDate = getTodaysDate();
                
                // CalendarContext.jsと同じベースURL設定を使用
                const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';
                
                // タイムアウト付きのfetch関数
                const fetchWithTimeout = (url, options = {}, timeout = 8000) => {
                    return Promise.race([
                        fetch(url, options),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Request timeout')), timeout)
                        )
                    ]);
                };

                // 並行リクエストを順次リクエストに変更（モバイル環境での安定性向上）
                const detailResponse = await fetchWithTimeout(
                    `${baseUrl}congestion-data/${apiLocation}?target_date=${todaysDate}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
                
                if (!detailResponse.ok) {
                    throw new Error(`詳細データの取得に失敗しました (${detailResponse.status})`);
                }
                
                const detailData = await detailResponse.json();
                setTodayData(detailData);

                // 1つ目が成功してから2つ目を実行
                const summaryResponse = await fetchWithTimeout(
                    `${baseUrl}congestion-data/${apiLocation}/summary?target_date=${todaysDate}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
                
                if (!summaryResponse.ok) {
                    throw new Error(`サマリーデータの取得に失敗しました (${summaryResponse.status})`);
                }
                
                const summaryData = await summaryResponse.json();
                setSummaryData(summaryData);
                
            } catch (err) {
                console.error('Error fetching today data:', err);
                if (err.message.includes('timeout')) {
                    setError('通信がタイムアウトしました。しばらく待ってから再度お試しください。');
                } else if (err.message.includes('Failed to fetch')) {
                    setError('ネットワークエラーが発生しました。インターネット接続を確認してください。');
                } else {
                    setError(`データの取得中にエラーが発生しました: ${err.message}`);
                }
            } finally {
                setFetchLoading(false);
            }
        };

        fetchTodayData();
    }, [selectedLocation]);

    // "today_details"アクションが選択された時のみ表示
    if (!selectedAction || selectedAction !== 'today_details') {
        return null;
    }

    // ローディング中の表示
    if (loading || fetchLoading) {
        return (
            <SectionContainer>
                <Typography variant="body1" align="center">
                    今日のデータを読み込んでいます...
                </Typography>
            </SectionContainer>
        );
    }

    // エラー表示
    if (error) {
        return (
            <SectionContainer>
                <Typography variant="body1" color="error" align="center">
                    {error}
                </Typography>
            </SectionContainer>
        );
    }

    // データがない場合
    if (!todayData || !summaryData) {
        return (
            <SectionContainer>
                <Typography variant="body1" align="center">
                    まず計測場所を選択してください
                </Typography>
            </SectionContainer>
        );
    }

    // 今日のデータを見つける → 昨日のデータと去年のデータを取得する
    const getYesterdayAndLastYearData = () => {
        if (!todayData || !todayData.data) return { yesterdayEntry: null, lastYearEntry: null };
        
        const yesterdayEntry = todayData.data.yesterday_hourly;
        const lastYearEntry = todayData.data.last_year_today_hourly;
        
        return { yesterdayEntry, lastYearEntry };
    };

    const { yesterdayEntry, lastYearEntry } = getYesterdayAndLastYearData();

    return (
        <SectionContainer>
            {/* タイトル部分 - Calendar.jsのスタイルに合わせる */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                mb: 2,
                px: 1
            }}>
                <Typography 
                    variant={isMobile ? "subtitle1" : "h5"} 
                    sx={{ textAlign: isMobile ? 'center' : 'left' }}
                >
                    {getLocationDisplayName(selectedLocation)}の混雑状況
                </Typography>
                
                <AnalysisInfoButton 
                    analysisType="today"
                    place={selectedLocation}
                />
            </Box>

            {summaryData && summaryData.data && (
                <>
                    {/* 今日の概要 - 混雑度が0の場合は非表示 */}
                    {(() => {
                        const todaysDate = getTodaysDate();
                        const todaySummary = summaryData.data.recent_week_daily_summary.find(day => day.date === todaysDate);
                        
                        // 今日のデータがないか、混雑度が0の場合は表示しない
                        if (!todaySummary || todaySummary.congestion_level === 0) {
                            return null;
                        }
                        
                        return (
                            <Box sx={{ mb: 3 }}>
                                <Typography 
                                    variant={isMobile ? "subtitle1" : "h6"} 
                                    gutterBottom 
                                    sx={{ 
                                        fontWeight: 'bold', 
                                        mb: 2,
                                        color: 'text.primary'
                                    }}
                                >
                                    {formatDateJapanese(getTodaysDate())} の概要
                                </Typography>
                                
                                <Box sx={{ 
                                    maxWidth: '500px', 
                                    border: '1px solid #ddd', 
                                    borderRadius: '8px', 
                                    overflow: 'hidden',
                                    backgroundColor: '#fff'
                                }}>
                                    {(() => {
                                        const cellColor = getCellColor(todaySummary.congestion_level);
                                        const textColor = getTextColor(todaySummary.congestion_level);
                                        
                                        return (
                                            <Box sx={{ 
                                                display: 'flex',
                                                alignItems: 'center',
                                                p: 2,
                                                gap: 2
                                            }}>
                                                {/* 混雑度セル */}
                                                <Box
                                                    sx={{
                                                        width: isMobile ? '80px' : '100px',
                                                        height: isMobile ? '80px' : '100px',
                                                        backgroundColor: cellColor,
                                                        color: textColor,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        border: '1px solid rgba(0,0,0,0.1)',
                                                        borderRadius: '4px',
                                                        gap: '2px'
                                                    }}
                                                >
                                                    <Typography 
                                                        sx={{
                                                            fontSize: isMobile ? '12px' : '14px',
                                                            lineHeight: '1',
                                                            fontWeight: '500',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {formatDateShort(todaySummary.date)}
                                                    </Typography>
                                                    <Typography 
                                                        sx={{ 
                                                            fontSize: isMobile ? '32px' : '40px',
                                                            lineHeight: '1',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {todaySummary.congestion_level}
                                                    </Typography>
                                                </Box>
                                                
                                                {/* 詳細情報 */}
                                                <Box sx={{ flex: 1 }}>
                                                    <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
                                                        混雑レベル {todaySummary.congestion_level}
                                                    </Typography>                                            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                                                {todaySummary.is_weekend ? "休日" : "平日"}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {getDayOfWeekJapanese(todaySummary.day_of_week)}曜日
                                            </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })()}
                                </Box>
                            </Box>
                        );
                    })()}

                    {/* 最近1週間の動向 - Calendar.jsスタイル */}
                    <Box sx={{ mb: 2 }}> {/* mb: 3 → 2に変更 */}
                        <Typography 
                            variant={isMobile ? "subtitle2" : "h6"} 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 'bold', 
                                mb: 1.5, // mb: 2 → 1.5に変更
                                color: 'text.primary'
                            }}
                        >
                            最近1週間の動向
                        </Typography>
                        
                        <Box sx={{ 
                            maxWidth: '800px', 
                            border: '1px solid #ddd', 
                            borderRadius: '8px', 
                            overflow: 'hidden',
                            backgroundColor: '#fff'
                        }}>
                            {/* 曜日のヘッダー */}
                            <Box sx={{ 
                                display: 'flex', 
                                backgroundColor: '#f5f5f5', 
                                borderBottom: '1px solid #ddd'
                            }}>
                                {summaryData.data.recent_week_daily_summary.map((day) => (
                                    <Box 
                                        key={day.date}
                                        sx={{ 
                                            flex: 1, 
                                            textAlign: 'center', 
                                            py: 0.8, // py: 1 → 0.8に変更
                                            borderRight: '1px solid #ddd',
                                            '&:last-child': { borderRight: 'none' }
                                        }}
                                    >
                                        <Typography 
                                            variant="body2" 
                                            sx={{ 
                                                fontWeight: 'bold',
                                                fontSize: isMobile ? '11px' : '13px' // フォントサイズを少し小さく
                                            }}
                                        >
                                            {getDayOfWeekJapanese(day.day_of_week)}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                            
                            {/* データセル */}
                            <Box sx={{ display: 'flex' }}>
                                {summaryData.data.recent_week_daily_summary.map((day) => {
                                    const todaysDate = getTodaysDate();
                                    const isToday = day.date === todaysDate;
                                    const hasData = day.congestion_level > 0;
                                    
                                    // データがない場合のスタイル
                                    if (!hasData) {
                                        return (
                                            <Box 
                                                key={day.date}
                                                sx={{ 
                                                    flex: 1,
                                                    backgroundColor: '#f5f5f5',
                                                    borderRight: '1px solid #ddd',
                                                    '&:last-child': { borderRight: 'none' },
                                                    height: isMobile ? (isSmallMobile ? '65px' : '75px') : '85px', // 高さを少し縮小
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: isSmallMobile ? '1px' : '2px',
                                                    color: '#999',
                                                    position: 'relative',
                                                    border: isToday ? '3px solid #1976d2' : undefined,
                                                    borderTop: isToday ? '3px solid #1976d2' : undefined,
                                                    borderBottom: isToday ? '3px solid #1976d2' : undefined
                                                }}
                                            >
                                                {/* 今日のバッジ */}
                                                {isToday && (
                                                    <Box 
                                                        sx={{ 
                                                            position: 'absolute', 
                                                            top: '-2px', 
                                                            right: '-2px',
                                                            backgroundColor: '#1976d2',
                                                            color: 'white',
                                                            padding: '1px 3px', // パディングを少し縮小
                                                            borderRadius: '2px',
                                                            fontSize: '0.55rem', // フォントサイズを少し小さく
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        今日
                                                    </Box>
                                                )}
                                                
                                                {/* 日付 */}
                                                <Typography 
                                                    sx={{
                                                        fontSize: isSmallMobile ? '11px' : isMobile ? '13px' : '15px', // フォントサイズを少し小さく
                                                        lineHeight: '1',
                                                        fontWeight: '500',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {formatDateShort(day.date)}
                                                </Typography>
                                                
                                                {/* データなし表示 */}
                                                <Typography 
                                                    sx={{ 
                                                        fontSize: isSmallMobile ? '9px' : '11px', // フォントサイズを小さく
                                                        lineHeight: '1',
                                                        fontWeight: 'bold',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    データ
                                                </Typography>
                                                <Typography 
                                                    sx={{ 
                                                        fontSize: isSmallMobile ? '9px' : '11px', // フォントサイズを小さく
                                                        lineHeight: '1',
                                                        fontWeight: 'bold',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    なし
                                                </Typography>
                                            </Box>
                                        );
                                    }
                                    
                                    // データがある場合の通常表示
                                    const cellColor = getCellColor(day.congestion_level);
                                    const textColor = getTextColor(day.congestion_level);
                                    
                                    return (
                                        <Box 
                                            key={day.date}
                                            sx={{ 
                                                flex: 1,
                                                backgroundColor: cellColor,
                                                borderRight: '1px solid #ddd',
                                                '&:last-child': { borderRight: 'none' },
                                                height: isMobile ? (isSmallMobile ? '65px' : '75px') : '85px', // 高さを少し縮小
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: isSmallMobile ? '1px' : '2px',
                                                color: textColor,
                                                position: 'relative',
                                                border: isToday ? '3px solid #1976d2' : undefined,
                                                borderTop: isToday ? '3px solid #1976d2' : undefined,
                                                borderBottom: isToday ? '3px solid #1976d2' : undefined
                                            }}
                                        >
                                            {/* 今日のバッジ */}
                                            {isToday && (
                                                <Box 
                                                    sx={{ 
                                                        position: 'absolute', 
                                                        top: '-2px', 
                                                        right: '-2px',
                                                        backgroundColor: '#1976d2',
                                                        color: 'white',
                                                        padding: '1px 3px', // パディングを少し縮小
                                                        borderRadius: '2px',
                                                        fontSize: '0.55rem', // フォントサイズを少し小さく
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    今日
                                                </Box>
                                            )}
                                            
                                            {/* 日付 */}
                                            <Typography 
                                                sx={{
                                                    fontSize: isSmallMobile ? '11px' : isMobile ? '13px' : '15px', // フォントサイズを少し小さく
                                                    lineHeight: '1',
                                                    fontWeight: '500',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {formatDateShort(day.date)}
                                            </Typography>
                                            
                                            {/* 混雑度 */}
                                            <Typography 
                                                sx={{ 
                                                    fontSize: isMobile ? (isSmallMobile ? '22px' : '26px') : '30px', // フォントサイズを少し小さく
                                                    lineHeight: '1',
                                                    fontWeight: 'bold',
                                                    textAlign: 'center'
                                                }}
                                            >
                                                {day.congestion_level}
                                            </Typography>
                                        </Box>
                                    );
                                })}
                            </Box>
                        </Box>
                    </Box>

                    {/* 前年の同期間データ */}
                    {summaryData.data.historical_data_available && summaryData.data.historical_daily_summary && (
                        <Box sx={{ mb: 2 }}> {/* mb: 3 → 2に変更 */}
                            <Typography 
                                variant={isMobile ? "subtitle2" : "h6"} 
                                gutterBottom 
                                sx={{ 
                                    fontWeight: 'bold', 
                                    mb: 1.5, // mb: 2 → 1.5に変更
                                    color: 'text.primary'
                                }}
                            >
                                前年同期間の比較（{summaryData.data.historical_reference_date.split('-')[0]}年）
                            </Typography>
                            
                            <Box sx={{ 
                                maxWidth: '800px', 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                overflow: 'hidden',
                                backgroundColor: '#fff'
                            }}>
                                {/* 曜日のヘッダー */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    backgroundColor: '#f0f8ff', 
                                    borderBottom: '1px solid #ddd'
                                }}>
                                    {summaryData.data.historical_daily_summary.slice(0, 8).map((day) => (
                                        <Box 
                                            key={day.date}
                                            sx={{ 
                                                flex: 1, 
                                                textAlign: 'center', 
                                                py: 0.8, // py: 1 → 0.8に変更
                                                borderRight: '1px solid #ddd',
                                                '&:last-child': { borderRight: 'none' }
                                            }}
                                        >
                                            <Typography 
                                                variant="body2" 
                                                sx={{ 
                                                    fontWeight: 'bold',
                                                    fontSize: isMobile ? '11px' : '13px' // フォントサイズを少し小さく
                                                }}
                                            >
                                                {getDayOfWeekJapanese(day.day_of_week)}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                                
                                {/* データセル - 前年と同じスタイルで高さを縮小 */}
                                <Box sx={{ display: 'flex' }}>
                                    {summaryData.data.historical_daily_summary.slice(0, 8).map((day) => {
                                        const isReferenceDate = day.days_from_reference === 0;
                                        const hasData = day.congestion_level > 0;
                                        
                                        // データがない場合のスタイル
                                        if (!hasData) {
                                            return (
                                                <Box 
                                                    key={day.date}
                                                    sx={{ 
                                                        flex: 1,
                                                        backgroundColor: '#f5f5f5',
                                                        borderRight: '1px solid #ddd',
                                                        '&:last-child': { borderRight: 'none' },
                                                        height: isMobile ? (isSmallMobile ? '65px' : '75px') : '85px', // 高さを少し縮小
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: isSmallMobile ? '1px' : '2px',
                                                        color: '#999',
                                                        position: 'relative',
                                                        border: isReferenceDate ? '3px solid #ff9800' : undefined,
                                                        borderTop: isReferenceDate ? '3px solid #ff9800' : undefined,
                                                        borderBottom: isReferenceDate ? '3px solid #ff9800' : undefined
                                                    }}
                                                >
                                                    {/* バッジと日付、データなし表示は同じスタイル */}
                                                    {isReferenceDate && (
                                                        <Box 
                                                            sx={{ 
                                                                position: 'absolute', 
                                                                top: '-2px', 
                                                                right: '-2px',
                                                                backgroundColor: '#ff9800',
                                                                color: 'white',
                                                                padding: '1px 3px', // パディングを少し縮小
                                                                borderRadius: '2px',
                                                                fontSize: '0.55rem', // フォントサイズを少し小さく
                                                                fontWeight: 'bold'
                                                            }}
                                                        >
                                                            前年
                                                        </Box>
                                                    )}
                                                    
                                                    <Typography 
                                                        sx={{
                                                            fontSize: isSmallMobile ? '11px' : isMobile ? '13px' : '15px',
                                                            lineHeight: '1',
                                                            fontWeight: '500',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {formatDateShort(day.date)}
                                                    </Typography>
                                                    
                                                    <Typography 
                                                        sx={{ 
                                                            fontSize: isSmallMobile ? '9px' : '11px',
                                                            lineHeight: '1',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        データ
                                                    </Typography>
                                                    <Typography 
                                                        sx={{ 
                                                            fontSize: isSmallMobile ? '9px' : '11px',
                                                            lineHeight: '1',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        なし
                                                    </Typography>
                                                </Box>
                                            );
                                        }
                                        
                                        // データがある場合の通常表示
                                        const cellColor = getCellColor(day.congestion_level);
                                        const textColor = getTextColor(day.congestion_level);
                                        
                                        return (
                                            <Box 
                                                key={day.date}
                                                sx={{ 
                                                    flex: 1,
                                                    backgroundColor: cellColor,
                                                    borderRight: '1px solid #ddd',
                                                    '&:last-child': { borderRight: 'none' },
                                                    height: isMobile ? (isSmallMobile ? '65px' : '75px') : '85px', // 高さを少し縮小
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: isSmallMobile ? '1px' : '2px',
                                                    color: textColor,
                                                    position: 'relative',
                                                    border: isReferenceDate ? '3px solid #ff9800' : undefined,
                                                    borderTop: isReferenceDate ? '3px solid #ff9800' : undefined,
                                                    borderBottom: isReferenceDate ? '3px solid #ff9800' : undefined
                                                }}
                                            >
                                                {/* バッジ、日付、混雑度は同じスタイルで縮小 */}
                                                {isReferenceDate && (
                                                    <Box 
                                                        sx={{ 
                                                            position: 'absolute', 
                                                            top: '-2px', 
                                                            right: '-2px',
                                                            backgroundColor: '#ff9800',
                                                            color: 'white',
                                                            padding: '1px 3px',
                                                            borderRadius: '2px',
                                                            fontSize: '0.55rem',
                                                            fontWeight: 'bold'
                                                        }}
                                                    >
                                                        前年
                                                    </Box>
                                                )}
                                                
                                                <Typography 
                                                    sx={{
                                                        fontSize: isSmallMobile ? '11px' : isMobile ? '13px' : '15px',
                                                        lineHeight: '1',
                                                        fontWeight: '500',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {formatDateShort(day.date)}
                                                </Typography>
                                                
                                                <Typography 
                                                    sx={{ 
                                                        fontSize: isMobile ? (isSmallMobile ? '22px' : '26px') : '30px',
                                                        lineHeight: '1',
                                                        fontWeight: 'bold',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {day.congestion_level}
                                                </Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            </Box>
                        </Box>
                    )}
                </>
            )}

            {/* 時間別詳細セクション - 昨日と去年のデータを表示 */}
            {(yesterdayEntry?.data_available || lastYearEntry?.data_available) && (
                <Box sx={{ mb: 2 }}> {/* mb: 3 → 2に変更 */}
                    <Typography 
                        variant={isMobile ? "subtitle2" : "h6"} 
                        gutterBottom 
                        sx={{ 
                            fontWeight: 'bold', 
                            mb: 1.5, // mb: 2 → 1.5に変更
                            color: 'text.primary'
                        }}
                    >
                        時間別詳細データ
                    </Typography>
                    
                    {/* 昨日のデータ */}
                    {yesterdayEntry?.data_available && (
                        <Box sx={{ mb: 3 }}>
                            <Typography 
                                variant="body1"
                                sx={{ 
                                    fontWeight: 'bold', 
                                    mb: 1.5, // mb: 2 → 1.5に変更
                                    color: 'text.primary',
                                    fontSize: isMobile ? '0.9rem' : '1rem' // フォントサイズを少し小さく
                                }}
                            >
                                昨日 - {formatDateJapanese(yesterdayEntry.date)}
                            </Typography>
                            
                            <Box sx={{ 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                overflow: 'hidden',
                                width: '100%',
                                maxWidth: '100%' // 最大幅を制限
                            }}>
                                <Box sx={{ 
                                    overflowX: 'auto',
                                    WebkitOverflowScrolling: 'touch',
                                    '&::-webkit-scrollbar': {
                                        height: '8px',
                                        width: '8px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: '#f1f1f1',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#c1c1c1',
                                        borderRadius: '4px'
                                    }
                                }}>
                                    {/* 時間帯ヘッダー */}
                                    <Box sx={{ 
                                        display: 'flex',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '1px solid #ddd',
                                        width: 'fit-content', // 必要な幅のみ使用
                                        minWidth: '100%'
                                    }}>
                                        {yesterdayEntry.hourly_congestion.map((hourData, index) => (
                                            <Box 
                                                key={`hour-header-${hourData.hour}`} 
                                                sx={{ 
                                                    minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                    width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                    textAlign: 'center', 
                                                    padding: isMobile ? '4px 2px' : '6px 2px',
                                                    borderRight: index !== yesterdayEntry.hourly_congestion.length - 1 ? '1px solid #ddd' : 'none',
                                                    flexShrink: 0,
                                                    height: isMobile ? (isSmallMobile ? '32px' : '36px') : '36px', // 高さを縮小
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Typography 
                                                    variant={isSmallMobile ? "bodyS" : "bodyM"}
                                                    fontWeight="bold"
                                                    sx={{
                                                        fontSize: isMobile ? (isSmallMobile ? '10px' : '11px') : '13px' // フォントサイズを少し小さく
                                                    }}
                                                >
                                                    {hourData.hour}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                    
                                    {/* データセル */}
                                    <Box sx={{ 
                                        display: 'flex',
                                        width: 'fit-content', // 必要な幅のみ使用
                                        minWidth: '100%'
                                    }}>
                                        {yesterdayEntry.hourly_congestion.map((hourData, index) => {
                                            const cellColor = getCellColor(hourData.congestion);
                                            const textColor = getTextColor(hourData.congestion);
                                            
                                            return (
                                                <Box
                                                    key={hourData.hour}
                                                    sx={{
                                                        minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                        width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                        height: isMobile ? (isSmallMobile ? '40px' : '45px') : '45px', // 高さを少し縮小
                                                        backgroundColor: hourData.congestion === 0 ? '#e0e0e0' : cellColor,
                                                        color: hourData.congestion === 0 ? '#666' : textColor,
                                                        borderRight: index !== yesterdayEntry.hourly_congestion.length - 1 ? '1px solid #ddd' : 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Typography 
                                                        sx={{ 
                                                            fontSize: isMobile ? (isSmallMobile ? '16px' : '18px') : '20px', // フォントサイズを少し小さく
                                                            lineHeight: '1',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {hourData.congestion === 0 ? '-' : hourData.congestion}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                    
                    {/* 前年同日のデータ - 同じスタイルで改善 */}
                    {lastYearEntry?.data_available && (
                        <Box sx={{ mb: 2 }}>
                            <Typography 
                                variant="body1"
                                sx={{ 
                                    fontWeight: 'bold', 
                                    mb: 1.5,
                                    color: 'text.primary',
                                    fontSize: isMobile ? '0.9rem' : '1rem'
                                }}
                            >
                                前年の同じ日 - {formatDateJapanese(lastYearEntry.date)}
                            </Typography>
                            
                            <Box sx={{ 
                                border: '1px solid #ddd', 
                                borderRadius: '8px', 
                                overflow: 'hidden',
                                width: '100%',
                                maxWidth: '100%'
                            }}>
                                <Box sx={{ 
                                    overflowX: 'auto',
                                    WebkitOverflowScrolling: 'touch',
                                    '&::-webkit-scrollbar': {
                                        height: '8px',
                                        width: '8px'
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: '#f1f1f1',
                                        borderRadius: '4px'
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        backgroundColor: '#c1c1c1',
                                        borderRadius: '4px'
                                    }
                                }}>
                                    {/* 時間帯ヘッダー */}
                                    <Box sx={{ 
                                        display: 'flex',
                                        backgroundColor: '#f5f5f5',
                                        borderBottom: '1px solid #ddd',
                                        width: 'fit-content',
                                        minWidth: '100%'
                                    }}>
                                        {lastYearEntry.hourly_congestion.map((hourData, index) => (
                                            <Box 
                                                key={`hour-header-${hourData.hour}`} 
                                                sx={{ 
                                                    minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                    width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                    textAlign: 'center', 
                                                    padding: isMobile ? '4px 2px' : '6px 2px',
                                                    borderRight: index !== lastYearEntry.hourly_congestion.length - 1 ? '1px solid #ddd' : 'none',
                                                    flexShrink: 0,
                                                    height: isMobile ? (isSmallMobile ? '32px' : '36px') : '36px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center'
                                                }}
                                            >
                                                <Typography 
                                                    variant={isSmallMobile ? "bodyS" : "bodyM"}
                                                    fontWeight="bold"
                                                    sx={{
                                                        fontSize: isMobile ? (isSmallMobile ? '10px' : '11px') : '13px'
                                                    }}
                                                >
                                                    {hourData.hour}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                    
                                    {/* データセル */}
                                    <Box sx={{ 
                                        display: 'flex',
                                        width: 'fit-content',
                                        minWidth: '100%'
                                    }}>
                                        {lastYearEntry.hourly_congestion.map((hourData, index) => {
                                            const cellColor = getCellColor(hourData.congestion);
                                            const textColor = getTextColor(hourData.congestion);
                                            
                                            return (
                                                <Box
                                                    key={hourData.hour}
                                                    sx={{
                                                        minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                        width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                        height: isMobile ? (isSmallMobile ? '40px' : '45px') : '45px',
                                                        backgroundColor: hourData.congestion === 0 ? '#e0e0e0' : cellColor,
                                                        color: hourData.congestion === 0 ? '#666' : textColor,
                                                        borderRight: index !== lastYearEntry.hourly_congestion.length - 1 ? '1px solid #ddd' : 'none',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        flexShrink: 0,
                                                    }}
                                                >
                                                    <Typography 
                                                        sx={{ 
                                                            fontSize: isMobile ? (isSmallMobile ? '16px' : '18px') : '20px',
                                                            lineHeight: '1',
                                                            fontWeight: 'bold',
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {hourData.congestion === 0 ? '-' : hourData.congestion}
                                                    </Typography>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </Box>
            )}

            {/* データがない場合の表示 */}
            {!yesterdayEntry?.data_available && !lastYearEntry?.data_available && summaryData && summaryData.data && (
                <Box sx={{ 
                    textAlign: 'center', 
                    py: 4,
                    backgroundColor: '#f9f9f9',
                    borderRadius: '8px',
                    border: '1px solid #ddd'
                }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        時間別の詳細データは利用できません
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        過去データ（上記の週間動向）をご参照ください
                    </Typography>
                </Box>
            )}

            {/* 凡例を追加 */}
            <CongestionLegend 
                showCalculationNote={false}
                legendType="calendar"
            />
        </SectionContainer>
    );
};

export default TodayDetails;
