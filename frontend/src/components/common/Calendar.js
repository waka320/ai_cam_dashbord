import React, { useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Popper, Paper, ClickAwayListener, useMediaQuery } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import CongestionLegend from './CongestionLegend';
import { useColorPalette } from '../../contexts/ColorPaletteContext';
import AnalysisInfoButton from '../ui/AnalysisInfoButton'; // 追加
import WeatherIcon from '../ui/WeatherIcon'; // 追加

// カレンダーコンポーネント
const CalendarHeatmap = () => {
    const { calendarData, selectedAction, selectedMonth, loading, selectedLocation, shouldShowCalculationNote } = useCalendar();
    const { getCellColor, getTextColor } = useColorPalette();
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    
    // レスポンシブ対応のためのメディアクエリ
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    // ポップオーバーの状態
    const [anchorEl, setAnchorEl] = useState(null);
    const [popperCell, setPopperCell] = useState(null);
    const [open, setOpen] = useState(false);
    const cellRefs = useRef({});

    // クリックしたセルの情報を表示
    const handleCellClick = (cell, event) => {
        if (cell && cell.highlighted) {
            const cellElement = event.currentTarget;
            
            if (anchorEl === cellElement) {
                // 同じセルをクリックした場合はクローズ
                setOpen(false);
                setAnchorEl(null);
            } else {
                // 別のセルをクリックした場合は表示を更新
                setAnchorEl(cellElement);
                setPopperCell(cell);
                setOpen(true);
            }
        }
    };

    // 場所名の取得（ファイル名部分のみ）
    const getPlaceName = () => {
        if (!selectedLocation) return 'default';
        const parts = selectedLocation.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace('.csv', '');
    };

    // ローディング中の表示
    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
                <CircularProgress />
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
        <ClickAwayListener onClickAway={() => setOpen(false)}>
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
                    {calendarData.map((week, rowIndex) => (
                        <Box key={rowIndex} sx={{ display: 'flex' }}>
                            {week.map((cell, colIndex) => {
                                const cellKey = `${rowIndex}-${colIndex}`;
                                return (
                                    <Box
                                        key={colIndex}
                                        ref={(el) => cellRefs.current[cellKey] = el}
                                        onClick={(event) => cell && cell.highlighted ? 
                                            handleCellClick(cell, event) : null}
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            // 混雑度0の日を灰色で表示
                                            backgroundColor: !cell ? '#fff' : 
                                                cell.congestion === 0 ? '#e0e0e0' : getCellColor(cell.congestion),
                                            // getTextColorを使用して文字色を動的に設定
                                            color: !cell ? 'inherit' : getTextColor(cell.congestion),
                                            borderRight: colIndex !== 6 ? '1px solid #ddd' : undefined,
                                            borderBottom: rowIndex !== calendarData.length - 1 ? '1px solid #ddd' : undefined,
                                            position: 'relative',
                                            cursor: cell && cell.highlighted ? 'pointer' : 'default',
                                            height: isMobile ? (isSmallMobile ? '45px' : '55px') : '65px',
                                            minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '50px',
                                            minHeight: isMobile ? (isSmallMobile ? '55px' : '55px') : '65px',
                                            paddingY: isMobile ? (isSmallMobile ? '5px' : '20px') : '20px'
                                        }}
                                    >
                                        {cell && (
                                            <Box sx={{ 
                                                position: 'relative',
                                                width: '100%',
                                                height: '100%',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                gap: isSmallMobile ? '1px' : '2px',
                                            }}>
                                                {/* 日付を上に中央揃えで表示 */}
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
                                                
                                                {/* 天気アイコンを右上の角にさりげなく表示 */}
                                                {cell.weather_info && (
                                                    <Box sx={{
                                                        position: 'absolute',
                                                        top: '3px',
                                                        right: '3px',
                                                        opacity: 0.8,
                                                        zIndex: 1
                                                    }}>
                                                        <WeatherIcon 
                                                            weather={cell.weather_info.weather}
                                                            size="medium"
                                                            showTemp={false}
                                                        />
                                                    </Box>
                                                )}
                                            </Box>
                                        )}
                                    </Box>
                                );
                            })}
                        </Box>
                    ))}
                </Box>

                {/* ハイライト理由のポップオーバー */}
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
                
                <CongestionLegend 
                    showCalculationNote={shouldShowCalculationNote()} 
                    legendType="calendar" 
                />
            </Box>
        </ClickAwayListener>
    );
};

export default CalendarHeatmap;
