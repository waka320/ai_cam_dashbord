import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, useMediaQuery, Paper, CircularProgress, 
} from '@mui/material';
import { useLocation } from 'react-router-dom';

import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useCalendar } from '../../contexts/CalendarContext';
import theme from '../../theme/theme';

function AdviceSection() {
    const { 
        aiAdvice, 
        loading, 
        actionChanging,
        locationChanging,
        dateChanging,
        selectedLocation, 
        selectedAction, 
        selectedYear, 
        selectedMonth,
        data,
        calendarData
    } = useCalendar();
    const location = useLocation();
    const isMobile = useMediaQuery('(max-width:768px)');
    const [conversation, setConversation] = useState([]);
    
    // 現在のページテーマを判定
    const isPurposePage = location.pathname === '/purpose';
    const isFunctionPage = location.pathname === '/function';
    
    // テーマカラーを取得
    const getThemeColors = () => {
        if (isPurposePage) {
            return {
                main: '#4A5568',        // 目的ベース用
                light: '#718096',
                dark: '#2D3748',
                contrastText: '#FFFFFF'
            };
        } else if (isFunctionPage) {
            return {
                main: '#553C9A',        // グラフベース用
                light: '#805AD5',
                dark: '#44337A',
                contrastText: '#FFFFFF'
            };
        } else {
            return theme.palette.primary;  // デフォルト
        }
    };
    
    const themeColors = getThemeColors();
    
    // 初期のAIアドバイスが更新されたらチャット履歴に追加
    useEffect(() => {
        if (aiAdvice && !conversation.some(msg => msg.type === 'ai' && msg.text === aiAdvice)) {
            setConversation([
                { type: 'ai', text: aiAdvice }
            ]);
        }
    }, [aiAdvice, conversation]);
    
    // AdviceSectionを表示するかどうかの判定
    const shouldShowAdviceSection = () => {
        // データ読み込み中は非表示
        if (loading || actionChanging || locationChanging || dateChanging) {
            return false;
        }
        
        // 必要な選択項目が揃っていない場合は非表示
        if (!selectedLocation || !selectedAction || !selectedYear || !selectedMonth) {
            return false;
        }
        
        // データが存在しない場合は非表示
        if (!data && (!calendarData || calendarData.length === 0)) {
            return false;
        }
        
        return true;
    };
    
    // 表示条件を満たさない場合は何も表示しない
    if (!shouldShowAdviceSection()) {
        return null;
    }
    
    // 会話のないときの初期ガイド表示
    const renderEmptyState = () => {
        if (loading) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 3,
                    minHeight: '180px'
                }}>
                    <CircularProgress size={36} color="primary" sx={{ mb: 2 }} />
                    <Typography variant="body1" align="center" color="textSecondary">
                        分析の手引きを読み込んでいます...
                    </Typography>
                </Box>
            );
        }
        
        if (!selectedLocation || !selectedAction || !selectedYear || !selectedMonth) {
            return (
                <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    p: 3,
                    minHeight: '180px',
                    backgroundColor: 'rgba(245, 245, 245, 0.5)',
                    borderRadius: '12px',
                }}>
                    <InfoOutlinedIcon sx={{ fontSize: 40, color: themeColors.main, mb: 2, opacity: 0.7 }} />
                    <Typography variant="body1" align="center" color="textSecondary" sx={{ maxWidth: '80%' }}>
                        場所、目的、年月を選択すると、グラフと分析の手引きが表示されます
                    </Typography>
                </Box>
            );
        }
        
        return null;
    };

    // AIメッセージのレンダリング
    const renderAIAdvice = (text) => {
        // null/undefinedは非表示
        if (text == null) return null;

        // 安全に文字列へ変換
        let adviceString = '';
        if (typeof text === 'string') {
            adviceString = text;
        } else {
            try {
                adviceString = String(text);
            } catch (e) {
                return null;
            }
        }
        if (!adviceString) return null;
        
        // セクション分割（■ で始まる行をセクションタイトルとして扱う）
        const sections = [];
        let currentTitle = '';
        let currentContent = [];

        const lines = adviceString.split('\n');
        lines.forEach(rawLine => {
            const line = String(rawLine ?? '');
            if (line.startsWith('■')) {
                if (currentTitle) {
                    sections.push({ title: currentTitle, content: currentContent });
                }
                currentTitle = line.replace('■', '').trim();
                currentContent = [];
            } else if (line.trim() !== '') {
                currentContent.push(line);
            }
        });
        if (currentTitle && currentContent.length > 0) {
            sections.push({ title: currentTitle, content: currentContent });
        }
        
        // タイトル行（【場所】目的）
        const titleLine = lines[0] ? String(lines[0]) : '';
        
        // セクション別のアイコンとスタイルを定義
        const getSectionStyle = (title) => {
            switch (title) {
                case 'やること':
                    return {
                        icon: '📋',
                        color: themeColors.main,
                        bgColor: isPurposePage 
                            ? 'rgba(74, 85, 104, 0.05)'
                            : isFunctionPage 
                            ? 'rgba(85, 60, 154, 0.05)'
                            : 'rgba(25, 118, 210, 0.05)'
                    };
                case '注意点':
                    return {
                        icon: '⚠️',
                        color: theme.palette.warning.main,
                        bgColor: 'rgba(237, 108, 2, 0.05)'
                    };
                case 'アドバイス':
                    return {
                        icon: '💡',
                        color: theme.palette.success.main,
                        bgColor: 'rgba(46, 125, 50, 0.05)'
                    };
                default:
                    return {
                        icon: '📌',
                        color: theme.palette.text.primary,
                        bgColor: 'rgba(0, 0, 0, 0.02)'
                    };
            }
        };
        
        return (
            <Box>
                {/* タイトル行 */}
                <Typography 
                    variant="h6" 
                    sx={{ 
                        mb: isMobile ? 2 : 2.5,
                        fontSize: isMobile ? '1rem' : '1.1rem',
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        pb: 1,
                        borderBottom: `2px solid ${themeColors.main}`
                    }}
                >
                    {titleLine}
                </Typography>
                
                {/* セクション */}
                {sections.map((section, idx) => {
                    const sectionStyle = getSectionStyle(section.title);
                    
                    return (
                        <Box 
                            key={idx} 
                            sx={{ 
                                mb: isMobile ? 2 : 2.5,
                                p: isMobile ? 1.5 : 2,
                                borderRadius: '8px',
                                backgroundColor: sectionStyle.bgColor,
                                border: `1px solid ${sectionStyle.color}15`
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: isMobile ? 1 : 1.2 }}>
                                <Typography 
                                    sx={{ 
                                        fontSize: isMobile ? '1rem' : '1.1rem',
                                        mr: 0.8
                                    }}
                                >
                                    {sectionStyle.icon}
                                </Typography>
                                <Typography 
                                    variant="subtitle1"
                                    sx={{ 
                                        fontWeight: 600,
                                        color: sectionStyle.color,
                                        fontSize: isMobile ? '0.9rem' : '1rem'
                                    }}
                                >
                                    {section.title}
                                </Typography>
                            </Box>
                            
                            <Box sx={{ pl: 0.3 }}>
                                {section.content.map((paragraph, pIdx) => (
                                    <Typography 
                                        key={pIdx}
                                        variant="body2"
                                        sx={{ 
                                            mb: paragraph.startsWith('・') ? (isMobile ? 0.7 : 0.8) : (isMobile ? 1 : 1.2),
                                            lineHeight: isMobile ? 1.5 : 1.6,
                                            color: theme.palette.text.secondary,
                                            fontSize: isMobile ? '0.8rem' : '0.85rem',
                                            whiteSpace: 'pre-line' // 改行を保持
                                        }}
                                    >
                                        {paragraph}
                                    </Typography>
                                ))}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    };
    
    return (
        <Paper elevation={2} sx={{ 
            borderRadius: '12px',
            overflow: 'hidden',
            mb: 3,
            border: '1px solid rgba(0, 0, 0, 0.08)'
        }}>
            {/* ヘッダー */}
            <Box sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                backgroundColor: themeColors.main,
                color: 'white',
                p: isMobile ? 1.5 : 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
                <LightbulbIcon sx={{ 
                    mr: 1.5,
                    fontSize: isMobile ? '1.5rem' : '1.75rem',
                    color: themeColors.contrastText
                }} />
                <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                        fontWeight: 600,
                        fontSize: isMobile ? '1.1rem' : '1.2rem'
                    }}
                >
                    分析の手引き
                </Typography>
            </Box>
            
            {/* アドバイス表示エリア */}
            <Box sx={{ 
                p: isMobile ? 1.5 : 2.5,
                backgroundColor: 'white',
                minHeight: '200px',
            }}>
                {!aiAdvice ? renderEmptyState() : renderAIAdvice(aiAdvice)}
            </Box>
        </Paper>
    );
}

export default AdviceSection;
