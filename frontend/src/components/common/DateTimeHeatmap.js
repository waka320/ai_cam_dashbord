import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Paper, CircularProgress, useMediaQuery, Popper, ClickAwayListener } from '@mui/material';
import { useCalendar } from '../../contexts/CalendarContext';
import CongestionLegend from './CongestionLegend';
import { useColorPalette } from '../../contexts/ColorPaletteContext'; 
import AnalysisInfoButton from '../ui/AnalysisInfoButton'; // 追加

// 日付を整形する関数（例: "2024-07-01" -> "7/1"）
const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
};

// 曜日を取得する関数（0: 日曜日 ~ 6: 土曜日）
const getDayOfWeek = (dateStr) => {
    const date = new Date(dateStr);
    const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
    return dayNames[date.getDay()];
};

// 日付×時間ヒートマップコンポーネント
const DateTimeHeatmap = () => {
    const { calendarData, selectedAction, loading, selectedLocation } = useCalendar();
    const { getCellColor, getTextColor } = useColorPalette();
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
                    データ形式が正しくありません。別のアクションを選択してください。
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

    // 場所名の取得（ファイル名部分のみ）
    const getPlaceName = () => {
        if (!selectedLocation) return 'default';
        const parts = selectedLocation.split('/');
        const filename = parts[parts.length - 1];
        return filename.replace('.csv', '');
    };

    return (
        <ClickAwayListener onClickAway={handleClickAway}>
            <Box sx={{ 
                maxWidth: '100%', 
                margin: '0 auto', 
                mt: 2, 
                px: isMobile ? 1 : 2
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                    <Typography 
                        variant={isMobile ? "subtitle1" : "h6"} 
                        sx={{ textAlign: isMobile ? 'center' : 'left' }}
                    >
                        日付×時間帯の混雑度
                    </Typography>
                    
                    {/* 分析情報ボタンを追加 */}
                    <AnalysisInfoButton 
                        analysisType="dateTime"
                        place={getPlaceName()}
                    />
                </Box>
                
                {/* ヘッダーとセルを分離したコンテナ */}
                <Box sx={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '8px', 
                    overflow: 'hidden',
                    width: '100%'
                }}>
                    {/* スクロール可能なコンテンツエリア */}
                    <Box sx={{ 
                        display: 'flex',
                        position: 'relative',
                    }}>
                        {/* 日付ラベル列 - 垂直方向に固定 */}
                        <Box sx={{ 
                            display: 'flex',
                            flexDirection: 'column',
                            width: isMobile ? '50px' : '60px', 
                            minWidth: isMobile ? '50px' : '60px',
                            position: 'sticky',
                            left: 0,
                            zIndex: 2,
                            boxShadow: '2px 0 4px rgba(0,0,0,0.05)'
                        }}>
                            {/* 左上角（日付ヘッダー） */}
                            <Box sx={{ 
                                borderRight: '1px solid #ddd',
                                borderBottom: '1px solid #ddd',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                padding: isMobile ? '5px 2px' : '10px 5px',
                                backgroundColor: '#f5f5f5',
                                height: isMobile ? (isSmallMobile ? '35px' : '40px') : '40px',
                            }}>
                                <Typography 
                                    variant={isSmallMobile ? "bodyS" : "bodyM"} 
                                    fontWeight="bold"
                                >
                                    日付
                                </Typography>
                            </Box>

                            {/* 日付ラベル */}
                            {sortedData.map((dateData, rowIndex) => (
                                <Box 
                                    key={`date-label-${dateData.date}`}
                                    sx={{ 
                                        borderRight: '1px solid #ddd',
                                        borderBottom: rowIndex !== sortedData.length - 1 ? '1px solid #ddd' : 'none',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: isMobile ? '4px 0' : '8px 0',
                                        backgroundColor: '#f9f9f9',
                                        height: isMobile ? (isSmallMobile ? '35px' : '40px') : '40px',
                                    }}
                                >
                                    <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center'
                                    }}>
                                        <Typography 
                                            variant={isSmallMobile ? "bodyS" : "bodyM"} 
                                            fontWeight="bold"
                                        >
                                            {formatDate(dateData.date)}
                                        </Typography>
                                        <Typography 
                                            variant="caption" 
                                            sx={{ 
                                                fontSize: isSmallMobile ? '0.6rem' : '0.7rem', 
                                                opacity: 0.8,
                                                lineHeight: 1
                                            }}
                                        >
                                            ({getDayOfWeek(dateData.date)})
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                        
                        {/* セルとヘッダーのスクロール可能なエリア */}
                        <Box sx={{ 
                            overflowX: 'auto',
                            overflowY: 'hidden',
                            // maxHeight: isMobile ? 'calc(100vh - 280px)' : 'calc(100vh - 300px)',
                            WebkitOverflowScrolling: 'touch',
                            zIndex: 1,
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
                                boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
                            }}>
                                {hours.map(hour => (
                                    <Box 
                                        key={`hour-${hour}`} 
                                        sx={{ 
                                            minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                            width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                            textAlign: 'center', 
                                            padding: isMobile ? '4px 2px' : '6px 2px',
                                            borderRight: hour !== hours[hours.length - 1] ? '1px solid #ddd' : 'none',
                                            borderBottom: '1px solid #ddd',
                                            flexShrink: 0,
                                            height: isMobile ? (isSmallMobile ? '35px' : '40px') : '40px',
                                        }}
                                    >
                                        <Typography 
                                            variant={isSmallMobile ? "bodyS" : "bodyM"}
                                            fontWeight="bold"
                                        >
                                            {hour}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>

                            {/* 時間ごとのセル（行） */}
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                {sortedData.map((dateData, rowIndex) => (
                                    <Box 
                                        key={`date-row-${dateData.date}`} 
                                        sx={{ 
                                            display: 'flex', 
                                            flexDirection: 'row'
                                        }}
                                    >
                                        {/* 時間ごとのセル */}
                                        {hours.map((hour, colIndex) => {
                                            const hourData = dateData.hours.find(h => h.hour === hour);
                                            const congestion = hourData ? hourData.congestion : 0;
                                            const count = hourData ? hourData.count : 0;
                                            const highlighted = hourData && hourData.highlighted;
                                            const highlightReason = hourData ? hourData.highlight_reason : '';
                                            const cellKey = `${dateData.date}-${hour}`;
                                            
                                            return (
                                                <Box 
                                                    key={`${dateData.date}-${hour}`}
                                                    ref={(el) => cellRefs.current[cellKey] = el}
                                                    onClick={() => highlighted && highlightReason ? 
                                                        handleCellClick(dateData.date, hour, highlightReason) : null}
                                                    sx={{ 
                                                        minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                        width: isMobile ? (isSmallMobile ? '30px' : '40px') : '40px',
                                                        height: isMobile ? (isSmallMobile ? '35px' : '40px') : '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        backgroundColor: congestion === 0 ? '#e0e0e0' : getCellColor(congestion),
                                                        color: congestion === 0 ? '#666' : getTextColor(congestion),
                                                        borderRight: colIndex !== hours.length - 1 ? '1px solid #ddd' : 'none',
                                                        borderBottom: rowIndex !== sortedData.length - 1 ? '1px solid #ddd' : 'none',
                                                        position: 'relative',
                                                        cursor: highlighted ? 'pointer' : 'default',
                                                        flexShrink: 0,
                                                        // ハイライトエフェクト
                                                        // ...(highlighted && {
                                                        //     '&::before': {
                                                        //         content: '""',
                                                        //         position: 'absolute',
                                                        //         top: isMobile ? '2px' : '3px',
                                                        //         left: isMobile ? '2px' : '3px',
                                                        //         right: isMobile ? '2px' : '3px',
                                                        //         bottom: isMobile ? '2px' : '3px',
                                                        //         borderRadius: '2px',
                                                        //         border: isMobile ? '1.5px solid rgba(255, 215, 0, 0.8)' : '2px solid rgba(255, 215, 0, 0.8)',
                                                        //         boxShadow: '0 0 3px rgba(255, 215, 0, 0.8)',
                                                        //         pointerEvents: 'none',
                                                        //         zIndex: 1,
                                                        //         backgroundColor: 'transparent',
                                                        //     }
                                                        // }),
                                                    }}
                                                    title={`${formatDate(dateData.date)} ${hour}時 ${congestion === 0 ? '(データなし)' : `(人数: ${count})`}`}
                                                >
                                                    {/* セル内容（変更なし） */}
                                                    <Box sx={{ 
                                                        textAlign: 'center', 
                                                        padding: isMobile ? (isSmallMobile ? '2px' : '4px') : '10px',
                                                        position: 'relative',
                                                        zIndex: 2,
                                                        width: '100%',
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center'
                                                    }}>
                                                        <Typography 
                                                            variant={isSmallMobile ? "caption" : "bodyXS"} 
                                                            fontWeight="bold"
                                                            sx={{ 
                                                                fontSize: isSmallMobile ? '0.65rem' : undefined
                                                            }}
                                                        >
                                                            {congestion === 0 ? '-' : congestion}
                                                        </Typography>
                                                        
                                                        {/* ハイライトされたセルにインフォアイコンを表示 */}
                                                        {/* {highlighted && highlightReason && (
                                                            <InfoIcon 
                                                                sx={{ 
                                                                    position: 'absolute',
                                                                    top: isMobile ? '1px' : '5px',
                                                                    right: isMobile ? '1px' : '5px',
                                                                    fontSize: isMobile ? '12px' : '16px',
                                                                    opacity: 0.8
                                                                }}
                                                            />
                                                        )} */}
                                                    </Box>
                                                </Box>
                                            );
                                        })}
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </Box>
                </Box>
                
                {/* ポッパーとレジェンドは変更なし */}
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
