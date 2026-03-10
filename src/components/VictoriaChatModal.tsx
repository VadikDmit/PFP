import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, User } from 'lucide-react';
import avatarImage from '../assets/avatar_full.png';
import { aiApi } from '../api/aiApi';

interface Message {
    id: string;
    text: string;
    sender: 'victoria' | 'user';
    isStreaming?: boolean;
}

interface VictoriaChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    goal: any;
    fieldName: string; // e.g., 'target_amount', 'term_months'
    fieldLabel: string; // e.g., 'Стоимость цели', 'Срок'
    currentValue: any;
    onUpdate: (newValue: any) => void;
}

const VictoriaChatModal: React.FC<VictoriaChatModalProps> = ({
    isOpen,
    onClose,
    goal,
    fieldName,
    fieldLabel,
    currentValue
}) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            // Initial greeting for the specific field
            const initChat = async () => {
                setIsTyping(true);
                const aiMsgId = 'init_field_' + Math.random().toString();
                setMessages([{ id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);

                try {
                    // Tell AI about current context
                    const contextMsg = `Я хотел бы обсудить параметр "${fieldLabel}" для моей цели "${goal?.name || 'этой цели'}". Сейчас значение: ${currentValue}. Подскажи, на что это влияет и как лучше настроить?`;

                    await aiApi.sendStreamingMessage(
                        'futurePFP',
                        contextMsg,
                        (chunk) => {
                            setMessages([{ id: aiMsgId, text: chunk, sender: 'victoria', isStreaming: true }]);
                        },
                        (fullText) => {
                            setMessages([{ id: aiMsgId, text: fullText, sender: 'victoria', isStreaming: false }]);
                            setIsTyping(false);
                        }
                    );
                } catch (err) {
                    console.error('Failed to start field chat', err);
                    setMessages([{ id: 'error', text: 'Извините, не удалось подключиться к Виктории.', sender: 'victoria' }]);
                    setIsTyping(false);
                }
            };

            initChat();
        } else {
            setMessages([]);
        }
    }, [isOpen, fieldName, goal?.id]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMsg: Message = { id: Date.now().toString(), text: inputValue, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        const aiMsgId = 'ai_' + Date.now().toString();
        setMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);

        try {
            await aiApi.sendStreamingMessage(
                'futurePFP',
                inputValue,
                (chunk) => {
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: chunk } : m));
                },
                (fullText) => {
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, isStreaming: false } : m));
                    setIsTyping(false);

                    // Heuristic: if message contains numbers, suggest update? (Optional)
                }
            );
        } catch (err) {
            console.error('Chat error', err);
            setIsTyping(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    zIndex: 2000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '16px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(8px)'
                }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        style={{
                            width: '100%',
                            maxWidth: '500px',
                            height: '80vh',
                            background: '#fff',
                            borderRadius: '32px',
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
                        }}
                    >
                        {/* Header */}
                        <div style={{
                            padding: '20px 24px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            background: 'linear-gradient(to right, #fff, #f8fafc)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '40px', height: '40px', borderRadius: '12px', overflow: 'hidden' }}>
                                    <img src={avatarImage} alt="Victoria" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                                <div>
                                    <div style={{ fontWeight: 800, color: '#1e293b', fontSize: '15px' }}>Виктория</div>
                                    <div style={{ fontSize: '12px', color: '#64748b' }}>Параметр: {fieldLabel}</div>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                            >
                                <X size={18} color="#64748b" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div
                            ref={scrollRef}
                            style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#fcfcfc' }}
                        >
                            {messages.map((m) => (
                                <div key={m.id} style={{ display: 'flex', justifyContent: m.sender === 'victoria' ? 'flex-start' : 'flex-end', gap: '8px' }}>
                                    {m.sender === 'victoria' && (
                                        <div style={{ width: '28px', height: '28px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, marginTop: '4px' }}>
                                            <img src={avatarImage} alt="V" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{
                                        maxWidth: '85%',
                                        padding: '12px 16px',
                                        borderRadius: '20px',
                                        fontSize: '14px',
                                        lineHeight: '1.5',
                                        background: m.sender === 'victoria' ? '#fff' : '#C60C7F',
                                        color: m.sender === 'victoria' ? '#1e293b' : '#000',
                                        border: m.sender === 'victoria' ? '1px solid #e2e8f0' : 'none',
                                        boxShadow: m.sender === 'victoria' ? '0 2px 4px rgba(0,0,0,0.02)' : '0 4px 12px rgba(198,12,127,0.2)',
                                        borderBottomLeftRadius: m.sender === 'victoria' ? '4px' : '20px',
                                        borderBottomRightRadius: m.sender === 'user' ? '4px' : '20px',
                                    }}>
                                        {m.text}
                                        {m.isStreaming && <span className="streaming-cursor">|</span>}
                                    </div>
                                    {m.sender === 'user' && (
                                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#ffc750', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '4px' }}>
                                            <User size={14} />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '20px 24px', borderTop: '1px solid #f1f5f9', background: '#fff' }}>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Задайте вопрос Виктории..."
                                    style={{
                                        width: '100%',
                                        padding: '14px 50px 14px 20px',
                                        borderRadius: '16px',
                                        border: '1px solid #e2e8f0',
                                        outline: 'none',
                                        fontSize: '14px',
                                        background: '#f8fafc'
                                    }}
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={isTyping || !inputValue.trim()}
                                    style={{
                                        position: 'absolute',
                                        right: '8px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: '#C60C7F',
                                        border: 'none',
                                        borderRadius: '12px',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        opacity: isTyping || !inputValue.trim() ? 0.5 : 1
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default VictoriaChatModal;
