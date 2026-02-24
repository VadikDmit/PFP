import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, PiggyBank, TrendingUp, Send, X, MessageSquare } from 'lucide-react';
import { getGoalImage } from '../utils/GoalImages';
import PortfolioDonutChart from './charts/PortfolioDonutChart';
import PortfolioBarChart from './charts/PortfolioBarChart';
import type { Client } from '../types/client';
import avatarImage from '../assets/avatar_full.png';
import { aiApi } from '../api/aiApi';

interface PresentPageProps {
    clientData: Client | null;
    onViewPlan: (client: Client, result: any) => void;
    onStartCJM: () => void;
    onAddGoalClick: () => void;
}

// --- MARKDOWN RENDERER HELPER ---
const MessageContent: React.FC<{ content: string; isShort?: boolean }> = ({ content, isShort }) => {
    if (!content) return null;

    const lines = content.split('\n');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {lines.map((line, idx) => {
                let trimmed = line.trim();
                if (!trimmed) return <div key={idx} style={{ height: '4px' }} />;

                // Header ###
                if (trimmed.startsWith('###') || trimmed.startsWith('##')) {
                    if (isShort) return null;
                    const level = trimmed.startsWith('###') ? 17 : 19;
                    return <div key={idx} style={{ fontWeight: '900', fontSize: `${level}px`, color: '#1e293b', marginTop: '12px', marginBottom: '4px' }}>{trimmed.replace(/^#+\s*/, '')}</div>;
                }

                // Bold **text**
                const parts = trimmed.split(/(\*\*.*?\*\*)/g);
                const renderedLine = parts.map((part, i) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={i} style={{ color: '#000', fontWeight: '800' }}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                });

                // List item * or 1.
                if (trimmed.startsWith('* ') || /^\d+\.\s/.test(trimmed)) {
                    return (
                        <div key={idx} style={{ display: 'flex', gap: '10px', paddingLeft: '4px', alignItems: 'flex-start' }}>
                            <div style={{ color: '#D946EF', fontWeight: '900', marginTop: '2px' }}>•</div>
                            <div style={{ flex: 1, lineHeight: '1.6' }}>{renderedLine.map((p, i) => <React.Fragment key={i}>{typeof p === 'string' ? p.replace(/^(\* |\d+\.\s)/, '') : p}</React.Fragment>)}</div>
                        </div>
                    );
                }

                return <div key={idx} style={{ lineHeight: '1.6' }}>{renderedLine}</div>;
            })}
        </div>
    );
};

