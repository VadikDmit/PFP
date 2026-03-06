
import React, { useState, useEffect, useRef } from 'react';
import { Send, Maximize2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { aiApi } from '../api/aiApi';
import avatarImage from '../assets/avatar_full.png';

interface AIDashboardHeaderProps {
    clientName: string;
    onOpenChat: () => void;
    clientData: any; // Context for AI
}

const AIDashboardHeader: React.FC<AIDashboardHeaderProps> = ({ clientName, onOpenChat, clientData }) => {
    const [message, setMessage] = useState('');
    const [aiResponse, setAiResponse] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const hasFetchedRef = useRef(false);

    useEffect(() => {
        if (!hasFetchedRef.current && clientData) {
            hasFetchedRef.current = true;
            greetUser();
        }
    }, [clientData]);

    const greetUser = async () => {
        // Optimization: check if we already greeted today for mainPFP
        const today = new Date().toDateString();
        const lastGreetingDate = localStorage.getItem('last_ai_greeting_mainPFP');

        if (lastGreetingDate === today) {
            setAiResponse(`С возвращением, ${clientName}! Готова продолжить работу над вашим планом.`);
            return;
        }

        setIsTyping(true);
        setAiResponse('');
        try {
            // Context for the AI - minimized as per user request
            const contextMessage = JSON.stringify({
                task: "greeting",
                client_id: clientData?.id,
                client_name: clientName
            });

            await aiApi.sendStreamingMessage(
                'mainPFP', // Using mainPFP stage as context
                contextMessage,
                (chunk) => setAiResponse(chunk),
                (full) => {
                    setAiResponse(full);
                    setIsTyping(false);
                    localStorage.setItem('last_ai_greeting_mainPFP', today);
                }
            );
        } catch (error) {
            console.error('Failed to get greeting:', error);
            setAiResponse('Доброе утро! Готова помочь вам с финансами.');
            setIsTyping(false);
        }
    };

    const handleSend = () => {
        if (!message.trim()) return;
        onOpenChat(); // Open modal on send attempt for better experience
    };

    return (
        <div style={{
            position: 'relative',
            background: 'linear-gradient(135deg, #fdfbf7 0%, #fff 100%)',
            borderRadius: '32px',
            padding: '40px',
            marginBottom: '32px',
            boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)',
            border: '1px solid rgba(255,255,255,0.8)',
            display: 'flex',
            gap: '40px',
            alignItems: 'flex-start',
            overflow: 'hidden'
        }}>
            {/* Background decoration */}
            <div style={{
                position: 'absolute',
                top: -50, right: -50,
                width: '300px', height: '300px',
                background: 'radial-gradient(circle, rgba(198,12,127,0.1) 0%, rgba(255,255,255,0) 70%)',
                borderRadius: '50%',
                zIndex: 0
            }} />

            {/* Avatar Section */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                style={{
                    position: 'relative',
                    flexShrink: 0,
                    zIndex: 1
                }}
            >
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '30px',
                    overflow: 'hidden',
                    boxShadow: '0 12px 24px rgba(0,0,0,0.1)',
                    border: '4px solid #fff'
                }}>
                    <img
                        src={avatarImage}
                        alt="Anna Dengina"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                </div>
                {isTyping && (
                    <div style={{
                        position: 'absolute',
                        bottom: -10,
                        right: -10,
                        background: '#34d399',
                        color: '#fff',
                        borderRadius: '20px',
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}>
                        Печатает...
                    </div>
                )}
            </motion.div>

            {/* Content Section */}
            <div style={{ flex: 1, zIndex: 1 }}>
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <h2 style={{
                        fontSize: '28px',
                        fontWeight: '800',
                        marginBottom: '16px',
                        background: 'linear-gradient(90deg, #111, #444)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent'
                    }}>
                        Финансовый ассистент Анна Деньгина
                    </h2>

                    <div style={{
                        fontSize: '18px',
                        lineHeight: '1.6',
                        color: '#444',
                        marginBottom: '32px',
                        minHeight: '60px',
                        maxWidth: '100%'
                    }}>
                        {aiResponse || (isTyping ? "..." : "Загрузка...")}
                    </div>

                    {/* Input Area */}
                    <div style={{
                        position: 'relative',
                        maxWidth: '100%',
                        boxShadow: '0 8px 20px rgba(0,0,0,0.06)',
                        borderRadius: '20px'
                    }}>
                        <input
                            type="text"
                            placeholder="Задайте любой вопрос по вашим финансам..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            style={{
                                width: '100%',
                                padding: '20px 60px 20px 24px',
                                borderRadius: '20px',
                                border: '1px solid #eee',
                                fontSize: '16px',
                                outline: 'none',
                                transition: 'border-color 0.2s',
                                background: '#fff'
                            }}
                            onFocus={(e) => e.target.style.borderColor = '#fbbf24'}
                            onBlur={(e) => e.target.style.borderColor = '#eee'}
                        />
                        <button
                            onClick={handleSend}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
                                border: 'none',
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#fff',
                                boxShadow: '0 4px 6px rgba(245, 158, 11, 0.2)'
                            }}
                        >
                            {message ? <Send size={20} /> : <Maximize2 size={20} />}
                        </button>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AIDashboardHeader;
