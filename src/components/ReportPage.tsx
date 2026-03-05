import React, { useState, useEffect } from 'react';
import { clientApi } from '../api/clientApi';
import { GoalsReport } from '../../Report';
import { buildGoalCardsForReport } from '../../Report/buildGoalCardsForReport';

interface ReportPageProps {
  clientId: number;
  onBack: () => void;
  /** Данные плана с экрана результата — показываем при 404 вместо пустой ошибки */
  fallbackPlan?: { client?: any; goalsSummary?: any } | null;
}

const ReportPage: React.FC<ReportPageProps> = ({ clientId, onBack, fallbackPlan }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [is404, setIs404] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        setIs404(false);
        const result = await clientApi.getReport(clientId);
        if (!cancelled) setData(result);
      } catch (err: any) {
        if (!cancelled) {
          const status = err.response?.status;
          const msg = err.response?.data?.error || err.message || 'Не удалось загрузить отчёт';
          setError(String(msg));
          setIs404(status === 404);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [clientId]);

  if (loading) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center' }}>
        <div className="animate-spin" style={{ width: '40px', height: '40px', margin: '0 auto 16px', border: '3px solid #f3f4f6', borderTopColor: 'var(--primary)', borderRadius: '50%' }} />
        <p style={{ color: '#64748b' }}>Загрузка отчёта...</p>
      </div>
    );
  }

  // 404: эндпоинт отчёта на бэкенде отсутствует — показываем отчёт по целям из данных плана
  if (error && is404 && fallbackPlan && (fallbackPlan.client || fallbackPlan.goalsSummary)) {
    const goalCards = buildGoalCardsForReport(fallbackPlan.goalsSummary || {}, fallbackPlan.client);
    const hasGoals = goalCards.length > 0;
    return (
      <div style={{ padding: '24px', maxWidth: '960px', margin: '0 auto', background: '#f8f9fa', minHeight: '100%' }}>
        <button
          type="button"
          onClick={onBack}
          style={{ marginBottom: '24px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '14px' }}
        >
          ← Назад к плану
        </button>
        {hasGoals ? (
          <GoalsReport
            client={fallbackPlan.client}
            goalsSummary={fallbackPlan.goalsSummary}
            goalCards={goalCards}
          />
        ) : (
          <>
            <p style={{ color: '#64748b', marginBottom: '16px', fontSize: '14px' }}>
              На сервере пока нет отдельного эндпоинта отчёта. Данных по целям для отчёта нет.
            </p>
            <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '24px', overflow: 'auto' }}>
              <pre style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                {JSON.stringify({ client: fallbackPlan.client, goals_summary: fallbackPlan.goalsSummary }, null, 2)}
              </pre>
            </div>
          </>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '48px 24px', textAlign: 'center', maxWidth: '520px', margin: '0 auto' }}>
        <p style={{ color: '#dc2626', marginBottom: '8px', fontWeight: 600 }}>Не удалось загрузить отчёт</p>
        <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '14px' }}>{error}</p>
        <button
          type="button"
          onClick={onBack}
          style={{ padding: '10px 20px', borderRadius: '12px', border: 'none', background: 'var(--primary)', color: '#fff', cursor: 'pointer', fontWeight: 600 }}
        >
          Назад к плану
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <button
        type="button"
        onClick={onBack}
        style={{ marginBottom: '24px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', fontSize: '14px' }}
      >
        ← Назад к плану
      </button>
      <div style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', padding: '24px', overflow: 'auto' }}>
        <pre style={{ margin: 0, fontSize: '13px', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default ReportPage;
