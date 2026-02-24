import React from 'react';
import { motion } from 'framer-motion';
import {
    XAxis, YAxis, Tooltip, ResponsiveContainer,
    AreaChart, Area
} from 'recharts';
import {
    TrendingUp,
    MessageSquare,
    BarChart3,
    PieChart,
    Globe,
    Coins,
    TrendingDown,
    Activity
} from 'lucide-react';
import avatarImage from '../assets/avatar_full.png';

const inflationData = [
    { month: 'Янв', rate: 11.2 },
    { month: 'Фев', rate: 10.8 },
    { month: 'Мар', rate: 9.5 },
    { month: 'Апр', rate: 8.7 },
    { month: 'Май', rate: 8.1 },
    { month: 'Июн', rate: 7.4 },
];

const keyRateData = [
    { year: '2023', rate: 16 },
    { year: '2024', rate: 21 },
    { year: '2025', rate: 18 },
];

const StatBlock: React.FC<{
    title: string;
    children: React.ReactNode;
    onAiClick?: () => void;
    icon?: React.ReactNode;
}> = ({ title, children, onAiClick, icon }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-card"
        style={{
            padding: '24px',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            position: 'relative',
            overflow: 'hidden'
        }}
    >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {icon && <div style={{ color: '#FFC750' }}>{icon}</div>}
                <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#111', margin: 0 }}>{title}</h3>
            </div>
            <button
                onClick={onAiClick}
                style={{
                    background: 'linear-gradient(135deg, #FFC750 0%, #FFB820 100%)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 4px 10px rgba(255, 199, 80, 0.3)',
                    color: '#000'
                }}
                title="Спросить ИИ"
            >
                <MessageSquare size={16} />
            </button>
        </div>
        <div style={{ flex: 1 }}>
            {children}
        </div>
    </motion.div>
);

const PastPage: React.FC = () => {
    return (
        <div style={{
            width: '100%',
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '32px'
        }}>
            {/* AI Summary Header */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="premium-card"
                style={{
                    display: 'flex',
                    gap: '24px',
                    alignItems: 'center',
                    background: 'linear-gradient(135deg, #fff 0%, #fdfbf7 100%)',
                    padding: '32px',
                    boxShadow: '0 20px 40px -10px rgba(0,0,0,0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.5)'
                }}
            >
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '3px solid #fff',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                }}>
                    <img src={avatarImage} alt="Anna" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: '#FFC750', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '1px' }}>
                        Анализ рынка от Анны
                    </div>
                    <p style={{ fontSize: '17px', color: '#1e293b', lineHeight: '1.6', fontWeight: '600', margin: 0 }}>
                        "Ну как видишь ставки по депозитам и облигациям идут вниз. Поэтому я в нашем финансовом плане использую дисконт по времени. Кстати последние данные говорят что и инфляция замедляется"
                    </p>
                </div>
            </motion.div>

            {/* Capital Blocks */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
                <StatBlock title="Рост капитала" icon={<TrendingUp size={20} />}>
                    <div style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(240, 242, 245, 0.5)',
                        borderRadius: '16px',
                        flexDirection: 'column',
                        gap: '12px',
                        border: '1px dashed #cbd5e1'
                    }}>
                        <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                            <Activity size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>Новый клиент</div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Данные о росте появятся после<br />первых пополнений</div>
                        </div>
                    </div>
                </StatBlock>

                <StatBlock title="Доходность портфеля" icon={<PieChart size={20} />}>
                    <div style={{
                        height: '200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(240, 242, 245, 0.5)',
                        borderRadius: '16px',
                        flexDirection: 'column',
                        gap: '12px',
                        border: '1px dashed #cbd5e1'
                    }}>
                        <div style={{ color: '#94a3b8', textAlign: 'center' }}>
                            <BarChart3 size={32} style={{ opacity: 0.3, marginBottom: '8px' }} />
                            <div style={{ fontWeight: '700', fontSize: '14px' }}>Статистика по продуктам</div>
                            <div style={{ fontSize: '12px', opacity: 0.7 }}>Расчет доходности будет доступен<br />после формирования портфеля</div>
                        </div>
                    </div>
                </StatBlock>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px' }}>
                {/* Inflation */}
                <StatBlock title="Инфляция" icon={<TrendingDown size={20} />}>
                    <div style={{ height: '180px', width: '100%', marginTop: '10px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={inflationData}>
                                <defs>
                                    <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FFC750" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#FFC750" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                                <YAxis hide />
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}
                                    labelStyle={{ fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="rate" stroke="#FFC750" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'center', marginTop: '8px', fontWeight: '500' }}>
                        Тренд: Постепенное замедление до 7.4%
                    </div>
                </StatBlock>

                {/* Key Rate */}
                <StatBlock title="Средняя ключевая ставка" icon={<Activity size={20} />}>
                    <div style={{ height: '180px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 20px' }}>
                            {keyRateData.map((d, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                                    <div style={{
                                        width: '40px',
                                        height: `${d.rate * 6}px`,
                                        background: i === 1 ? '#FFB820' : '#e2e8f0',
                                        borderRadius: '8px 8px 4px 4px',
                                        transition: 'all 0.3s ease'
                                    }} />
                                    <span style={{ fontSize: '12px', fontWeight: '700' }}>{d.rate}%</span>
                                    <span style={{ fontSize: '10px', color: '#94a3b8' }}>{d.year}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </StatBlock>

                {/* Bonds */}
                <StatBlock title="ОФЗ" icon={<Globe size={20} />}>
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#10b981' }}>14.2%</div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Текущая доходность 10-летних бумаг</div>
                        <div style={{
                            height: '4px',
                            width: '100%',
                            background: '#e2e8f0',
                            borderRadius: '2px',
                            marginTop: '16px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ width: '70%', height: '100%', background: '#10b981' }} />
                        </div>
                    </div>
                </StatBlock>

                <StatBlock title="Корп. облигации" icon={<Shield size={18} style={{ color: '#FFC750' }} />}>
                    <div style={{ padding: '20px 0' }}>
                        <div style={{ fontSize: '32px', fontWeight: '900', color: '#3b82f6' }}>18.5%</div>
                        <div style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>Средняя доходность (рейтинг AA+)</div>
                        <div style={{
                            height: '4px',
                            width: '100%',
                            background: '#e2e8f0',
                            borderRadius: '2px',
                            marginTop: '16px',
                            overflow: 'hidden'
                        }}>
                            <div style={{ width: '85%', height: '100%', background: '#3b82f6' }} />
                        </div>
                    </div>
                </StatBlock>

                {/* MOEX & Gold */}
                <StatBlock title="Индекс МосБиржи" icon={<TrendingUp size={20} />}>
                    <div style={{ height: '100px', display: 'flex', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '900' }}>3 245.12</div>
                            <div style={{ color: '#ef4444', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <TrendingDown size={14} /> -1.2% за неделю
                            </div>
                        </div>
                    </div>
                </StatBlock>

                <StatBlock title="Золото" icon={<Coins size={20} />}>
                    <div style={{ height: '100px', display: 'flex', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: '28px', fontWeight: '900' }}>7 420 ₽</div>
                            <div style={{ color: '#10b981', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <TrendingUp size={14} /> +0.8% (за грамм)
                            </div>
                        </div>
                    </div>
                </StatBlock>
            </div>
        </div>
    );
};

// Simplified Shield icon for internal use if lucide one fails to match size
const Shield: React.FC<{ size?: number, style?: React.CSSProperties }> = ({ size = 20, style }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

export default PastPage;
