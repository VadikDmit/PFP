import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Target, ShieldCheck, Briefcase, PiggyBank, DollarSign, Heart } from 'lucide-react';
import StepClientData from './steps/StepClientData';
import StepGoalSelection from './steps/StepGoalSelection';
import StepAssets from './steps/StepAssets';
import StepFinReserve from './steps/StepFinReserve';
import StepLifeInsurance from './steps/StepLifeInsurance';
import StepIncome from './steps/StepIncome';
import StepRiskProfile from './steps/StepRiskProfile';
import VictoriaOnboarding from './VictoriaOnboarding';
import { clientApi } from '../api/clientApi';
import type { Asset, ClientGoal } from '../types/client';

interface CJMFlowProps {
    onComplete: (result: any) => void;
    onBack?: () => void;
    isNewClient?: boolean;
}

export interface CJMData {
    // ... existing fields ...
    gender: 'male' | 'female';
    age: number;
    // Legacy single-goal fields (deprecated but kept for compatibility during refactor)
    goalTypeId?: number;
    goalName?: string;
    targetAmount?: number;
    termMonths?: number;
    initialCapital?: number;
    monthlyReplenishment?: number;

    // Global Financials
    avgMonthlyIncome: number;
    riskProfile: 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';
    riskProfileAnswers?: Record<string, number>;

    // v3 New Structures
    assets?: Asset[];
    goals?: ClientGoal[];

    // Identifiers
    fio?: string;
    phone?: string;
    uuid?: string;

    // Life Insurance
    lifeInsuranceLimit?: number;
}

