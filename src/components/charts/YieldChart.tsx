import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';

interface YieldChartProps {
    title: string;
    type: 'forecast' | 'historical';
}

const PERIODS = ['1 мес', '3 мес', '6 мес', '1 год', '3 года', '5 лет', '10 лет', '20 лет'];

const YieldChart: React.FC<YieldChartProps> = ({ title, type }) => {
    const [activePeriod, setActivePeriod] = useState(PERIODS[3]);

    // Mock data generation for SVG path
    const points = useMemo(() => {
        const count = 20;
        const res = [];
        let cur = 50;
        for (let i = 0; i < count; i++) {
            // Forecast always goes up, historical fluctuates
            const trend = type === 'forecast' ? 2 : 0;
            const variance = 10;
            cur = cur + (Math.random() - 0.5 + trend / 10) * variance;
            res.push({ x: (i / (count - 1)) * 100, y: 100 - Math.max(10, Math.min(cur, 90)) });
        }
        return res;
    }, [activePeriod, type]);

    const pathData = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;

    return (
        <div className="premium-card" style={{ flex: 1, minWidth: '340px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: '800', letterSpacing: '-0.3px' }}>{title}</h3>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#10b981' }}>+{(Math.random() * 15 + 5).toFixed(1)}%</div>
            </div>

            {/* SVG Chart Area */}
            <div style={{ width: '100%', height: '120px', position: 'relative', marginBottom: '24px' }}>
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                    <defs>
                        <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={type === 'forecast' ? '#3B82F6' : '#10B981'} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={type === 'forecast' ? '#3B82F6' : '#10B981'} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <motion.path
                        key={activePeriod}
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        d={pathData}
                        fill="none"
                        stroke={type === 'forecast' ? '#3B82F6' : '#10B981'}
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                    <path
                        d={`${pathData} L 100,100 L 0,100 Z`}
                        fill={`url(#grad-${type})`}
                    />
                </svg>
            </div>

            {/* Period selector */}
            <div style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}>
                {PERIODS.map(p => (
                    <button
                        key={p}
                        onClick={() => setActivePeriod(p)}
                        style={{
                            padding: '6px 12px',
                            borderRadius: '8px',
                            border: 'none',
                            background: activePeriod === p ? '#111' : '#f3f4f6',
                            color: activePeriod === p ? '#fff' : '#666',
                            fontSize: '11px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        {p}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default YieldChart;
