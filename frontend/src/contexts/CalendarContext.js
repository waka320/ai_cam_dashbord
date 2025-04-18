import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

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

const COOKIE_KEYS = {
  LOCATION: 'dashboard_location',
  ACTION: 'dashboard_action',
  YEAR: 'dashboard_year',
  MONTH: 'dashboard_month'
};

const CalendarContext = createContext();

export function CalendarProvider({ children }) {
  // 状態の初期化
  const [calendarData, setCalendarData] = useState([]);
  const [aiAdvice, setAiAdvice] = useState("");
  const [aiResponses, setAiResponses] = useState([]);
  const [aiQuestionLoading, setAiQuestionLoading] = useState(false);
  
  // 状態と手動更新フラグを保持するRef
  const locationRef = useRef({ value: '', manuallyChanged: false });
  const actionRef = useRef({ value: '', manuallyChanged: false });
  const yearRef = useRef({ value: '', manuallyChanged: false });
  const monthRef = useRef({ value: '', manuallyChanged: false });
  
  // 状態変数
  const [selectedLocation, setSelectedLocationInternal] = useState("");
  const [selectedAction, setSelectedActionInternal] = useState("");
  const [selectedYear, setSelectedYearInternal] = useState("");
  const [selectedMonth, setSelectedMonthInternal] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [inputsComplete, setInputsComplete] = useState(false);
  const [error, setError] = useState("");
  const [cookiesLoaded, setCookiesLoaded] = useState(false);
  
  // 現在のリクエストをキャンセルするコントローラー
  const abortControllerRef = useRef(null);

  // ラッパー関数で手動変更フラグを設定
  const setSelectedLocation = useCallback((value) => {
    locationRef.current.manuallyChanged = true;
    locationRef.current.value = value;
    setSelectedLocationInternal(value);
  }, []);

  const setSelectedAction = useCallback((value) => {
    actionRef.current.manuallyChanged = true;
    actionRef.current.value = value;
    // アクションの変更時にはデータをクリア
    setCalendarData([]);
    setSelectedActionInternal(value);
  }, []);

  const setSelectedYear = useCallback((value) => {
    yearRef.current.manuallyChanged = true;
    yearRef.current.value = value;
    setSelectedYearInternal(value);
  }, []);

  const setSelectedMonth = useCallback((value) => {
    monthRef.current.manuallyChanged = true;
    monthRef.current.value = value;
    setSelectedMonthInternal(value);
  }, []);

  // マウント時にCookieから値を読み込む（一度だけ）
  useEffect(() => {
    if (!cookiesLoaded) {
      const locationFromCookie = getCookie(COOKIE_KEYS.LOCATION);
      const actionFromCookie = getCookie(COOKIE_KEYS.ACTION);
      const yearFromCookie = getCookie(COOKIE_KEYS.YEAR);
      const monthFromCookie = getCookie(COOKIE_KEYS.MONTH);

      // Cookieに値が保存されている場合のみ状態を更新
      if (locationFromCookie && !locationRef.current.manuallyChanged) {
        locationRef.current.value = locationFromCookie;
        setSelectedLocationInternal(locationFromCookie);
      }
      
      if (actionFromCookie && !actionRef.current.manuallyChanged) {
        actionRef.current.value = actionFromCookie;
        setSelectedActionInternal(actionFromCookie);
      }
      
      if (yearFromCookie && !yearRef.current.manuallyChanged) {
        yearRef.current.value = yearFromCookie;
        setSelectedYearInternal(yearFromCookie);
      }
      
      if (monthFromCookie && !monthRef.current.manuallyChanged) {
        monthRef.current.value = monthFromCookie;
        setSelectedMonthInternal(monthFromCookie);
      }

      // 遅延して完了フラグを設定することで、状態更新を確実に反映
      setTimeout(() => {
        setCookiesLoaded(true);
      }, 100);
    }
  }, [cookiesLoaded]);

  // 選択値が変更されたらCookieに保存（cookiesLoadedがtrueになった後のみ）
  useEffect(() => {
    if (cookiesLoaded && selectedLocation) {
      setCookie(COOKIE_KEYS.LOCATION, selectedLocation);
      locationRef.current.value = selectedLocation;
    }
  }, [selectedLocation, cookiesLoaded]);

  useEffect(() => {
    if (cookiesLoaded && selectedAction) {
      setCookie(COOKIE_KEYS.ACTION, selectedAction);
      actionRef.current.value = selectedAction;
    }
  }, [selectedAction, cookiesLoaded]);

  useEffect(() => {
    if (cookiesLoaded && selectedYear) {
      setCookie(COOKIE_KEYS.YEAR, selectedYear);
      yearRef.current.value = selectedYear;
    }
  }, [selectedYear, cookiesLoaded]);

  useEffect(() => {
    if (cookiesLoaded && selectedMonth) {
      setCookie(COOKIE_KEYS.MONTH, selectedMonth);
      monthRef.current.value = selectedMonth;
    }
  }, [selectedMonth, cookiesLoaded]);

  // 入力が全て完了しているかチェックする
  useEffect(() => {
    if (selectedLocation && selectedAction && selectedYear && selectedMonth) {
      setInputsComplete(true);
    } else {
      setInputsComplete(false);
    }
  }, [selectedLocation, selectedAction, selectedYear, selectedMonth]);

  // パラメータを直接指定してデータを取得する関数
  const fetchCalendarDataWithParams = useCallback(async (location, action, year, month) => {
    if (!location || !action || !year || !month) {
      return;
    }

    try {
      // 進行中のリクエストがあればキャンセル
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // 新しいAbortControllerを作成
      abortControllerRef.current = new AbortController();
      
      setLoading(true); // リクエスト開始時にローディング状態をtrueに
      setError(""); // エラーメッセージをクリア

      console.log(`Fetching data with params: ${year}年${month}月, location: ${location}, action: ${action}`);

      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';
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
        // AbortController のシグナルを設定
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        throw new Error(`データの取得に失敗しました (${response.status})`);
      }

      const data = await response.json();
      console.log(`Successfully received data for: ${year}年${month}月`, data);
      
      // カレンダーデータを設定
      setCalendarData(data.data || []);

      // AIアドバイスも設定
      if (data.ai_advice) {
        setAiAdvice(data.ai_advice);
      } else {
        setAiAdvice(""); 
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('リクエストがキャンセルされました');
        return;
      }
      
      console.error('Error:', error);
      setError(error.message);
      setAiAdvice("データの取得中にエラーが発生しました。再度お試しください。");
      setCalendarData([]);
    } finally {
      setLoading(false);
    }
  }, []);

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
  useEffect(() => {
    if (cookiesLoaded && inputsComplete) {
      fetchCalendarData();
    } else if (cookiesLoaded) {
      // 入力が完了していない場合はデータをクリア
      setCalendarData([]);
      setAiAdvice("");
    }
  }, [inputsComplete, fetchCalendarData, cookiesLoaded]);

  // 年月を同時に更新し、その後データを取得する関数
  const updateMonthAndFetch = useCallback((newYear, newMonth) => {
    // データ変更のログを出力
    console.log(`Updating from ${selectedYear}年${selectedMonth}月 to ${newYear}年${newMonth}月`);
    
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
    
    // 状態を一括更新
    setSelectedYearInternal(newYear.toString());
    setSelectedMonthInternal(newMonth.toString());
    
    // 状態更新が完了した後に明示的にデータを取得する
    // 複数の状態更新後にuseEffectが正しく発火しない場合の対策
    setTimeout(() => {
      if (selectedLocation && selectedAction) {
        // 新しい月のデータを確実に取得するために直接パラメータを指定
        fetchCalendarDataWithParams(
          selectedLocation, 
          selectedAction, 
          newYear.toString(), 
          newMonth.toString()
        );
      }
    }, 100);
  }, [selectedLocation, selectedAction, selectedYear, selectedMonth, fetchCalendarDataWithParams]);

  // Cookieを含めた選択値をリセットする関数
  const resetSelections = () => {
    // 進行中のリクエストをキャンセル
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // データと選択値をクリア
    setCalendarData([]);
    setAiAdvice("");
    
    // 手動更新フラグを設定してから値をリセット
    locationRef.current.manuallyChanged = true;
    actionRef.current.manuallyChanged = true;
    yearRef.current.manuallyChanged = true;
    monthRef.current.manuallyChanged = true;
    
    setSelectedLocationInternal('');
    setSelectedActionInternal('');
    setSelectedYearInternal('');
    setSelectedMonthInternal('');
    
    // Cookieもクリア
    setCookie(COOKIE_KEYS.LOCATION, '', 0);
    setCookie(COOKIE_KEYS.ACTION, '', 0);
    setCookie(COOKIE_KEYS.YEAR, '', 0);
    setCookie(COOKIE_KEYS.MONTH, '', 0);
  };

  // AI質問機能
  const askFollowupQuestion = useCallback(async (question) => {
    if (!selectedLocation || !selectedAction || !selectedYear || !selectedMonth || !question) {
      return null;
    }
    
    try {
      setAiQuestionLoading(true);
      
      // この部分は実際のAPIエンドポイントに置き換えてください
      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';
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

  return (
    <CalendarContext.Provider value={{
      calendarData,
      aiAdvice,
      aiResponses,
      loading,
      aiQuestionLoading,
      error,
      selectedLocation,
      setSelectedLocation,
      selectedAction,
      setSelectedAction,
      selectedYear,
      setSelectedYear,
      selectedMonth,
      setSelectedMonth,
      fetchCalendarData,
      askFollowupQuestion,
      resetSelections,
      updateMonthAndFetch
    }}>
      {children}
    </CalendarContext.Provider>
  );
}

CalendarProvider.propTypes = {
  children: PropTypes.node.isRequired
};

export function useCalendar() {
  return useContext(CalendarContext);
}
