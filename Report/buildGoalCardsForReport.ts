import type { GoalReportItem } from './GoalsReport';
import { formatMonthsToDate } from '../src/utils/dateUtils';
import { GOAL_GALLERY_ITEMS } from '../src/utils/GoalImages';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ' ₽';

export function buildGoalCardsForReport(
  goalsSummary: { goals?: any[] },
  client?: { goals?: { id?: number; name?: string; goal_type_id?: number }[] } | null
): GoalReportItem[] {
  const rawGoals = goalsSummary?.goals || [];
  return rawGoals.map((goalResult: any, index: number) => {
    const summary = goalResult?.summary || {};
    const details = goalResult?.details || {};
    const typeId = goalResult?.goal_type_id || 0;
    const fmt = (val: number | undefined) => (val !== undefined ? formatCurrency(val) : '0 ₽');
    const fmtDate = (months: number | undefined) => (months ? formatMonthsToDate(months) : '-');
    let displaySlots: { label: string; value: string }[] = [];

    switch (typeId) {
      case 1:
      case 2:
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
      case 9:
      case 10:
      case 11:
      case 4:
      case 14:
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

    const defaultTitle = GOAL_GALLERY_ITEMS.find((i) => i.typeId === typeId)?.title;
    const mappedGoal = client?.goals?.find((g: any) => g.id === goalResult.goal_id) || client?.goals?.[index];
    const displayName = mappedGoal?.name || goalResult.goal_name || goalResult.name || defaultTitle || 'Цель';

    const termMonths = details?.term_months ?? summary?.term_months ?? summary?.target_months ?? 0;
    let achievementDate = '';
    let achievementYear: number | undefined;
    if (termMonths) {
      const d = new Date();
      d.setMonth(d.getMonth() + termMonths);
      achievementDate = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
      achievementYear = d.getFullYear();
    }

    const initialCapital = summary?.initial_capital ?? 0;
    const projectedCapital = summary?.projected_capital_at_end ?? summary?.target_amount ?? details?.target_capital_required ?? details?.target_amount ?? summary?.target_amount_initial ?? 0;
    const totalForChart = projectedCapital > 0 ? projectedCapital : (summary?.target_amount_initial ?? 0);
    const ownForChart = initialCapital;
    const otherForChart = Math.max(0, totalForChart - ownForChart);

    return {
      id: goalResult?.goal_id ?? index,
      name: displayName,
      targetAmount: details.target_capital_required ?? details.target_amount ?? summary.target_amount ?? summary.target_amount_initial ?? projectedCapital ?? 0,
      initialCapital,
      monthlyPayment: summary?.monthly_replenishment ?? summary.monthly_payment ?? 0,
      termMonths,
      displaySlots,
      goalTypeId: typeId,
      yieldPercent: goalResult?.accumulation_yield_percent ?? details?.accumulation_yield_percent ?? undefined,
      achievementDate,
      achievementYear,
      projectedCapital: projectedCapital > 0 ? projectedCapital : undefined,
      chartValues: totalForChart > 0 ? { own: ownForChart, other: otherForChart, total: totalForChart } : undefined,
    };
  });
}
