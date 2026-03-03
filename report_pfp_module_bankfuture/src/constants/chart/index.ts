import type { ChartOptions } from 'chart.js';

const options: ChartOptions<'line'> = {
    plugins: {
        legend: { display: false },
        tooltip: {
            backgroundColor: '#333',
            titleFont: { size: 10 },
            bodyFont: { size: 10 },
        },
        decimation: {
            enabled: true,
            algorithm: 'lttb',
            samples: 20,
        },
    },
    responsive: true,
    aspectRatio: 3,
    scales: {
        y: {
            ticks: {
                callback: (value) => Number(value).toLocaleString('ru-RU', {
                    style: 'currency',
                    currency: 'RUB',
                    maximumFractionDigits: 0,
                }),
                font: { size: 8 },
            },
            grid: { display: true },
        },
        x: {
            ticks: {
                maxTicksLimit: 2,
                font: { size: 8 },
            },
            grid: { display: false },
        },
    },
    locale: 'ru-RU',
};

export const datasetsOptions = {
    borderColor: '#FFC759',
    tension: 0.3,
    fill: false,
    pointRadius: 0,
    borderWidth: 2,
};

export default options;
