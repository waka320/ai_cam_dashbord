import React, { createContext, useContext, useState, useCallback } from 'react';
import PropTypes from 'prop-types';

const CalendarContext = createContext();

export function CalendarProvider({ children }) {
    const [calendarData, setCalendarData] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState("");
    const [selectedAction, setSelectedAction] = useState("");
    const [selectedYear, setSelectedYear] = useState("");
    const [selectedMonth, setSelectedMonth] = useState("");

    // fetchCalendarDataをuseCallbackでラップ
    const fetchCalendarData = useCallback(async () => {
        try {
            // 環境変数からAPIのベースURLを取得、なければデフォルト値を使用
            const baseUrl = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/';
            const response = await fetch(`${baseUrl}api/graph`, {
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
            setCalendarData(data.data);
        } catch (error) {
            console.error('Error:', error);
        }
    }, [selectedLocation, selectedAction, selectedYear, selectedMonth]);

    // 選択値が変更されるたびに実行される副作用
    React.useEffect(() => {
        // すべての選択値が入力されている場合のみデータを取得
        if (selectedLocation && selectedAction && selectedYear && selectedMonth) {
            fetchCalendarData();
        }
    }, [selectedLocation, selectedAction, selectedYear, selectedMonth, fetchCalendarData]);

    return (
        <CalendarContext.Provider value={{
            calendarData,
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
