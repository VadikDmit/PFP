import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, ChevronRight } from 'lucide-react';
import avatarImage from '../assets/avatar_full.png';
import { aiApi } from '../api/aiApi';
import Markdown from 'react-markdown';
import type { CJMData } from './CJMFlow';
import { GOAL_GALLERY_ITEMS } from '../utils/GoalImages';

type OnboardingStep = 'name' | 'gender' | 'age' | 'goal_selection' | 'goal_parameters' | 'chat';

interface EditingGoal {
    typeId: number;
    title: string;
    targetAmount: number;
    termMonths: number;
    initialCapital: number;
    monthlyReplenishment: number;
    desiredMonthlyIncome: number;
}


interface Message {
    id: string;
    text: string;
    sender: 'victoria' | 'user';
    isStreaming?: boolean;
}

interface VictoriaOnboardingProps {
    data: CJMData;
    setData: React.Dispatch<React.SetStateAction<CJMData>>;
    onComplete: () => void;
}

const VictoriaOnboarding: React.FC<VictoriaOnboardingProps> = ({ data, setData, onComplete }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('gender');
    const [aiStage, setAiStage] = useState('anketa1');
    const [editingGoal, setEditingGoal] = useState<EditingGoal | null>(null);

    const formatCurrency = (val: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val).replace('₽', 'р.');



    const scrollRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);

    useEffect(() => {
        if (hasInitialized.current) return;
        hasInitialized.current = true;

        const initChat = async () => {
            try {
                const history = await aiApi.getHistory('anketa1');
                if (history && history.length > 0) {
                    const formatted: Message[] = history.map((m: any) => ({
                        id: Math.random().toString(),
                        text: m.content,
                        sender: m.role === 'assistant' ? 'victoria' : 'user'
                    }));
                    setMessages(formatted);
                    setCurrentStep('chat');
                } else {
                    // Start the anketa1 stream by sending "start"
                    setIsTyping(true);
                    const aiMsgId = 'init_stream_' + Math.random().toString();
                    setMessages([{ id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);

                    try {
                        await aiApi.sendStreamingMessage(
                            'anketa1',
                            'start',
                            (chunk) => {
                                setMessages([{ id: aiMsgId, text: chunk, sender: 'victoria', isStreaming: true }]);
                            },
                            (fullText) => {
                                setMessages([{ id: aiMsgId, text: fullText, sender: 'victoria', isStreaming: false }]);
                                setIsTyping(false);
                                // The AI asks for gender on 'start', so we stay in 'gender' step
                            }
                        );
                    } catch (streamErr) {
                        console.error('Failed to start stream', streamErr);
                        setMessages([{ id: aiMsgId, text: 'Ошибка старта. Попробуйте обновить страницу.', sender: 'victoria', isStreaming: false }]);
                        setIsTyping(false);
                    }
                }
            } catch (err) {
                console.error('Failed to load anketa history', err);
                setMessages([{
                    id: 'init_error',
                    text: 'Привет! Я Виктория. Произошла ошибка загрузки истории, но мы можем попытаться продолжить. Напишите что-нибудь.',
                    sender: 'victoria'
                }]);
                setCurrentStep('chat');
            }
        };
        initChat();
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSendMessage = async (textOverride?: string, stageOverride?: string) => {
        const text = textOverride || inputValue;
        if (!text.trim() || isTyping) return;

        const userMsg: Message = { id: Math.random().toString(), text, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        const aiMsgId = Math.random().toString();
        setMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);

        try {
            await aiApi.sendStreamingMessage(
                stageOverride || aiStage,
                text,
                (chunk) => {
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: chunk } : m));
                },
                (fullText) => {
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, isStreaming: false } : m));
                    setIsTyping(false);
                }
            );
        } catch (error) {
            console.error(error);
            setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: 'Извините, произошла ошибка связи с ИИ.', isStreaming: false } : m));
            setIsTyping(false);
        }
    };

    const handleGenderSelect = async (gender: 'male' | 'female') => {
        setData(prev => ({ ...prev, gender }));

        // Show AI typing and switch step to age immediately to feel responsive
        setIsTyping(true);
        setCurrentStep('age');

        await handleSendMessage(gender === 'male' ? 'Мужской' : 'Женский');
    };

    const handleAgeSubmit = async () => {
        setIsTyping(true);
        // Transition to goal selection step
        setCurrentStep('goal_selection');
        // Switch AI stage to anketaTarget for the next interactions
        setAiStage('anketaTarget');

        await handleSendMessage(`${data.age} лет`, 'anketaTarget');
    };

    const handleGoalSelect = async (goal: typeof GOAL_GALLERY_ITEMS[0]) => {
        setIsTyping(true);

        // Initialize editing state with defaults
        const defaults: EditingGoal = {
            typeId: goal.typeId,
            title: goal.title,
            targetAmount: (goal.typeId === 1 || goal.typeId === 2) ? 0 : 3000000,
            termMonths: (goal.typeId === 1) ? 0 : 60,
            initialCapital: (goal.typeId === 8) ? 10000000 : (goal.typeId === 3) ? 500000 : (goal.typeId === 7) ? 100000 : 0,
            monthlyReplenishment: (goal.typeId === 7) ? 5000 : (goal.typeId === 3) ? 20000 : 0,
            desiredMonthlyIncome: (goal.typeId === 1 || goal.typeId === 2) ? 100000 : 0
        };
        setEditingGoal(defaults);

        // Switch to parameter input step
        setCurrentStep('goal_parameters');

        // Send to AI with explicit stage
        await handleSendMessage(`Моя цель: ${goal.title}`, 'anketaTarget');
    };

    const handleParametersSubmit = async () => {
        if (!editingGoal) return;
        setIsTyping(true);

        const newGoal = {
            goal_type_id: editingGoal.typeId,
            name: editingGoal.title,
            initial_capital: editingGoal.initialCapital,
            monthly_replenishment: editingGoal.monthlyReplenishment,
            target_amount: editingGoal.targetAmount,
            term_months: editingGoal.termMonths,
            desired_monthly_income: editingGoal.desiredMonthlyIncome,
            inflation_rate: 5.6
        };
        setData(prev => ({ ...prev, goals: [...(prev.goals || []), newGoal] }));

        // Format message for AI
        let msg = `Параметры цели: `;
        if (editingGoal.typeId === 1 || editingGoal.typeId === 2) msg += `доход ${formatCurrency(editingGoal.desiredMonthlyIncome)}`;
        else if (editingGoal.typeId === 8) msg += `капитал ${formatCurrency(editingGoal.initialCapital)}`;
        else if (editingGoal.typeId === 3 || editingGoal.typeId === 7) msg += `капитал ${formatCurrency(editingGoal.initialCapital)}, пополнение ${formatCurrency(editingGoal.monthlyReplenishment)}`;
        else msg += `стоимость ${formatCurrency(editingGoal.targetAmount)}`;

        if (editingGoal.termMonths > 0) msg += `, срок ${Math.floor(editingGoal.termMonths / 12)} лет`;

        await handleSendMessage(msg, 'anketaTarget');

        // Reset and back to selection
        setEditingGoal(null);
        setCurrentStep('goal_selection');
    };

    return (
        <div className="onboarding-chat-container">
            <style>{`
                .onboarding-chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-width: 900px;
                    margin: 0 auto;
                    background: #fff;
                    box-shadow: 0 0 40px rgba(0,0,0,0.05);
                    position: relative;
                }

                @media (max-width: 1024px) {
                    .onboarding-chat-container {
                        max-width: 100%;
                        height: 100dvh;
                    }
                }

                .chat-header {
                    padding: 16px 24px;
                    border-bottom: 1px solid #f1f5f9;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255,255,255,0.8);
                    backdrop-filter: blur(10px);
                    position: sticky;
                    top: 0;
                    z-index: 10;
                }

                .chat-messages {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px;
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    background: #f8fafc;
                    scrollbar-width: none;
                }

                .message-bubble {
                    max-width: 85%;
                    padding: 16px 20px;
                    border-radius: 20px;
                    font-size: 16px;
                    line-height: 1.5;
                    position: relative;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.02);
                }

                .message-victoria {
                    align-self: flex-start;
                    background: #fff;
                    color: #334155;
                    border: 1px solid #e2e8f0;
                    border-bottom-left-radius: 4px;
                }

                .message-user {
                    align-self: flex-end;
                    background: var(--primary);
                    color: #000;
                    font-weight: 600;
                    border-bottom-right-radius: 4px;
                }

                .chat-input-area {
                    padding: 24px;
                    background: #fff;
                    border-top: 1px solid #f1f5f9;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                .deepseek-input-box {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 24px;
                    padding: 8px 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    transition: all 0.2s;
                }

                .deepseek-input-box:focus-within {
                    border-color: var(--primary);
                    background: #fff;
                    box-shadow: 0 4px 25px rgba(255, 199, 80, 0.15);
                }

                .deepseek-input {
                    flex: 1;
                    border: none;
                    background: transparent;
                    padding: 12px 0;
                    font-size: 16px;
                    outline: none;
                }

                .send-button {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    background: var(--primary);
                    border: none;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: transform 0.2s;
                }

                .send-button:hover {
                    transform: scale(1.05);
                }
                
                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                .typing-indicator {
                    display: flex;
                    gap: 4px;
                    padding: 8px 0;
                }
                
                .exit-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 8px;
                    border-radius: 12px;
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .exit-btn:hover {
                    background: #fee2e2;
                    color: #ef4444;
                }
                .exit-btn:active { transform: translateY(0); }
                
                .btn-primary {
                    background: linear-gradient(135deg, #FFD93D 0%, #FFC750 100%);
                    color: #000;
                    font-weight: 800;
                    border: none;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 4px 15px rgba(255, 199, 80, 0.3);
                }
                .btn-primary:hover:not(:disabled) {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(255, 199, 80, 0.4);
                }
                .btn-primary:active { transform: translateY(0); }
                .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
                
                .btn-secondary {
                    background: #fff;
                    border: 2px solid #f1f5f9;
                    color: #1e293b;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .btn-secondary:hover:not(:disabled) {
                    border-color: var(--primary);
                    background: #fffef0;
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.03);
                }
                .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }

                input[type="range"] {
                    -webkit-appearance: none;
                    width: 100%;
                    height: 8px;
                    border-radius: 5px;
                    background: #e2e8f0;
                    outline: none;
                    margin: 20px 0;
                }
                input[type="range"]::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: var(--primary);
                    cursor: pointer;
                    border: 4px solid #fff;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                    transition: transform 0.2s;
                }
                .goal-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                    padding: 10px;
                    max-height: 300px;
                    overflow-y: auto;
                }
                .goal-card {
                    background: #fff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    padding: 12px;
                    cursor: pointer;
                    transition: all 0.2s;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 8px;
                }
                .goal-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .goal-card img {
                    width: 60px;
                    height: 60px;
                    border-radius: 12px;
                    object-fit: cover;
                }
                .goal-card span {
                    font-size: 13px;
                    font-weight: 700;
                    color: #1e293b;
                    line-height: 1.2;
                }
            `}</style>

            <div className="chat-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '16px', overflow: 'hidden', border: '2px solid var(--primary)' }}>
                        <img src={avatarImage} alt="Victoria" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div>
                        <div style={{ fontWeight: '900', fontSize: '18px', color: '#1e293b' }}>Виктория</div>
                        <div style={{ fontSize: '13px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} />
                            Ассистент Анны Деньгиной
                        </div>
                    </div>
                </div>

                <button className="exit-btn" onClick={onComplete} title="Выйти">
                    <LogOut size={20} />
                </button>
            </div>

            <div className="chat-messages" ref={scrollRef}>
                <AnimatePresence>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
                        >
                            <div className={`message-bubble ${m.sender === 'victoria' ? 'message-victoria' : 'message-user'}`}>
                                <Markdown>{m.text}</Markdown>
                            </div>
                        </motion.div>
                    ))}
                    {isTyping && !messages[messages.length - 1]?.isStreaming && (
                        <div className="message-bubble message-victoria" style={{ width: 'fit-content' }}>
                            <div className="typing-indicator">
                                {[0, 1, 2].map(i => (
                                    <motion.div
                                        key={i}
                                        animate={{ y: [0, -6, 0] }}
                                        transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                        style={{ width: '6px', height: '6px', background: '#94a3b8', borderRadius: '50%' }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </AnimatePresence>
            </div>

            <div className="chat-input-area">
                <AnimatePresence mode="wait">
                    {currentStep === 'gender' && !isTyping && (
                        <motion.div
                            key="gender"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                delay: 0.2
                            }}
                            style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}
                        >
                            <button onClick={() => handleGenderSelect('male')} className="btn-secondary" style={{ padding: '32px', borderRadius: '24px', fontSize: '20px' }}>
                                <span style={{ fontSize: '40px' }}>👨</span>
                                Мужской
                            </button>
                            <button onClick={() => handleGenderSelect('female')} className="btn-secondary" style={{ padding: '32px', borderRadius: '24px', fontSize: '20px' }}>
                                <span style={{ fontSize: '40px' }}>👩</span>
                                Женский
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 'age' && !isTyping && (
                        <motion.div
                            key="age"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 25,
                                delay: 0.2
                            }}
                            style={{ padding: '10px 20px 20px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                                <span style={{ fontWeight: '800', color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ваш возраст</span>
                                <span style={{ fontWeight: '900', color: '#1e293b', fontSize: '36px', lineHeight: 1 }}>{data.age} <span style={{ fontSize: '18px', color: '#94a3b8' }}>лет</span></span>
                            </div>
                            <input
                                type="range"
                                min="18"
                                max="80"
                                value={data.age}
                                onChange={e => setData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                            />
                            <button onClick={handleAgeSubmit} className="btn-primary" style={{ padding: '20px', width: '100%', borderRadius: '20px', fontSize: '18px', marginTop: '10px' }}>
                                Далее <ChevronRight size={22} style={{ marginLeft: '8px' }} />
                            </button>
                        </motion.div>
                    )}

                    {currentStep === 'goal_selection' && !isTyping && (
                        <motion.div
                            key="goal_selection"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            style={{ padding: '10px' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingLeft: '10px' }}>
                                <div style={{ fontWeight: '800', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>Выберите основную цель {data.goals?.length ? `(${data.goals.length})` : ''}</div>
                                {data.goals && data.goals.length > 0 && (
                                    <button
                                        onClick={() => onComplete()}
                                        className="btn-primary"
                                        style={{ padding: '8px 16px', borderRadius: '12px', fontSize: '13px' }}
                                    >
                                        Далее <ChevronRight size={16} />
                                    </button>
                                )}
                            </div>
                            <div className="goal-grid">
                                {GOAL_GALLERY_ITEMS.map(goal => (
                                    <div key={goal.id} className="goal-card" onClick={() => handleGoalSelect(goal)}>
                                        <img src={goal.image} alt={goal.title} />
                                        <span>{goal.title}</span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'goal_parameters' && editingGoal && !isTyping && (
                        <motion.div
                            key="goal_parameters"
                            initial={{ opacity: 0, y: 30, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.2 }}
                            style={{ padding: '10px 20px 20px' }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                <img
                                    src={GOAL_GALLERY_ITEMS.find(i => i.typeId === editingGoal.typeId)?.image}
                                    alt=""
                                    style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }}
                                />
                                <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{editingGoal.title}</div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                {/* 1. Target Amount / Desired Income / Capital */}
                                {(editingGoal.typeId === 1 || editingGoal.typeId === 2) ? (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Желаемый доход</span>
                                            <span style={{ fontWeight: '800', color: '#1e293b' }}>{formatCurrency(editingGoal.desiredMonthlyIncome)}</span>
                                        </div>
                                        <input
                                            type="range" min="10000" max="1000000" step="5000"
                                            value={editingGoal.desiredMonthlyIncome}
                                            onChange={e => setEditingGoal({ ...editingGoal, desiredMonthlyIncome: parseInt(e.target.value) })}
                                        />
                                    </div>
                                ) : editingGoal.typeId === 8 ? (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Капитал</span>
                                            <span style={{ fontWeight: '800', color: '#1e293b' }}>{formatCurrency(editingGoal.initialCapital)}</span>
                                        </div>
                                        <input
                                            type="range" min="1000000" max="100000000" step="500000"
                                            value={editingGoal.initialCapital}
                                            onChange={e => setEditingGoal({ ...editingGoal, initialCapital: parseInt(e.target.value) })}
                                        />
                                    </div>
                                ) : (editingGoal.typeId === 3 || editingGoal.typeId === 7) ? (
                                    <>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Начальный капитал</span>
                                                <span style={{ fontWeight: '800', color: '#1e293b' }}>{formatCurrency(editingGoal.initialCapital)}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="10000000" step="100000"
                                                value={editingGoal.initialCapital}
                                                onChange={e => setEditingGoal({ ...editingGoal, initialCapital: parseInt(e.target.value) })}
                                            />
                                        </div>
                                        <div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                                <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Ежемесячное пополнение</span>
                                                <span style={{ fontWeight: '800', color: '#1e293b' }}>{formatCurrency(editingGoal.monthlyReplenishment)}</span>
                                            </div>
                                            <input
                                                type="range" min="0" max="500000" step="5000"
                                                value={editingGoal.monthlyReplenishment}
                                                onChange={e => setEditingGoal({ ...editingGoal, monthlyReplenishment: parseInt(e.target.value) })}
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Стоимость цели</span>
                                            <span style={{ fontWeight: '800', color: '#1e293b' }}>{formatCurrency(editingGoal.targetAmount)}</span>
                                        </div>
                                        <input
                                            type="range" min="100000" max="50000000" step="100000"
                                            value={editingGoal.targetAmount}
                                            onChange={e => setEditingGoal({ ...editingGoal, targetAmount: parseInt(e.target.value) })}
                                        />
                                    </div>
                                )}

                                {/* 2. Term (if applicable) */}
                                {editingGoal.typeId !== 1 && editingGoal.typeId !== 7 && editingGoal.typeId !== 8 && (
                                    <div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#64748b', fontSize: '13px', fontWeight: '700' }}>Срок (лет)</span>
                                            <span style={{ fontWeight: '800', color: '#1e293b' }}>{Math.floor(editingGoal.termMonths / 12)} лет</span>
                                        </div>
                                        <input
                                            type="range" min="1" max="50" step="1"
                                            value={editingGoal.termMonths / 12}
                                            onChange={e => setEditingGoal({ ...editingGoal, termMonths: parseInt(e.target.value) * 12 })}
                                        />
                                    </div>
                                )}

                                <button onClick={handleParametersSubmit} className="btn-primary" style={{ padding: '20px', width: '100%', borderRadius: '20px', fontSize: '18px', marginTop: '10px' }}>
                                    Далее <ChevronRight size={22} style={{ marginLeft: '8px' }} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'chat' && !isTyping && (
                        <motion.div
                            key="chat"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="deepseek-input-box"
                        >
                            <input
                                className="deepseek-input"
                                placeholder="Напишите Виктории..."
                                value={inputValue}
                                onChange={e => setInputValue(e.target.value)}
                                onKeyDown={e => {
                                    if (e.key === 'Enter') handleSendMessage();
                                }}
                            />
                            <button className="send-button" onClick={() => handleSendMessage()} disabled={!inputValue.trim()}>
                                <Send size={20} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default VictoriaOnboarding;
