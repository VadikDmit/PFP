import React from 'react';
import { LogOut } from 'lucide-react';

interface HeaderProps {
    activePage?: 'past' | 'present' | 'future';
    onNavigate?: (page: 'past' | 'present' | 'future') => void;
    onLogout?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activePage = 'present', onNavigate, onLogout }) => {
    const handleNavClick = (page: 'past' | 'present' | 'future', e: React.MouseEvent) => {
        e.preventDefault();
        if (onNavigate) onNavigate(page);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (onLogout) onLogout();
    };

    return (
        <header style={{
            height: '56px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            borderBottom: '1px solid #eee',
            position: 'sticky',
            top: 0,
            zIndex: 100,
            gap: '8px',
        }}>
            {/* Logo */}
            <div style={{
                fontSize: '17px',
                fontWeight: '800',
                color: '#333',
                flexShrink: 0,
                whiteSpace: 'nowrap',
            }}>
                <span style={{ color: '#C60C7F' }}>Anna</span>
            </div>

            {/* Navigation */}
            <nav style={{
                display: 'flex',
                gap: '4px',
                flex: 1,
                justifyContent: 'center',
            }}>
                {(['past', 'present', 'future'] as const).map((page) => {
                    const labels = { past: 'Прошлое', present: 'Настоящее', future: 'Будущее' };
                    const isActive = activePage === page;
                    return (
                        <a
                            key={page}
                            href="#"
                            onClick={(e) => handleNavClick(page, e)}
                            style={{
                                color: isActive ? '#fff' : '#666',
                                fontWeight: isActive ? '700' : '500',
                                textDecoration: 'none',
                                fontSize: '13px',
                                cursor: 'pointer',
                                padding: '6px 10px',
                                borderRadius: '20px',
                                background: isActive ? '#C60C7F' : 'transparent',
                                transition: 'all 0.2s ease',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {labels[page]}
                        </a>
                    );
                })}
            </nav>

            {/* Logout */}
            <button
                onClick={handleLogout}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#bbb',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '6px',
                    borderRadius: '8px',
                    flexShrink: 0,
                }}
                title="Выйти"
            >
                <LogOut size={18} />
            </button>
        </header>
    );
};

export default Header;
