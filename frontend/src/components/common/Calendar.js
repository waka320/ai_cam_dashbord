import React, { useState, useRef } from 'react';
import { Box, Typography, CircularProgress, Popper, Paper, ClickAwayListener, useMediaQuery } from '@mui/material';
import theme from '../../theme/theme';
import { useCalendar } from '../../contexts/CalendarContext';
import CongestionLegend, { getCellColor } from './CongestionLegend';
import InfoIcon from '@mui/icons-material/Info';

// カレンダーコンポーネント
const CalendarHeatmap = () => {
    const { calendarData, selectedAction, loading } = useCalendar();
    const daysOfWeek = ['日', '月', '火', '水', '木', '金', '土'];
    
    // レスポンシブ対応のためのメディアクエリ
    const isMobile = useMediaQuery('(max-width:768px)');
    const isSmallMobile = useMediaQuery('(max-width:480px)');
    
    // クリックしたセルの参照とポップオーバーの状態管理
    const [anchorEl, setAnchorEl] = useState(null);
    const [popperText, setPopperText] = useState('');
    const [open, setOpen] = useState(false);
    const cellRefs = useRef({});

    // セルをタップした時の処理
    const handleCellClick = (rowIndex, colIndex, highlightReason) => {
        const cellKey = `${rowIndex}-${colIndex}`;
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
        <ClickAwayListener onClickAway={handleClickAway}>
            <Box>
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
                                        onClick={() => cell && cell.highlighted && cell.highlight_reason ? 
                                            handleCellClick(rowIndex, colIndex, cell.highlight_reason) : null}
                                        sx={{
                                            flex: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: cell ? getCellColor(cell.congestion) : '#fff',
                                            color: cell && cell.congestion <= 8 && cell.congestion >= 3 ? 'inherit' : theme.palette.text.white,
                                            borderRight: colIndex !== 6 ? '1px solid #ddd' : undefined,
                                            borderBottom: rowIndex !== calendarData.length - 1 ? '1px solid #ddd' : undefined,
                                            position: 'relative',
                                            cursor: cell && cell.highlighted ? 'pointer' : 'default',
                                            height: isMobile ? (isSmallMobile ? '45px' : '55px') : 'auto',
                                            minWidth: isMobile ? (isSmallMobile ? '30px' : '40px') : 'auto',
                                            // ハイライトエフェクト
                                            ...(cell && cell.highlighted && {
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
                                    >
                                        {cell && (
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
                                                    variant={isMobile ? (isSmallMobile ? "bodyL" : "h4") : "h3"} 
                                                    sx={{ 
                                                        margin: '0px',
                                                        fontSize: isMobile ? (isSmallMobile ? '14px' : '16px') : undefined,
                                                        lineHeight: isMobile ? '1.2' : undefined
                                                    }}
                                                >
                                                    {cell.date}
                                                </Typography>
                                                
                                                <Typography 
                                                    variant={isMobile ? "bodyS" : "bodyM"} 
                                                    sx={{
                                                        fontSize: isSmallMobile ? '10px' : undefined,
                                                        lineHeight: isSmallMobile ? '1' : undefined,
                                                        marginTop: isSmallMobile ? '2px' : undefined
                                                    }}
                                                >
                                                    {isSmallMobile ? `混:${cell.congestion}` : `混雑度: ${cell.congestion}`}
                                                </Typography>
                                                
                                                {/* ハイライトされたセルにインフォアイコンを表示 */}
                                                {cell.highlighted && cell.highlight_reason && (
                                                    <InfoIcon 
                                                        sx={{ 
                                                            position: 'absolute',
                                                            top: isMobile ? '1px' : '5px',
                                                            right: isMobile ? '1px' : '5px',
                                                            fontSize: isMobile ? '12px' : '16px',
                                                            opacity: 0.8,
                                                            color: cell.congestion <= 8 && cell.congestion >= 3 ? 'inherit' : theme.palette.text.white,
                                                        }}
                                                    />
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
                            {popperText}
                        </Typography>
                    </Paper>
                </Popper>
                
                <CongestionLegend />
            </Box>
        </ClickAwayListener>
    );
};

export default CalendarHeatmap;
