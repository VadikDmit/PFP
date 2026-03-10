# Report PFP Module

Модуль генерации PDF-отчётов для персонального финансового планирования (ПФП).
Рендерит многостраничный финансовый отчёт с графиками, таблицами портфелей и визуализацией целей.

## Quick Start

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000) — landing page с ссылками на отчёты.
Откройте [http://localhost:3000/report](http://localhost:3000/report) — полный демо-отчёт с mock-данными.

## Архитектура

```
src/
├── context/ReportContext.tsx       # React Context (DataProvider → компоненты)
├── types/
│   ├── report.ts                  # Типы данных (ReportTarget, PortfolioItem, etc.)
│   └── dataProvider.ts            # Интерфейс ReportDataProvider
├── data/mockProvider.ts           # Демо-данные (заменить для продакшена)
├── pages/
│   ├── report/index.tsx           # Полный отчёт
│   └── mini-report/index.tsx      # Упрощённый отчёт
├── components/report/             # 40+ компонентов секций отчёта
├── layout/report/                 # A4 layout wrapper
├── constants/                     # Конфигурация графиков, названия целей
└── assets/                        # Изображения, стили, SVG
```

## Интеграция

### 1. Реализуйте `ReportDataProvider`

Интерфейс находится в `src/types/dataProvider.ts`. Ключевые методы:

| Метод | Описание |
|-------|----------|
| `getTargets()` | Финансовые цели клиента |
| `getPortfolio(targetKey)` | Портфель для конкретной цели |
| `getCustomer()` | Информация о клиенте |
| `getTaxPlanning()` | Данные налогового планирования |
| `getTools()` | Доступные инвестиционные продукты |
| `getRiskProfileLabel()` | Определение риск-профиля |

### 2. Подключите провайдер

```tsx
import { ReportProvider } from '@/context/ReportContext';
import { myBackendProvider } from './myProvider';

<ReportProvider provider={myBackendProvider}>
  <Component />
</ReportProvider>
```

### 3. Типы целей

Модуль поддерживает 25+ типов финансовых целей:
- Пенсия, Инвестиции, Накопление капитала
- Недвижимость (квартира, дом, ипотека)
- Образование (+ комбинированные цели)
- Страхование, Финансовый резерв
- Рефинансирование кредитов, Налоговое планирование

## PDF Export

Встроен через `react-to-print`. Кнопка "Сохранить PDF" на странице отчёта вызывает диалог печати браузера.

## Стек

- **Next.js 13** (Pages Router) + TypeScript
- **bizcharts** — круговые диаграммы (DonutChart)
- **chart.js + react-chartjs-2** — линейные графики роста капитала
- **react-apexcharts** — столбчатые диаграммы
- **SCSS Modules** + Tailwind CSS — стилизация
- **MUI + Ant Design** — UI-компоненты

## Стилизация

SCSS Modules — основной подход. Vendor-миксины автоматически подключаются через `next.config.js` (`sassOptions.prependData`).
Tailwind используется для утилитарных классов.

## Лицензия

Proprietary. Все права защищены.
