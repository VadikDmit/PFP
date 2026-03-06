import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clientApi } from '../api/clientApi';

interface RegisterPageProps {
    onRegisterSuccess: () => void;
    onSwitchToLogin: () => void;
}

type Step = 'form' | 'success';

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegisterSuccess, onSwitchToLogin }) => {
    const [step, setStep] = useState<Step>('form');
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== passwordConfirm) {
            setError('Пароли не совпадают');
            return;
        }
        if (password.length < 6) {
            setError('Пароль должен содержать минимум 6 символов');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const response = await clientApi.registerFast({
                email,
                name,
                password
            });

            if (response.token) {
                localStorage.setItem('token', response.token);
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));
                }
                setStep('success');
                setTimeout(() => onRegisterSuccess(), 1500);
            }
        } catch (err: any) {
            const msg = err.response?.data?.message || err.response?.data?.error || 'Ошибка при регистрации';
            if (err.response?.status === 409) {
                setError('Пользователь с таким email уже зарегистрирован');
            } else {
                setError(msg);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            padding: '20px'
        }}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="premium-card"
                style={{ width: '100%', maxWidth: '440px' }}
            >
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{
                        background: '#C60C7F',
                        width: '64px',
                        height: '64px',
                        borderRadius: '16px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '16px',
                        boxShadow: '0 0 20px rgba(198, 12, 127, 0.3)'
                    }}>
                        <UserPlus size={32} color="#000" />
                    </div>
                    <h1 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '8px' }}>
                        {step === 'form' && 'Регистрация'}
                        {step === 'success' && 'Готово!'}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                        {step === 'form' && 'Создайте аккаунт для личного финансового плана'}
                        {step === 'success' && 'Аккаунт успешно создан'}
                    </p>
                </div>

                {error && (
                    <div style={{
                        background: '#fee2e2',
                        color: '#dc2626',
                        padding: '12px 16px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        marginBottom: '16px',
                        textAlign: 'center'
                    }}>
                        {error}
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {step === 'form' && (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleRegister}
                        >
                            <div className="input-group">
                                <label className="label">Ваше имя</label>
                                <div style={{ position: 'relative' }}>
                                    <User style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                        placeholder="Иван Иванов"
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="label">Электронная почта *</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                        placeholder="email@example.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="label">Придумайте пароль *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                        placeholder="Минимум 6 символов"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="input-group">
                                <label className="label">Подтвердите пароль *</label>
                                <div style={{ position: 'relative' }}>
                                    <Lock style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
                                    <input
                                        type="password"
                                        value={passwordConfirm}
                                        onChange={(e) => setPasswordConfirm(e.target.value)}
                                        style={{ paddingLeft: '40px' }}
                                        placeholder="Повторите пароль"
                                        minLength={6}
                                        required
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
                                {loading ? <><Loader2 className="animate-spin" size={18} style={{ display: 'inline' }} /> Создание аккаунта...</> : 'Зарегистрироваться'}
                            </button>
                        </motion.form>
                    )}

                    {step === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ textAlign: 'center', padding: '40px 20px' }}
                        >
                            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'center' }}>
                                <div className="premium-loader" style={{
                                    width: '60px',
                                    height: '60px',
                                    border: '3px solid rgba(198, 12, 127, 0.1)',
                                    borderTop: '3px solid #C60C7F',
                                    borderRadius: '50%',
                                    animation: 'spin 1s linear infinite'
                                }} />
                            </div>
                            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px', color: '#1e293b' }}>Почти готово!</h3>
                            <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Виктория уже готовит ваше личное пространство...</p>

                            <style>{`
                                @keyframes spin {
                                    0% { transform: rotate(0deg); }
                                    100% { transform: rotate(360deg); }
                                }
                            `}</style>
                        </motion.div>
                    )}
                </AnimatePresence>

                {step === 'form' && (
                    <div style={{ marginTop: '24px', textAlign: 'center' }}>
                        <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
                            Уже есть аккаунт?{' '}
                            <span
                                style={{ color: '#C60C7F', cursor: 'pointer', fontWeight: '600' }}
                                onClick={onSwitchToLogin}
                            >
                                Войти
                            </span>
                        </p>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default RegisterPage;

