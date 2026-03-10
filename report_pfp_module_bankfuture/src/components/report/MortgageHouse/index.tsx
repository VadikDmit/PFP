import { useEffect, useState } from 'react';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler, type ChartData } from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ReportTarget } from '@/types/report';
import ReportLayout from '@/layout/report';
import options, { datasetsOptions } from '@/constants/chart';
import mortgageImg from '@/assets/images/report/mortgage/cover.jpg';
import style from '../style.module.scss';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);
type GoalReportType = { number: number; target: ReportTarget };

const MortgageHouseReportComponent = ({ number, target }: GoalReportType) => {
    const [capitalGrowthChart, setCapitalGrowthChart] = useState<{ value: number; date: string }[]>([]);

    useEffect(() => {
        if (!target.months) return;
        const chartData: { value: number; date: string }[] = [];
        let balance = (target.cost || 0) - (target.initialCapital || 0);
        for (let i = 0; i < target.months; i++) {
            const d = new Date(); d.setUTCMonth(i + d.getMonth());
            if (i !== 0 && target.mortgageRate) balance -= ((target.initialReplenishment || 0) - (balance * target.mortgageRate / 1200));
            chartData.push({ value: Math.floor(balance * -1), date: d.toLocaleDateString('ru-RU') });
        }
        setCapitalGrowthChart(chartData);
    }, []);

    const dataChart: ChartData<'line'> = { labels: capitalGrowthChart.map((d) => d.date), datasets: [{ data: capitalGrowthChart.map((d) => d.value), ...datasetsOptions }] };
    const fmt = (val: number) => (val || 0).toLocaleString('ru-RU', { style: 'currency', currency: target.currency || 'RUB', maximumFractionDigits: 0 }).replace(/^(\D+)/, '$1 ').replace('CN', '');

    return (
        <ReportLayout title='Ипотека на дом' number={`${number}`} isTarget>
            <div className={style.container} style={{ marginBlockStart: 30 }}>
                <div className={style.top_container}>
                    <div className={style.top} style={{ width: 'min-content', marginInlineEnd: 30 }}>
                        <div className={`${style.top_img} ${style.top_img__mortgage}`} style={{ backgroundImage: `url(${mortgageImg.src})` }} />
                    </div>
                    <div className={`${style.top} ${style.top__morgage}`}>
                        <nav className={style.top__list}>
                            <ul>
                                <li className={style.top__list_item}><span className={style.top__list_item_text}>Стоимость цели</span><span className={style.top__list_item_text__blue}>{fmt(target.cost || 0)}</span></li>
                                <li className={style.top__list_item}><span className={style.top__list_item_text}>Первоначальный взнос</span><span className={style.top__list_item_text__blue}>{fmt(target.initialCapital || 0)}</span></li>
                                <li className={style.top__list_item}><span className={style.top__list_item_text}>Сумма кредита</span><span className={style.top__list_item_text__blue}>{fmt((target.cost || 0) - (target.initialCapital || 0))}</span></li>
                                <li className={style.top__list_item}><span className={style.top__list_item_text}>Срок кредита</span><span className={style.top__list_item_text__blue}>{`${target.months / 12} лет`}</span></li>
                                <li className={style.top__list_item}><span className={style.top__list_item_text}>Ставка</span><span className={style.top__list_item_text__blue}>{`${target.mortgageRate || 0}%`}</span></li>
                                <li className={style.top__list_item}><span className={style.top__list_item_text}>Ежемесячный платеж</span><span className={style.top__list_item_text__blue}>{fmt(target.initialReplenishment || 0)}</span></li>
                            </ul>
                        </nav>
                    </div>
                </div>
            </div>
            <div className={style.footer} style={{ marginBlockStart: 30, alignItems: 'flex-start' }}>
                <div className={style.footer_chart}><Line data={dataChart} options={options} /></div>
                <ul className={style.footer__list} style={{ width: '100%', marginBlockEnd: 40 }}>
                    <li className={style.footer__list_item}><p style={{ textAlign: 'left' }}>Всего выплачено % по кредиту</p><span style={{ textAlign: 'left', color: '#B12087' }}>{((target.initialReplenishment || 0) * target.months - ((target.cost || 0) - (target.initialCapital || 0))).toLocaleString('ru-RU', { style: 'currency', currency: target.currency || 'RUB', maximumFractionDigits: 0 })}</span></li>
                </ul>
            </div>
        </ReportLayout>
    );
};

export default MortgageHouseReportComponent;
