import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

// Cookie操作用のユーティリティ関数
const setCookie = (name, value, days = 30) => {
  const date = new Date();
  date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
  const expires = `expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value};${expires};path=/`;
};

const getCookie = (name) => {
  const cookieName = `${name}=`;
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    let cookie = cookies[i].trim();
    if (cookie.indexOf(cookieName) === 0) {
      return cookie.substring(cookieName.length, cookie.length);
    }
  }
  return '';
};

// ページタイプに応じたCookieキーを生成する関数
const getCookieKeys = (pageType) => {
  const prefix = pageType === 'purpose' ? 'purpose_' : 
                pageType === 'function' ? 'function_' : '';
  
  return {
    LOCATION: `${prefix}dashboard_location`,
    ACTION: `${prefix}dashboard_action`,
    YEAR: `${prefix}dashboard_year`,
    MONTH: `${prefix}dashboard_month`
  };
};

// 各ダッシュボードで有効なアクション
const VALID_ACTIONS = {
  purpose: [
    "today_details", "cal_holiday", "cal_shoping_holiday", "cal_long_holiday", 
    "cal_event", "cal_training", "dti_event_time", "wti_shift", 
    "dti_open_hour", "dti_shoping_open_hour"
  ],
  function: [
    "cal_cog", "dti_cog", "wti_cog", "month_trend", "week_trend"
  ]
};

// デフォルトアクション
const DEFAULT_ACTIONS = {
  purpose: "today_details",
  function: "cal_cog"
};

// アクションの有効性をチェック
const isValidActionForPage = (action, pageType) => {
  if (pageType === 'default') return true; // デフォルトページでは全て有効
  return VALID_ACTIONS[pageType]?.includes(action) || false;
};

// 無効なアクションの場合のデフォルト値を取得
const getValidActionForPage = (action, pageType) => {
  if (isValidActionForPage(action, pageType)) {
    return action;
  }
  return DEFAULT_ACTIONS[pageType] || '';
};

const CalendarContext = createContext();

export const useCalendar = () => {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendar must be used within a CalendarProvider');
  }
  return context;
};

