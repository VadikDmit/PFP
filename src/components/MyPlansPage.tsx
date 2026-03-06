import React, { useState, useEffect } from 'react';
import { Plus, TrendingUp, Loader2, Target } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientApi } from '../api/clientApi';
import type { Client } from '../types/client';
import AIDashboardHeader from './AIDashboardHeader';
import WideChatModal from './WideChatModal';
import AddGoalModal from './AddGoalModal';
import { getGoalImage } from '../utils/GoalImages';

interface MyPlansPageProps {
    onCreatePlan: () => void;
    onViewPlan: (client: Client, result: any) => void;
    autoOpenAddGoal?: boolean;
    onOpenAddGoalHandled?: () => void;
}

const MyPlansPage: React.FC<MyPlansPageProps> = ({ onCreatePlan, onViewPlan, autoOpenAddGoal, onOpenAddGoalHandled }) => {
    const [clientData, setClientData] = useState<Client | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        if (autoOpenAddGoal && onOpenAddGoalHandled) {
            setIsAddModalOpen(true);
            onOpenAddGoalHandled();
        }
    }, [autoOpenAddGoal, onOpenAddGoalHandled]);

    useEffect(() => {
        loadPlan();
    }, []);

    const loadPlan = async () => {
        setLoading(true);
        setError('');
        try {
            const data = await clientApi.getMyPlan();
            setClientData(data);
        } catch (err: any) {
            if (err.response?.status === 404) {
                // No plan yet — that's ok
                setClientData(null);
            } else {
                setError('Не удалось загрузить данные');
                console.error('Failed to load plan:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (goalPayload: any) => {
        setLoading(true);
        try {
            await clientApi.addGoal(goalPayload);
            await loadPlan(); // Refresh data
        } catch (err) {
            console.error('Failed to add goal:', err);
            alert('Не удалось добавить цель. Попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    const hasGoals = clientData?.goals && clientData.goals.length > 0;

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: 'calc(100vh - 80px)',
                gap: '12px',
                color: 'var(--text-muted)'
            }}>
                <Loader2 className="animate-spin" size={24} />
                Загрузка...
            </div>
        );
    }

    return (
        <div style={{
            width: '100%',
            maxWidth: '1440px',
            margin: '0 auto',
            padding: '20px 40px'
        }}>

            {/* AI Header Section */}
            <AIDashboardHeader
                clientName={clientData ? `${clientData.first_name} ${clientData.last_name || ''}`.trim() : 'Пользователь'}
                onOpenChat={() => setIsChatOpen(true)}
                clientData={clientData}
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', marginTop: '40px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '4px' }}>
                        Мои финансовые цели
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {hasGoals ? `${clientData!.goals!.length} целей в работе` : 'Начните планирование будущего'}
                    </p>
                </div>
                <button className="btn-primary" onClick={() => setIsAddModalOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={18} />
                    {hasGoals ? 'Добавить цель' : 'Создатить план'}
                </button>
            </div>

            {error && (
                <div style={{
                    background: '#fee2e2',
                    color: '#dc2626',
                    padding: '16px',
                    borderRadius: '12px',
                    marginBottom: '24px',
                    textAlign: 'center'
                }}>
                    {error}
                    <button
                        onClick={loadPlan}
                        style={{
                            marginLeft: '12px',
                            color: '#dc2626',
                            textDecoration: 'underline',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer'
                        }}
                    >
                        Повторить
                    </button>
                </div>
            )}

            {!hasGoals ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                        textAlign: 'center',
                        padding: '60px 24px',
                        background: 'var(--card-bg)',
                        borderRadius: '24px',
                        border: '2px dashed var(--border-color)',
                    }}
                >
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: 'linear-gradient(135deg, #C60C7F, #e040a8)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '24px'
                    }}>
                        <Target size={36} color="#000" />
                    </div>
                    <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>
                        У вас пока нет финансового плана
                    </h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px', maxWidth: '400px', margin: '0 auto 24px' }}>
                        Создайте свою первую финансовую цель, и Анна поможет вам составить план её достижения.
                    </p>
                    <button className="btn-primary" onClick={onCreatePlan} style={{ fontSize: '16px', padding: '14px 32px' }}>
                        Создать финансовый план
                    </button>
                </motion.div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px' }}>
                    {/* Summary card - redesign as a premium card */}
                    {clientData?.goals_summary && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="premium-card"
                            style={{
                                cursor: 'pointer',
                                background: 'linear-gradient(135deg, #222, #000)',
                                color: '#fff',
                                border: 'none'
                            }}
                            onClick={() => onViewPlan(clientData!, clientData!.goals_summary)}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                                <div style={{
                                    width: '56px',
                                    height: '56px',
                                    borderRadius: '16px',
                                    background: 'rgba(255,255,255,0.1)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    <TrendingUp size={28} color="#fbbf24" />
                                </div>
                                <div style={{
                                    padding: '6px 12px',
                                    borderRadius: '20px',
                                    background: 'rgba(255,255,255,0.1)',
                                    fontSize: '12px',
                                    fontWeight: '600'
                                }}>
                                    Сводный отчёт
                                </div>
                            </div>

                            <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Мой финансовый план</h3>
                            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginBottom: '24px' }}>
                                Общая стратегия и анализ всех ваших целей
                            </p>

                            <div style={{ display: 'flex', gap: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Вероятность</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700', color: '#10b981' }}>
                                        {Math.round((clientData.goals_summary.success_probability || 0) * 100)}%
                                    </div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', marginBottom: '4px' }}>Целей</div>
                                    <div style={{ fontSize: '18px', fontWeight: '700' }}>{clientData!.goals!.length}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Goals list */}
                    {clientData!.goals!.map((goal, index) => (
                        <motion.div
                            key={goal.id || index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            style={{
                                cursor: 'pointer',
                                borderRadius: '20px',
                                overflow: 'hidden',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                                background: '#fff',
                                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            whileHover={{ y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }}
                            onClick={() => onViewPlan(clientData!, clientData!.goals_summary)}
                        >
                            {/* Image section */}
                            <div style={{
                                position: 'relative',
                                height: '180px',
                                overflow: 'hidden',
                            }}>
                                <img
                                    src={getGoalImage(goal.name, goal.goal_type_id)}
                                    alt={goal.name}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        transition: 'transform 0.4s ease',
                                    }}
                                    onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
                                    onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                />
                                {/* Dark gradient overlay */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: 0,
                                    left: 0,
                                    right: 0,
                                    height: '100%',
                                    background: 'linear-gradient(0deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0) 100%)',
                                    pointerEvents: 'none',
                                }} />
                                {/* Title on image */}
                                <div style={{
                                    position: 'absolute',
                                    bottom: '16px',
                                    left: '20px',
                                    right: '20px',
                                    color: '#fff',
                                }}>
                                    <div style={{ fontWeight: '700', fontSize: '20px', marginBottom: '4px', lineHeight: '1.2', textShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
                                        {goal.name}
                                    </div>
                                    <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.8)' }}>
                                        {goal.risk_profile ? getRiskLabel(goal.risk_profile) : ''}
                                    </div>
                                </div>
                            </div>

                            {/* Info section */}
                            <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                <div style={{ marginBottom: '16px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                                        <span>Прогресс</span>
                                        <span>0%</span>
                                    </div>
                                    <div style={{ width: '100%', height: '6px', background: '#f0f0f0', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: '5%', height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', borderRadius: '3px' }} />
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                                    <div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Цель</div>
                                        <div style={{ fontWeight: '700', fontSize: '17px' }}>{formatMoney(goal.target_amount || 0)}</div>
                                    </div>
                                    {goal.term_months && (
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '2px' }}>Срок</div>
                                            <div style={{
                                                fontWeight: '600',
                                                fontSize: '14px',
                                                background: '#f5f5f5',
                                                padding: '4px 10px',
                                                borderRadius: '8px',
                                            }}>
                                                {Math.round(goal.term_months / 12)} лет
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {isChatOpen && (
                    <WideChatModal
                        isOpen={isChatOpen}
                        onClose={() => setIsChatOpen(false)}
                        clientData={clientData}
                    />
                )}
            </AnimatePresence>

            <AddGoalModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAdd={handleAddGoal}
            />
        </div>
    );
};

function formatMoney(amount: number): string {
    return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
}



function getRiskLabel(profile: string): string {
    switch (profile) {
        case 'CONSERVATIVE': return 'Консервативный';
        case 'BALANCED': return 'Сбалансированный';
        case 'AGGRESSIVE': return 'Агрессивный';
        default: return profile;
    }
}

export default MyPlansPage;

