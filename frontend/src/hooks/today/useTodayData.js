import { useState, useEffect } from 'react';

export const useTodayData = (selectedLocation) => {
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

    useEffect(() => {
        const fetchTodayData = async () => {
            if (!selectedLocation) return;

            setFetchLoading(true);
            setError('');
            
            try {
                const apiLocation = getApiLocation(selectedLocation);
                const todaysDate = getTodaysDate();
                const weeksCount = 3; // 3週間分のデータを取得
                
                // eslint-disable-next-line no-undef
                const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';
                
                console.log('TodayDetails: Fetching data for:', apiLocation, 'date:', todaysDate, 'weeks:', weeksCount);
                
                const fetchWithTimeout = (url, options = {}, timeout = 30000) => {
                    return Promise.race([
                        fetch(url, options),
                        new Promise((_, reject) => 
                            setTimeout(() => reject(new Error('Request timeout')), timeout)
                        )
                    ]);
                };

                // 詳細データを取得（weeks_countパラメータ追加）
                const detailResponse = await fetchWithTimeout(
                    `${baseUrl}congestion-data/${apiLocation}?target_date=${todaysDate}&weeks_count=${weeksCount}`,
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
                console.log('TodayDetails: Detail data received:', detailData);
                setTodayData(detailData);

                // サマリーデータを取得（weeks_countパラメータ追加）
                const summaryResponse = await fetchWithTimeout(
                    `${baseUrl}congestion-data/${apiLocation}/summary?target_date=${todaysDate}&weeks_count=${weeksCount}`,
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    }
                );
                
                if (!summaryResponse.ok) {
                    throw new Error(`サマリーデータの取得に失敗しました (${summaryResponse.status})`);
                }
                
                const summaryDataResult = await summaryResponse.json();
                console.log('TodayDetails: Summary data received:', summaryDataResult);
                
                // レスポンスデータの詳細ログ
                console.log('TodayDetails: Summary data details:', {
                    recentWeekLength: summaryDataResult?.data?.recent_week_daily_summary?.length,
                    historicalLength: summaryDataResult?.data?.historical_daily_summary?.length,
                    weeksCount: summaryDataResult?.data?.weeks_count,
                    actualDays: summaryDataResult?.data?.actual_days,
                    startDate: summaryDataResult?.data?.recent_week_start_date,
                    endDate: summaryDataResult?.data?.recent_week_end_date
                });
                
                // 天気情報の詳細ログ
                console.log('TodayDetails: Weather info check:', {
                    firstDayWeather: summaryDataResult?.data?.recent_week_daily_summary?.[0]?.weather_info,
                    todayWeather: summaryDataResult?.data?.recent_week_daily_summary?.find(d => d.is_today)?.weather_info,
                    hasWeatherInfo: summaryDataResult?.data?.recent_week_daily_summary?.some(d => d.weather_info)
                });
                
                // サマリーデータに詳細データの一部をマージして補完
                if (summaryDataResult.data && detailData.data) {
                    // recent_week_daily_summaryが期待より少ない場合、詳細データから補完
                    const expectedDays = weeksCount * 7;
                    const currentSummaryLength = summaryDataResult.data.recent_week_daily_summary?.length || 0;
                    
                    if (currentSummaryLength < expectedDays) {
                        console.log(`TodayDetails: データ補完が必要 - 現在: ${currentSummaryLength}日, 期待: ${expectedDays}日`);
                        
                        // 詳細データのextended_weekから補完
                        const extendedWeekData = detailData.data.extended_week?.daily_data || [];
                        console.log('TodayDetails: Extended week data length:', extendedWeekData.length);
                        
                        if (extendedWeekData.length > currentSummaryLength) {
                            const supplementedData = extendedWeekData.map(day => ({
                                date: day.date,
                                day_of_week: day.day_of_week,
                                congestion_level: day.congestion_level,
                                is_weekend: day.is_weekend,
                                week_of_month_label: day.week_of_month_label,
                                is_today: day.is_today || false,
                                days_from_today: day.days_from_today || 0,
                                weather_info: day.weather_info || null  // 天気情報を追加
                            }));
                            
                            summaryDataResult.data.recent_week_daily_summary = supplementedData;
                            summaryDataResult.data.actual_days = supplementedData.length;
                            
                            console.log('TodayDetails: データ補完完了:', {
                                supplementedLength: supplementedData.length,
                                firstDate: supplementedData[0]?.date,
                                lastDate: supplementedData[supplementedData.length - 1]?.date,
                                hasWeatherInfo: supplementedData.some(d => d.weather_info),
                                firstWeather: supplementedData[0]?.weather_info
                            });
                        }
                    }
                    
                    // 詳細データも追加してフォールバック用に保持
                    summaryDataResult.data.extended_week = detailData.data.extended_week;
                    summaryDataResult.data.historical_comparison = detailData.data.historical_comparison;
                }
                
                setSummaryData(summaryDataResult);
                
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

    return {
        todayData,
        summaryData,
        error,
        fetchLoading,
        getTodaysDate
    };
};
