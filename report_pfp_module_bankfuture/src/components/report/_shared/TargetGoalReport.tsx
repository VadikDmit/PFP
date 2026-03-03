import { useEffect, useState } from 'react';
import {
    Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler, type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useReport } from '@/context/ReportContext';
import { ReportTarget, PortfolioItem } from '@/types/report';
import ReportLayout from '@/layout/report';
import options, { datasetsOptions } from '@/constants/chart';
import styleG from '../style.module.scss';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

type TargetGoalReportProps = {
    number: number;
    target: ReportTarget;
    title: string;
    coverImgSrc?: string;
};

const TargetGoalReport = ({ number, target, title, coverImgSrc }: TargetGoalReportProps) => {
    const { getPortfolio } = useReport();
    const [portfolioInitial, setPortfolioInitial] = useState<PortfolioItem[]>([]);
    const [portfolioReplenishment, setPortfolioReplenishment] = useState<PortfolioItem[]>([]);
    const [capitalGrowthChart, setCapitalGrowthChart] = useState<{ value: number; date: string }[]>([]);
    const [riskScoreTotal, setRiskScoreTotal] = useState(0);

    useEffect(() => {
        if (target.capitalRaising?.length) {
            const chartData = target.capitalRaising.map((item, index) => {
                const dayNow = new Date();
                dayNow.setUTCMonth(index + dayNow.getMonth());
                return { value: Math.floor(item), date: dayNow.toLocaleDateString('ru-RU') };
            });
            setCapitalGrowthChart(chartData);
        }
        if (target.key) {
            getPortfolio(target.key).then(({ initialCapital, monthlyReplenishment }) => {
                setPortfolioInitial(initialCapital);
                setPortfolioReplenishment(monthlyReplenishment);
                const score = initialCapital.reduce((acc, item) => acc + (item.share / 100) * 2.5, 0);
                setRiskScoreTotal(score);
            });
        }
    }, []);

    const dataChart: ChartData<'line'> = {
        labels: capitalGrowthChart.map((d) => d.date),
        datasets: [{ data: capitalGrowthChart.map((d) => d.value), ...datasetsOptions }],
    };

    const fmt = (val: number, cur?: string) => (val || 0).toLocaleString('ru-RU', {
        style: 'currency', currency: cur || 'RUB', maximumFractionDigits: 0,
    }).replace(/^(\D+)/, '$1 ').replace('CN', '');

    const fmtTool = (sum: number, cur?: string) => Number(sum).toLocaleString('ru-RU', {
        style: 'currency', currency: cur || 'RUB', maximumFractionDigits: 0,
    }).replace(/^(\D+)/, '$1 ').replace('CN', '');

    return (
        <ReportLayout title={title} number={`${number}`} isTarget months={target.months} riskScoreTotal={riskScoreTotal}>
            <div className={styleG.container} style={{ alignItems: 'center' }}>
                <div className={styleG.top}>
                    <ul className={styleG.top__list}>
                        <li className={styleG.top__list_item}>
                            <span className={styleG.top__list_item_text}>{'Стоимость цели\nв сегодняшних деньгах'}</span>
                            <span className={styleG.top__list_item_text__blue}>{fmt(target.cost || 0, target.currency)}</span>
                        </li>
                        <li className={styleG.top__list_item}>
                            <span className={styleG.top__list_item_text}>{'Стоимость цели\nс учётом инфляции'}</span>
                            <span className={styleG.top__list_item_text__blue}>{fmt(target.costWithInflation || 0, target.currency)}</span>
                        </li>
                        <li className={styleG.top__list_item}>
                            <span className={styleG.top__list_item_text}>Первоначальный капитал</span>
                            <span className={styleG.top__list_item_text__blue}>{fmt(target.initialCapital || 0, target.currency)}</span>
                        </li>
                        <li className={styleG.top__list_item}>
                            <span className={styleG.top__list_item_text}>{'Рекомендованное\nежемесячное пополнение'}</span>
                            <span className={styleG.top__list_item_text__blue}>{fmt(target.initialReplenishment || 0, target.currency)}</span>
                        </li>
                    </ul>
                </div>
                <div className={styleG.top}>
                    {coverImgSrc ? (
                        <div className={`${styleG.top_img} ${styleG.top_img__left}`} style={{ backgroundImage: `url(${coverImgSrc})` }} />
                    ) : null}
                </div>
            </div>
            <div className={styleG.container}>
                <div className={styleG.offer_container}>
                    <div className={styleG.offer_item}>
                        <span className={styleG.offer_item_title}>{'Возможный портфель\nдля первоначального капитала'}</span>
                        <table className={styleG.offer_item__table}>
                            <thead className={styleG.offer_item__table__head}>
                                <tr className={styleG.offer_item__table__head_row}><td>Продукт</td><td>Сумма</td></tr>
                            </thead>
                            <tbody className={styleG.offer_item__table__body}>
                                {portfolioInitial.map((tool, i) => (
                                    <tr className={styleG.offer_item__table__body_row} key={i}>
                                        <td>{tool.title}</td>
                                        <td>{fmtTool(tool.sum, tool.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                <div className={styleG.offer_container}>
                    <div className={styleG.offer_item}>
                        <span className={styleG.offer_item_title}>{'Возможный портфель\nдля ежемесячного капитала'}</span>
                        <table className={styleG.offer_item__table}>
                            <thead className={styleG.offer_item__table__head}>
                                <tr className={styleG.offer_item__table__head_row}><td>Продукт</td><td>Сумма</td></tr>
                            </thead>
                            <tbody className={styleG.offer_item__table__body}>
                                {portfolioReplenishment.map((tool, i) => (
                                    <tr className={styleG.offer_item__table__body_row} key={i}>
                                        <td>{tool.title}</td>
                                        <td>{fmtTool(tool.sum, tool.currency)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <div className={styleG.footer}>
                {portfolioInitial.length ? (
                    <span className={styleG.footer_title}>
                        {'Доходность стратегии*\n'}
                        <span className={styleG.footer_title_wrap}>
                            {`${(((portfolioInitial.reduce((a, b) => ((b.sum * (b.percent || 0)) / 100) + a, 0) / portfolioInitial.reduce((a, b) => a + b.sum, 0)) || 0) * 100).toFixed(2)}%`}
                        </span>
                    </span>
                ) : null}
                <div className={styleG.footer_chart}>
                    <Line data={dataChart} options={options} />
                </div>
                <p className={styleG.footer_text}>
                    *- доходность продуктов в портфеле рассчитана на основе действующих на текущий момент тарифов и/или исторических данных и не гарантирована
                </p>
            </div>
        </ReportLayout>
    );
};

export default TargetGoalReport;
