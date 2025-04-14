import React, { useState, useRef, useEffect } from 'react';
import { 
    Box, Typography, Button, useMediaQuery, TextField, Paper, 
    Avatar, Divider, CircularProgress, Fade, 
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PersonIcon from '@mui/icons-material/Person';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useCalendar } from '../../contexts/CalendarContext';
import theme from '../../theme/theme';

function AISection() {
    const { aiAdvice, loading, selectedLocation, selectedAction, selectedYear, selectedMonth } = useCalendar();
    const isMobile = useMediaQuery('(max-width:768px)');
    const [followupQuestion, setFollowupQuestion] = useState('');
    const [conversation, setConversation] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);
    
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
    
    // 質問送信の処理
    const handleAskQuestion = async () => {
        if (!followupQuestion.trim()) return;
        
        const userQuestion = followupQuestion.trim();
        
        // ユーザーの質問をチャット履歴に追加
        setConversation(prev => [...prev, { type: 'user', text: userQuestion }]);
        setFollowupQuestion('');
        setIsTyping(true);
        // 自動スクロール関連コードをコメントアウト
        // setShouldScrollToBottom(true);  // ユーザーメッセージ送信時はスクロール
        
        try {
            // 本来ならapiを呼び出す
            // ここではデモ用にタイムアウトで応答をシミュレート
            setTimeout(() => {
                const aiResponse = `ご質問「${userQuestion}」について分析しました。\n\n高山市のデータによると、この時期は観光客が${selectedMonth || "X"}月に${Math.round(Math.random() * 20) + 10}%増加する傾向があります。${selectedAction?.includes('event') ? 'イベント開催は週末が効果的でしょう。' : '営業日の検討には平日と週末のバランスが重要です。'}\n\n詳細な提案としては、地域特性を活かした戦略が有効です。`;
                
                // AIの回答をチャット履歴に追加
                setConversation(prev => [...prev, { type: 'ai', text: aiResponse }]);
                setIsTyping(false);
                // 自動スクロール関連コードをコメントアウト
                // setShouldScrollToBottom(true);  // AI応答受信時はスクロール
            }, 1500);
            
            // 実際のAPI呼び出しの場合は以下のようなコードになる
            /*
            const response = await fetch('/api/ask-ai', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: userQuestion,
                    location: selectedLocation,
                    action: selectedAction,
                    year: selectedYear,
                    month: selectedMonth,
                    context: conversation
                })
            });
            
            if (!response.ok) throw new Error('AIへの質問送信に失敗しました');
            
            const data = await response.json();
            setConversation(prev => [...prev, { type: 'ai', text: data.response }]);
            setShouldScrollToBottom(true);
            */
            
        } catch (error) {
            // エラー処理
            setConversation(prev => [...prev, { 
                type: 'ai', 
                text: 'すみません、質問の処理中にエラーが発生しました。もう一度お試しください。',
                isError: true 
            }]);
            // 自動スクロール関連コードをコメントアウト
            // setShouldScrollToBottom(true);
        } finally {
            setIsTyping(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleAskQuestion();
        }
    };
    
    // AIメッセージのレンダリング
    const renderAIMessage = (text, isError = false) => {
        // 段落分割
        const paragraphs = text.split('\n').filter(p => p.trim() !== '');
        
        return (
            <Box>
                {paragraphs.map((paragraph, idx) => (
                    <Typography 
                        key={idx} 
                        variant="body1" 
                        color={isError ? "error" : "textPrimary"}
                        sx={{ 
                            mb: 1.5, 
                            lineHeight: 1.6,
                            fontSize: '0.95rem',
                            whiteSpace: 'pre-wrap'
                        }}
                    >
                        {paragraph}
                    </Typography>
                ))}
            </Box>
        );
    };
    
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
                    AIからのアドバイス
                </Typography>
                
            </Box>
            
            {/* 会話エリア */}
            <Box 
                ref={chatContainerRef}
                sx={{ 
                    p: 0,
                    height: isMobile ? '300px' : '350px',
                    maxHeight: '350px',
                    overflowY: 'auto',
                    backgroundColor: 'rgba(250, 250, 250, 0.5)',
                    // スクロールカスタマイズ
                    scrollBehavior: 'auto',
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
                }}
            >
                {conversation.length === 0 ? (
                    renderEmptyState()
                ) : (
                    <Box sx={{ p: 2 }}>
                        {conversation.map((message, index) => (
                            <Box 
                                key={index} 
                                sx={{ 
                                    display: 'flex', 
                                    mb: 2.5,
                                    alignItems: 'flex-start'
                                }}
                            >
                                <Avatar 
                                    sx={{ 
                                        bgcolor: message.type === 'ai' ? theme.palette.primary.main : 'gray',
                                        width: 36,
                                        height: 36,
                                        mr: 1.5
                                    }}
                                >
                                    {message.type === 'ai' ? <SmartToyIcon /> : <PersonIcon />}
                                </Avatar>
                                <Box 
                                    sx={{ 
                                        backgroundColor: message.type === 'ai' 
                                            ? 'white' 
                                            : theme.palette.grey[100],
                                        p: 1.5,
                                        borderRadius: '12px',
                                        flexGrow: 1,
                                        border: message.type === 'ai' ? '1px solid rgba(0, 0, 0, 0.08)' : 'none',
                                        ml: message.type === 'user' ? 'auto' : 0,
                                        maxWidth: '85%'
                                    }}
                                >
                                    {message.type === 'ai' 
                                        ? renderAIMessage(message.text, message.isError) 
                                        : (
                                            <Typography 
                                                variant="body1" 
                                                sx={{ 
                                                    fontSize: '0.95rem',
                                                    fontWeight: 500
                                                }}
                                            >
                                                {message.text}
                                            </Typography>
                                        )
                                    }
                                </Box>
                            </Box>
                        ))}
                        
                        {/* タイピング中のインジケーター */}
                        {isTyping && (
                            <Fade in={isTyping}>
                                <Box 
                                    sx={{ 
                                        display: 'flex', 
                                        mb: 2,
                                        alignItems: 'flex-start'
                                    }}
                                >
                                    <Avatar 
                                        sx={{ 
                                            bgcolor: theme.palette.primary.main,
                                            width: 36,
                                            height: 36,
                                            mr: 1.5
                                        }}
                                    >
                                        <SmartToyIcon />
                                    </Avatar>
                                    <Box 
                                        sx={{ 
                                            display: 'flex',
                                            alignItems: 'center',
                                            p: 2,
                                            borderRadius: '12px',
                                            backgroundColor: 'white',
                                            border: '1px solid rgba(0, 0, 0, 0.08)',
                                        }}
                                    >
                                        <Box sx={{ 
                                            display: 'flex', 
                                            alignItems: 'center',
                                            gap: 0.5
                                        }}>
                                            <Box className="loading-pulse" sx={{ 
                                                width: 6, 
                                                height: 6, 
                                                backgroundColor: theme.palette.grey[400],
                                                borderRadius: '50%' 
                                            }} />
                                            <Box className="loading-pulse" sx={{ 
                                                width: 6, 
                                                height: 6, 
                                                backgroundColor: theme.palette.grey[400],
                                                borderRadius: '50%',
                                                animationDelay: '0.2s'
                                            }} />
                                            <Box className="loading-pulse" sx={{ 
                                                width: 6, 
                                                height: 6, 
                                                backgroundColor: theme.palette.grey[400],
                                                borderRadius: '50%',
                                                animationDelay: '0.4s'
                                            }} />
                                        </Box>
                                    </Box>
                                </Box>
                            </Fade>
                        )}
                        
                        {/* マニュアルスクロール用のアンカーポイント（機能は無効化済み） */}
                        <div ref={messagesEndRef} style={{ height: 1 }} />
                    </Box>
                )}
            </Box>
            
            {/* 入力エリア */}
            <Divider />
            <Box sx={{ 
                p: 2, 
                display: 'flex', 
                alignItems: 'center',
                backgroundColor: 'white'
            }}>
                <TextField 
                    fullWidth
                    variant="outlined"
                    size="small"
                    placeholder={aiAdvice ? "AIに質問する..." : "必要な情報を先に選択してください"}
                    value={followupQuestion}
                    onChange={(e) => setFollowupQuestion(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading || !aiAdvice || isTyping}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '20px',
                            paddingRight: '14px',
                            backgroundColor: theme.palette.grey[50]
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <Button
                                color="primary"
                                disabled={!followupQuestion.trim() || loading || !aiAdvice || isTyping}
                                onClick={handleAskQuestion}
                                sx={{ 
                                    minWidth: 'auto', 
                                    borderRadius: '50%',
                                    width: 32,
                                    height: 32,
                                    padding: 0
                                }}
                            >
                                <SendIcon fontSize="small" />
                            </Button>
                        )
                    }}
                />
            </Box>
        </Paper>
    );
}

export default AISection;
