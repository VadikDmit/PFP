import Link from 'next/link';

const IndexPage = () => (
    <div style = { {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        gap: 20,
    } }>
        <h1 style = { { fontSize: 24, fontWeight: 700 } }>Report PFP Module</h1>
        <p style = { { color: '#666', maxWidth: 400, textAlign: 'center' } }>
            Модуль генерации финансовых отчётов с визуализацией портфеля и целей.
        </p>
        <div style = { { display: 'flex', gap: 16 } }>
            <Link
                href = '/report'
                style = { {
                    padding: '12px 24px',
                    background: '#FFC759',
                    borderRadius: 8,
                    color: '#332C09',
                    fontWeight: 600,
                    textDecoration: 'none',
                } }
            >
                Полный отчёт
            </Link>
            <Link
                href = '/mini-report'
                style = { {
                    padding: '12px 24px',
                    border: '1px solid #FFC759',
                    borderRadius: 8,
                    color: '#FFC759',
                    fontWeight: 600,
                    textDecoration: 'none',
                } }
            >
                Мини-отчёт
            </Link>
        </div>
    </div>
);

export default IndexPage;
