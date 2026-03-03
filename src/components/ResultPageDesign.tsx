import React, { useState, useEffect, useCallback } from 'react';
import {
  Send,
  Plus,
  Trash2,
} from 'lucide-react';
import avatarImage from '../assets/avatar_full.png';
import { getGoalImage, GOAL_GALLERY_ITEMS } from '../utils/GoalImages';
import { PortfolioDistribution } from './PortfolioDistribution';
import { formatMonthsToDate } from '../utils/dateUtils';
import AddGoalModal from './AddGoalModal';
import VictoriaChatModal from './VictoriaChatModal';
import { aiApi } from '../api/aiApi';

export interface GoalCardSlot {
  label: string;
  value: string;
}

interface GoalResult {
  id: number;
  name: string;
  targetAmount: number;
  initialCapital: number;
  monthlyPayment: number;
  termMonths: number;
  goalType?: string;
  goalTypeId?: number;
  displaySlots: GoalCardSlot[];
  totalPremium?: number;
  risks?: any[];
  assets_allocation?: any[];
  portfolio_structure?: any;
  originalData?: any;
  targetMonthlyIncome?: number;
  yieldPercent?: number;
  initialInstruments?: any[];
  monthlyInstruments?: any[];
}

interface ResultPageDesignProps {
  calculationData: any;
  client?: any;
  onAddGoal?: (goal: any) => void;
  onDeleteGoal?: (goalId: number) => void;
  onGoToReport?: () => void;
  onRecalculate?: (payload: any) => void;
  onRestart?: () => void;
  isCalculating?: boolean;
}

interface EditFormState {
  name: string;
  target_amount: number;
  term_months: number;
  initial_capital: number;
  ops_capital?: number;
  ipk_current?: number;
  desired_monthly_income?: number;
  risk_profile?: string;
  inflation_rate?: number;
  monthly_replenishment?: number;
  [key: string]: any;
}