export const CalendarProvider = ({ children, searchParams, setSearchParams }) => {
  const location = useLocation();
  
  // 現在のページタイプを判定
  const getPageType = () => {
    if (location.pathname === '/purpose') return 'purpose';
    if (location.pathname === '/function') return 'function';
    return 'default';
  };
  
  const pageType = getPageType();
  const COOKIE_KEYS = getCookieKeys(pageType);
  
  // データ取得実行中フラグ
  const [isFetchingData, setIsFetchingData] = useState(false);
  
  // 現在の年月を取得
  const today = new Date();
  const currentYear = today.getFullYear().toString();
  const currentMonth = (today.getMonth() + 1).toString();
  
  // URLパラメータから初期値を取得（URLパラメータがない場合は現在の年月をデフォルト値として使用）
  const initialLocation = searchParams.get('location') || '';
  const initialAction = searchParams.get('action') || '';
  const initialYear = searchParams.get('year') || currentYear;
  const initialMonth = searchParams.get('month') || currentMonth;
  
  // Abort Controller のためのRef
  const abortControllerRef = useRef(null);

  // 状態の初期化（URLパラメータ優先）
  const [calendarData, setCalendarData] = useState([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiResponses, setAiResponses] = useState([]);
  const [aiQuestionLoading, setAiQuestionLoading] = useState(false);
  const [weatherData, setWeatherData] = useState([]); // 天気データの状態を追加
  const [eventData, setEventData] = useState([]); // イベントデータの状態を追加
  
  // 状態と手動更新フラグを保持するRef（Cookie/URLパラメータ両対応）
  const locationRef = useRef({ value: initialLocation, manuallyChanged: !!initialLocation });
  const actionRef = useRef({ value: initialAction, manuallyChanged: !!initialAction });
  const yearRef = useRef({ value: initialYear, manuallyChanged: !!initialYear });
  const monthRef = useRef({ value: initialMonth, manuallyChanged: !!initialMonth });
  
  // 状態変数の初期値をURLパラメータから設定
  const [selectedLocation, setSelectedLocationInternal] = useState(initialLocation);
  const [selectedAction, setSelectedActionInternal] = useState(initialAction);
  const [selectedYear, setSelectedYearInternal] = useState(initialYear);
  const [selectedMonth, setSelectedMonthInternal] = useState(initialMonth);
  
  // 各種ローディング状態を追加
  const [loading, setLoading] = useState(false);
  const [actionChanging, setActionChanging] = useState(false);
  const [locationChanging, setLocationChanging] = useState(false);
  const [dateChanging, setDateChanging] = useState(false);
  
  const [inputsComplete, setInputsComplete] = useState(false);
  const [error, setError] = useState("");
  const [cookiesLoaded, setCookiesLoaded] = useState(false);
  
  // 追加の状態
  const [data, setData] = useState(null);
  const [responseType, setResponseType] = useState(null);
  
  // ページトップにスクロールする共通関数
  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);
  
  // URLパラメータ更新関数
  const updateUrlParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);
  
  // パラメータを直接指定してデータを取得する関数を先に定義
  const fetchCalendarDataWithParams = useCallback(async (location, action, year, month) => {
    if (!location || !action || !year || !month) {
      // パラメータが不足している場合はローディング状態を解除して終了
      setDateChanging(false);
      setLoading(false);
      return;
    }

    try {
      // 既存のリクエストをキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 新しいAbortControllerを作成
      abortControllerRef.current = new AbortController();
      
      // ローディング状態を設定
      setLoading(true);
      setError("");

      console.log(`Fetching data with params: ${year}年${month}月, location: ${location}, action: ${action}`);

      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/'; // eslint-disable-line no-undef
      const response = await fetch(`${baseUrl}api/get-graph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place: location,
          action: action,
          year: parseInt(year),
          month: parseInt(month)
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`データの取得に失敗しました (${response.status})`);
      }

      const result = await response.json();
      console.log(`Successfully received data for: ${year}年${month}月`, result);
      
      // 傾向分析データかどうかを判定
      const isTrendAnalysis = ['year_trend', 'month_trend', 'week_trend'].includes(action);
      
      if (isTrendAnalysis) {
        // 傾向分析の場合は、dataとresponseTypeに格納
        setData(result.data);
        setResponseType(action);
        setCalendarData([]); // カレンダーデータはクリア
        console.log('Trend analysis data set:', {
          action: action,
          data: result.data,
          dataLength: result.data?.length
        });
      } else {
        // 既存の処理（カレンダー、ヒートマップなど）
        setCalendarData(result.data);
        setData(null); // 傾向分析データはクリア
        setResponseType(null);
      }

      setAiAdvice(result.ai_advice || '');
      setWeatherData(result.weather_data || []);
      setEventData(result.event_data || []); // イベントデータを設定

    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('リクエストがキャンセルされました');
        return;
      }
      
      console.error('Error fetching data:', error);
      setError('データの取得に失敗しました。再度お試しください。');
    } finally {
      setLoading(false);
      setActionChanging(false);
      setLocationChanging(false);
      setDateChanging(false);
    }
  }, []);
  
  // アクション変更時のハンドラー
  const handleActionChange = useCallback((value) => {
    setActionChanging(true);
    actionRef.current.manuallyChanged = true;
    actionRef.current.value = value;
    setCalendarData([]);
    setSelectedActionInternal(value);
    updateUrlParam('action', value);
    
    // ページトップにスクロール
    scrollToTop();

    // 条件が揃っていれば直ちにデータ取得を実行
    if (selectedLocation && selectedYear && selectedMonth) {
      fetchCalendarDataWithParams(
        selectedLocation,
        value,
        selectedYear,
        selectedMonth
      );
    }
    
    // ローディング状態をリセット（データ取得完了後に自動的にfalseになる）
    setTimeout(() => setActionChanging(false), 500);
  }, [updateUrlParam, scrollToTop, selectedLocation, selectedYear, selectedMonth, fetchCalendarDataWithParams]);

  // 場所変更時のハンドラー
  const handleLocationChange = useCallback((value) => {
    setLocationChanging(true);
    locationRef.current.manuallyChanged = true;
    locationRef.current.value = value;
    setSelectedLocationInternal(value);
    updateUrlParam('location', value);
    
    // ページトップにスクロール
    scrollToTop();
    
    setTimeout(() => setLocationChanging(false), 500);
  }, [updateUrlParam, scrollToTop]);

  // 日付変更時のハンドラー - fetchCalendarDataWithParamsを使用
  const handleDateChange = useCallback((year, month) => {
    // まずローディング状態をオンにする
    setDateChanging(true);
    
    yearRef.current.manuallyChanged = true;
    yearRef.current.value = year.toString();
    monthRef.current.manuallyChanged = true;
    monthRef.current.value = month.toString();
    
    setSelectedYearInternal(year.toString());
    setSelectedMonthInternal(month.toString());
    
    // URLパラメータを更新
    updateUrlParam('year', year.toString());
    updateUrlParam('month', month.toString());
    
    // ページトップにスクロール
    scrollToTop();
    
    // データ取得を開始（すべての条件が揃っている場合）
    if (selectedAction && selectedLocation) {
      fetchCalendarDataWithParams(selectedLocation, selectedAction, year.toString(), month.toString());
    } else {
      // データ取得を行わない場合はローディング状態をリセット
      setTimeout(() => setDateChanging(false), 500);
    }
  }, [selectedAction, selectedLocation, updateUrlParam, fetchCalendarDataWithParams, scrollToTop]);

  // 既存のsetSelectedLocation等を更新
  const setSelectedLocation = useCallback((value) => {
    handleLocationChange(value);
  }, [handleLocationChange]);

  const setSelectedAction = useCallback((value) => {
    handleActionChange(value);
  }, [handleActionChange]);

  // setSelectedYearの改善
  const setSelectedYear = useCallback((value) => {
    setDateChanging(true);
    yearRef.current.manuallyChanged = true;
    yearRef.current.value = value;
    setSelectedYearInternal(value);
    updateUrlParam('year', value);
    
    // ページトップにスクロール
    scrollToTop();
    
    // 月が選択済みでアクションと場所も選択されていれば即時データ取得
    if (selectedMonth && selectedAction && selectedLocation) {
      // 既存のリクエストをキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 即時にデータ取得を開始
      fetchCalendarDataWithParams(selectedLocation, selectedAction, value, selectedMonth);
    } else {
      // 条件が揃っていない場合でもローディング状態を維持してユーザーフィードバックを提供
      setTimeout(() => setDateChanging(false), 800);
    }
  }, [selectedMonth, selectedAction, selectedLocation, fetchCalendarDataWithParams, updateUrlParam, scrollToTop]);

  // setSelectedMonthの改善
  const setSelectedMonth = useCallback((value) => {
    setDateChanging(true);
    monthRef.current.manuallyChanged = true;
    monthRef.current.value = value;
    setSelectedMonthInternal(value);
    updateUrlParam('month', value);
    
    // ページトップにスクロール
    scrollToTop();
    
    // 年が選択済みでアクションと場所も選択されていれば即時データ取得
    if (selectedYear && selectedAction && selectedLocation) {
      // 既存のリクエストをキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 即時にデータ取得を開始
      fetchCalendarDataWithParams(selectedLocation, selectedAction, selectedYear, value);
    } else {
      // 条件が揃っていない場合でもローディング状態を維持してユーザーフィードバックを提供
      setTimeout(() => setDateChanging(false), 800);
    }
  }, [selectedYear, selectedAction, selectedLocation, fetchCalendarDataWithParams, updateUrlParam, scrollToTop]);

  // ページタイプが変更されたときに状態をクリアしてリセット
  useEffect(() => {
    // 進行中のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // データをクリア
    setCalendarData([]);
    setAiAdvice("");
    setWeatherData([]);
    setEventData([]);
    setData(null);
    setResponseType(null);
    setError("");
    setLoading(false);
    setActionChanging(false);
    setLocationChanging(false);
    setDateChanging(false);
    
    // Cookie読み込み状態とフェッチングフラグをリセット
    setCookiesLoaded(false);
    setIsFetchingData(false);
    
    console.log(`Page type changed to: ${pageType}, clearing all data`);
  }, [pageType]);

  //  マウント時またはページタイプ変更時にCookieから値を読み込む
  useEffect(() => {
    if (!cookiesLoaded) {
      const locationFromCookie = getCookie(COOKIE_KEYS.LOCATION);
      const actionFromCookie = getCookie(COOKIE_KEYS.ACTION);
      const yearFromCookie = getCookie(COOKIE_KEYS.YEAR);
      const monthFromCookie = getCookie(COOKIE_KEYS.MONTH);

      // ページタイプが変更された場合は、手動変更フラグをリセットして状態を初期化
      if (pageType !== 'default') {
        locationRef.current.manuallyChanged = false;
        actionRef.current.manuallyChanged = false;
        yearRef.current.manuallyChanged = false;
        monthRef.current.manuallyChanged = false;
        
        // 状態を初期化（URLパラメータがある場合はそれを優先）
        const urlLocation = searchParams.get('location') || '';
        const urlAction = searchParams.get('action') || '';
        const urlYear = searchParams.get('year') || '';
        const urlMonth = searchParams.get('month') || '';
        
                      // URLパラメータがある場合はそれを使用、なければCookieから復元、最後にデフォルト値
              const finalLocation = urlLocation || locationFromCookie || '';
              let finalAction = urlAction || actionFromCookie || '';
              
              // アクションが現在のページタイプに対して有効かチェック
              finalAction = getValidActionForPage(finalAction, pageType);
              if (!finalAction) {
                finalAction = DEFAULT_ACTIONS[pageType] || '';
              }
              
              const finalYear = urlYear || yearFromCookie || currentYear;
              const finalMonth = urlMonth || monthFromCookie || currentMonth;
        
        // 状態を設定
        locationRef.current.value = finalLocation;
        setSelectedLocationInternal(finalLocation);
        if (finalLocation !== urlLocation) updateUrlParam('location', finalLocation);
        
        actionRef.current.value = finalAction;
        setSelectedActionInternal(finalAction);
        if (finalAction !== urlAction) updateUrlParam('action', finalAction);
        
        yearRef.current.value = finalYear;
        setSelectedYearInternal(finalYear);
        if (finalYear !== urlYear) updateUrlParam('year', finalYear);
        
        monthRef.current.value = finalMonth;
        setSelectedMonthInternal(finalMonth);
        if (finalMonth !== urlMonth) updateUrlParam('month', finalMonth);
        
        // 遅延して完了フラグを設定し、データ取得も実行
        setTimeout(() => {
          setCookiesLoaded(true);
          
          // 全ての必要な値が揃っており、データ取得中でない場合のみ実行
          if (finalLocation && finalAction && finalYear && finalMonth && !isFetchingData) {
            console.log('Page switch: Auto-fetching data with restored values:', {
              location: finalLocation,
              action: finalAction,
              originalAction: urlAction || actionFromCookie,
              actionChanged: finalAction !== (urlAction || actionFromCookie),
              pageType: pageType,
              year: finalYear,
              month: finalMonth
            });
            
            // データ取得フラグを設定してから実行
            setIsFetchingData(true);
            fetchCalendarDataWithParams(finalLocation, finalAction, finalYear, finalMonth)
              .finally(() => {
                setTimeout(() => setIsFetchingData(false), 1000); // 1秒後にフラグをリセット
              });
          }
        }, 150); // 状態更新が確実に完了するよう少し遅延を増やす
        return; // 早期リターンで以下の処理をスキップ
      }

      // Cookieに値が保存されている場合のみ状態を更新
      if (locationFromCookie && !locationRef.current.manuallyChanged) {
        locationRef.current.value = locationFromCookie;
        setSelectedLocationInternal(locationFromCookie);
        updateUrlParam('location', locationFromCookie);
      }
      
      if (actionFromCookie && !actionRef.current.manuallyChanged) {
        actionRef.current.value = actionFromCookie;
        setSelectedActionInternal(actionFromCookie);
        updateUrlParam('action', actionFromCookie);
      }
      
      // Cookieに値がない場合は現在の年月をデフォルト値として使用
      if (yearFromCookie && !yearRef.current.manuallyChanged) {
        yearRef.current.value = yearFromCookie;
        setSelectedYearInternal(yearFromCookie);
        updateUrlParam('year', yearFromCookie);
      } else if (!yearRef.current.manuallyChanged) {
        yearRef.current.value = currentYear;
        setSelectedYearInternal(currentYear);
        updateUrlParam('year', currentYear);
      }
      
      if (monthFromCookie && !monthRef.current.manuallyChanged) {
        monthRef.current.value = monthFromCookie;
        setSelectedMonthInternal(monthFromCookie);
        updateUrlParam('month', monthFromCookie);
      } else if (!monthRef.current.manuallyChanged) {
        monthRef.current.value = currentMonth;
        setSelectedMonthInternal(currentMonth);
        updateUrlParam('month', currentMonth);
      }

      // 遅延して完了フラグを設定し、必要に応じてデータ取得も実行
      setTimeout(() => {
        setCookiesLoaded(true);
        
        // デフォルトページでも、全ての値が揃っており、データ取得中でない場合はデータを取得
        const currentLocation = locationRef.current.value;
        const currentAction = actionRef.current.value;
        const currentYear = yearRef.current.value;
        const currentMonth = monthRef.current.value;
        
        if (currentLocation && currentAction && currentYear && currentMonth && !isFetchingData) {
          console.log('Default page: Auto-fetching data with current values:', {
            location: currentLocation,
            action: currentAction,
            year: currentYear,
            month: currentMonth
          });
          
          // データ取得フラグを設定してから実行
          setIsFetchingData(true);
          fetchCalendarDataWithParams(currentLocation, currentAction, currentYear, currentMonth)
            .finally(() => {
              setTimeout(() => setIsFetchingData(false), 1000); // 1秒後にフラグをリセット
            });
        }
      }, 100);
    }
  }, [cookiesLoaded, currentYear, currentMonth, pageType, COOKIE_KEYS, updateUrlParam, searchParams, fetchCalendarDataWithParams, isFetchingData]);

  // 選択値が変更されたらCookieに保存（cookiesLoadedがtrueになった後のみ）
  useEffect(() => {
    if (cookiesLoaded && selectedLocation) {
      setCookie(COOKIE_KEYS.LOCATION, selectedLocation);
      locationRef.current.value = selectedLocation;
    }
  }, [selectedLocation, cookiesLoaded, COOKIE_KEYS.LOCATION]);

  useEffect(() => {
    if (cookiesLoaded && selectedAction) {
      setCookie(COOKIE_KEYS.ACTION, selectedAction);
      actionRef.current.value = selectedAction;
    }
  }, [selectedAction, cookiesLoaded, COOKIE_KEYS.ACTION]);

  useEffect(() => {
    if (cookiesLoaded && selectedYear) {
      setCookie(COOKIE_KEYS.YEAR, selectedYear);
      yearRef.current.value = selectedYear;
    }
  }, [selectedYear, cookiesLoaded, COOKIE_KEYS.YEAR]);

  useEffect(() => {
    if (cookiesLoaded && selectedMonth) {
      setCookie(COOKIE_KEYS.MONTH, selectedMonth);
      monthRef.current.value = selectedMonth;
    }
  }, [selectedMonth, cookiesLoaded, COOKIE_KEYS.MONTH]);

  // 入力が全て完了しているかチェックする
  useEffect(() => {
    if (selectedLocation && selectedAction && selectedYear && selectedMonth) {
      setInputsComplete(true);
    } else {
      setInputsComplete(false);
    }
  }, [selectedLocation, selectedAction, selectedYear, selectedMonth]);

  // 通常のフェッチ関数（現在選択中の値を使用）
  const fetchCalendarData = useCallback(async () => {
    // 全ての入力が完了していない場合は処理を行わない
    if (!selectedLocation || !selectedAction || !selectedYear || !selectedMonth) {
      return;
    }
    
    // パラメータ付きのフェッチ関数を呼び出す
    fetchCalendarDataWithParams(
      selectedLocation, 
      selectedAction, 
      selectedYear, 
      selectedMonth
    );
  }, [selectedLocation, selectedAction, selectedYear, selectedMonth, fetchCalendarDataWithParams]);

  // Cookie読み込みも完了し、入力が全て完了したらデータを取得する
  // ただし、ダッシュボードページでは既に上記でデータ取得済みなのでスキップ
  useEffect(() => {
    // ダッシュボードページでは既にCookie復元時にデータ取得済み
    if (pageType !== 'default') {
      return;
    }
    
    if (cookiesLoaded && inputsComplete) {
      fetchCalendarData();
    } else if (cookiesLoaded) {
      // 入力が完了していない場合はデータをクリア
      setCalendarData([]);
      setAiAdvice("");
    }
  }, [inputsComplete, fetchCalendarData, cookiesLoaded, pageType]);

  // 計算方法の注記を表示するかどうかを判定する関数
  const shouldShowCalculationNote = useCallback(() => {
    return selectedAction.startsWith('wti') || selectedAction.startsWith('dti');
  }, [selectedAction]);

  // 年月を同時に更新し、その後データを取得する関数
  const updateMonthAndFetch = useCallback((newYear, newMonth) => {
    // ローディング状態を即時に設定
    setDateChanging(true);
    
    // 進行中のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // データ取得状態をリセット
    setCalendarData([]);
    setAiAdvice("");
    
    // 状態の更新（年と月を同時に設定）
    yearRef.current.manuallyChanged = true;
    yearRef.current.value = newYear.toString();
    
    monthRef.current.manuallyChanged = true;
    monthRef.current.value = newMonth.toString();
    
    // 状態を更新
    setSelectedYearInternal(newYear.toString());
    setSelectedMonthInternal(newMonth.toString());
    
    // URLパラメータを更新
    updateUrlParam('year', newYear.toString());
    updateUrlParam('month', newMonth.toString());
    
    // ページトップにスクロール
    scrollToTop();
    
    // 即時にデータ取得を開始（遅延なし）
    if (selectedLocation && selectedAction) {
      fetchCalendarDataWithParams(
        selectedLocation, 
        selectedAction, 
        newYear.toString(), 
        newMonth.toString()
      );
    } else {
      // データ取得条件が不足している場合はローディング状態を解除
      setTimeout(() => setDateChanging(false), 500);
    }
  }, [selectedLocation, selectedAction, fetchCalendarDataWithParams, updateUrlParam, scrollToTop]);

  // Cookieを含めた選択値をリセットする関数
  const resetSelections = useCallback(() => {
    // 進行中のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // データと選択値をクリア
    setCalendarData([]);
    setAiAdvice("");
    setWeatherData([]); // 天気データもクリア
    setEventData([]); // イベントデータもクリア
    
    // 手動更新フラグを設定してから値をリセット
    locationRef.current.manuallyChanged = true;
    actionRef.current.manuallyChanged = true;
    yearRef.current.manuallyChanged = true;
    monthRef.current.manuallyChanged = true;
    
    setSelectedLocationInternal('');
    setSelectedActionInternal('');
    setSelectedYearInternal('');
    setSelectedMonthInternal('');
    
    // 現在のページタイプに応じたCookieをクリア
    const currentCookieKeys = getCookieKeys(pageType);
    setCookie(currentCookieKeys.LOCATION, '', 0);
    setCookie(currentCookieKeys.ACTION, '', 0);
    setCookie(currentCookieKeys.YEAR, '', 0);
    setCookie(currentCookieKeys.MONTH, '', 0);
    
    // URLパラメータをすべて削除
    setSearchParams({}, { replace: true });
  }, [setSearchParams, pageType]);

  // AI質問機能
  const askFollowupQuestion = useCallback(async (question) => {
    if (!selectedLocation || !selectedAction || !selectedYear || !selectedMonth || !question) {
      return null;
    }
    
    try {
      setAiQuestionLoading(true);
      
      // この部分は実際のAPIエンドポイントに置き換えてください
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/'; // eslint-disable-line no-undef
      const response = await fetch(`${baseUrl}api/ask-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place: selectedLocation,
          action: selectedAction,
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth),
          question: question,
          context: aiResponses // 過去の会話履歴
        })
      });

      if (!response.ok) {
        throw new Error(`AIへの質問送信に失敗しました (${response.status})`);
      }

      const data = await response.json();
      
      // 回答を状態に保存
      const newResponse = {
        question,
        answer: data.response || 'すみません、回答を生成できませんでした。',
        timestamp: new Date().toISOString()
      };
      
      setAiResponses(prev => [...prev, newResponse]);
      
      return newResponse;
    } catch (error) {
      console.error('Error asking AI:', error);
      return {
        question,
        answer: 'エラーが発生しました。もう一度お試しください。',
        isError: true,
        timestamp: new Date().toISOString()
      };
    } finally {
      setAiQuestionLoading(false);
    }
  }, [selectedLocation, selectedAction, selectedYear, selectedMonth, aiResponses]);

  const value = {
    calendarData,
    aiAdvice,
    aiResponses,
    loading,
    actionChanging,
    locationChanging,
    dateChanging,
    aiQuestionLoading,
    error,
    weatherData, // 天気データを追加
    eventData, // イベントデータを追加
    selectedLocation,
    setSelectedLocation,
    selectedAction,
    setSelectedAction,
    selectedYear,
    setSelectedYear,
    selectedMonth,
    setSelectedMonth,
    handleActionChange,
    handleLocationChange,
    handleDateChange,
    fetchCalendarData,
    askFollowupQuestion,
    resetSelections,
    updateMonthAndFetch,
    shouldShowCalculationNote,
    data,
    setData,
    responseType,
    setResponseType
  };

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

// propTypesの更新
CalendarProvider.propTypes = {
  children: PropTypes.node.isRequired,
  searchParams: PropTypes.object.isRequired, // URLSearchParamsインスタンス
  setSearchParams: PropTypes.func.isRequired
};
