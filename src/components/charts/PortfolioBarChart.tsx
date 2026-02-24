import React from 'react';

interface AllocationItem {
    name: string;
    amount: number;
    color?: string;
}

interface PortfolioBarChartProps {
    items: AllocationItem[];
    total: number;
    title: string;
}

const PortfolioBarChart: React.FC<PortfolioBarChartProps> = ({ items, total, title }) => {
    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="premium-card" style={{
            flex: 1,
            minWidth: '340px',
            padding: '28px',
            background: 'linear-gradient(145deg, #ffffff 0%, #f9fafb 100%)',
            border: '1px solid rgba(226, 232, 240, 0.6)',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.04), 0 8px 10px -6px rgba(0, 0, 0, 0.04)'
        }}>
            <h3 style={{
                fontSize: '18px',
                fontWeight: '900',
                marginBottom: '24px',
                letterSpacing: '-0.5px',
                color: '#1e293b'
            }}>{title}</h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {items.length > 0 ? items.map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '14px',
                        padding: '10px 0',
                        borderBottom: '1px solid rgba(241, 245, 249, 0.8)'
                    }}>
                        <span style={{ color: '#64748b', fontWeight: '600' }}>{item.name}</span>
                        <span style={{ color: '#0f172a', fontWeight: '800', letterSpacing: '-0.2px' }}>
                            {new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(item.amount)} ₽
                        </span>
                    </div>
                )) : (
                    <div style={{ color: '#94a3b8', textAlign: 'center', padding: '20px', fontSize: '13px' }}>Нет данных</div>
                )}
            </div>

            <div style={{
                marginTop: 'auto',
                paddingTop: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
            }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Итого в месяц</span>
                <div style={{ fontSize: '26px', fontWeight: '950', color: '#3b82f6', letterSpacing: '-1px' }}>{formatCurrency(total)}</div>
            </div>
        </div>
    );
};

export default PortfolioBarChart;
