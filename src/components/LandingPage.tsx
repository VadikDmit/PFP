import React from 'react';
import {
    ArrowRight,
    CheckCircle2,
    Landmark,
    ReceiptText,
    ShieldCheck,
    Target,
    TrendingUp
} from 'lucide-react';
import { GOAL_GALLERY_ITEMS } from '../utils/GoalImages';

interface LandingPageProps {
    onStart: () => void;
    onLogin: () => void;
}

const BENEFITS = [
    {
        title: 'Контроль и ясность',
        description: 'Видно, куда уходят деньги, где потери и какие действия реально приближают к вашим целям.',
        icon: CheckCircle2
    },
    {
        title: 'Рост капитала',
        description: 'Деньги начинают работать как система: стратегия, риск-профиль, горизонт и регулярная корректировка.',
        icon: TrendingUp
    },
    {
        title: 'Защита от ошибок',
        description: 'Сценарный анализ заранее показывает, как пережить кризисы и не слить результат на эмоциях.',
        icon: ShieldCheck
    }
];

const INCOME_GROWTH_FACTORS = [
    {
        title: 'Налоговое планирование',
        description: 'Используем легальные льготы, вычеты и корректные налоговые режимы без серых схем.',
        icon: ReceiptText
    },
    {
        title: 'Софинансирование и программы',
        description: 'Подключаем доступные механики допвзносов и поддержки, чтобы усилить вашу доходность.',
        icon: Landmark
    },
    {
        title: 'Цели + дисциплина',
        description: 'Фиксируем цели, сроки и чекпоинты, чтобы стратегия работала не месяц, а годы.',
        icon: Target
    }
];

const LANDING_GOALS = GOAL_GALLERY_ITEMS.slice(0, 8);

const LandingPage: React.FC<LandingPageProps> = ({ onStart, onLogin }) => {
    const scrollToSection = (sectionId: string) => {
        const section = document.getElementById(sectionId);
        section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    return (
        <div className="landing-page-wrap">
            <header className="landing-header">
                <div className="landing-logo">
                    <span className="landing-logo__badge">FP</span>
                    <div>
                        <div className="landing-logo__title">Финансовый консультант</div>
                        <div className="landing-logo__caption">Персональный план капитала</div>
                    </div>
                </div>

                <nav className="landing-nav">
                    <button type="button" onClick={() => scrollToSection('why-fin-plan')}>Почему важно</button>
                    <button type="button" onClick={() => scrollToSection('income-growth')}>Рост доходности</button>
                    <button type="button" onClick={() => scrollToSection('goals-showcase')}>Цели</button>
                </nav>

                <div className="landing-header__actions">
                    <button type="button" className="landing-btn landing-btn--ghost" onClick={onLogin}>
                        Войти
                    </button>
                    <button type="button" className="landing-btn landing-btn--primary" onClick={onStart}>
                        Начать
                    </button>
                </div>
            </header>

            <main className="landing-main">
                <section className="landing-hero">
                    <div className="landing-hero__left">
                        <p className="landing-kicker">Финансовый консалтинг для людей и семей</p>
                        <h2 className="landing-hero__title">
                            Финансовое планирование — это система, которая помогает
                            <span> увеличивать доходность и достигать цели без хаоса.</span>
                        </h2>
                        <p className="landing-hero__text">
                            Мы строим личный маршрут: от текущего состояния до нужного уровня капитала,
                            с понятными шагами, сроками и метриками контроля.
                        </p>
                        <div className="landing-hero__actions">
                            <button type="button" className="landing-btn landing-btn--primary landing-btn--large" onClick={onStart}>
                                Начать финансовое планирование <ArrowRight size={18} />
                            </button>
                            <button type="button" className="landing-btn landing-btn--ghost landing-btn--large" onClick={() => scrollToSection('why-fin-plan')}>
                                Что это даёт
                            </button>
                        </div>
                    </div>

                    <div className="landing-hero__right">
                        <div className="landing-glass-card">
                            <div className="landing-glass-card__label">Потенциал дополнительной доходности</div>
                            <div className="landing-glass-card__main">до 113% годовых</div>
                            <p className="landing-glass-card__subtext">
                                В отдельных сценариях за счёт налогового планирования и софинансирования.
                                По более консервативным сценариям в среднем ориентир — около 17% годовых.
                            </p>
                            <div className="landing-glass-card__meta">
                                Важно: результат зависит от ваших параметров, горизонта и выбранных инструментов.
                                Это не гарантия доходности.
                            </div>
                        </div>
                    </div>
                </section>

                <section id="why-fin-plan" className="landing-section">
                    <div className="landing-section__head">
                        <h3>Почему финансовое планирование важно</h3>
                        <p>
                            Без плана деньги рассеиваются. С планом — превращаются в управляемую систему, которая
                            работает на ваши приоритеты: безопасность, доход, капитал и цели семьи.
                        </p>
                    </div>

                    <div className="landing-feature-grid">
                        {BENEFITS.map((item) => {
                            const Icon = item.icon;
                            return (
                                <article key={item.title} className="landing-feature-card">
                                    <div className="landing-feature-card__icon">
                                        <Icon size={20} />
                                    </div>
                                    <h4>{item.title}</h4>
                                    <p>{item.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section id="income-growth" className="landing-section">
                    <div className="landing-section__head">
                        <h3>За счёт чего растёт доходность</h3>
                        <p>
                            Доходность — это не “удача”, а комбинация инструментов, налоговой эффективности и
                            дисциплины исполнения плана.
                        </p>
                    </div>

                    <div className="landing-growth-grid">
                        {INCOME_GROWTH_FACTORS.map((factor) => {
                            const Icon = factor.icon;
                            return (
                                <article key={factor.title} className="landing-growth-card">
                                    <div className="landing-growth-card__top">
                                        <Icon size={20} />
                                        <h4>{factor.title}</h4>
                                    </div>
                                    <p>{factor.description}</p>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section id="goals-showcase" className="landing-section">
                    <div className="landing-section__head">
                        <h3>Цели, которые можно закрывать системно</h3>
                        <p>
                            От финансовой подушки и ренты до жилья, бизнеса и пассивного дохода.
                            План адаптируется под ваши сроки и риск-профиль.
                        </p>
                    </div>

                    <div className="landing-goals-grid">
                        {LANDING_GOALS.map((goal) => (
                            <article key={goal.id} className="landing-goal-card">
                                <img src={goal.image} alt={goal.title} />
                                <div className="landing-goal-card__overlay">
                                    <div>{goal.title}</div>
                                    <span>{goal.description}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="landing-cta">
                    <h3>Готовы перейти от хаоса к системе?</h3>
                    <p>Запустите планирование и получите понятную карту действий под ваши цели.</p>
                    <button type="button" className="landing-btn landing-btn--primary landing-btn--large" onClick={onStart}>
                        Начать сейчас <ArrowRight size={18} />
                    </button>
                </section>
            </main>
        </div>
    );
};

export default LandingPage;
