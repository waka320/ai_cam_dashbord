import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const CalendarContext = createContext();

export function CalendarProvider({ children }) {
  const [calendarData, setCalendarData] = useState([]);
  const [aiAdvice, setAiAdvice] = useState(""); // AIアドバイスの状態を追加
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedAction, setSelectedAction] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [loading, setLoading] = useState(false); // ローディング状態の追加
  const [inputsComplete, setInputsComplete] = useState(false); // 入力完了状態を追加

  // 入力が全て完了しているかチェックする
  useEffect(() => {
    if (selectedLocation && selectedAction && selectedYear && selectedMonth) {
      setInputsComplete(true);
    } else {
      setInputsComplete(false);
    }
  }, [selectedLocation, selectedAction, selectedYear, selectedMonth]);

  const fetchCalendarData = useCallback(async () => {
    // 全ての入力が完了していない場合は処理を行わない
    if (!selectedLocation || !selectedAction || !selectedYear || !selectedMonth) {
      return;
    }

    try {
      setLoading(true); // リクエスト開始時にローディング状態をtrueに

      const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';
      const response = await fetch(`${baseUrl}api/get-graph`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          place: selectedLocation,
          action: selectedAction,
          year: parseInt(selectedYear),
          month: parseInt(selectedMonth)
        })
      });

      if (!response.ok) {
        throw new Error('データの取得に失敗しました');
      }

      const data = await response.json();
      console.log("API Response:", data);
      console.log("Data structure:", Array.isArray(data.data) ? "Array" : typeof data.data);
      if (Array.isArray(data.data) && data.data.length > 0) {
        console.log("First item type:", Array.isArray(data.data[0]) ? "Array" : typeof data.data[0]);
        console.log("Sample data:", data.data[0]);
      }
      setCalendarData(data.data);

      // AIアドバイスがレスポンスに含まれている場合、状態を更新
      if (data.ai_advice) {
        setAiAdvice(data.ai_advice);
      } else {
        setAiAdvice(""); // AIアドバイスがない場合は空にする
      }
    } catch (error) {
      console.error('Error:', error);
      setAiAdvice("データの取得中にエラーが発生しました。再度お試しください。");
    } finally {
      setLoading(false); // リクエスト完了時にローディング状態をfalseに
    }
  }, [selectedLocation, selectedAction, selectedYear, selectedMonth]);

  // 入力が全て完了したらデータを取得する
  useEffect(() => {
    if (inputsComplete) {
      fetchCalendarData();
    }
  }, [inputsComplete, fetchCalendarData]);

  return (
    <CalendarContext.Provider value={{
      calendarData,
      aiAdvice, // AIアドバイスを提供
      loading,
      selectedLocation,
      setSelectedLocation,
      selectedAction,
      setSelectedAction,
      selectedYear,
      setSelectedYear,
      selectedMonth,
      setSelectedMonth,
      fetchCalendarData
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
