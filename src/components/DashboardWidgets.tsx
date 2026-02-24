import React, { useMemo } from 'react';
import { ShieldAlert, ArrowRight, TrendingUp, Landmark, Coins, Briefcase, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface DashboardWidgetsProps {
    clientData: any;
}

interface Instrument {
    name: string;
    amount: number;
    share?: number;
    yield?: number;
}

const DashboardWidgets: React.FC<DashboardWidgetsProps> = ({ clientData }) => {
    // Correct paths based on the provided JSON
    const goals = clientData?.goals_summary?.goals || [];

    // Aggregation logic
    const aggregateInstruments = (instrumentKey: 'initial_instruments' | 'monthly_instruments') => {
        const aggregated: Record<string, Instrument> = {};

        goals.forEach((goal: any) => {
            // Data is inside goal.details according to JSON
            const instruments = goal.details?.[instrumentKey] || [];
            instruments.forEach((inst: any) => {
                const name = inst.name || 'Прочий актив';
                if (!aggregated[name]) {
                    aggregated[name] = {
                        name,
                        amount: 0,
                        yield: inst.yield
                    };
                }
                aggregated[name].amount += (inst.amount || 0);
            });
        });

        return Object.values(aggregated).sort((a, b) => b.amount - a.amount);
    };

    const initialAllocations = useMemo(() => aggregateInstruments('initial_instruments'), [goals]);
    const monthlyAllocations = useMemo(() => aggregateInstruments('monthly_instruments'), [goals]);

    const totalInitial = useMemo(() => initialAllocations.reduce((sum, inst) => sum + inst.amount, 0), [initialAllocations]);
    const totalMonthly = useMemo(() => monthlyAllocations.reduce((sum, inst) => sum + inst.amount, 0), [monthlyAllocations]);

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(amount);
    };

    const getInstrumentIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('депозит') || n.includes('вклад') || n.includes('счет')) return <Landmark size={18} />;
        if (n.includes('офз') || n.includes('облигации') || n.includes('акции') || n.includes('фонд') || n.includes('золото')) return <TrendingUp size={18} />;
        if (n.includes('кэш') || n.includes('наличные')) return <Coins size={18} />;
        return <Briefcase size={18} />;
    };

    const InstrumentTile = ({ inst, isMonthly }: { inst: Instrument, isMonthly?: boolean }) => (
        <motion.div
            whileHover={{ y: -3, boxShadow: '0 8px 16px rgba(0,0,0,0.06)' }}
            style={{
                background: '#fff',
                borderRadius: '20px',
                padding: '16px 20px',
                border: '1px solid #f0f0f0',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                minWidth: '220px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                    padding: '8px',
                    borderRadius: '12px',
                    background: isMonthly ? '#fff7ed' : '#f0fdf4',
                    color: isMonthly ? '#f59e0b' : '#10b981'
                }}>
                    {getInstrumentIcon(inst.name)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#111', lineHeight: '1.2' }}>{inst.name}</span>
                    {inst.yield && (
                        <span style={{ fontSize: '11px', color: '#10b981', fontWeight: '600' }}>
                            {inst.yield}% доходность
                        </span>
                    )}
                </div>
            </div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: '#111' }}>
                {formatMoney(inst.amount)}
                {isMonthly && <span style={{ fontSize: '12px', color: '#9ca3af', fontWeight: '500', marginLeft: '4px' }}>/мес</span>}
            </div>
        </motion.div>
    );

    return (
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '32px', marginBottom: '48px' }}>

            {/* ROW 1: Current Capital Allocation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Текущий капитал (Распределение)
                        </h3>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>
                            {formatMoney(totalInitial)}
                        </div>
                    </div>
                    <div style={{ padding: '8px 16px', borderRadius: '12px', background: '#f3f4f6', fontSize: '12px', fontWeight: '700', color: '#4b5563' }}>
                        По плану
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}>
                    {initialAllocations.length > 0 ? (
                        initialAllocations.map((inst, idx) => (
                            <InstrumentTile key={idx} inst={inst} />
                        ))
                    ) : (
                        <div style={{ padding: '32px', textAlign: 'center', width: '100%', border: '1px dashed #e5e7eb', borderRadius: '24px', color: '#9ca3af' }}>
                            Инструменты для текущего капитала не определены
                        </div>
                    )}
                </div>
            </div>

            {/* ROW 2: Monthly Replenishment Allocation */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                            Пополнение капитала (Инструменты)
                        </h3>
                        <div style={{ fontSize: '24px', fontWeight: '800', color: '#111' }}>
                            {formatMoney(totalMonthly)} <span style={{ fontSize: '14px', color: '#9ca3af' }}>в месяц</span>
                        </div>
                    </div>
                </div>

                <div style={{
                    display: 'flex',
                    gap: '16px',
                    overflowX: 'auto',
                    paddingBottom: '8px',
                    msOverflowStyle: 'none',
                    scrollbarWidth: 'none'
                }}>
                    {monthlyAllocations.length > 0 ? (
                        monthlyAllocations.map((inst, idx) => (
                            <InstrumentTile key={idx} inst={inst} isMonthly />
                        ))
                    ) : (
                        <div style={{ padding: '32px', textAlign: 'center', width: '100%', border: '1px dashed #e5e7eb', borderRadius: '24px', color: '#9ca3af' }}>
                            Инструменты для пополнения не определены
                        </div>
                    )}
                </div>
            </div>

            {/* Extra Rows: Risk & Promo (More compact) */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                        background: '#fff',
                        borderRadius: '24px',
                        padding: '20px 24px',
                        border: '1px solid #f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        cursor: 'pointer'
                    }}
                >
                    <div style={{ padding: '12px', borderRadius: '14px', background: '#eff6ff', color: '#3b82f6' }}>
                        <ShieldAlert size={24} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '15px', fontWeight: '700' }}>Защита семьи и здоровья</div>
                        <div style={{ fontSize: '13px', color: '#ef4444', fontWeight: '500' }}>Необходимо оформить защиту</div>
                    </div>
                    <ArrowRight size={20} color="#3b82f6" />
                </motion.div>

                <motion.div
                    whileHover={{ scale: 1.01 }}
                    style={{
                        background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
                        borderRadius: '24px',
                        padding: '20px 24px',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        position: 'relative'
                    }}
                >
                    <div style={{ position: 'absolute', right: '-10px', top: '-10px', opacity: 0.1 }}>
                        <Activity size={100} />
                    </div>
                    <div style={{ zIndex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: '600', opacity: 0.9 }}>Спецпредложение ДОМ.РФ</div>
                        <div style={{ fontSize: '18px', fontWeight: '800' }}>Вклад 28% годовых</div>
                    </div>
                    <button style={{
                        zIndex: 1,
                        background: '#fff',
                        color: '#1e3a8a',
                        border: 'none',
                        padding: '8px 20px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: '800',
                        marginLeft: 'auto'
                    }}>
                        Перейти
                    </button>
                </motion.div>
            </div>
        </div>
    );
};

export default DashboardWidgets;
