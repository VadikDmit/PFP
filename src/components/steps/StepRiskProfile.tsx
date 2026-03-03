import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { CJMData } from '../CJMFlow';

interface StepRiskProfileProps {
    data: CJMData;
    setData: (data: CJMData) => void;
    onComplete: () => void;
    onPrev: () => void;
    loading?: boolean;
}

interface QuestionOption {
    text: string;
    points: number;
}

interface Question {
    id: string;
    text: string;
    options: QuestionOption[];
}

const questions: Question[] = [
    {
        id: 'q2',
        text: 'Какую просадку капитала за год вы считаете допустимой?',
        options: [
            { text: 'Менее 5%', points: 1 },
            { text: '5–10%', points: 2 },
            { text: '10–20%', points: 3 },
            { text: '20–30%', points: 4 },
            { text: 'Более 30%', points: 5 },
        ],
    },
    {
        id: 'q3',
        text: 'Если ваши инвестиции упадут на 20%, что вы сделаете?',
        options: [
            { text: 'Продам, чтобы избежать убытков', points: 1 },
            { text: 'Частично продам', points: 2 },
            { text: 'Ничего не изменю', points: 3 },
            { text: 'Докуплю на просадке', points: 4 },
            { text: 'Буду рад возможности для увеличения капитала', points: 5 },
        ],
    },
    {
        id: 'q4',
        text: 'Какой опыт инвестирования у вас есть?',
        options: [
            { text: 'Никакого', points: 1 },
            { text: 'Только депозиты', points: 2 },
            { text: 'Облигации и фонды', points: 3 },
            { text: 'Акции и ETF', points: 4 },
            { text: 'Опционы, фьючерсы, криптовалюты', points: 5 },
        ],
    },
    {
        id: 'q6',
        text: 'Какую долю дохода вы готовы инвестировать?',
        options: [
            { text: 'До 5%', points: 1 },
            { text: '5–10%', points: 2 },
            { text: '10–20%', points: 3 },
            { text: '20–30%', points: 4 },
            { text: 'Более 30%', points: 5 },
        ],
    },
    {
        id: 'q7',
        text: 'Что для вас важнее при выборе инструмента?',
        options: [
            { text: 'Гарантия сохранения капитала', points: 1 },
            { text: 'Стабильный небольшой доход', points: 2 },
            { text: 'Баланс дохода и риска', points: 3 },
            { text: 'Высокий потенциальный доход', points: 4 },
            { text: 'Максимальная доходность, даже с высоким риском', points: 5 },
        ],
    },
    {
        id: 'q8',
        text: 'Есть ли у вас финансовая «подушка безопасности»?',
        options: [
            { text: 'Нет', points: 1 },
            { text: 'На 1–2 месяца', points: 2 },
            { text: 'На 3–6 месяцев', points: 3 },
            { text: 'На 6–12 месяцев', points: 4 },
            { text: 'Более года', points: 5 },
        ],
    },
    {
        id: 'q9',
        text: 'Как вы реагируете на волатильность рынка?',
        options: [
            { text: 'Сильно нервничаю', points: 1 },
            { text: 'Слежу, но стараюсь не паниковать', points: 2 },
            { text: 'Спокойно наблюдаю', points: 3 },
            { text: 'Вижу возможности', points: 4 },
            { text: 'Активно торгую на колебаниях', points: 5 },
        ],
    },
    {
        id: 'q10',
        text: 'Какой результат инвестирования за год вас устроит?',
        options: [
            { text: 'Не потерять деньги', points: 1 },
            { text: 'Обогнать инфляцию', points: 2 },
            { text: '10–15% годовых', points: 3 },
            { text: '15–25% годовых', points: 4 },
            { text: 'Более 25% годовых', points: 5 },
        ],
    },
];

function calculateProfile(answers: Record<string, number>): { total: number; profile: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE'; label: string } {
    const total = Object.values(answers).reduce((sum, v) => sum + v, 0);
    if (total <= 20) return { total, profile: 'CONSERVATIVE', label: 'Консервативный' };
    if (total <= 34) return { total, profile: 'BALANCED', label: 'Сбалансированный' };
    return { total, profile: 'AGGRESSIVE', label: 'Агрессивный' };
}

const profileColors: Record<string, string> = {
    CONSERVATIVE: '#10b981',
    BALANCED: '#f59e0b',
    AGGRESSIVE: '#ef4444',
};