const ResultPageDesign: React.FC<ResultPageDesignProps> = ({
  calculationData,
  client,
  onAddGoal,
  onDeleteGoal,
  onGoToReport,
  onRecalculate,
  isCalculating,
}) => {
  const [editingGoal, setEditingGoal] = useState<GoalResult | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    name: '',
    target_amount: 0,
    term_months: 0,
    initial_capital: 0
  });
  const [snapshotForm, setSnapshotForm] = useState<EditFormState | null>(null);

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [chatField, setChatField] = useState<{ name: string; label: string; value: any } | null>(null);

  const [aiMessage, setAiMessage] = useState('');
  const [isAiTyping, setIsAiTyping] = useState(false);

  useEffect(() => {
    const startGreeting = async () => {
      setIsAiTyping(true);
      try {
        await aiApi.sendStreamingMessage(
          'futurePFP',
          'Привет! Я подготовила финансовый план. Расскажи мне кратко, что ты о нем думаешь?',
          (chunk) => setAiMessage(chunk),
          () => setIsAiTyping(false)
        );
      } catch (err) {
        console.error('AI Greeting error', err);
        setAiMessage('Я подготовила для вас финансовый план с учетом ваших целей и ресурсов. Давайте обсудим его?');
        setIsAiTyping(false);
      }
    };
    startGreeting();
  }, []);

  const openFieldChat = (goal: GoalResult, slot: GoalCardSlot) => {
    let fieldName = 'target_amount';
    if (slot.label.includes('Срок')) fieldName = 'term_months';
    if (slot.label.includes('капитал')) fieldName = 'initial_capital';
    if (slot.label.includes('пополнение')) fieldName = 'monthly_replenishment';

    setEditingGoal(goal);
    setChatField({ name: fieldName, label: slot.label, value: slot.value });
    setIsChatModalOpen(true);
  };

  const onSubmitEdit = useCallback(() => {
    if (!onRecalculate || !editingGoal) return;
    const goalPayload: any = { goal_id: editingGoal.id };
    let hasChanges = false;
    Object.keys(editForm).forEach(key => {
      const val = (editForm as any)[key];
      const snapVal = snapshotForm ? (snapshotForm as any)[key] : undefined;
      const isChanged = typeof val === 'number' && typeof snapVal === 'number'
        ? Math.abs(val - snapVal) > 0.01
        : String(val) !== String(snapVal);
      if (isChanged) {
        goalPayload[key] = val;
        hasChanges = true;
      }
    });
    if (!hasChanges) {
      setEditingGoal(null);
      return;
    }
    onRecalculate(goalPayload);
  }, [onRecalculate, editingGoal, editForm, snapshotForm]);

  const calcRoot = calculationData || {};
  const calculatedGoals = Array.isArray(calcRoot.goals) ? calcRoot.goals : [];
  const consolidatedPortfolio = calcRoot?.summary?.consolidated_portfolio;
  const assetsAllocation = consolidatedPortfolio?.assets_allocation || [];
  const rawCashFlow = consolidatedPortfolio?.cash_flow_allocation || calcRoot?.cash_flow_allocation || [];
  const cashFlowAllocation = rawCashFlow.map((item: any) => {
    if (item.payment_frequency === 'annual') {
      return {
        ...item,
        amount: Math.round(item.amount / 12),
        name: `${item.name} (общ.${new Intl.NumberFormat('ru-RU', { compactDisplay: 'short', notation: 'compact' }).format(item.amount)})`
      };
    }
    return item;
  });


  const taxBenefitsSummary = calcRoot?.summary?.tax_benefits_summary;
  const taxPlanningLegacy = calcRoot.tax_planning;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + '₽';
  };

  const goalCards: GoalResult[] = (calculatedGoals as any[]).map((goalResult: any, index: number) => {
    const summary = goalResult?.summary || {};
    const details = goalResult?.details || {};
    const typeId = goalResult?.goal_type_id || 0;
    const fmt = (val: number | undefined) => val !== undefined ? formatCurrency(val) : '0₽';
    const fmtDate = (months: number | undefined) => months ? formatMonthsToDate(months) : '-';
    let displaySlots: GoalCardSlot[] = [];

    switch (typeId) {
      case 1: case 2:
        displaySlots = [
          { label: 'Желаемый доход', value: fmt(summary.target_amount_initial) },
          { label: 'Первонач. капитал', value: fmt(summary.initial_capital) },
          { label: 'Ежем. пополнение', value: fmt(summary.monthly_replenishment) },
          { label: 'Срок', value: fmtDate(summary.target_months) },
        ];
        break;
      case 3:
        displaySlots = [
          { label: 'Итоговый капитал', value: fmt(summary.projected_capital_at_end) },
          { label: 'Текущий капитал', value: fmt(summary.initial_capital) },
          { label: 'Ежем. пополнение', value: fmt(summary.monthly_replenishment) },
          { label: 'Срок', value: fmtDate(summary.target_months) },
        ];
        break;
      case 9: case 10: case 11: case 4: case 14:
        displaySlots = [
          { label: 'Стоимость сегодня', value: fmt(summary.target_amount_initial) },
          { label: 'Первонач. капитал', value: fmt(summary.initial_capital) },
          { label: 'Ежем. пополнение', value: fmt(summary.monthly_replenishment) },
          { label: 'Срок', value: fmtDate(summary.term_months || summary.target_months) },
        ];
        break;
      case 5: {
        const premium = summary.initial_capital || summary.premium || 0;
        displaySlots = [
          { label: 'Страховая сумма', value: fmt(summary.target_coverage) },
          { label: 'Взнос (год)', value: fmt(premium) },
          { label: 'Ежем. пополнение', value: fmt(Math.round(premium / 12)) },
          { label: 'Срок', value: fmtDate(summary.target_months) },
        ];
        break;
      }
      case 7:
        displaySlots = [
          { label: 'Итоговый капитал', value: fmt(summary.projected_capital_at_end) },
          { label: 'Накоплено (Сейчас)', value: fmt(summary.initial_capital) },
          { label: 'Ежем. пополнение', value: fmt(summary.monthly_replenishment) },
          { label: 'Срок', value: (summary.target_months || 0) + ' мес' },
        ];
        break;
      case 8:
        displaySlots = [
          { label: 'Ежем. доход', value: fmt(summary.projected_monthly_income) },
          { label: 'Капитал', value: fmt(summary.initial_capital) },
        ];
        break;
      default:
        displaySlots = [
          { label: 'Цель', value: fmt(summary.target_amount || summary.target_amount_initial) },
          { label: 'Срок', value: fmtDate(summary.target_months) },
        ];
    }

    const defaultTitle = GOAL_GALLERY_ITEMS.find(i => i.typeId === typeId)?.title;
    let mappedGoal = client?.goals?.find((g: any) => g.id === goalResult.goal_id) || client?.goals?.[index];
    const displayName = mappedGoal?.name || goalResult.goal_name || goalResult.name || defaultTitle || 'Цель';

    return {
      id: goalResult?.goal_id || 0,
      name: displayName,
      targetAmount: details.target_capital_required ?? details.target_amount ?? summary.target_amount ?? summary.target_amount_initial ?? 0,
      initialCapital: summary?.initial_capital || 0,
      monthlyPayment: summary?.monthly_replenishment ?? summary.monthly_payment ?? 0,
      termMonths: details?.term_months || summary?.term_months || 0,
      goalType: goalResult?.goal_type,
      goalTypeId: typeId,
      displaySlots,
      risks: details?.risks || [],
      assets_allocation: summary?.assets_allocation || details?.portfolio?.instruments || [],
      portfolio_structure: goalResult?.portfolio_structure || summary?.portfolio_structure,
      yieldPercent: goalResult.accumulation_yield_percent || details?.accumulation_yield_percent || 0,
      initialInstruments: details?.initial_instruments || [],
      monthlyInstruments: details?.monthly_instruments || [],
      originalData: goalResult
    };
  });

  useEffect(() => {
    if (editingGoal) {
      const updatedGoal = goalCards.find(g => g.id === editingGoal.id);
      if (updatedGoal) {
        setEditingGoal(updatedGoal);
        const input = updatedGoal.originalData?.goal_input || {};
        const summary = updatedGoal.originalData?.summary || {};
        const details = updatedGoal.originalData?.details || {};
        const newSnapshot: EditFormState = {
          name: updatedGoal.name,
          target_amount: input.target_amount ?? details.target_amount ?? summary.target_amount ?? updatedGoal.targetAmount ?? 0,
          desired_monthly_income: input.desired_monthly_income ?? details.target_amount ?? summary.target_amount ?? 0,
          term_months: input.term_months ?? details.term_months ?? summary.target_months ?? updatedGoal.termMonths ?? 0,
          initial_capital: input.initial_capital ?? summary.initial_capital ?? updatedGoal.initialCapital ?? 0,
          monthly_replenishment: input.monthly_replenishment ?? summary.monthly_replenishment ?? 0,
          ops_capital: input.ops_capital ?? details.ops_capital ?? updatedGoal.originalData?.ops_capital ?? 0,
          ipk_current: input.ipk_current ?? details.state_pension?.ipk_current ?? details.ipk_current ?? updatedGoal.originalData?.ipk_current ?? 0,
          risk_profile: input.risk_profile ?? details.risk_profile ?? summary.risk_profile ?? 'BALANCED',
          inflation_rate: input.inflation_rate ?? details.inflation_rate ?? updatedGoal.originalData?.inflation_rate ?? 0,
        };
        setSnapshotForm(newSnapshot);
        setEditForm(prev => ({ ...prev, monthly_replenishment: newSnapshot.monthly_replenishment }));
      }
    }
  }, [calculationData]);

  useEffect(() => {
    if (!editingGoal || !onRecalculate || isCalculating) return;
    let hasChanges = false;
    Object.keys(editForm).forEach(key => {
      const val = (editForm as any)[key] ?? (typeof (snapshotForm as any)?.[key] === 'number' ? 0 : '');
      const snapVal = (snapshotForm as any)?.[key] ?? (typeof (editForm as any)?.[key] === 'number' ? 0 : '');
      const isChanged = typeof val === 'number' && typeof snapVal === 'number'
        ? Math.abs(val - snapVal) > 1
        : String(val) !== String(snapVal);
      if (isChanged) hasChanges = true;
    });
    if (!hasChanges) return;
    const timer = setTimeout(() => onSubmitEdit(), 1000);
    return () => clearTimeout(timer);
  }, [editForm, snapshotForm, onRecalculate, isCalculating, onSubmitEdit]);

  const taxDeduction2026 = taxBenefitsSummary?.totals?.deduction_2026 || 0;
  const taxCofinancing2026 = taxBenefitsSummary?.totals?.cofinancing_2026 || 0;
  const taxTotalDeduction = taxBenefitsSummary?.totals?.total_deductions || taxPlanningLegacy?.total_deductions || 0;
  const taxTotalCofinancing = taxBenefitsSummary?.totals?.total_cofinancing || 0;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F9FAFB', fontFamily: "'Inter', sans-serif" }}>
      {/* Общий контейнер для выравнивания всей страницы */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', width: '100%' }}>

        {/* Блок ИИ - Full Width within 1200px */}
        <section style={{
          width: '100%',
          marginBottom: '40px',
          background: '#FFFFFF',
          borderRadius: '32px',
          padding: '32px',
          boxShadow: 'var(--shadow-premium)',
          border: '1px solid rgba(0,0,0,0.05)'
        }}>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
            <div style={{ flexShrink: 0 }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                overflow: 'hidden',
                background: '#fff',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '2px solid var(--primary)'
              }}>
                <img src={avatarImage} alt="Victoria" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '300px' }}>
              <div style={{ fontSize: '18px', lineHeight: '1.6', color: '#1e293b', marginBottom: '24px', fontWeight: 500 }}>
                {aiMessage}
                {isAiTyping && <span className="streaming-cursor">|</span>}
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', marginBottom: '24px' }}>
                {['Что такое ПДС?', 'Какие гарантии?', 'Какие риски?', 'Как получить вычет?', 'С чего начать?'].map((q, i) => (
                  <button
                    key={i}
                    style={{
                      padding: '10px 20px',
                      background: 'rgba(255, 199, 80, 0.1)',
                      border: '1px solid rgba(255, 199, 80, 0.2)',
                      borderRadius: '100px',
                      color: '#1e293b',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--primary)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 199, 80, 0.1)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', maxWidth: '600px' }}>
                <input
                  type="text"
                  placeholder="Задайте свой вопрос Виктории..."
                  style={{
                    width: '100%',
                    padding: '16px 60px 16px 24px',
                    borderRadius: '20px',
                    border: '1px solid #e2e8f0',
                    fontSize: '15px',
                    outline: 'none',
                    background: '#f8fafc',
                    boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'
                  }}
                />
                <button style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'var(--primary)',
                  border: 'none',
                  borderRadius: '14px',
                  width: '44px',
                  height: '44px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 10px rgba(255,199,80,0.3)'
                }}>
                  <Send size={20} />
                </button>
              </div>
            </div>
          </div>
        </section>

        <main style={{ width: '100%' }}>
          {/* Портфели */}
          <PortfolioDistribution assetsAllocation={assetsAllocation} cashFlowAllocation={cashFlowAllocation} />

          {/* Налоговое планирование */}
          {(taxTotalDeduction > 0 || taxTotalCofinancing > 0) && (
            <section style={{
              background: '#FFFFFF',
              borderRadius: '24px',
              padding: '24px',
              marginBottom: '40px',
              boxShadow: '0px 4px 6px -1px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '20px', color: '#111827' }}>Налоговое планирование</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Налоговый вычет (всего)</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(taxTotalDeduction)}</div>
                  {taxDeduction2026 > 0 && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>+{formatCurrency(taxDeduction2026)} в 2026 г.</div>}
                </div>
                <div style={{ padding: '20px', background: '#f8fafc', borderRadius: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#64748b', marginBottom: '4px' }}>Гос. софинансирование</div>
                  <div style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a' }}>{formatCurrency(taxTotalCofinancing)}</div>
                  {taxCofinancing2026 > 0 && <div style={{ fontSize: '12px', color: '#10b981', marginTop: '4px' }}>+{formatCurrency(taxCofinancing2026)} в 2026 г.</div>}
                </div>
              </div>
            </section>
          )}

          {/* Сетка целей */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
            {goalCards.map((goal) => (
              <div
                key={goal.id}
                style={{
                  background: `linear-gradient(180deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.8) 100%), url(${getGoalImage(goal.name, goal.goalTypeId || 0)}) center/cover no-repeat`,
                  borderRadius: '24px',
                  padding: '32px',
                  color: '#fff',
                  position: 'relative',
                  minHeight: '280px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-premium)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-8px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div>
                  <h3 style={{ fontSize: '28px', fontWeight: '900', margin: '0 0 12px 0', textShadow: '0 2px 10px rgba(0,0,0,0.5)' }}>{goal.name}</h3>
                </div>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  background: 'rgba(255,255,255,0.06)',
                  backdropFilter: 'blur(10px)',
                  padding: '20px',
                  borderRadius: '24px',
                  border: '1px solid rgba(255,255,255,0.18)'
                }}>
                  {goal.displaySlots.map((slot, idx) => (
                    <div key={idx} onClick={() => openFieldChat(goal, slot)} style={{ cursor: 'pointer', padding: '8px', borderRadius: '12px', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.12)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}>
                      <div style={{ fontSize: '11px', opacity: 0.7, textTransform: 'uppercase', marginBottom: '4px', fontWeight: 600 }}>{slot.label}</div>
                      <div style={{ fontSize: '16px', fontWeight: '800' }}>{slot.value}</div>
                    </div>
                  ))}
                </div>

                {onDeleteGoal && (
                  <button onClick={(e) => { e.stopPropagation(); onDeleteGoal(goal.id); }} style={{
                    position: 'absolute', top: '24px', right: '24px', background: 'rgba(255,255,255,0.15)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', width: '36px', height: '36px', color: '#fff', cursor: 'pointer',
                    backdropFilter: 'blur(4px)'
                  }}>
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            ))}

            <button onClick={() => setIsAddModalOpen(true)} style={{
              borderRadius: '24px', border: '2px dashed #E5E7EB', background: '#F9FAFB', minHeight: '280px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s'
            }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E5E7EB'; e.currentTarget.style.background = '#F9FAFB'; }}>
              <Plus size={32} color="#C2185B" />
              <span style={{ color: '#C2185B', fontSize: '16px', fontWeight: '500' }}>+ Добавить цель</span>
            </button>
          </div>

          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <button onClick={onGoToReport} style={{
              background: '#C2185B', color: '#fff', border: 'none', borderRadius: '100px', padding: '16px 48px',
              fontSize: '16px', fontWeight: '600', cursor: 'pointer', maxWidth: '300px', width: '100%', boxShadow: '0 4px 12px rgba(194,24,91,0.3)'
            }}>
              Перейти в отчет
            </button>
          </div>
        </main>
      </div>

      <AddGoalModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={(g) => { if (onAddGoal) onAddGoal(g); setIsAddModalOpen(false); }} />

      <VictoriaChatModal
        isOpen={isChatModalOpen}
        onClose={() => setIsChatModalOpen(false)}
        goal={editingGoal}
        fieldName={chatField?.name || ''}
        fieldLabel={chatField?.label || ''}
        currentValue={chatField?.value}
        onUpdate={(val) => {
          if (editingGoal && chatField) {
            setEditForm(prev => ({ ...prev, [chatField.name]: val }));
            onSubmitEdit();
          }
        }}
      />
    </div>
  );
};

export default ResultPageDesign;