const CJMFlow: React.FC<CJMFlowProps> = ({ onComplete, onBack, isNewClient }) => {
    // Start at 0 (Victoria) for new clients, at 1 (ClientData) for existing
    const [step, setStep] = useState(isNewClient ? 0 : 1);
    const [loading, setLoading] = useState(false);
    const [data, setData] = useState<CJMData>({
        gender: 'male',
        age: 39,
        goalTypeId: 3,
        goalName: 'Инвестиции',
        targetAmount: 1500000,
        termMonths: 60,
        initialCapital: 100000,
        monthlyReplenishment: 5000,
        avgMonthlyIncome: 150000,
        riskProfile: 'BALANCED',
        lifeInsuranceLimit: 0,
    });

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const handleCalculate = async () => {
        setLoading(true);
        try {
            // Calculate Total Liquid Capital from Assets
            const assetsInitial = (data.assets || []).reduce((sum, a) => sum + (a.current_value || 0), 0);

            // Construct Goals Payload - фильтруем НСЖ (id=5), не отправляем на расчет
            let goalsToProcess = (data.goals || []).filter(g => g.goal_type_id !== 5);

            // Автоматически добавляем FIN_RESERVE (id=7), если указаны initialCapital или monthlyReplenishment в StepFinReserve
            // и еще нет цели FIN_RESERVE в списке
            const hasFinReserveGoal = goalsToProcess.some(g => g.goal_type_id === 7);
            if (!hasFinReserveGoal && (data.initialCapital || data.monthlyReplenishment)) {
                goalsToProcess.push({
                    goal_type_id: 7,
                    name: 'Финансовый резерв',
                    initial_capital: data.initialCapital || 0,
                    monthly_replenishment: data.monthlyReplenishment || 0,
                    term_months: 12, // FIN_RESERVE всегда 12 месяцев
                    risk_profile: 'CONSERVATIVE'
                });
            }

            // Life Insurance (ID 5)
            if (data.lifeInsuranceLimit && data.lifeInsuranceLimit > 0) {
                const targetCoverage = data.lifeInsuranceLimit;
                const termMonths = 180; // 15 years default

                goalsToProcess.push({
                    goal_type_id: 5,
                    name: 'Защита Жизни',
                    target_amount: targetCoverage,
                    term_months: termMonths,
                    risk_profile: 'CONSERVATIVE',
                    inflation_rate: 0,
                    // Backend calculation fallback
                    initial_capital: targetCoverage / (termMonths / 12),
                    monthly_replenishment: targetCoverage / termMonths
                });
            }

            const goalsPayload = goalsToProcess.map(g => {
                // Определяем типы целей сначала
                const isLifeInsurance = g.goal_type_id === 5;
                const isRent = g.goal_type_id === 8;
                const isFinReserve = g.goal_type_id === 7;
                const isInvestment = g.goal_type_id === 3;
                const isPension = g.goal_type_id === 1; // PENSION
                const isPassiveIncome = g.goal_type_id === 2; // PASSIVE_INCOME

                // Only for Insurance (5), Rent (8), or FinReserve (7), use initial_capital from goal itself
                const initialCapital = (isFinReserve || isRent || isLifeInsurance)
                    ? (g.initial_capital || 0)
                    : undefined;

                // monthly_replenishment передаем для Investment (3), FinReserve (7) и Insurance (5)
                const monthlyReplenishment = (isFinReserve || isInvestment || isLifeInsurance)
                    ? (g.monthly_replenishment !== undefined ? g.monthly_replenishment : (data.monthlyReplenishment || undefined))
                    : undefined;

                const payload: any = {
                    goal_type_id: g.goal_type_id,
                    name: g.name,
                    risk_profile: (g.risk_profile || data.riskProfile || 'BALANCED') as "CONSERVATIVE" | "BALANCED" | "AGGRESSIVE",
                    inflation_rate: g.inflation_rate || 10
                };

                // Для PENSION и PASSIVE_INCOME: target_amount = desired_monthly_income, term_months не нужен
                if (isPension || isPassiveIncome) {
                    payload.target_amount = g.desired_monthly_income || 0;
                    payload.term_months = g.term_months || 120; // Все равно нужен для API, но бэк может игнорировать
                    if (g.desired_monthly_income !== undefined) {
                        payload.desired_monthly_income = g.desired_monthly_income;
                    }
                } else {
                    // Для остальных целей
                    payload.target_amount = isRent ? (g.initial_capital || 0) : (isFinReserve ? (g.initial_capital || 0) : (g.insurance_limit || g.target_amount || 0));
                    payload.term_months = isRent ? 12 : (isFinReserve ? 12 : (g.term_months || 120));
                }

                // Только для FIN_RESERVE и RENT передаем initial_capital
                if (initialCapital !== undefined) {
                    payload.initial_capital = initialCapital;
                }

                // Только для FIN_RESERVE (id=7) и Investment (id=3) передаем monthly_replenishment
                if (monthlyReplenishment !== undefined) {
                    payload.monthly_replenishment = monthlyReplenishment;
                }

                return payload;
            });

            // Fallback for legacy flow if no goals (should not happen with new UI)
            if (goalsPayload.length === 0 && data.goalTypeId) {
                goalsPayload.push({
                    goal_type_id: data.goalTypeId!,
                    name: data.goalName!,
                    target_amount: data.targetAmount || 0,
                    term_months: data.termMonths || 120,
                    risk_profile: data.riskProfile,
                    initial_capital: data.initialCapital || 0,
                    monthly_replenishment: undefined,
                    inflation_rate: 10,
                    desired_monthly_income: undefined
                });
            }

            const payload = {
                goals: goalsPayload,
                client: {
                    birth_date: new Date(new Date().getFullYear() - data.age, 0, 1).toISOString().split('T')[0],
                    sex: data.gender,
                    fio: data.fio || '',
                    phone: data.phone,
                    avg_monthly_income: data.avgMonthlyIncome,
                    total_liquid_capital: assetsInitial,
                    risk_profile_answers: data.riskProfileAnswers || {},
                },
                assets: (data.assets || []).map(a => ({
                    type: a.type,
                    name: a.name,
                    current_value: a.current_value,
                    currency: a.currency || 'RUB',
                    start_date: new Date().toISOString().split('T')[0],
                    risk_level: 'conservative'
                })),
            };

            // B2C: always use firstRun
            const response = await clientApi.firstRun(payload);
            onComplete(response);
        } catch (error) {
            console.error('Calculation error:', error);
            alert('Ошибка при расчете. Пожалуйста, попробуйте снова.');
        } finally {
            setLoading(false);
        }
    };

    const steps = [
        { title: 'Личные данные', icon: <User size={20} /> },
        { title: 'Цели', icon: <Target size={20} /> },
        { title: 'Активы', icon: <Briefcase size={20} /> },
        { title: 'Финрезерв', icon: <PiggyBank size={20} /> },
        { title: 'Защита Жизни', icon: <Heart size={20} /> },
        { title: 'Доход', icon: <DollarSign size={20} /> },
        { title: 'Риск-профиль', icon: <ShieldCheck size={20} /> }
    ];



    // Dynamic styles based on step
    const isWideStep = step === 2; // Goal Selection needs full width
    const containerStyle: React.CSSProperties = isWideStep ? {
        width: '100%',
        margin: '0',
        padding: '0'
    } : {
        maxWidth: '800px',
        margin: '0 auto',
        padding: '40px 20px'
    };

    // If we are in Victoria Chat Mode (step 0), we want a completely different layout
    if (step === 0 && isNewClient) {
        return (
            <div style={{ width: '100%', height: '100vh', background: '#fff', position: 'fixed', top: 0, left: 0, zIndex: 9999 }}>
                <VictoriaOnboarding
                    data={data}
                    setData={setData}
                    onExit={() => {
                        if (onBack) {
                            onBack();
                        } else {
                            setStep(1);
                        }
                    }}
                    // После полного диалога (включая риск-профиль) — сразу расчёт, без старого интерфейса
                    onFinish={() => handleCalculate()}
                />
            </div>
        );
    }

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', overflowX: 'auto' }}>
                {steps.map((s, i) => (
                    <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative', minWidth: 0 }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: step > i + 1 ? 'var(--secondary)' : step === i + 1 ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                            color: step === i + 1 ? '#000' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 4px',
                            transition: 'all 0.3s ease',
                            flexShrink: 0
                        }}>
                            {s.icon}
                        </div>
                        <span style={{
                            fontSize: '10px',
                            color: step === i + 1 ? 'var(--primary)' : 'var(--text-muted)',
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '48px',
                            margin: '0 auto'
                        }}>{s.title}</span>
                        {i < steps.length - 1 && (
                            <div style={{
                                position: 'absolute',
                                top: '18px',
                                left: 'calc(50% + 20px)',
                                right: 'calc(-50% + 20px)',
                                height: '2px',
                                background: step > i + 1 ? 'var(--secondary)' : 'rgba(255,255,255,0.1)'
                            }} />
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="premium-card"
                >
                    {step === 1 && <StepClientData data={data} setData={setData} onNext={nextStep} />}
                    {step === 2 && <StepGoalSelection data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />}
                    {step === 3 && <StepAssets data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />}
                    {step === 4 && <StepFinReserve data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />}
                    {step === 5 && <StepLifeInsurance data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />}
                    {step === 6 && <StepIncome data={data} setData={setData} onNext={nextStep} onPrev={prevStep} />}
                    {step === 7 && <StepRiskProfile data={data} setData={setData} onComplete={handleCalculate} onPrev={prevStep} loading={loading} />}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default CJMFlow;
