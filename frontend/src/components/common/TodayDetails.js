import React, { useRef } from 'react';
import { Box, Typography, useMediaQuery } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import SectionContainer from '../ui/SectionContainer';
import CongestionLegend from './CongestionLegend';
import AnalysisInfoButton from '../ui/AnalysisInfoButton';
import { useTodayData } from '../../hooks/today/useTodayData';
import { getLocationDisplayName } from '../../utils/todayUtils';
import WeeklyTrend from '../today/WeeklyTrend';
import HourlyDetails from '../today/HourlyDetails';

const TodayDetails = () => {
    const { selectedAction, selectedLocation, loading } = useCalendar();
    const isMobile = useMediaQuery('(max-width:768px)');
    
    const { todayData, summaryData, error, fetchLoading, getTodaysDate } = useTodayData(selectedLocation);
    
    // スクロール連動のためのRef
    const currentYearScrollRef = useRef(null);
    const historicalScrollRef = useRef(null);

    // スクロール連動の処理
    const handleScroll = (sourceRef, targetRefs) => {
        if (!sourceRef.current) return;
        
        const scrollLeft = sourceRef.current.scrollLeft;
        targetRefs.forEach(targetRef => {
            if (targetRef.current && targetRef !== sourceRef) {
                targetRef.current.scrollLeft = scrollLeft;
            }
        });
    };

    // "today_details"アクションが選択された時のみ表示
    if (!selectedAction || selectedAction !== 'today_details') {
        console.log('TodayDetails: Action not selected or wrong action:', selectedAction);
        return null;
    }

    // ローディング中の表示
    if (loading || fetchLoading) {
        console.log('TodayDetails: Loading state:', { loading, fetchLoading });
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
        console.log('TodayDetails: Error state:', error);
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
        console.log('TodayDetails: No data:', { todayData: !!todayData, summaryData: !!summaryData });
        return (
            <SectionContainer>
                <Typography variant="body1" align="center">
                    まず計測場所を選択してください
                </Typography>
            </SectionContainer>
        );
    }

    console.log('TodayDetails: Rendering with data:', { 
        todayData: todayData, 
        summaryData: summaryData,
        hasRecentWeek: summaryData?.data?.recent_week_daily_summary?.length,
        hasHistorical: summaryData?.data?.historical_data_available
    });

    return (
        <SectionContainer>
            {/* タイトル部分 */}
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
                    analysisType="calendar"
                    place={selectedLocation}
                />
            </Box>

            {summaryData && summaryData.data && (
                <>
                    {/* 週間動向の比較セクション */}
                    <Box sx={{ mb: 2 }}>
                        <Typography 
                            variant={isMobile ? "subtitle2" : "h6"} 
                            gutterBottom 
                            sx={{ 
                                fontWeight: 'bold', 
                                mb: 1.5,
                                color: 'text.primary'
                            }}
                        >
                            一週間の比較
                        </Typography>
                        
                        {/* 最近1週間の動向 */}
                        <WeeklyTrend 
                            summaryData={summaryData}
                            getTodaysDate={getTodaysDate}
                            handleScroll={() => handleScroll(currentYearScrollRef, [historicalScrollRef])}
                            isHistorical={false}
                            scrollRef={currentYearScrollRef}
                        />

                        {/* 前年の同期間データ */}
                        <WeeklyTrend 
                            summaryData={summaryData}
                            getTodaysDate={getTodaysDate}
                            handleScroll={() => handleScroll(historicalScrollRef, [currentYearScrollRef])}
                            isHistorical={true}
                            scrollRef={historicalScrollRef}
                        />
                    </Box>
                </>
            )}

            {/* 時間別詳細セクション */}
            <HourlyDetails 
                todayData={todayData}
                handleScroll={handleScroll}
            />

            {/* 凡例を追加 */}
            <CongestionLegend 
                showCalculationNote={false}
                legendType="calendar"
            />
        </SectionContainer>
    );
};

export default TodayDetails;
