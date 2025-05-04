import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, CircularProgress, useMediaQuery, Popper, ClickAwayListener } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import CongestionLegend from './CongestionLegend';
import { useColorPalette } from '../../contexts/ColorPaletteContext'; 
import InfoIcon from '@mui/icons-material/Info';

// 日付を整形する関数（例: "2024-07-01" -> "7/1"）
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 日付×時間ヒートマップコンポーネント
const DateTimeHeatmap = () => {
    const { calendarData, selectedAction, loading } = useCalendar();
    const { getCellColor } = useColorPalette(); // ColorPaletteContextから取得
    // レスポンシブ対応のためのメディアクエリ
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');

    // クリックしたセルの参照とポップオーバーの状態管理
    const [anchorEl, setAnchorEl] = useState(null);
    const [popperText, setPopperText] = useState('');
    const [open, setOpen] = useState(false);
    const cellRefs = useRef({});

    // セルをタップした時の処理
    const handleCellClick = (date, hour, highlightReason) => {
        const cellKey = `${date}-${hour}`;
        const cellElement = cellRefs.current[cellKey];
        
        if (anchorEl === cellElement) {
            // 同じセルをクリックした場合はポップオーバーを閉じる
            setOpen(false);
            setAnchorEl(null);
        } else {
            // 新しいセルをクリックした場合はポップオーバーを開く
            setAnchorEl(cellElement);
            setPopperText(highlightReason);
            setOpen(true);
        }
    };

    // ポップオーバー以外の場所をクリックした時に閉じる
    const handleClickAway = () => {
        setOpen(false);
    };

    // データの詳細をコンソールに出力（コンポーネントがレンダリングされるたびに）
    useEffect(() => {
        if (selectedAction?.startsWith('dti')) {
            console.group('DateTimeHeatmap データ詳細');
            console.log('選択されたアクション:', selectedAction);
            console.log('データの有無:', calendarData ? `データあり (${calendarData.length} 件)` : 'データなし');
            console.log('データの型:', typeof calendarData);
            console.log('配列かどうか:', Array.isArray(calendarData));
            
            if (Array.isArray(calendarData) && calendarData.length > 0) {
                console.log('最初のデータ項目:', calendarData[0]);
                
                const firstItem = calendarData[0];
                console.log('dateプロパティ:', firstItem.date);
                console.log('hoursプロパティ:', firstItem.hours);
                
                if (Array.isArray(firstItem.hours) && firstItem.hours.length > 0) {
                    console.log('最初の時間帯データ:', firstItem.hours[0]);
                }
            }
            
            console.log('データ全体:', calendarData);
            console.groupEnd();
        }
    }, [calendarData, selectedAction]);

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

    // actionが"dti"で始まる場合のみ表示
    if (!selectedAction || !selectedAction.startsWith('dti')) {
        return null;
    }

    // データ形式チェックを行うが、明らかに一部のデータがあれば表示する
    let hasValidData = false;
    try {
        // 少なくとも1つのアイテムでdate属性とhours配列があれば有効とみなす
        for (const item of calendarData) {
            if (item && item.date && Array.isArray(item.hours) && item.hours.length > 0) {
                hasValidData = true;
                break;
            }
        }
    } catch (error) {
        console.error("Error checking data format:", error);
    }

    if (!hasValidData) {
        console.error("No valid data items found for DateTimeHeatmap:", calendarData);
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                <Typography variant="body1" color="error">
                    データ形式が正しくありません。別のアクションを選択してください2。
                </Typography>
            </Box>
        );
    }

    // 時間の範囲を定義（7-22時）に修正
    const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7時から22時まで

    // 日付でソート - エラーハンドリング付き
    let sortedData = [];
    try {
        sortedData = [...calendarData].sort((a, b) => {
            return new Date(a.date) - new Date(b.date);
        });
    } catch (error) {
        console.error("Error sorting data:", error);
        // エラーが発生しても、元のデータをそのまま使用
        sortedData = calendarData;
    }

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ 
                maxWidth: '100%', 
                margin: '0 auto', 
                mt: 2, 
                px: isMobile ? 1 : 2
            }}>
                <Typography 
                    variant={isMobile ? "subtitle1" : "h6"} 
                    gutterBottom
                    sx={{ textAlign: isMobile ? 'center' : 'left' }}
                >
                    日付×時間帯の混雑度
                </Typography>
                
                <Paper 
                    elevation={2} 
                    sx={{ 
                        p: isMobile ? 1 : 2, 
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                >
                    {/* スクロール可能なコンテナ */}
                    <Box sx={{ 
                        overflowX: 'auto', 
                        WebkitOverflowScrolling: 'touch',
                        '&::-webkit-scrollbar': {
                            height: '8px'
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
                        {/* 全体コンテナ */}
                        <Box sx={{ 
                            display: 'flex', 
                            flexDirection: 'column',
                            minWidth: isMobile ? '800px' : 'auto' // モバイルでは最小幅を設定
                        }}>
                            {/* 時間帯のヘッダー行 */}
                            <Box sx={{ display: 'flex', flexDirection: 'row', position: 'sticky', left: 0 }}>
                                {/* 空のセル（左上角） */}
                                <Box sx={{ 
                                    width: isMobile ? '50px' : '60px', 
                                    minWidth: isMobile ? '50px' : '60px',
                                    borderBottom: '1px solid #ddd',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    backgroundColor: '#f5f5f5',
                                    position: 'sticky',
                                    left: 0,
                                    zIndex: 2
                                }}>
                                    <Typography 
                                        variant={isSmallMobile ? "caption" : "bodyS"} 
                                        fontWeight="bold"
                                    >
                                        日付
                                    </Typography>
                                </Box>
                                
                                {/* 時間帯ヘッダー */}
                                <Box sx={{ 
                                    display: 'flex', 
                                    flex: 1,
                                    borderBottom: '1px solid #ddd',
                                    backgroundColor: '#f5f5f5'
                                }}>
                                    {hours.map(hour => (
                                        <Box 
                                            key={`hour-${hour}`} 
                                            sx={{ 
                                                flex: 1,
                                                minWidth: isMobile ? '25px' : '30px',
                                                textAlign: 'center', 
                                                borderRight: hour !== 22 ? '1px solid #ddd' : 'none',
                                                padding: isMobile ? '3px 0' : '4px 0'
                                            }}
                                        >
                                            <Typography 
                                                variant={isSmallMobile ? "caption" : "bodyS"}
                                                sx={{ fontSize: isSmallMobile ? '0.65rem' : undefined }}
                                            >
                                                {hour}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>

                            {/* 日付ごとの行 */}
                            {sortedData.map((dateData, index) => (
                                <Box 
                                    key={`date-${dateData.date}`} 
                                    sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'row',
                                        borderBottom: index !== sortedData.length - 1 ? '1px solid #ddd' : 'none' 
                                    }}
                                >
                                    {/* 日付ラベル */}
                                    <Box sx={{ 
                                        width: isMobile ? '50px' : '60px', 
                                        minWidth: isMobile ? '50px' : '60px',
                                        borderRight: '1px solid #ddd',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: isMobile ? '3px 0' : '4px 0',
                                        backgroundColor: '#f9f9f9',
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 1
                                    }}>
                                        <Typography 
                                            variant={isSmallMobile ? "caption" : "bodyS"} 
                                            fontWeight="bold"
                                            sx={{ fontSize: isSmallMobile ? '0.65rem' : undefined }}
                                        >
                                            {formatDate(dateData.date)}
                                        </Typography>
                                    </Box>
                                    
                                    {/* 時間ごとのセル */}
                                    <Box sx={{ display: 'flex', flex: 1 }}>
                                        {hours.map(hour => {
                                            const hourData = dateData.hours.find(h => h.hour === hour);
                                            const congestion = hourData ? hourData.congestion : 0;
                                            const count = hourData ? hourData.count : 0;
                                            const highlighted = hourData && hourData.highlighted;
                                            const highlightReason = hourData ? hourData.highlight_reason : '';
                                            const cellKey = `${dateData.date}-${hour}`;
                                            
                                            // 混雑度0の場合は灰色を使用
                                            const cellColor = congestion === 0 ? '#e0e0e0' : getCellColor(congestion);
                                            
                                            return (
                                                <Box 
                                                    key={`${dateData.date}-${hour}`}
                                                    ref={(el) => cellRefs.current[cellKey] = el}
                                                    onClick={() => highlighted && highlightReason ? 
                                                        handleCellClick(dateData.date, hour, highlightReason) : null}
                                                    sx={{ 
                                                        flex: 1,
                                                        minWidth: isMobile ? '25px' : '30px',
                                                        height: isMobile ? '35px' : '40px',
                                                        backgroundColor: cellColor,
                                                        color: congestion === 0 ? '#666' : 
                                                              congestion >= 8 ? 'white' : 'inherit',
                                                        borderRight: hour !== 22 ? '1px solid #ddd' : 'none',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        padding: isMobile ? '1px' : '2px',
                                                        position: 'relative',
                                                        cursor: highlighted ? 'pointer' : 'default',
                                                        // ハイライトエフェクト
                                                        ...(highlighted && {
                                                            '&::before': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                top: isMobile ? '2px' : '3px',
                                                                left: isMobile ? '2px' : '3px',
                                                                right: isMobile ? '2px' : '3px',
                                                                bottom: isMobile ? '2px' : '3px',
                                                                borderRadius: '2px',
                                                                border: isMobile ? '1.5px solid rgba(255, 215, 0, 0.8)' : '2px solid rgba(255, 215, 0, 0.8)',
                                                                boxShadow: '0 0 3px rgba(255, 215, 0, 0.8)',
                                                                pointerEvents: 'none',
                                                                zIndex: 1,
                                                                backgroundColor: 'transparent',
                                                            }
                                                        }),
                                                    }}
                                                    title={`${formatDate(dateData.date)} ${hour}時 ${congestion === 0 ? '(データなし)' : `(人数: ${count})`}`}
                                                >
                                                    <Typography 
                                                        variant={isSmallMobile ? "caption" : "bodyXS"} 
                                                        fontWeight="bold"
                                                        sx={{ 
                                                            fontSize: isSmallMobile ? '0.65rem' : undefined,
                                                            color: congestion === 0 ? '#666' : 'inherit'
                                                        }}
                                                    >
                                                        {congestion === 0 ? '-' : congestion}
                                                    </Typography>
                                                    
                                                    {/* ハイライトされたセルにインフォアイコンを表示 */}
                                                    {highlighted && highlightReason && (
                                                        <InfoIcon 
                                                            sx={{ 
                                                                position: 'absolute',
                                                                top: '1px',
                                                                right: '1px',
                                                                fontSize: isMobile ? '10px' : '12px',
                                                                opacity: 0.8,
                                                                color: congestion >= 8 ? 'white' : 'inherit',
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                </Paper>
                
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
                            {popperText}
                        </Typography>
                    </Paper>
                </Popper>

                <Box sx={{ mt: 2 }}>
                    <CongestionLegend />
                </Box>
            </Box>
        </ClickAwayListener>
    );
};

export default DateTimeHeatmap;
