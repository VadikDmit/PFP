import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, LogOut, ChevronRight } from 'lucide-react';
import avatarImage from '../assets/avatar_full.png';
import { aiApi } from '../api/aiApi';
import Markdown from 'react-markdown';
import type { CJMData } from './CJMFlow';
import { GOAL_GALLERY_ITEMS } from '../utils/GoalImages';
import StepRiskProfile from './steps/StepRiskProfile';

type OnboardingStep =
    | 'name'
    | 'gender'
    | 'age'
    | 'goal_selection'
    | 'goal_parameters'
    | 'assets'
    | 'fin_reserve'
    | 'life_insurance'
    | 'income'
    | 'risk_profile'
    | 'chat';

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
    onExit: () => void;
    onFinish: () => void;
}

const VictoriaOnboarding: React.FC<VictoriaOnboardingProps> = ({ data, setData, onExit, onFinish }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('gender');
    const [aiStage, setAiStage] = useState('anketa1');
    const [editingGoal, setEditingGoal] = useState<EditingGoal | null>(null);
    const [initialCapitalInput, setInitialCapitalInput] = useState<number>(data.initialCapital || 0);
    const [finInitial, setFinInitial] = useState<number>(data.initialCapital || 0);
    const [finMonthly, setFinMonthly] = useState<number>(data.monthlyReplenishment || 0);
    const [lifeLimit, setLifeLimit] = useState<number>(data.lifeInsuranceLimit ?? 0);

    const formatCurrency = (val: number) => new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val).replace('₽', 'р.');
    const formatNumber = (val: number) => new Intl.NumberFormat('ru-RU').format(val);



    const scrollRef = useRef<HTMLDivElement>(null);
    const hasInitialized = useRef(false);
    const messagesRef = useRef<Message[]>([]);
    useEffect(() => { messagesRef.current = messages; }, [messages]);

    const buildHistory = (msgs: Message[]): Array<{ role: 'user' | 'assistant'; content: string }> =>
        msgs.map(m => ({ role: m.sender === 'victoria' ? 'assistant' : 'user', content: m.text }));

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

                    // Восстанавливаем шаг по последнему сообщению ассистента, чтобы показать нужный интерфейс
                    const lastAssistant = [...history].reverse().find((m: any) => m.role === 'assistant');
                    const lastContent = (lastAssistant?.content || '').toLowerCase();
                    let step: OnboardingStep = 'chat';
                    if (/возраст|сколько вам лет|укажите.*возраст|полных лет/i.test(lastContent)) step = 'age';
                    else if (/пол\s*[?]?$|какой ваш пол|мужской|женский/i.test(lastContent)) step = 'gender';
                    else if (/цел|выберите цель|какая.*цел|целей вам ближе/i.test(lastContent)) step = 'goal_selection';
                    else if (/капитал|текущий капитал|сбережения|ликвидн/i.test(lastContent)) step = 'assets';
                    else if (/финансовый резерв|финрезерв|резерв/i.test(lastContent)) step = 'fin_reserve';
                    else if (/защит.*жизн|страхов|нсж|лимит/i.test(lastContent)) step = 'life_insurance';
                    else if (/доход|среднемесячн|ежемесячный доход|ндфл/i.test(lastContent)) step = 'income';
                    else if (/риск-профил|риск профил|анкет.*риск/i.test(lastContent)) step = 'risk_profile';
                    setCurrentStep(step);
                    if (step === 'age') setAiStage('anketa1');
                    if (step === 'goal_selection' || step === 'goal_parameters') setAiStage('anketaTarget');
                    if (step === 'assets') setAiStage('initialCapital');
                    if (step === 'fin_reserve') setAiStage('finReserve');
                    if (step === 'life_insurance') setAiStage('LifeInsurance');
                    if (step === 'income') setAiStage('income');
                    if (step === 'risk_profile') setAiStage('riskProfile');
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

        // Собираем историю для ИИ, чтобы не здоровался заново
        const history = [
            ...messages.map(m => ({
                role: (m.sender === 'victoria' ? 'assistant' : 'user') as 'user' | 'assistant',
                content: m.text
            })),
            { role: 'user' as const, content: text }
        ];

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
                },
                history
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

        // Даём пользователю прочитать ответ ИИ, потом показываем список целей — без резкого прыжка
        await new Promise(r => setTimeout(r, 1500));
        setEditingGoal(null);
        setCurrentStep('goal_selection');
    };

    const handleStartAssetsStep = async () => {
        setCurrentStep('assets');
        setAiStage('initialCapital');
        setIsTyping(true);

        const aiMsgId = 'initial_capital_' + Math.random().toString();
        setMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);

        try {
            await aiApi.sendStreamingMessage(
                'initialCapital',
                'start',
                (chunk) => {
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: chunk, isStreaming: true } : m));
                },
                (fullText) => {
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, isStreaming: false } : m));
                    setIsTyping(false);
                },
                buildHistory(messagesRef.current)
            );
        } catch (err) {
            console.error('Failed to start initialCapital dialogue', err);
            setMessages(prev => prev.map(m => m.id === aiMsgId ? {
                ...m,
                text: 'Отлично, с целями понятно. А какой у вас сейчас текущий капитал уже есть?',
                isStreaming: false
            } : m));
            setIsTyping(false);
        }
    };

    const handleInitialCapitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        const numValue = Number(rawValue);
        setInitialCapitalInput(numValue);

        // Сохраняем сразу и в общие данные
        const newAsset = {
            type: 'CASH' as const,
            name: 'Наличные',
            current_value: numValue,
            currency: 'RUB'
        };

        setData(prev => ({
            ...prev,
            initialCapital: numValue,
            assets: [newAsset]
        }));
    };

    const handleInitialCapitalSubmit = async () => {
        if (isTyping) return;

        const capital = initialCapitalInput || 0;

        const newAsset = {
            type: 'CASH' as const,
            name: 'Наличные',
            current_value: capital,
            currency: 'RUB'
        };
        setData(prev => ({
            ...prev,
            initialCapital: capital,
            assets: [newAsset]
        }));
        setMessages(prev => [...prev, {
            id: Math.random().toString(),
            text: `Мой текущий капитал: ${formatCurrency(capital)}`,
            sender: 'user'
        }]);

        // По умолчанию: 10% капитала в стартовый взнос, 1% в месяц на пополнение
        const startDefault = Math.round(((capital || 0) * 0.1) / 10000) * 10000;
        const monthlyDefault = Math.round(((capital || 0) * 0.01) / 5000) * 5000;
        setFinInitial(startDefault);
        setFinMonthly(monthlyDefault);
        setCurrentStep('fin_reserve');
        setAiStage('finReserve');

        setIsTyping(true);
        const aiMsgId = 'fin_reserve_' + Math.random().toString();
        setMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);

        try {
            await aiApi.sendStreamingMessage(
                'finReserve',
                'start',
                chunk => {
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: chunk, isStreaming: true } : m));
                },
                fullText => {
                    setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, isStreaming: false } : m));
                    setIsTyping(false);
                },
                buildHistory(messagesRef.current)
            );
        } catch (err) {
            console.error('Failed to start finReserve dialogue', err);
            setMessages(prev => prev.map(m => m.id === aiMsgId ? {
                ...m,
                text: 'Часть капитала важно направить в финансовый резерв. Давайте определим его размер.',
                isStreaming: false
            } : m));
            setIsTyping(false);
        }
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

                .goal-selection-bubble {
                    max-width: 100%;
                }

                .goal-params-bubble {
                    width: 85%;
                    max-width: 85%;
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
                    grid-template-columns: repeat(3, minmax(0, 1fr));
                    gap: 8px;
                    padding: 4px;
                }
                .goal-card {
                    position: relative;
                    background: transparent;
                    border: 1px solid #e2e8f0;
                    border-radius: 12px;
                    padding: 0;
                    cursor: pointer;
                    transition: all 0.2s;
                    overflow: hidden;
                }
                .goal-card:hover {
                    border-color: var(--primary);
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                .goal-card img {
                    width: 100%;
                    height: 90px;
                    object-fit: cover;
                    display: block;
                }
                .goal-card span {
                    position: absolute;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    padding: 6px 8px;
                    font-size: 11px;
                    font-weight: 700;
                    color: #f9fafb;
                    line-height: 1.3;
                    background: linear-gradient(to top, rgba(15,23,42,0.85), rgba(15,23,42,0.0));
                    word-wrap: break-word;
                    white-space: normal;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                @media (max-width: 768px) {
                    .goal-grid {
                        grid-template-columns: repeat(2, minmax(0, 1fr));
                    }
                }

                @media (min-width: 1200px) {
                    .goal-grid {
                        grid-template-columns: repeat(4, minmax(0, 1fr));
                    }
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

                <button className="exit-btn" onClick={onExit} title="Выйти">
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

                    {currentStep === 'gender' && !isTyping && (
                        <motion.div
                            key="gender-options"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-params-bubble">
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <button
                                        onClick={() => handleGenderSelect('male')}
                                        className="btn-secondary"
                                        style={{ padding: '24px', borderRadius: '24px', fontSize: '18px' }}
                                    >
                                        <span style={{ fontSize: '32px' }}>👨</span>
                                        Мужской
                                    </button>
                                    <button
                                        onClick={() => handleGenderSelect('female')}
                                        className="btn-secondary"
                                        style={{ padding: '24px', borderRadius: '24px', fontSize: '18px' }}
                                    >
                                        <span style={{ fontSize: '32px' }}>👩</span>
                                        Женский
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'age' && !isTyping && (
                        <motion.div
                            key="age-bubble"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-params-bubble">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '8px' }}>
                                    <span style={{ fontWeight: 800, color: '#64748b', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px' }}>Ваш возраст</span>
                                    <span style={{ fontWeight: 900, color: '#1e293b', fontSize: '32px', lineHeight: 1 }}>
                                        {data.age} <span style={{ fontSize: '18px', color: '#94a3b8' }}>лет</span>
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min={18}
                                    max={80}
                                    value={data.age}
                                    onChange={e => setData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                                />
                                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
                                    <button
                                        onClick={handleAgeSubmit}
                                        className="btn-primary"
                                        style={{ padding: '8px 18px', borderRadius: '999px', fontSize: '13px', boxShadow: '0 3px 10px rgba(255,199,80,0.25)' }}
                                    >
                                        Далее <ChevronRight size={18} style={{ marginLeft: '6px' }} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'goal_selection' && !isTyping && (
                        <motion.div
                            key="goal-selection-bubble"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-selection-bubble">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                                    <div style={{ fontWeight: '800', color: '#64748b', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        Выберите основную цель {data.goals?.length ? `(${data.goals.length})` : ''}
                                    </div>
                                </div>
                                <div className="goal-grid">
                                    {GOAL_GALLERY_ITEMS.map(goal => (
                                        <div key={goal.id} className="goal-card" onClick={() => handleGoalSelect(goal)}>
                                            <img src={goal.image} alt={goal.title} />
                                            <span>{goal.title}</span>
                                        </div>
                                    ))}
                                </div>
                                {data.goals && data.goals.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                                        <button
                                            onClick={handleStartAssetsStep}
                                            className="btn-primary"
                                            style={{ padding: '8px 16px', borderRadius: '999px', fontSize: '13px' }}
                                        >
                                            Далее <ChevronRight size={16} style={{ marginLeft: '6px' }} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'assets' && !isTyping && (
                        <motion.div
                            key="assets-bubble"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-params-bubble">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <img
                                        src={GOAL_GALLERY_ITEMS.find(i => i.typeId === 3)?.image}
                                        alt=""
                                        style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }}
                                    />
                                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>Первоначальный капитал</div>
                                </div>

                                <div style={{ padding: '8px 0 0' }}>
                                    <div style={{ marginBottom: '12px', fontSize: '14px', color: '#64748b' }}>
                                        Введите, пожалуйста, сумму вашего текущего капитала (сбережения, вклады, инвестиции и другие ликвидные активы).
                                    </div>
                                    <input
                                        type="text"
                                        value={initialCapitalInput ? formatNumber(initialCapitalInput) : ''}
                                        onChange={handleInitialCapitalChange}
                                        placeholder="0"
                                        style={{
                                            width: '100%',
                                            padding: '20px',
                                            background: 'rgba(248,250,252,0.9)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '18px',
                                            color: 'var(--primary)',
                                            fontSize: '28px',
                                            fontWeight: 700,
                                            outline: 'none',
                                            textAlign: 'center',
                                            boxShadow: '0 4px 12px rgba(148,163,184,0.12)'
                                        }}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                        <button
                                            onClick={handleInitialCapitalSubmit}
                                            className="btn-primary"
                                            style={{ padding: '10px 22px', borderRadius: '999px', fontSize: '14px' }}
                                        >
                                            Далее <ChevronRight size={18} style={{ marginLeft: '6px' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'fin_reserve' && !isTyping && (
                        <motion.div
                            key="fin-reserve-bubble"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-params-bubble">
                                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                                    Финансовый резерв
                                </div>
                                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>
                                    Уточним, какую часть капитала вы готовы выделить сейчас в финрезерв и сколько комфортно докладывать ежемесячно.
                                </div>

                                <div style={{ marginBottom: '18px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Первоначальный капитал в резерве</span>
                                        <span style={{ fontWeight: 800, color: '#1e293b' }}>{formatCurrency(finInitial)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={Math.max(initialCapitalInput || 1000000, finInitial || 0)}
                                        step={10000}
                                        value={finInitial}
                                        onChange={e => setFinInitial(parseInt(e.target.value))}
                                    />
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
                                        <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Ежемесячное пополнение</span>
                                        <span style={{ fontWeight: 800, color: '#1e293b' }}>{formatCurrency(finMonthly)}</span>
                                    </div>
                                    <input
                                        type="range"
                                        min={0}
                                        max={200000}
                                        step={5000}
                                        value={finMonthly}
                                        onChange={e => setFinMonthly(parseInt(e.target.value))}
                                    />
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
                                    <button
                                        onClick={async () => {
                                            setData(prev => ({
                                                ...prev,
                                                initialCapital: finInitial,
                                                monthlyReplenishment: finMonthly
                                            }));
                                            // Только показываем ввод в чате, в ИИ не шлём — без лишнего запроса и двух сообщений
                                            setMessages(prev => [...prev, {
                                                id: Math.random().toString(),
                                                text: `На финансовый резерв: стартовая сумма ${formatCurrency(finInitial)}, ежемесячное пополнение ${formatCurrency(finMonthly)}.`,
                                                sender: 'user'
                                            }]);

                                            setCurrentStep('life_insurance');
                                            setAiStage('LifeInsurance');
                                            setIsTyping(true);
                                            const aiMsgId = 'life_insurance_' + Math.random().toString();
                                            setMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);
                                            try {
                                                await aiApi.sendStreamingMessage(
                                                    'LifeInsurance',
                                                    'start',
                                                    chunk => {
                                                        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: chunk, isStreaming: true } : m));
                                                    },
                                                    fullText => {
                                                        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, isStreaming: false } : m));
                                                        setIsTyping(false);
                                                    },
                                                    buildHistory(messagesRef.current)
                                                );
                                            } catch (err) {
                                                console.error('Failed to start LifeInsurance dialogue', err);
                                                setMessages(prev => prev.map(m => m.id === aiMsgId ? {
                                                    ...m,
                                                    text: 'Теперь обсудим защиту жизни: какой страховой капитал вам будет комфортен?',
                                                    isStreaming: false
                                                } : m));
                                                setIsTyping(false);
                                            }
                                        }}
                                        className="btn-primary"
                                        style={{ padding: '10px 22px', borderRadius: '999px', fontSize: '14px' }}
                                    >
                                        Далее <ChevronRight size={18} style={{ marginLeft: '6px' }} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'goal_parameters' && editingGoal && !isTyping && (
                        <motion.div
                            key="goal-parameters-bubble"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-params-bubble">
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px' }}>
                                    <img
                                        src={GOAL_GALLERY_ITEMS.find(i => i.typeId === editingGoal.typeId)?.image}
                                        alt=""
                                        style={{ width: '50px', height: '50px', borderRadius: '12px', objectFit: 'cover' }}
                                    />
                                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#1e293b' }}>{editingGoal.title}</div>
                                </div>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                        <button
                                            onClick={handleParametersSubmit}
                                            className="btn-primary"
                                            style={{ padding: '10px 22px', borderRadius: '999px', fontSize: '14px' }}
                                        >
                                            Далее <ChevronRight size={18} style={{ marginLeft: '6px' }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'life_insurance' && !isTyping && (
                        <motion.div
                            key="life-insurance-bubble"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-params-bubble">
                                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                                    Защита жизни
                                </div>
                                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>
                                    Выберите лимит страхового покрытия, который будет комфортным для вашей семьи.
                                </div>

                                <div style={{ marginBottom: '8px' }}>
                                    <input
                                        type="range"
                                        min={0}
                                        max={10000000}
                                        step={500000}
                                        value={lifeLimit}
                                        onChange={e => setLifeLimit(parseInt(e.target.value))}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
                                        <span>0 ₽</span>
                                        <span>5 млн ₽</span>
                                        <span>10 млн ₽</span>
                                    </div>
                                </div>
                                <div style={{
                                    background: 'var(--card-bg)',
                                    borderRadius: '12px',
                                    border: '1px solid #e2e8f0',
                                    padding: '10px 14px',
                                    textAlign: 'right',
                                    fontSize: '18px',
                                    fontWeight: 700,
                                    color: '#1e293b',
                                    marginBottom: '10px'
                                }}>
                                    {formatCurrency(lifeLimit)}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                    <button
                                        onClick={async () => {
                                            setData(prev => ({
                                                ...prev,
                                                lifeInsuranceLimit: lifeLimit
                                            }));
                                            setMessages(prev => [...prev, {
                                                id: Math.random().toString(),
                                                text: `Лимит страхования жизни: ${formatCurrency(lifeLimit)}.`,
                                                sender: 'user'
                                            }]);

                                            setCurrentStep('income');
                                            setAiStage('income');
                                            setIsTyping(true);
                                            const aiMsgId = 'income_' + Math.random().toString();
                                            setMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);
                                            try {
                                                await aiApi.sendStreamingMessage(
                                                    'income',
                                                    'start',
                                                    chunk => {
                                                        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: chunk, isStreaming: true } : m));
                                                    },
                                                    fullText => {
                                                        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, isStreaming: false } : m));
                                                        setIsTyping(false);
                                                    },
                                                    buildHistory(messagesRef.current)
                                                );
                                            } catch (err) {
                                                console.error('Failed to start income dialogue', err);
                                                setMessages(prev => prev.map(m => m.id === aiMsgId ? {
                                                    ...m,
                                                    text: 'И последний штрих — ваш среднемесячный доход до вычета НДФЛ.',
                                                    isStreaming: false
                                                } : m));
                                                setIsTyping(false);
                                            }
                                        }}
                                        className="btn-primary"
                                        style={{ padding: '10px 22px', borderRadius: '999px', fontSize: '14px' }}
                                    >
                                        Далее <ChevronRight size={18} style={{ marginLeft: '6px' }} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'income' && !isTyping && (
                        <motion.div
                            key="income-bubble"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-params-bubble">
                                <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#1e293b' }}>
                                    Ваш доход
                                </div>
                                <div style={{ marginBottom: '16px', fontSize: '14px', color: '#64748b' }}>
                                    Укажите ваш среднемесячный доход до вычета НДФЛ — это поможет точнее подобрать решения.
                                </div>

                                <div style={{ marginBottom: '12px' }}>
                                    <input
                                        type="range"
                                        min={30000}
                                        max={1000000}
                                        step={5000}
                                        value={data.avgMonthlyIncome}
                                        onChange={e => setData(prev => ({ ...prev, avgMonthlyIncome: parseInt(e.target.value) }))}
                                    />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', color: '#94a3b8' }}>
                                        <span>30 000 ₽</span>
                                        <span>1 000 000 ₽</span>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                                    {formatCurrency(data.avgMonthlyIncome).replace('р.', '₽')}
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                                    <button
                                        onClick={async () => {
                                            setMessages(prev => [...prev, {
                                                id: Math.random().toString(),
                                                text: `Мой среднемесячный доход: ${formatCurrency(data.avgMonthlyIncome)}.`,
                                                sender: 'user'
                                            }]);

                                            setCurrentStep('risk_profile');
                                            setAiStage('riskProfile');
                                            setIsTyping(true);
                                            const aiMsgId = 'risk_profile_' + Math.random().toString();
                                            setMessages(prev => [...prev, { id: aiMsgId, text: '', sender: 'victoria', isStreaming: true }]);
                                            try {
                                                await aiApi.sendStreamingMessage(
                                                    'riskProfile',
                                                    'start',
                                                    chunk => {
                                                        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: chunk, isStreaming: true } : m));
                                                    },
                                                    fullText => {
                                                        setMessages(prev => prev.map(m => m.id === aiMsgId ? { ...m, text: fullText, isStreaming: false } : m));
                                                        setIsTyping(false);
                                                    },
                                                    buildHistory(messagesRef.current)
                                                );
                                            } catch (err) {
                                                console.error('Failed to start riskProfile dialogue', err);
                                                setMessages(prev => prev.map(m => m.id === aiMsgId ? {
                                                    ...m,
                                                    text: 'Теперь давайте определим ваш риск-профиль с помощью короткой анкеты.',
                                                    isStreaming: false
                                                } : m));
                                                setIsTyping(false);
                                            }
                                        }}
                                        className="btn-primary"
                                        style={{ padding: '10px 22px', borderRadius: '999px', fontSize: '14px' }}
                                    >
                                        Далее <ChevronRight size={18} style={{ marginLeft: '6px' }} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {currentStep === 'risk_profile' && !isTyping && (
                        <motion.div
                            key="risk-profile-bubble"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            style={{ display: 'flex', flexDirection: 'column', width: '100%', alignItems: 'flex-start' }}
                        >
                            <div className="message-bubble message-victoria goal-params-bubble">
                                <StepRiskProfile
                                    data={data}
                                    setData={d => setData(d)}
                                    onPrev={() => setCurrentStep('income')}
                                    loading={false}
                                    onComplete={() => {
                                        // Без запроса в ИИ — сразу на расчёт
                                        onFinish();
                                    }}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            <div className="chat-input-area">
                <AnimatePresence mode="wait">
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
