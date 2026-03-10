import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, PiggyBank, TrendingUp, Send, X, MessageSquare } from 'lucide-react';
import { getGoalImage } from '../utils/GoalImages';
import type { Client } from '../types/client';
import avatarImage from '../assets/avatar_full.png';
import { aiApi } from '../api/aiApi';

interface PresentPageProps {
    clientData: Client | null;
    onViewPlan: (client: Client, result: any) => void;
    onStartCJM: () => void;
    onAddGoalClick: () => void;
}

// На экране «Настоящее» показываем только превью; полный текст — в модалке чата
const MAX_SUMMARY_PREVIEW_LENGTH = 200;

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
                target_amount_future: undefined as number | undefined,
                yieldPercent: undefined as number | undefined,
            };
        }
        const initialSum = (reserveGoal.details?.initial_instruments || []).reduce((s: number, i: any) => s + (i.amount || 0), 0);
        const monthlySum = (reserveGoal.details?.monthly_instruments || []).reduce((s: number, i: any) => s + (i.amount || 0), 0);
        const summary = reserveGoal.summary || {};
        const target_amount_future = summary.target_amount_future ?? reserveGoal.details?.target_amount_future;
        const yieldPercent = reserveGoal.accumulation_yield_percent ?? reserveGoal.details?.accumulation_yield_percent ?? summary.yield_percent;
        return { initial: initialSum, monthly: monthlySum, target_amount_future, yieldPercent };
    }, [calcGoals, goals]);

    const insuranceData = useMemo(() => {
        // Ищем сначала в calcGoals (там полные details), потом в goals
        const calcGoal = calcGoals.find((g: any) => g.goal_type_id === 5);
        if (calcGoal?.details?.risks?.length) {
            return {
                risks: calcGoal.details.risks as { risk_name: string; limit_amount: number }[],
                programName: calcGoal.details.program_name as string | undefined,
                annualPremium: calcGoal.details.annual_premium as number | undefined,
                taxDeduction: calcGoal.details.tax_deduction_2026 as number | undefined,
            };
        }
        // Фолбэк — старый хардкод
        const goal = goals.find((g: any) => g.goal_type_id === 5);
        const limit = goal?.target_amount || goal?.insurance_limit || 3000000;
        return {
            risks: [
                { risk_name: 'СЛП', limit_amount: limit },
                { risk_name: 'НС', limit_amount: limit },
                { risk_name: 'ДТП', limit_amount: limit * 2 },
            ],
            programName: undefined,
            annualPremium: undefined,
            taxDeduction: undefined,
        };
    }, [calcGoals, goals]);

    const formatMoney = (amount: number) =>
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);

    return (
        <div className="presentPage" style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

            {/* AI Summary and Stub */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="premium-card"
                    onClick={() => setIsChatOpen(true)}
                    style={{
                        display: 'flex', gap: '14px', alignItems: 'flex-start',
                        background: 'linear-gradient(135deg, #fff 0%, #fefcf9 100%)',
                        padding: '16px 20px', cursor: 'pointer',
                        border: '1px solid rgba(217, 70, 239, 0.1)',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <img
                        src={avatarImage} alt="Anna"
                        style={{ width: '40px', height: '40px', borderRadius: '12px', objectFit: 'cover', flexShrink: 0, border: '2px solid #fff', boxShadow: '0 4px 8px rgba(0,0,0,0.08)' }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                            <div style={{ fontSize: '10px', fontWeight: '900', color: '#D946EF', textTransform: 'uppercase', letterSpacing: '0.8px' }}>ИИ-Сводка</div>
                            <div style={{ padding: '1px 6px', background: '#f0fdf4', color: '#16a34a', borderRadius: '100px', fontSize: '9px', fontWeight: '800' }}>ONLINE</div>
                        </div>
                        {isSummaryLoading && !aiSummary ? (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ height: '12px', width: '100%', background: '#f1f5f9', borderRadius: '4px' }} className="animate-pulse" />
                                <div style={{ height: '12px', width: '70%', background: '#f1f5f9', borderRadius: '4px' }} className="animate-pulse" />
                            </div>
                        ) : (
                            <>
                                <div style={{ fontSize: '14px', color: '#333', lineHeight: '1.4', fontWeight: '500' }}>
                                    <MessageContent content={aiSummary.length > MAX_SUMMARY_PREVIEW_LENGTH ? (aiSummary.slice(0, MAX_SUMMARY_PREVIEW_LENGTH).trim().replace(/\s+\S*$/, '') || aiSummary.slice(0, MAX_SUMMARY_PREVIEW_LENGTH)) + '…' : aiSummary} isShort />
                                </div>
                                {aiSummary.length > MAX_SUMMARY_PREVIEW_LENGTH && (
                                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#D946EF', fontWeight: '700' }}>
                                        Открыть чат — весь текст и общение с Анной →
                                    </div>
                                )}
                            </>
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
                    <div style={{ marginLeft: 'auto', width: '36px', height: '36px', borderRadius: '50%', background: '#C60C7F', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(198, 12, 127, 0.3)' }}>
                        <Send size={16} color="#000" />
                    </div>
                </motion.div>
            </div>

            {/* Портфель — два блока: Первоначальный капитал + Пополнение, с диаграммами */}
            {(() => {
                const PORTFOLIO_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];
                const nonZero = (items: { name: string; amount: number }[]) => items.filter((i) => (i.amount || 0) > 0);
                const initialNonZero = nonZero(initialInstruments);
                const monthlyNonZero = nonZero(monthlyInstruments);
                const buildDonutGradient = (items: { name: string; amount: number }[]) => {
                    const sum = items.reduce((s, i) => s + i.amount, 0);
                    if (items.length === 0 || sum <= 0) return '#e2e8f0';
                    let endAngleDeg = 0; // в градусах 0–360
                    return `conic-gradient(${items.map((item, i) => {
                        const segmentDeg = (item.amount / sum) * 360;
                        endAngleDeg += segmentDeg;
                        return `${PORTFOLIO_COLORS[i % PORTFOLIO_COLORS.length]} ${endAngleDeg}deg`;
                    }).join(', ')})`;
                };
                return (
                    <>
                        <div className="presentPortfolioGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                            {/* Блок: Первоначальный капитал */}
                            <div className="premium-card" style={{
                                padding: '18px 20px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                                border: '1px solid rgba(226,232,240,0.8)',
                                borderRadius: '16px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                            }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Первоначальный капитал</h3>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: buildDonutGradient(initialNonZero),
                                        position: 'relative',
                                        flexShrink: 0,
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                        }}>
                                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>Итого</span>
                                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                                                {totalInitial >= 1e6 ? `${(totalInitial / 1e6).toFixed(1)} млн` : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(totalInitial)}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {initialNonZero.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {initialNonZero.map((item: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PORTFOLIO_COLORS[idx % PORTFOLIO_COLORS.length], flexShrink: 0 }} />
                                                        <span style={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                                        <span style={{ color: '#1e293b', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: 'auto' }}>{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(item.amount)} ₽</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div style={{ fontSize: '13px', color: '#94a3b8' }}>Нет активов</div>}
                                    </div>
                                </div>
                                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(241,245,249,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    <TrendingUp size={16} color="#10b981" />
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Доходность за 12м</span>
                                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>+17%</span>
                                </div>
                            </div>

                            {/* Блок: Пополнение */}
                            <div className="premium-card" style={{
                                padding: '18px 20px',
                                background: 'linear-gradient(145deg, #ffffff 0%, #f8fafc 100%)',
                                border: '1px solid rgba(226,232,240,0.8)',
                                borderRadius: '16px',
                                boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
                            }}>
                                <h3 style={{ fontSize: '15px', fontWeight: '800', color: '#1e293b', marginBottom: '14px' }}>Пополнение</h3>
                                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: '100px',
                                        height: '100px',
                                        borderRadius: '50%',
                                        background: buildDonutGradient(monthlyNonZero),
                                        position: 'relative',
                                        flexShrink: 0,
                                    }}>
                                        <div style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            width: '60px',
                                            height: '60px',
                                            borderRadius: '50%',
                                            background: '#fff',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexDirection: 'column',
                                        }}>
                                            <span style={{ fontSize: '10px', color: '#64748b', fontWeight: '700' }}>В месяц</span>
                                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b' }}>
                                                {totalMonthly >= 1e6 ? `${(totalMonthly / 1e6).toFixed(1)} млн` : new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(totalMonthly)}
                                            </span>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        {monthlyNonZero.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                                {monthlyNonZero.map((item: any, idx: number) => (
                                                    <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px' }}>
                                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: PORTFOLIO_COLORS[idx % PORTFOLIO_COLORS.length], flexShrink: 0 }} />
                                                        <span style={{ color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                                                        <span style={{ color: '#1e293b', fontWeight: '700', whiteSpace: 'nowrap', marginLeft: 'auto' }}>{new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(item.amount)} ₽</span>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : <div style={{ fontSize: '13px', color: '#94a3b8' }}>Нет данных</div>}
                                    </div>
                                </div>
                                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px solid rgba(241,245,249,0.9)', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px' }}>
                                    <TrendingUp size={16} color="#10b981" />
                                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Прогноз</span>
                                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#10b981' }}>+12.4%</span>
                                </div>
                            </div>
                        </div>
                    </>
                );
            })()}

            {/* Protection Block — карточки в одном стиле с фоновой картинкой */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>Защита</h3>
                <div className="presentProtectionGrid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '16px' }}>
                    <div
                        className="premium-card"
                        style={{
                            position: 'relative',
                            border: '1px solid #bbf7d0',
                            padding: '16px',
                            overflow: 'hidden',
                            minHeight: '140px',
                        }}
                    >
                        <img
                            src={getGoalImage('Финансовый резерв', 7)}
                            alt=""
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.2,
                            }}
                        />
                        <div style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(135deg, rgba(240,253,244,0.92) 0%, rgba(220,252,231,0.92) 100%)', borderRadius: '12px', padding: '14px', height: '100%', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(34,197,94,0.3)' }}>
                                    <PiggyBank size={20} color="#fff" />
                                </div>
                                <div style={{ fontWeight: '800', fontSize: '15px', lineHeight: '1.2' }}>Финансовый резерв</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '8px 10px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Капитал</div>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap' }}>{formatMoney(reserveData.initial)}</div>
                                </div>
                                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '8px 10px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Пополнение</div>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap' }}>{formatMoney(reserveData.monthly)}<span style={{ fontSize: '10px', color: '#64748b', marginLeft: '2px' }}>/мес</span></div>
                                </div>
                                {reserveData.target_amount_future != null && reserveData.target_amount_future > 0 && (
                                    <div style={{ background: 'rgba(34,197,94,0.12)', padding: '8px 10px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Прогноз через год</div>
                                        <div style={{ fontSize: '14px', fontWeight: '800', color: '#15803d', whiteSpace: 'nowrap' }}>{formatMoney(reserveData.target_amount_future)}</div>
                                    </div>
                                )}
                                <div style={{ background: 'rgba(255,255,255,0.8)', padding: '8px 10px', borderRadius: '8px' }}>
                                    <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Доходность портфеля</div>
                                    <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>
                                        {reserveData.yieldPercent != null && reserveData.yieldPercent > 0 ? `≈ ${reserveData.yieldPercent}% год.` : '—'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div
                        className="premium-card"
                        style={{
                            position: 'relative',
                            border: '1px solid #bfdbfe',
                            padding: '16px',
                            overflow: 'hidden',
                            minHeight: '140px',
                        }}
                    >
                        <img
                            src={getGoalImage('Защита жизни', 5)}
                            alt=""
                            style={{
                                position: 'absolute',
                                inset: 0,
                                width: '100%',
                                height: '100%',
                                objectFit: 'cover',
                                opacity: 0.2,
                            }}
                        />
                        <div style={{ position: 'relative', zIndex: 1, background: 'linear-gradient(135deg, rgba(239,246,255,0.92) 0%, rgba(219,234,254,0.92) 100%)', borderRadius: '12px', padding: '14px', height: '100%', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{ width: '40px', height: '40px', flexShrink: 0, borderRadius: '12px', background: 'linear-gradient(135deg, #3b82f6, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(59,130,246,0.3)' }}>
                                    <Shield size={20} color="#fff" />
                                </div>
                                <div>
                                    <div style={{ fontWeight: '800', fontSize: '15px', lineHeight: '1.2' }}>Защита жизни</div>
                                    {insuranceData.programName && (
                                        <div style={{ fontSize: '11px', color: '#3b82f6', fontWeight: '600', marginTop: '2px' }}>{insuranceData.programName}</div>
                                    )}
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {insuranceData.risks.map((risk) => (
                                    <div key={risk.risk_name} style={{ background: 'rgba(255,255,255,0.8)', padding: '8px 10px', borderRadius: '8px' }}>
                                        <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px', lineHeight: '1.3' }}>{risk.risk_name}</div>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap' }}>{formatMoney(risk.limit_amount)}</div>
                                    </div>
                                ))}
                                {insuranceData.annualPremium != null && (
                                    <div style={{ background: 'rgba(59,130,246,0.1)', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '10px', color: '#2563eb', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Взнос/мес</div>
                                        <div style={{ fontSize: '13px', fontWeight: '800', color: '#2563eb' }}>{formatMoney(insuranceData.annualPremium / 12)}</div>
                                    </div>
                                )}
                                {insuranceData.taxDeduction != null && (
                                    <div style={{ background: 'rgba(16,185,129,0.1)', padding: '8px 10px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '10px', color: '#10b981', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px' }}>Налог. вычет 2026</div>
                                        <div style={{ fontSize: '12px', fontWeight: '800', color: '#10b981' }}>-{formatMoney(insuranceData.taxDeduction)}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Инвестиционные цели — крупные карточки с фоновой картинкой и полным набором параметров */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '20px', fontWeight: '900', color: '#1e293b' }}>Инвестиционные цели</h3>
                    <button onClick={() => onViewPlan(clientData!, goalsSummary)} style={{ background: 'none', border: 'none', color: '#D946EF', fontWeight: '800', cursor: 'pointer', fontSize: '14px' }}>Смотреть всё</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="presentGoalsGrid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    {goals.filter((g: any) => g.goal_type_id !== 5 && g.goal_type_id !== 7).slice(0, 4).map((goal: any, idx: number) => {
                        const investmentCalcGoals = calcGoals.filter((c: any) => c.goal_type_id !== 5 && c.goal_type_id !== 7);
                        const calcGoal = investmentCalcGoals[idx] || calcGoals.find((c: any) => c.goal_type_id === goal.goal_type_id && (c.name === goal.name || c.goal_name === goal.name));
                        const summary = calcGoal?.summary || {};
                        const targetInitial = summary.target_amount_initial ?? goal.target_amount ?? goal.initial_capital;
                        const targetFuture = summary.target_amount_future;
                        const termMonths = summary.target_months ?? goal.term_months;
                        const initialCap = summary.initial_capital ?? goal.initial_capital;
                        const monthlyRep = summary.monthly_replenishment ?? goal.monthly_replenishment;
                        const yieldPercent = calcGoal?.accumulation_yield_percent ?? calcGoal?.details?.accumulation_yield_percent ?? goal?.accumulation_yield_percent ?? goal?.details?.accumulation_yield_percent ?? summary?.accumulation_yield_percent ?? summary?.yield_percent;
                        const bgImg = getGoalImage(goal.name, goal.goal_type_id);
                        return (
                            <motion.div
                                key={goal.id || idx}
                                whileHover={{ y: -2, boxShadow: '0 12px 32px rgba(0,0,0,0.12)' }}
                                className="premium-card"
                                style={{
                                    position: 'relative',
                                    padding: 0,
                                    overflow: 'hidden',
                                    cursor: 'pointer',
                                    minHeight: '200px',
                                    borderRadius: '16px',
                                    border: '1px solid rgba(226,232,240,0.8)',
                                }}
                                onClick={() => onViewPlan(clientData!, goalsSummary)}
                            >
                                {/* Картинка на весь блок */}
                                <img
                                    src={bgImg}
                                    alt=""
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: 'center',
                                    }}
                                />
                                {/* Лёгкий оверлей, чтобы текст читался, но картинка была видна */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(145deg, rgba(255,255,255,0.55) 0%, rgba(248,250,252,0.65) 50%, rgba(241,245,249,0.75) 100%)',
                                        borderRadius: '16px',
                                        pointerEvents: 'none',
                                    }}
                                />
                                <div style={{
                                    position: 'relative',
                                    zIndex: 1,
                                    padding: '20px 22px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '14px',
                                    height: '100%',
                                    minHeight: '200px',
                                }}>
                                    <div style={{ fontWeight: '800', fontSize: '18px', color: '#1e293b', lineHeight: '1.25', letterSpacing: '-0.02em' }}>
                                        {goal.name}
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px 16px', flex: 1, alignContent: 'start' }}>
                                        {targetInitial != null && (
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Стоимость цели</div>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#1e293b', whiteSpace: 'nowrap' }}>{formatMoney(targetInitial)}</div>
                                            </div>
                                        )}
                                        {targetFuture != null && targetFuture > 0 && (
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>С учётом инфляции</div>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#475569', whiteSpace: 'nowrap' }}>{formatMoney(targetFuture)}</div>
                                            </div>
                                        )}
                                        {termMonths != null && (
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Срок</div>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#475569' }}>
                                                    {termMonths >= 12 ? `${Math.round(termMonths / 12)} ${Math.round(termMonths / 12) === 1 ? 'год' : Math.round(termMonths / 12) < 5 ? 'года' : 'лет'}` : `${termMonths} мес`}
                                                </div>
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Первонач. капитал</div>
                                            <div style={{ fontSize: '14px', fontWeight: '800', color: '#475569', whiteSpace: 'nowrap' }}>{formatMoney(initialCap ?? goal.initial_capital ?? 0)}</div>
                                        </div>
                                        {monthlyRep != null && monthlyRep > 0 && (
                                            <div>
                                                <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Пополнение</div>
                                                <div style={{ fontSize: '14px', fontWeight: '800', color: '#10b981', whiteSpace: 'nowrap' }}>{formatMoney(monthlyRep)}/мес</div>
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.3px', marginBottom: '2px' }}>Прогноз доходности</div>
                                            <div style={{ fontSize: '14px', fontWeight: '800', color: yieldPercent != null && yieldPercent > 0 ? '#059669' : '#64748b' }}>
                                                {yieldPercent != null ? `≈ ${yieldPercent}% год.` : '—'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                    </div>
                    <motion.div
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.98 }}
                        className="premium-card"
                        onClick={onStartCJM}
                        style={{
                            border: '2px dashed #e2e8f0', background: '#f8fafc',
                            display: 'flex', flexDirection: 'row', gap: '12px',
                            justifyContent: 'center', alignItems: 'center', cursor: 'pointer', height: '64px'
                        }}
                    >
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.06)' }}>
                            <span style={{ fontSize: '20px', color: '#94a3b8', fontWeight: '300' }}>+</span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: '#94a3b8' }}>Добавить цель</span>
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
