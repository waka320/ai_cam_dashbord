import React, { useState, useEffect } from 'react';
import { 
    Box, Typography, useMediaQuery, Paper, CircularProgress, 
} from '@mui/material';

import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useCalendar } from '../../contexts/CalendarContext';
import theme from '../../theme/theme';

function AdviceSection() {
    const { aiAdvice, loading, selectedLocation, selectedAction, selectedYear, selectedMonth } = useCalendar();
    const isMobile = useMediaQuery('(max-width:768px)');
    const [conversation, setConversation] = useState([]);
    
    // 初期のAIアドバイスが更新されたらチャット履歴に追加
    useEffect(() => {
        if (aiAdvice && !conversation.some(msg => msg.type === 'ai' && msg.text === aiAdvice)) {
            setConversation([
                { type: 'ai', text: aiAdvice }
            ]);
        }
    }, [aiAdvice, conversation]);
    
    // 自動スクロール機能を無効化（関連するコードをコメントアウト）
    /*
    const [shouldScrollToBottom, setShouldScrollToBottom] = useState(false);
    
    // 新しいメッセージが追加されたときのみスクロール処理を実行
    useEffect(() => {
        // 入力中はスクロールしない
        if (shouldScrollToBottom && messagesEndRef.current && chatContainerRef.current) {
            // スクロール処理をタイマーで少し遅らせる
            const timer = setTimeout(() => {
                // スクロール位置が下部に近い場合か、自分のメッセージが最後の場合のみスクロール
                const container = chatContainerRef.current;
                const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 150;
                const lastMsg = conversation[conversation.length - 1];
                
                if (isNearBottom || lastMsg?.type === 'user' || conversation.length <= 1) {
                    messagesEndRef.current.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'end'
                    });
                }
                // setShouldScrollToBottom(false);
            }, 100);
            
            return () => clearTimeout(timer);
        }
    }, [conversation, shouldScrollToBottom]);
    */
    
    // 未使用関数を削除
    /*
    // 質問送信の処理
    const handleAskQuestion = async () => {
        // ...関数の中身は省略...
    };
    
    // AIメッセージのレンダリング
    const renderAIMessage = (text, isError = false) => {
        // ...関数の中身は省略...
    };
    */
    
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
                        AIがデータを分析しています...
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
                    <InfoOutlinedIcon sx={{ fontSize: 40, color: theme.palette.primary.main, mb: 2, opacity: 0.7 }} />
                    <Typography variant="body1" align="center" color="textSecondary" sx={{ maxWidth: '80%' }}>
                        場所、目的、年月を選択すると、AIからのアドバイスが表示されます
                    </Typography>
                </Box>
            );
        }
        
        return null;
    };

    // AIメッセージのレンダリング
    const renderAIAdvice = (text) => {
        if (!text) return null;
        
        // セクション分割（■ で始まる行をセクションタイトルとして扱う）
        const sections = [];
        let currentTitle = '';
        let currentContent = [];
        
        text.split('\n').forEach(line => {
            if (line.startsWith('■')) {
                // 新しいセクションの開始
                if (currentTitle) {
                    // 前のセクションを保存
                    sections.push({ title: currentTitle, content: currentContent });
                }
                currentTitle = line.replace('■', '').trim();
                currentContent = [];
            } else if (line.trim() !== '') {
                currentContent.push(line);
            }
        });
        
        // 最後のセクションを追加
        if (currentTitle && currentContent.length > 0) {
            sections.push({ title: currentTitle, content: currentContent });
        }
        
        // タイトル行（【場所】目的）を抽出
        const titleLine = text.split('\n')[0] || '';
        
        return (
            <Box>
                {/* タイトル行 */}
                <Typography 
                    variant="h6" 
                    sx={{ 
                        mb: 2,
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: theme.palette.text.primary
                    }}
                >
                    {titleLine}
                </Typography>
                
                {/* セクション */}
                {sections.map((section, idx) => (
                    <Box key={idx} sx={{ mb: 3 }}>
                        <Typography 
                            variant="subtitle1"
                            sx={{ 
                                mb: 1, 
                                fontWeight: 600,
                                color: theme.palette.primary.main,
                                fontSize: '0.9rem'
                            }}
                        >
                            {section.title}
                        </Typography>
                        
                        <Box sx={{ pl: 1 }}>
                            {section.content.map((paragraph, pIdx) => (
                                <Typography 
                                    key={pIdx}
                                    variant="body2"
                                    sx={{ 
                                        mb: 1,
                                        lineHeight: 1.6,
                                        color: theme.palette.text.secondary
                                    }}
                                >
                                    {paragraph}
                                </Typography>
                            ))}
                        </Box>
                    </Box>
                ))}
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
                backgroundColor: theme.palette.primary.main,
                color: 'white',
                p: isMobile ? 1.5 : 2,
                borderBottom: '1px solid rgba(0, 0, 0, 0.08)'
            }}>
                <LightbulbIcon sx={{ 
                    mr: 1.5,
                    fontSize: isMobile ? '1.5rem' : '1.75rem',
                    color: theme.palette.primary.contrastText
                }} />
                <Typography 
                    variant="h6" 
                    component="h2" 
                    sx={{ 
                        fontWeight: 600,
                        fontSize: isMobile ? '1.1rem' : '1.2rem'
                    }}
                >
                    分析のアドバイス
                </Typography>
            </Box>
            
            {/* アドバイス表示エリア */}
            <Box sx={{ 
                p: 2.5,
                backgroundColor: 'white',
                minHeight: '200px',
                maxHeight: '350px',
                overflowY: 'auto',
                '&::-webkit-scrollbar': {
                    width: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: '#f1f1f1',
                },
                '&::-webkit-scrollbar-thumb': {
                    background: '#bbb',
                    borderRadius: '4px',
                },
            }}>
                {!aiAdvice ? renderEmptyState() : renderAIAdvice(aiAdvice)}
            </Box>
        </Paper>
    );
}

export default AdviceSection;