const StepRiskProfile: React.FC<StepRiskProfileProps> = ({ data, setData, onComplete, onPrev, loading }) => {
    const [currentQ, setCurrentQ] = useState(0);
    const [answers, setAnswers] = useState<Record<string, number>>(data.riskProfileAnswers || {});
    const [showResult, setShowResult] = useState(false);

    const allAnswered = questions.every(q => answers[q.id] !== undefined);
    const answeredCount = Object.keys(answers).length;

    const handleSelect = (questionId: string, points: number) => {
        const newAnswers = { ...answers, [questionId]: points };
        setAnswers(newAnswers);

        // Auto-advance or finish
        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(currentQ + 1);
            } else {
                // All answered - Skip result screen and go straight to calculation
                const result = calculateProfile(newAnswers);
                setData({
                    ...data,
                    riskProfile: result.profile,
                    riskProfileAnswers: newAnswers,
                });
                onComplete();
            }
        }, 300);
    };

    const handleConfirm = () => {
        if (allAnswered) {
            onComplete();
        }
    };

    const question = questions[currentQ];
    const result = allAnswered ? calculateProfile(answers) : null;

    return (
        <div style={{ padding: '8px 0' }}>
            <h2 style={{ marginBottom: '8px', fontSize: '22px', textAlign: 'center' }}>
                Определение риск-профиля
            </h2>

            {/* Progress bar */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
                {questions.map((q, i) => (
                    <div
                        key={q.id}
                        style={{
                            flex: 1,
                            height: '4px',
                            borderRadius: '2px',
                            background: answers[q.id] !== undefined ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            cursor: 'pointer',
                            transition: 'background 0.3s',
                        }}
                        onClick={() => { setCurrentQ(i); setShowResult(false); }}
                    />
                ))}
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
                Вопрос {currentQ + 1} из {questions.length} • Отвечено {answeredCount}/{questions.length}
            </p>

            {!showResult ? (
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentQ}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25 }}
                    >
                        <h3 style={{ fontSize: '17px', fontWeight: '600', marginBottom: '16px', lineHeight: '1.4' }}>
                            {question.text}
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {question.options.map((opt, idx) => {
                                const isSelected = answers[question.id] === opt.points;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleSelect(question.id, opt.points)}
                                        style={{
                                            padding: '14px 16px',
                                            borderRadius: '12px',
                                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                                            background: isSelected ? 'rgba(255, 199, 80, 0.12)' : 'var(--card-bg)',
                                            color: 'var(--text-main)',
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            transition: 'all 0.2s',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                        }}
                                    >
                                        <span style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            border: `2px solid ${isSelected ? 'var(--primary)' : 'var(--border-color)'}`,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            flexShrink: 0,
                                            background: isSelected ? 'var(--primary)' : 'transparent',
                                        }}>
                                            {isSelected && <CheckCircle size={14} color="#000" />}
                                        </span>
                                        {opt.text}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Navigation between questions */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                            <button
                                onClick={() => currentQ > 0 ? setCurrentQ(currentQ - 1) : onPrev()}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '4px',
                                    fontSize: '14px',
                                }}
                            >
                                <ChevronLeft size={16} />
                                {currentQ > 0 ? 'Предыдущий вопрос' : 'Назад к доходу'}
                            </button>

                            {currentQ < questions.length - 1 && answers[question.id] !== undefined && (
                                <button
                                    onClick={() => setCurrentQ(currentQ + 1)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        color: 'var(--primary)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                    }}
                                >
                                    Следующий <ChevronRight size={16} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                </AnimatePresence>
            ) : (
                /* Result */
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ textAlign: 'center' }}
                >
                    <div style={{
                        padding: '32px',
                        borderRadius: '16px',
                        border: `2px solid ${profileColors[result!.profile]}`,
                        background: `${profileColors[result!.profile]}10`,
                        marginBottom: '24px',
                    }}>
                        <div style={{ fontSize: '48px', marginBottom: '12px' }}>
                            {result!.profile === 'CONSERVATIVE' ? '🛡️' : result!.profile === 'BALANCED' ? '⚖️' : '🚀'}
                        </div>
                        <h3 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px', color: profileColors[result!.profile] }}>
                            {result!.label} профиль
                        </h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Ваш балл: {result!.total} из 45
                        </p>
                        <div style={{
                            height: '6px',
                            borderRadius: '3px',
                            background: 'rgba(255,255,255,0.1)',
                            marginTop: '16px',
                            overflow: 'hidden',
                        }}>
                            <div style={{
                                width: `${(result!.total / 45) * 100}%`,
                                height: '100%',
                                background: profileColors[result!.profile],
                                borderRadius: '3px',
                                transition: 'width 0.5s ease',
                            }} />
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button
                            onClick={() => { setShowResult(false); setCurrentQ(0); }}
                            className="btn-secondary"
                            style={{ flex: 1 }}
                        >
                            Пересдать анкету
                        </button>
                        <button
                            onClick={handleConfirm}
                            className="btn-primary"
                            style={{ flex: 2 }}
                            disabled={loading}
                        >
                            {loading ? 'Расчёт...' : 'Рассчитать мой план'}
                        </button>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default StepRiskProfile;
