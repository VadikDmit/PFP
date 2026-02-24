
import React, { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import { aiApi } from '../api/aiApi';
import avatarImage from '../assets/avatar_full.png';
import Markdown from 'react-markdown';

interface WideChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    clientData: any;
    initialMessage?: string;
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
    isStreaming?: boolean;
}

const WideChatModal: React.FC<WideChatModalProps> = ({ isOpen, onClose, clientData, initialMessage }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Здравствуйте! Я готова обсудить ваши финансовые цели. Что вас интересует?' }
    ]);
    const [input, setInput] = useState(initialMessage || '');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && initialMessage) {
            handleSendMessage(initialMessage);
            setInput('');
        }
    }, [isOpen]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSendMessage = async (text: string) => {
        if (!text.trim()) return;

        const userMsg: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Placeholder for AI streaming message
        setMessages(prev => [...prev, { role: 'assistant', content: '', isStreaming: true }]);

        try {
            const messagePayload = JSON.stringify({
                message: text,
                client_id: clientData?.id
            });

            await aiApi.sendStreamingMessage(
                'general',
                messagePayload,
                (chunk) => {
                    setMessages(prev => prev.map((msg, idx) =>
                        idx === prev.length - 1 ? { ...msg, content: chunk } : msg
                    ));
                },
                (full) => {
                    setMessages(prev => prev.map((msg, idx) =>
                        idx === prev.length - 1 ? { ...msg, content: full, isStreaming: false } : msg
                    ));
                }
            );

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => prev.map((msg, idx) =>
                idx === prev.length - 1 ? { ...msg, content: 'Извините, произошла ошибка связи.', isStreaming: false } : msg
            ));
        }
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 4000,
            backgroundColor: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    height: '85vh',
                    background: '#fff',
                    borderRadius: '32px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
                }}
            >
                {/* Header */}
                <div style={{
                    padding: '24px 32px',
                    borderBottom: '1px solid #f0f0f0',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#fff'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: '#f3f4f6',
                            overflow: 'hidden'
                        }}>
                            <img src={avatarImage} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: '700', margin: 0 }}>Анна Деньгина</h3>
                            <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span>
                                Онлайн • Финансовый советник
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '50%' }}
                        className="hover-bg"
                    >
                        <X size={24} color="#666" />
                    </button>
                    <style>{`.hover-bg:hover { background: #f3f4f6; }`}</style>
                </div>

                {/* Messages Area */}
                <div style={{
                    flex: 1,
                    padding: '32px',
                    overflowY: 'auto',
                    background: '#f9fafb',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '24px'
                }}>
                    {messages.map((msg, idx) => (
                        <div key={idx} style={{
                            display: 'flex',
                            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        }}>
                            <div style={{
                                maxWidth: '70%',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '12px',
                                flexDirection: msg.role === 'user' ? 'row-reverse' : 'row'
                            }}>
                                {msg.role === 'assistant' && (
                                    <div style={{
                                        width: '36px', height: '36px', borderRadius: '10px', overflow: 'hidden', flexShrink: 0
                                    }}>
                                        <img src={avatarImage} alt="AI" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    </div>
                                )}
                                <div style={{
                                    padding: '16px 24px',
                                    borderRadius: '20px',
                                    background: msg.role === 'user' ? '#111' : '#fff',
                                    color: msg.role === 'user' ? '#fff' : '#111',
                                    boxShadow: msg.role === 'user' ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 4px rgba(0,0,0,0.05)',
                                    borderTopRightRadius: msg.role === 'user' ? '4px' : '20px',
                                    borderTopLeftRadius: msg.role === 'assistant' ? '4px' : '20px',
                                    fontSize: '16px',
                                    lineHeight: '1.6'
                                }}>
                                    <Markdown>{msg.content}</Markdown>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div style={{
                    padding: '24px 32px',
                    background: '#fff',
                    borderTop: '1px solid #f0f0f0'
                }}>
                    <div style={{
                        position: 'relative',
                        maxWidth: '1000px',
                        margin: '0 auto'
                    }}>
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSendMessage(input);
                                }
                            }}
                            placeholder="Напишите сообщение..."
                            style={{
                                width: '100%',
                                padding: '16px 60px 16px 20px',
                                borderRadius: '16px',
                                border: '1px solid #e5e7eb',
                                fontSize: '16px',
                                outline: 'none',
                                resize: 'none',
                                height: '60px',
                                fontFamily: 'inherit',
                                background: '#f9fafb'
                            }}
                        />
                        <button
                            onClick={() => handleSendMessage(input)}
                            disabled={!input.trim()}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: input.trim() ? '#111' : '#e5e7eb',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: input.trim() ? 'pointer' : 'default',
                                transition: 'background 0.2s'
                            }}
                        >
                            <Send size={18} />
                        </button>
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '12px', color: '#9ca3af' }}>
                        Анна может ошибаться. Проверяйте важную информацию.
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default WideChatModal;