const PresentPage: React.FC<PresentPageProps> = ({ clientData, onViewPlan, onStartCJM }) => {
    const goals = clientData?.goals || [];
    const goalsSummary = clientData?.goals_summary;
    const calcGoals = goalsSummary?.goals || [];

    const [aiSummary, setAiSummary] = useState<string>('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(true);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const hasFetched = useRef(false);

    // Fetch AI Summary on load
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchSummary = async () => {
            setIsSummaryLoading(true);
            try {
                const history = await aiApi.getHistory('mainPFP');
                const lastAiMessage = history?.filter((m: any) => m.role === 'assistant').pop();

                if (lastAiMessage) {
                    setAiSummary(lastAiMessage.content);
                    setIsSummaryLoading(false);
                } else {
                    await aiApi.sendStreamingMessage(
                        'mainPFP',
                        'Сделай краткую сводку по моему текущему финансовому состоянию и дай один главный совет.',
                        (text) => setAiSummary(text),
                        () => setIsSummaryLoading(false)
                    );
                }
            } catch (err) {
                console.error('Failed to fetch AI summary:', err);
                setAiSummary('Привет! Я подготовила твой финансовый план. Давай обсудим детали?');
                setIsSummaryLoading(false);
            }
        };

        fetchSummary();
    }, []);

    // Aggregate Initial Capital Instruments
    const initialInstruments = useMemo(() => {
        const aggregated: Record<string, number> = {};
        calcGoals.forEach((g: any) => {
            const insts = g.details?.initial_instruments || [];
            insts.forEach((i: any) => {
                const name = i.name || 'Прочий актив';
                aggregated[name] = (aggregated[name] || 0) + (i.amount || 0);
            });
        });
        return Object.entries(aggregated)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [calcGoals]);

    // Aggregate Monthly Instruments
    const monthlyInstruments = useMemo(() => {
        const aggregated: Record<string, number> = {};
        calcGoals.forEach((g: any) => {
            const insts = g.details?.monthly_instruments || [];
            insts.forEach((i: any) => {
                const name = i.name || 'Прочий актив';
                aggregated[name] = (aggregated[name] || 0) + (i.amount || 0);
            });
        });
        return Object.entries(aggregated)
            .map(([name, amount]) => ({ name, amount }))
            .sort((a, b) => b.amount - a.amount);
    }, [calcGoals]);

    const totalInitial = initialInstruments.reduce((sum: number, i: any) => sum + i.amount, 0);
    const totalMonthly = monthlyInstruments.reduce((sum: number, i: any) => sum + i.amount, 0);

    const reserveData = useMemo(() => {
        const reserveGoal = calcGoals.find((g: any) => g.goal_type_id === 7);
        if (!reserveGoal) {
            const fallback = goals.find((g: any) => g.goal_type_id === 7);
            return {
                initial: fallback?.initial_capital || 0,
                monthly: fallback?.monthly_replenishment || 0,
            };
        }
        const initialSum = (reserveGoal.details?.initial_instruments || []).reduce((s: number, i: any) => s + (i.amount || 0), 0);
        const monthlySum = (reserveGoal.details?.monthly_instruments || []).reduce((s: number, i: any) => s + (i.amount || 0), 0);
        return { initial: initialSum, monthly: monthlySum };
    }, [calcGoals, goals]);

    const insuranceData = useMemo(() => {
        const goal = goals.find((g: any) => g.goal_type_id === 5);
        const limit = goal?.target_amount || goal?.insurance_limit || 3000000;
        return {
            slp: limit,
            ns: limit,
            dtp: limit * 2
        };
    }, [goals]);

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);

    return (
        <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* AI Summary and Stub */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card"
                    onClick={() => setIsChatOpen(true)}
                    style={{
                        display: 'flex', gap: '24px', alignItems: 'center',
                        background: 'linear-gradient(135deg, #fff 0%, #fefcf9 100%)',
                        padding: '24px 32px', cursor: 'pointer',
                        border: '1px solid rgba(217, 70, 239, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <div style={{
                        position: 'absolute', top: '-10px', right: '-10px',
                        width: '100px', height: '100px',
                        background: 'radial-gradient(circle, rgba(217, 70, 239, 0.05) 0%, transparent 70%)',
                        zIndex: 0
                    }} />

                    <div style={{ width: '64px', height: '64px', borderRadius: '18px', overflow: 'hidden', flexShrink: 0, border: '2px solid #fff', boxShadow: '0 8px 16px rgba(0,0,0,0.08)', zIndex: 1 }}>
                        <img src={avatarImage} alt="Anna" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ flex: 1, zIndex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                            <div style={{ fontSize: '11px', fontWeight: '900', color: '#D946EF', textTransform: 'uppercase', letterSpacing: '1px' }}>ИИ-Сводка</div>
                            <div style={{ padding: '2px 8px', background: '#f0fdf4', color: '#16a34a', borderRadius: '100px', fontSize: '10px', fontWeight: '800' }}>ONLINE</div>
                        </div>
                        {isSummaryLoading && !aiSummary ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div style={{ height: '14px', width: '100%', background: '#f1f5f9', borderRadius: '4px' }} className="animate-pulse" />
                                <div style={{ height: '14px', width: '80%', background: '#f1f5f9', borderRadius: '4px' }} className="animate-pulse" />
                            </div>
                        ) : (
                            <div style={{ fontSize: '15px', color: '#333', lineHeight: '1.5', fontWeight: '500' }}>
                                <MessageContent content={aiSummary} isShort />
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.005, boxShadow: '0 12px 30px rgba(0,0,0,0.05)' }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => setIsChatOpen(true)}
                    style={{
                        background: '#fff', borderRadius: '32px', padding: '14px 24px',
                        display: 'flex', alignItems: 'center', gap: '12px',
                        border: '1px solid #eef2f6', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', cursor: 'pointer'
                    }}
                >
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <MessageSquare size={16} color="#94a3b8" />
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '15px', fontWeight: '500' }}>Задать вопрос Анне о финансовом плане...</span>
                    <div style={{ marginLeft: 'auto', width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #FFD93D, #FFC750)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(255, 199, 80, 0.3)' }}>
                        <Send size={16} color="#000" />
                    </div>
                </motion.div>
            </div>

            {/* Portfolio Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <PortfolioDonutChart items={initialInstruments} total={totalInitial} title="Мои активы" />
                <PortfolioBarChart items={monthlyInstruments} total={totalMonthly} title="Портфель пополнения" />
            </div>

            {/* Yield Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'linear-gradient(to bottom right, #fff, #f0fdf4)' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Историческая доходность (12м)</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>+17.0%</div>
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} color="#10b981" />
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px', background: 'linear-gradient(to bottom right, #fff, #f0fdf4)' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Прогноз доходности</div>
                        <div style={{ fontSize: '28px', fontWeight: '900', color: '#10b981' }}>+12.4%</div>
                    </div>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <TrendingUp size={24} color="#10b981" />
                    </div>
                </div>
            </div>

            {/* Protection Block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>Защита</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div className="premium-card" style={{ background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)', border: '1px solid #bbf7d0', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(34,197,94,0.3)' }}>
                                <PiggyBank size={22} color="#fff" />
                            </div>
                            <div style={{ fontWeight: '800', fontSize: '18px' }}>Финансовый резерв</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px' }}>
                                <span style={{ color: '#666', fontWeight: '600' }}>Капитал</span>
                                <strong style={{ fontSize: '17px' }}>{formatMoney(reserveData.initial)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)', padding: '12px 16px', borderRadius: '12px' }}>
                                <span style={{ color: '#666', fontWeight: '600' }}>Пополнение</span>
                                <strong style={{ fontSize: '17px' }}>{formatMoney(reserveData.monthly)}<span style={{ fontSize: '12px', color: '#888' }}>/мес</span></strong>
                            </div>
                        </div>
                    </div>
                    <div className="premium-card" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)', border: '1px solid #bfdbfe', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                            <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
                                <Shield size={22} color="#fff" />
                            </div>
                            <div style={{ fontWeight: '800', fontSize: '18px' }}>Защита жизни</div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)', padding: '10px 16px', borderRadius: '10px' }}>
                                <span style={{ color: '#666', fontWeight: '600' }}>СЛП</span>
                                <strong>{formatMoney(insuranceData.slp)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)', padding: '10px 16px', borderRadius: '10px' }}>
                                <span style={{ color: '#666', fontWeight: '600' }}>НС</span>
                                <strong>{formatMoney(insuranceData.ns)}</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.6)', padding: '10px 16px', borderRadius: '10px' }}>
                                <span style={{ color: '#666', fontWeight: '600' }}>ДТП</span>
                                <strong>{formatMoney(insuranceData.dtp)}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Goals Grid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>Текущие цели</h3>
                    <button onClick={() => onViewPlan(clientData!, goalsSummary)} style={{ background: 'none', border: 'none', color: '#D946EF', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Смотреть всё</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                    {goals.filter((g: any) => g.goal_type_id !== 5 && g.goal_type_id !== 7).slice(0, 3).map((goal: any, idx: number) => (
                        <motion.div
                            key={goal.id || idx}
                            whileHover={{ y: -5 }}
                            className="premium-card"
                            style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
                            onClick={() => onViewPlan(clientData!, goalsSummary)}
                        >
                            <div style={{ height: '110px', position: 'relative' }}>
                                <img src={getGoalImage(goal.name, goal.goal_type_id)} alt={goal.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent)' }} />
                                <div style={{ position: 'absolute', bottom: '10px', left: '12px', color: '#fff', fontWeight: '900', fontSize: '15px' }}>{goal.name}</div>
                            </div>
                            <div style={{ padding: '12px 14px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Стоимость</span>
                                    <strong style={{ fontSize: '14px' }}>{formatMoney(goal.target_amount)}</strong>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="premium-card"
                        onClick={onStartCJM}
                        style={{
                            border: '2px dashed #e2e8f0', background: '#f8fafc',
                            display: 'flex', flexDirection: 'column', gap: '8px',
                            justifyContent: 'center', alignItems: 'center', cursor: 'pointer', height: '160px'
                        }}
                    >
                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                            <span style={{ fontSize: '24px', color: '#94a3b8', fontWeight: '300' }}>+</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '800', color: '#94a3b8' }}>Добавить цель</span>
                    </motion.div>
                </div>
            </div>

            {/* AIChatModal */}
            <AIChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
    );
};

const AIChatModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState<any[]>([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const hasInitHistory = useRef(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen && !hasInitHistory.current) {
            hasInitHistory.current = true;
            fetchHistory();
        }
    }, [isOpen]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const fetchHistory = async () => {
        try {
            const history = await aiApi.getHistory('mainPFP');
            const filtered = (history || []).filter((m: any, idx: number) => {
                const isSystemPrompt = m.role === 'user' && m.content.toLowerCase().includes('краткую сводку');
                return !(idx === 0 && isSystemPrompt);
            });
            setMessages(filtered);
        } catch (err) {
            console.error('Failed to fetch chat history:', err);
        }
    };

    const handleSend = async () => {
        if (!inputValue.trim() || isTyping) return;

        const userMsg = { role: 'user', content: inputValue };
        setMessages(prev => [...prev, userMsg]);
        setInputValue('');
        setIsTyping(true);

        try {
            let fullAiResponse = '';
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            await aiApi.sendStreamingMessage(
                'mainPFP',
                inputValue,
                (chunk) => {
                    fullAiResponse = chunk;
                    setMessages(prev => {
                        const next = [...prev];
                        next[next.length - 1] = { role: 'assistant', content: fullAiResponse };
                        return next;
                    });
                },
                () => setIsTyping(false)
            );
        } catch (err) {
            console.error('Chat failed:', err);
            setIsTyping(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ width: '90%', maxWidth: '600px', height: '80vh', background: '#fff', borderRadius: '24px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
                    >
                        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <img src={avatarImage} style={{ width: '40px', height: '40px', borderRadius: '50%' }} alt="Anna" />
                                <span style={{ fontWeight: 'bold' }}>Анна</span>
                            </div>
                            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}><X size={24} /></button>
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {messages.map((m, i) => (
                                <div key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%', padding: '12px 16px', borderRadius: '16px', background: m.role === 'user' ? '#D946EF' : '#f1f5f9', color: m.role === 'user' ? '#fff' : '#333' }}>
                                    <MessageContent content={m.content} />
                                </div>
                            ))}
                            {isTyping && <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: '16px', background: '#f1f5f9' }}>Анна печатает...</div>}
                            <div ref={chatEndRef} />
                        </div>
                        <div style={{ padding: '20px', borderTop: '1px solid #eee', display: 'flex', gap: '12px' }}>
                            <input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Спросите Анну..."
                                style={{ flex: 1, border: '1px solid #ddd', borderRadius: '12px', padding: '10px 16px', outline: 'none' }}
                            />
                            <button onClick={handleSend} style={{ background: '#D946EF', border: 'none', color: '#fff', borderRadius: '12px', padding: '0 20px', cursor: 'pointer' }}><Send size={20} /></button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default PresentPage;
