import React from 'react';
import { Box, Typography, CircularProgress, useMediaQuery, LinearProgress } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import CongestionLegend from './CongestionLegend';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import AnalysisInfoButton from '../ui/AnalysisInfoButton'; // 追加
import WeatherIcon from '../ui/WeatherIcon'; // 追加


// カレンダーコンポーネント
const CalendarHeatmap = () => {
    const { 
        calendarData, 
        selectedAction, 
        selectedMonth, 
        selectedYear, // 追加
        loading, 
        actionChanging,
        locationChanging,
        dateChanging,
        selectedLocation, 
        shouldShowCalculationNote,
        eventData // イベントデータを追加
    } = useCalendar();
    const { getCellColor, getTextColor } = useColorPalette();
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    
    // レスポンシブ対応のためのメディアクエリ
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    // ポップオーバーの状態
    // const [anchorEl, setAnchorEl] = useState(null);
    // const [popperCell, setPopperCell] = useState(null);
    // const [open, setOpen] = useState(false);
    // const cellRefs = useRef({});

    // クリックしたセルの情報を表示
    // const handleCellClick = (cell, event) => {
    //     if (cell && cell.highlighted) {
    //         const cellElement = event.currentTarget;
    //         
    //         if (anchorEl === cellElement) {
    //             // 同じセルをクリックした場合はクローズ
    //             setOpen(false);
    //             setAnchorEl(null);
    //         } else {
    //             // 別のセルをクリックした場合は表示を更新
    //             setAnchorEl(cellElement);
    //             setPopperCell(cell);
    //             setOpen(true);
    //         }
    //     }
    // };

    // 場所名の取得（ファイル名部分のみ）
    const getPlaceName = () => {
        if (!selectedLocation) return 'default';
        const parts = selectedLocation.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace('.csv', '');
    };

    // 指定した日付のイベント情報を取得
    const getEventsForDate = (dateNum) => {
        // eventDataから直接取得
        if (!eventData || !Array.isArray(eventData)) return [];
        
        // selectedYearとselectedMonthが存在しない場合は空配列を返す
        if (!selectedYear || !selectedMonth) return [];
        
        try {
            const targetDateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(dateNum).padStart(2, '0')}`;
            
            return eventData.filter(event => event.date === targetDateStr) || [];
        } catch (error) {
            console.error('Error in getEventsForDate:', error, 'selectedYear:', selectedYear, 'selectedMonth:', selectedMonth, 'dateNum:', dateNum);
            return [];
        }
    };

    // 行内の最大イベント数を計算
    const getMaxEventsInRow = (week) => {
        let maxEvents = 0;
        week.forEach(cell => {
            if (cell) {
                const events = getEventsForDate(cell.date);
                maxEvents = Math.max(maxEvents, events.length);
            }
        });
        return maxEvents;
    };

    // イベント数に基づいて行の高さを計算
    const getRowHeight = (maxEvents) => {
        const baseHeight = isMobile ? (isSmallMobile ? 60 : 70) : 80;
        const eventHeight = isSmallMobile ? 16 : isMobile ? 18 : 20;
        const additionalHeight = Math.max(0, maxEvents - 1) * eventHeight;
        return baseHeight + additionalHeight;
    };

    // このコンポーネントを表示すべきか判断
    const shouldShowComponent = selectedAction && selectedAction.startsWith('cal');
    
    // 表示される場合のみローディングを表示する条件（dateChangingを優先的にチェック）
    const isLoading = shouldShowComponent && (loading || actionChanging || locationChanging || dateChanging);

    // このコンポーネントが表示されない場合は何も返さない
    if (!shouldShowComponent) {
        return null;
    }

    // ローディング表示
    if (isLoading) {
        return (
            <Box>
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 1,
                    px: 1
                }}>
                    <Typography 
                        variant={isMobile ? "subtitle1" : "h5"} 
                        sx={{ textAlign: isMobile ? 'center' : 'left' }}
                    >
                        混雑度カレンダー
                    </Typography>
                </Box>
                
                <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center', 
                    alignItems: 'center', 
                    minHeight: '400px',
                    flexDirection: 'column',
                    gap: 2,
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                }}>
                    <CircularProgress 
                        size={48}
                        thickness={4}
                        sx={{ color: '#383947' }}
                    />
                    <Typography variant="h6" color="primary" fontWeight="bold">
                        データを読み込み中...
                    </Typography>
                    <Box sx={{ width: '300px', mt: 1 }}>
                        <LinearProgress 
                            variant="indeterminate"
                            sx={{
                                height: 4,
                                borderRadius: 2,
                                backgroundColor: 'rgba(0, 0, 0, 0.1)',
                                '& .MuiLinearProgress-bar': {
                                    borderRadius: 2,
                                    backgroundColor: '#383947',
                                }
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        );
    }

    // calendarDataが空の場合は何も表示しない
    if (!calendarData || calendarData.length === 0) {
        return null;
    }

    // actionが"cal"で始まる場合のみ表示
    if (!selectedAction || !selectedAction.startsWith('cal')) {
        return null;
    }

    // データが期待する形式でない場合の処理を追加
    if (!Array.isArray(calendarData) || !calendarData.every(row => Array.isArray(row))) {
        console.error("Invalid data format for Calendar:", calendarData);
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Typography variant="body1" color="error">
                    データ形式が正しくありません。別のアクションを選択してください。
                </Typography>
            </Box>
        );
    }

    return (
        // <ClickAwayListener onClickAway={() => setOpen(false)}>
            <Box>
                {/* 分析情報ボタンとタイトルの追加 */}
                <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    mb: 1,
                    px: 1
                }}>
                    <Typography 
                        variant={isMobile ? "subtitle1" : "h5"} 
                        sx={{ textAlign: isMobile ? 'center' : 'left' }}
                    >
                        {selectedMonth}月の混雑度カレンダー
                    </Typography>
                    
                    <AnalysisInfoButton 
                        analysisType="calendar"
                        place={getPlaceName()}
                    />
                </Box>

                <Box sx={{ 
                    maxWidth: '800px', 
                    margin: '0 auto', 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    width: '100%'
                }}>
                    {/* 曜日のヘッダー */}
                    <Box sx={{ 
                        display: 'flex', 
                        backgroundColor: '#f5f5f5', 
                        borderBottom: '1px solid #ddd'
                    }}>
                        {daysOfWeek.map((day, index) => (
                            <Box key={index} sx={{ 
                                flex: 1, 
                                textAlign: 'center', 
                                padding: isMobile ? '4px 2px' : '10px' 
                            }}>
                                <Typography 
                                    variant={isSmallMobile ? "bodyS" : "bodyM"} 
                                    fontWeight="bold"
                                >
                                    {day}
                                </Typography>
                            </Box>
                        ))}
                    </Box>

                    {/* カレンダーのセル */}
                    {calendarData.map((week, rowIndex) => {
                        const maxEventsInRow = getMaxEventsInRow(week);
                        const rowHeight = getRowHeight(maxEventsInRow);
                        
                        return (
                            <Box key={rowIndex} sx={{ display: 'flex' }}>
                                {week.map((cell, colIndex) => {
                                    // const cellKey = `${rowIndex}-${colIndex}`;
                                    return (
                                        <Box
                                            key={colIndex}
                                            // ref={(el) => cellRefs.current[cellKey] = el}
                                            // onClick={(event) => cell && cell.highlighted ? 
                                            //     handleCellClick(cell, event) : null}
                                            sx={{
                                                flex: 1,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                // 混雑度0の日を灰色で表示
                                                backgroundColor: !cell ? '#fff' : 
                                                    cell.congestion === 0 ? '#e0e0e0' : getCellColor(cell.congestion),
                                                borderRight: colIndex !== 6 ? '1px solid #ddd' : undefined,
                                                borderBottom: rowIndex !== calendarData.length - 1 ? '1px solid #ddd' : undefined,
                                                position: 'relative',
                                                // cursor: cell && cell.highlighted ? 'pointer' : 'default',
                                                cursor: 'default',
                                                height: `${rowHeight}px`,
                                                minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '50px',
                                            }}
                                        >
                                        {cell && (
                                            <>
                                                {/* メインコンテンツエリア */}
                                                <Box sx={{ 
                                                    flex: 1,
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                    justifyContent: 'flex-start',
                                                    gap: isSmallMobile ? '1px' : '2px',
                                                    color: !cell ? 'inherit' : getTextColor(cell.congestion),
                                                    position: 'relative',
                                                    paddingTop: isSmallMobile ? '4px' : isMobile ? '6px' : '8px'
                                                }}>


                                                    {/* 日付と天気を同じ行に表示 */}
                                                    <Box sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '2px',
                                                        width: '100%'
                                                    }}>
                                                        <Typography 
                                                            sx={{
                                                                fontSize: isSmallMobile ? '12px' : isMobile ? '14px' : '16px',
                                                                lineHeight: '1',
                                                                color: cell.congestion === 0 ? '#666' : getTextColor(cell.congestion),
                                                                fontWeight: '500',
                                                                textAlign: 'center',
                                                            }}
                                                        >
                                                            {`${cell.date}日`}
                                                        </Typography>
                                                        
                                                        {/* 天気アイコンを日付の横に表示 */}
                                                        {cell.weather_info && (
                                                            <Box sx={{
                                                                width: isSmallMobile ? '16px' : isMobile ? '18px' : '20px',
                                                                height: isSmallMobile ? '16px' : isMobile ? '18px' : '20px',
                                                                backgroundColor: 'rgba(255, 255, 255, 0.85)',
                                                                borderRadius: '3px',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                            }}>
                                                                <WeatherIcon 
                                                                    weather={cell.weather_info.weather}
                                                                    size="small"
                                                                    showTemp={false}
                                                                />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                    
                                                    {/* 混雑度を下に中央揃えで表示 */}
                                                    <Typography 
                                                        sx={{ 
                                                            fontSize: isMobile ? (isSmallMobile ? '22px' : '24px') : '26px',
                                                            lineHeight: '1',
                                                            fontWeight: 'bold',
                                                            color: cell.congestion === 0 ? '#666' : 'inherit',
                                                            margin: 0,
                                                            textAlign: 'center'
                                                        }}
                                                    >
                                                        {cell.congestion === 0 ? '-' : cell.congestion}
                                                    </Typography>
                                                </Box>
                                                

                                                
                                                {/* イベント情報エリア */}
                                                {(() => {
                                                    const events = getEventsForDate(cell.date);
                                                    return events.length > 0 && (
                                                        <Box sx={{
                                                            width: '100%',
                                                            minHeight: isSmallMobile ? '18px' : isMobile ? '20px' : '22px',
                                                            backgroundColor: 'rgba(255, 255, 255, 0.75)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: '2px 3px',
                                                            overflow: 'visible'
                                                        }}>
                                                            <Typography 
                                                                sx={{ 
                                                                    fontSize: isSmallMobile ? '10px' : isMobile ? '11px' : '12px',
                                                                    color: '#333',
                                                                    fontWeight: '600',
                                                                    lineHeight: '1.1',
                                                                    textAlign: 'center',
                                                                    whiteSpace: 'normal',
                                                                    wordBreak: 'break-word',
                                                                    hyphens: 'auto',
                                                                    maxWidth: '100%'
                                                                }}
                                                                title={events.map(e => e.title).join(', ')}
                                                            >
                                                                {events.map((event, index) => (
                                                                    <span key={index}>
                                                                        {event.title}
                                                                        {index < events.length - 1 && (
                                                                            <br />
                                                                        )}
                                                                    </span>
                                                                ))}
                                                            </Typography>
                                                        </Box>
                                                    );
                                                })()}
                                            </>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                        );
                    })}
                </Box>

                {/* ハイライト理由のポップオーバー */}
                {/*
                <Popper 
                    open={open} 
                    anchorEl={anchorEl}
                    placement={isMobile ? "bottom" : "top"}
                    modifiers={[
                        {
                            name: 'offset',
                            options: {
                                offset: [0, isMobile ? 5 : 10],
                            },
                        },
                        {
                            name: 'preventOverflow',
                            enabled: true,
                            options: {
                                boundary: document.body,
                            },
                        },
                    ]}
                    sx={{ 
                        zIndex: 1500
                    }}
                >
                    <Paper 
                        elevation={3} 
                        sx={{ 
                            p: isMobile ? 1.5 : 2, 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                            border: '1px solid #ddd',
                            maxWidth: isMobile ? '180px' : '200px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                            fontSize: isMobile ? (isSmallMobile ? '12px' : '14px') : undefined
                        }}
                    >
                        <Typography variant={isMobile ? "bodyS" : "bodyM"} fontWeight="bold">
                            {popperCell?.highlight_reason}
                        </Typography>
                    </Paper>
                </Popper>
                */}
                
                <CongestionLegend 
                    showCalculationNote={shouldShowCalculationNote()} 
                    legendType="calendar" 
                />
            </Box>
        // </ClickAwayListener>
    );
};

export default CalendarHeatmap;
