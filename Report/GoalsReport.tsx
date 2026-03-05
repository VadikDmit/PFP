import React from 'react';
import './GoalsReport.css';
import avatarImage from '../src/assets/avatar_full.png';
import { getGoalImage } from '../src/utils/GoalImages';

export interface GoalReportItem {
  id: number;
  name: string;
  targetAmount?: number;
  initialCapital?: number;
  monthlyPayment?: number;
  termMonths?: number;
  displaySlots?: { label: string; value: string }[];
  goalTypeId?: number;
  yieldPercent?: number;
  achievementDate?: string;
  /** Год достижения цели (для градиентного блока) */
  achievementYear?: number;
  /** Итоговый капитал к концу срока (для блока «ты получишь») */
  projectedCapital?: number;
  /** Данные для графика: собственные средства, прочий доход, итого (в руб.) */
  chartValues?: { own: number; other: number; total: number };
}

export interface GoalsReportProps {
  clientName?: string;
  client?: { id?: number; first_name?: string; last_name?: string; [key: string]: unknown };
  goalsSummary?: { goals?: unknown[]; success_probability?: number };
  goalCards?: GoalReportItem[];
  reportDate?: string;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('ru-RU', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value) + ' ₽';

const CHART_MAX_RUB = 20_000_000;
const CHART_TICKS = [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20]; // млн для подписей оси

const defaultCoverImage = '/Report/assets/cover-goals.png';

export const GoalsReport: React.FC<GoalsReportProps> = ({
  clientName,
  client,
  goalsSummary,
  goalCards = [],
  reportDate = new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
}) => {
  const name = clientName || [client?.first_name, client?.last_name].filter(Boolean).join(' ') || 'Клиент';
  const clientId = client?.id != null ? `# ${client.id}` : '';
  const goals = goalCards.length > 0
    ? goalCards
    : (goalsSummary?.goals as GoalReportItem[]) || [];

  const coverDate = reportDate.endsWith('г.') ? reportDate : `${reportDate}г.`;

  return (
    <div className="goals-report">
      {/* Обложка A4: фон из assets, логотип по центру, блок с заголовком и датой внизу */}
      <header className="goals-report__cover">
        <div className="goals-report__cover-bg" />
        <div className="goals-report__cover-logo-center">
          <img src="/Report/assets/logo.png" alt="Bank Future" className="goals-report__cover-logo" />
        </div>
        <div className="goals-report__cover-title-block">
          <h1 className="goals-report__cover-title">
            <span>ПЕРСОНАЛЬНОЕ</span>
            <span>ФИНАНСОВОЕ</span>
            <span>РЕШЕНИЕ</span>
          </h1>
          <p className="goals-report__cover-date">{coverDate}</p>
        </div>
      </header>

      {/* Каждая цель — отдельная страница в формате с картинки */}
      {goals.map((goal: GoalReportItem, index: number) => (
        <section key={goal.id ?? index} className="goals-report__goal-page">
          <div className="goals-report__goal-inner">
            {/* Шапка: аватар + номер цели + название + дата достижения */}
            <div className="goals-report__goal-header">
              <img src={avatarImage} alt="" className="goals-report__goal-avatar" />
              <div className="goals-report__goal-header-text">
                <h2 className="goals-report__goal-title">Цель {index + 1}. {goal.name}</h2>
                {goal.achievementDate && (
                  <p className="goals-report__goal-date">Дата достижения — {goal.achievementDate}г.</p>
                )}
              </div>
            </div>

            {/* Блок: слева — инструкции, справа — картинка */}
            <div className="goals-report__goal-instructions-row">
              <div className="goals-report__goal-instructions">
                <h3 className="goals-report__goal-instructions-title">Для достижения цели необходимо:</h3>
                <ol className="goals-report__goal-instructions-list">
                  {goal.initialCapital != null && goal.initialCapital > 0 && (
                    <li>Открыть портфель на сумму {formatCurrency(goal.initialCapital)}, представленный ниже.</li>
                  )}
                  {goal.monthlyPayment != null && goal.monthlyPayment > 0 && (
                    <li>Пополнять на {formatCurrency(goal.monthlyPayment)} ежемесячно.</li>
                  )}
                  <li>Раз в полгода актуализировать финансовый план.</li>
                </ol>
              </div>
              <div
                className="goals-report__goal-picture"
                style={{ backgroundImage: `url(${getGoalImage(goal.name, goal.goalTypeId ?? 0)})` }}
              />
            </div>

            {/* Градиентный блок: итог по реальным данным + «Из них» */}
            <div className="goals-report__goal-summary-block">
              <p className="goals-report__goal-summary-main">
                В {goal.achievementYear ?? (goal.achievementDate?.match(/\d{4}/)?.[0]) ?? 'целевой'} году ты получишь — {formatCurrency(goal.projectedCapital ?? goal.targetAmount ?? 0)}
              </p>
              {(goal.displaySlots?.length ?? 0) > 0 && (
                <>
                  <p className="goals-report__goal-summary-caption">Из них:</p>
                  <ul className="goals-report__goal-summary-list">
                    {goal.displaySlots!.map((slot, i) => (
                      <li key={i}>
                        <span>{slot.label}</span>
                        <span>{slot.value}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>

            {/* Доходность */}
            {goal.yieldPercent != null && goal.yieldPercent > 0 && (
              <div className="goals-report__goal-yield">
                <span className="goals-report__goal-yield-label">
                  Прогнозное значение доходности Программы долгосрочных сбережений
                </span>
                <span className="goals-report__goal-yield-value">{goal.yieldPercent.toFixed(1)}% годовых</span>
              </div>
            )}

            {/* График достижения цели: ось 0–20 млн ₽, пунктирная сетка, три столбца справа */}
            <div className="goals-report__goal-chart">
              <h3 className="goals-report__goal-chart-title">График достижения цели с учётом пополнения</h3>
              <div className="goals-report__goal-chart-placeholder">
                <div className="goals-report__goal-chart-y-axis">
                  {CHART_TICKS.slice().reverse().map((million) => (
                    <div key={million} className="goals-report__goal-chart-tick">
                      {million === 0 ? '0₽' : formatCurrency(million * 1_000_000)}
                    </div>
                  ))}
                </div>
                <div className="goals-report__goal-chart-area">
                  <div className="goals-report__goal-chart-grid">
                    {CHART_TICKS.map((_, i) => (
                      <div key={i} className="goals-report__goal-chart-grid-line" />
                    ))}
                  </div>
                  <div className="goals-report__goal-chart-bars">
                    {goal.chartValues && goal.chartValues.total > 0 ? (
                      <>
                        <div
                          className="goals-report__goal-chart-bar goals-report__goal-chart-bar--own"
                          style={{ height: `${Math.min(100, (goal.chartValues.own / CHART_MAX_RUB) * 100)}%` }}
                          title={formatCurrency(goal.chartValues.own)}
                        />
                        <div
                          className="goals-report__goal-chart-bar goals-report__goal-chart-bar--other"
                          style={{ height: `${Math.min(100, (goal.chartValues.other / CHART_MAX_RUB) * 100)}%` }}
                          title={formatCurrency(goal.chartValues.other)}
                        />
                        <div
                          className="goals-report__goal-chart-bar goals-report__goal-chart-bar--total"
                          style={{ height: `${Math.min(100, (goal.chartValues.total / CHART_MAX_RUB) * 100)}%` }}
                          title={formatCurrency(goal.chartValues.total)}
                        />
                      </>
                    ) : (
                      <>
                        <div
                          className="goals-report__goal-chart-bar goals-report__goal-chart-bar--own"
                          style={{ height: goal.initialCapital != null ? `${Math.min(100, (goal.initialCapital / CHART_MAX_RUB) * 100)}%` : '25%' }}
                        />
                        <div
                          className="goals-report__goal-chart-bar goals-report__goal-chart-bar--other"
                          style={{ height: goal.targetAmount != null && goal.initialCapital != null ? `${Math.min(100, (Math.max(0, goal.targetAmount - goal.initialCapital) / CHART_MAX_RUB) * 100)}%` : '55%' }}
                        />
                        <div
                          className="goals-report__goal-chart-bar goals-report__goal-chart-bar--total"
                          style={{ height: goal.targetAmount != null ? `${Math.min(100, (goal.targetAmount / CHART_MAX_RUB) * 100)}%` : '87%' }}
                        />
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="goals-report__goal-chart-legend">
                <span><i className="goals-report__legend-swatch goals-report__legend-swatch--magenta" /> Собственные средства{goal.chartValues ? ` — ${formatCurrency(goal.chartValues.own)}` : ''}</span>
                <span><i className="goals-report__legend-swatch goals-report__legend-swatch--dark" /> Процентный доход, софинансирование, налоговые вычеты{goal.chartValues ? ` — ${formatCurrency(goal.chartValues.other)}` : ''}</span>
                <span><i className="goals-report__legend-swatch goals-report__legend-swatch--light" /> Итого капитал{goal.chartValues ? ` — ${formatCurrency(goal.chartValues.total)}` : ''}</span>
              </div>
            </div>

            <p className="goals-report__goal-disclaimer">* — Дисклеймер</p>
          </div>
        </section>
      ))}

      {/* Декларация о рисках ПДС — отдельная страница */}
      <section className="goals-report__risk-page">
        <h2 className="goals-report__risk-title">
          Декларация о рисках программы
          <br />
          долгосрочных сбережений (ПДС)
        </h2>
        <div className="goals-report__risk-section">
          <h3 className="goals-report__risk-section-header">1. Инфляционный риск</h3>
          <div className="goals-report__risk-content">
            <p className="goals-report__risk-subhead">Суть риска:</p>
            <p className="goals-report__risk-text">
              В финансовом плане учтен прогноз по инфляции, однако фактическая инфляция может оказаться выше или ниже запланированной. Это создает следующие риски:
            </p>
            <ul className="goals-report__risk-list">
              <li><em>Если инфляция выше ожидаемой:</em> снижение реальной доходности инвестиций, уменьшение покупательной способности сбережений, рост расходов сверх запланированного бюджета.</li>
              <li><em>Если инфляция ниже ожидаемой:</em> возможное избыточное накопление ликвидности в одной цели и недофинансирование других целей.</li>
            </ul>
            <p className="goals-report__risk-subhead">Меры снижения риска:</p>
            <p className="goals-report__risk-text">
              Регулярный пересмотр финансового плана (раз в полгода) с корректировкой:
            </p>
            <ul className="goals-report__risk-list">
              <li><em>Прогноза инфляции с учетом актуальных данных</em></li>
              <li><em>Стоимости цели</em></li>
              <li><em>Индексации пополнения</em></li>
            </ul>
          </div>
        </div>

        <div className="goals-report__risk-section">
          <h3 className="goals-report__risk-section-header">2. Риск банкротства НПФ</h3>
          <div className="goals-report__risk-content">
            <p className="goals-report__risk-subhead">Суть риска:</p>
            <p className="goals-report__risk-text">
              НПФ — это организация, управляющая пенсионными накоплениями и выплатами клиентов. Теоретически существует риск его банкротства, что может привести к:
            </p>
            <ul className="goals-report__risk-list">
              <li>Заморозке или задержке выплат пенсионных накоплений.</li>
              <li>Потере капитала.</li>
              <li>Частичной потере инвестиционного дохода (если фонд работал с высокорисковыми активами).</li>
              <li>Необходимости перевода пенсионных прав в другой фонд (если ЦБ отзывает лицензию).</li>
            </ul>
            <p className="goals-report__risk-subhead">Факторы, снижающие вероятность риска:</p>
            <p className="goals-report__risk-label">1. Жесткий государственный контроль:</p>
            <ul className="goals-report__risk-list">
              <li>ЦБ РФ регулирует деятельность НПФ, устанавливает требования к капиталу и инвестиционным портфелям.</li>
              <li>Обязательное размещение резервов в консервативные активы (гособлигации, высоконадежные корпоративные облигации).</li>
            </ul>
            <p className="goals-report__risk-label">Система гарантирования пенсионных накоплений:</p>
            <ul className="goals-report__risk-list">
              <li>Агентство по страхованию вкладов (АСВ) гарантирует возврат до 2,8 млн руб. в случае отзыва лицензии у НПФ.</li>
              <li>Если накопления превышают эту сумму, остаток может быть восстановлен в другом фонде.</li>
            </ul>
            <p className="goals-report__risk-label">Ограничения на рискованные инвестиции:</p>
            <ul className="goals-report__risk-list">
              <li>НПФ не могут вкладывать средства в высокорисковые активы (акции с низкой ликвидностью, криптовалюты, производные инструменты).</li>
              <li>Основная часть портфеля — ОФЗ, корпоративные облигации 1-2 эшелона, банковские депозиты.</li>
            </ul>
            <p className="goals-report__risk-subhead">Меры снижения риска:</p>
            <ul className="goals-report__risk-list">
              <li>Выбор НПФ с высоким рейтингом надежности (по данным ЦБ, рейтинговых агентств).</li>
              <li>Контроль за изменениями в регулировании (новые законы, требования ЦБ).</li>
              <li>Открытие нескольких счетов ПДС в разных фондах.</li>
            </ul>
          </div>
        </div>

        <div className="goals-report__risk-section">
          <h3 className="goals-report__risk-section-header">3. Риск дефолта государства по облигациям федерального займа (ОФЗ)</h3>
          <div className="goals-report__risk-content">
            <p className="goals-report__risk-subhead">Суть риска:</p>
            <p className="goals-report__risk-text">
              Дефолт по ОФЗ — это отказ Министерства финансов РФ исполнять обязательства по выплате купонного дохода или погашению номинала облигаций.
            </p>
            <p className="goals-report__risk-subhead">Факторы, влияющие на вероятность дефолта:</p>
            <p className="goals-report__risk-label">1. Уровень госдолга:</p>
            <p className="goals-report__risk-text">
              Отношение госдолга к ВВП России (~20% в 2024 г.) существенно ниже критических уровней (для сравнения: США — ~120%, Япония — ~260%).
            </p>
            <p className="goals-report__risk-label">Платежеспособность государства:</p>
            <ul className="goals-report__risk-list">
              <li>Основные источники погашения: нефтегазовые доходы, налоговые поступления.</li>
              <li>Наличие золотовалютных резервов.</li>
            </ul>
            <p className="goals-report__risk-label">Ограничения на рискованные инвестиции:</p>
            <ul className="goals-report__risk-list">
              <li>НПФ не могут вкладывать средства в высокорисковые активы (акции с низкой ликвидностью, криптовалюты, производные инструменты).</li>
              <li>Основная часть портфеля — ОФЗ, корпоративные облигации 1-2 эшелона, банковские депозиты.</li>
            </ul>
            <p className="goals-report__risk-subhead">Факторы снижения риска:</p>
            <p className="goals-report__risk-label">Суверенная денежная эмиссия:</p>
            <ul className="goals-report__risk-list">
              <li>Россия выпускает ОФЗ в национальной валюте (рубли).</li>
              <li>Технически может всегда напечатать деньги для погашения долга (риск — гиперинфляция, но не дефолт).</li>
            </ul>
            <p className="goals-report__risk-label">Структура держателей ОФЗ:</p>
            <ul className="goals-report__risk-list">
              <li>Основные владельцы — российские банки, НПФ, страховые компании и ЦБ РФ (&gt;70%).</li>
              <li>Низкая зависимость от иностранных кредиторов.</li>
            </ul>
            <p className="goals-report__risk-label">Политические факторы:</p>
            <ul className="goals-report__risk-list">
              <li>Дефолт разрушит доверие к финансовой системе.</li>
              <li>Власти будут любой ценой избегать формального дефолта.</li>
            </ul>
            <p className="goals-report__risk-subhead">Вывод:</p>
            <ul className="goals-report__risk-list">
              <li><em>Вероятность дефолта:</em> Минимальная.</li>
              <li><em>Основная защита:</em> Фактическая невозможность дефолта в национальной валюте при сохранении контроля над денежной эмиссией.</li>
            </ul>
            <p className="goals-report__risk-text">
              Для российских инвесторов ОФЗ остаются инструментом с максимальной надежностью в рублевом сегменте. Альтернативы с сопоставимым уровнем защиты капитала отсутствуют (депозиты в банках считаются чуть менее надежными, чем ОФЗ).
            </p>
          </div>
        </div>

        <div className="goals-report__risk-section">
          <h3 className="goals-report__risk-section-header">4. Риски инвестирования в акции российских компаний</h3>
          <div className="goals-report__risk-content">
            <p className="goals-report__risk-subhead">Суть риска:</p>
            <p className="goals-report__risk-text">
              НПФ могут вкладывать средства в акции только в пределах, установленных Банком России.
            </p>
            <p className="goals-report__risk-label">Основные риски:</p>
            <ul className="goals-report__risk-list">
              <li><em>Рыночная волатильность</em> — стоимость акций может резко снижаться из-за экономических кризисов, санкций или ухудшения финансовых показателей компаний.</li>
              <li><em>Ограниченная диверсификация</em> — из-за регуляторных ограничений НПФ не могут свободно распределять активы между разными секторами.</li>
              <li><em>Низкая ликвидность отдельных бумаг</em> — некоторые акции могут быть труднореализуемыми при необходимости срочного выхода.</li>
            </ul>
            <p className="goals-report__risk-subhead">Факторы, снижающие риск:</p>
            <ul className="goals-report__risk-list">
              <li><em>Жесткие требования ЦБ</em> — НПФ могут вкладывать только в акции крупных и ликвидных компаний (голубые фишки, индекс МосБиржи).</li>
              <li><em>Лимиты на долю акций</em> — обычно не более 7% портфеля, что ограничивает потенциальные потери.</li>
              <li><em>Диверсификация портфеля акций</em> — инвестирование в акции разных компаний из различных секторов экономики (финансы, нефтегаз, IT, потребительские товары и др.).</li>
            </ul>
            <p className="goals-report__risk-subhead">Вывод:</p>
            <p className="goals-report__risk-text">
              НПФ при инвестировании в акции компаний применяют комплексный подход к управлению рисками, сочетая диверсификацию, строгий отбор эмитентов, соблюдение регуляторных ограничений и использование защитных стратегий. Основная цель — минимизировать потери при рыночных колебаниях, обеспечивая при этом долгосрочный рост пенсионных накоплений. За счет консервативной инвестиционной политики и контроля со стороны Банка России НПФ снижают вероятность значительных убытков, сохраняя баланс между доходностью и надежностью.
            </p>
          </div>
        </div>

        <div className="goals-report__risk-section">
          <h3 className="goals-report__risk-section-header">5. Риски инвестирования НПФ в корпоративные облигации</h3>
          <div className="goals-report__risk-content">
            <p className="goals-report__risk-subhead">Основные риски:</p>
            <ul className="goals-report__risk-list">
              <li><em>Кредитный риск</em> — вероятность дефолта эмитента и невыплаты купонов/номинала.</li>
              <li><em>Риск ликвидности</em> — сложность продажи бумаг без потери стоимости.</li>
              <li><em>Процентный риск</em> — снижение рыночной цены облигаций при росте ключевой ставки.</li>
            </ul>
            <p className="goals-report__risk-subhead">Факторы снижения рисков НПФ:</p>
            <ul className="goals-report__risk-list">
              <li>Отбор эмитентов с высоким кредитным рейтингом.</li>
              <li>Диверсификация по секторам/эмитентам.</li>
              <li>Контроль дюрации (сроков погашения).</li>
              <li>Соблюдение нормативов ЦБ РФ.</li>
              <li>Мониторинг ликвидности и макроэкономической ситуации.</li>
            </ul>
            <p className="goals-report__risk-subhead">Вывод:</p>
            <p className="goals-report__risk-text">
              НПФ минимизируют риски за счет консервативного подхода и регулирования, сохраняя баланс между доходностью и надежностью.
            </p>
          </div>
        </div>
      </section>

      <footer className="goals-report__footer">
        <p>Сформировано в BankFuture. Данные носят информационный характер.</p>
      </footer>
    </div>
  );
};

export default GoalsReport;
