import { useEffect, useState } from 'react';
import {
    Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler, type ChartData,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useReport } from '@/context/ReportContext';
import { ReportTarget, PortfolioItem } from '@/types/report';
import ReportLayout from '@/layout/report';
import options, { datasetsOptions } from '@/constants/chart';
import style from './style.module.scss';
import styleG from '../style.module.scss';

ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Legend, Tooltip, Filler);

type FinanceReserveReportType = { number: number; target: ReportTarget };

const FinanceReserveReportComponent = ({ target, number }: FinanceReserveReportType) => {
    const { getPortfolio } = useReport();
    const [portfolioInitial, setPortfolioInitial] = useState<PortfolioItem[]>([]);
    const [capitalGrowthChart, setCapitalGrowthChart] = useState<{ value: number; date: string }[]>([]);

    useEffect(() => {
        if (target.capitalRaising?.length) {
            const chartData = target.capitalRaising
                .filter((_, index) => index <= 6)
                .map((item, index) => {
                    const dayNow = new Date();
                    dayNow.setUTCMonth(index + dayNow.getMonth());
                    return { value: Math.floor(item), date: dayNow.toLocaleDateString('ru-RU') };
                });
            setCapitalGrowthChart(chartData);
        }
        if (target.key) {
            getPortfolio(target.key).then(({ initialCapital }) => {
                setPortfolioInitial(initialCapital);
            });
        }
    }, []);

    const dataChart: ChartData<'line'> = {
        labels: capitalGrowthChart.map((d) => d.date),
        datasets: [{ data: capitalGrowthChart.map((d) => d.value), ...datasetsOptions }],
    };

    return (
        <ReportLayout title='Финансовый резерв' number={`${number}`} isTarget>
            <div className='flex gap-x-[10px] mt-[20px] mb-[30px]'>
                <div className='p-[10px] text-[12px] border-[#F1F0F5] border-[1px] rounded-[10px] leading-tight'>
                    <p>
                        Финансовый резерв -- это важная часть вашего финансового плана, которая позволяет вам быть
                        готовыми к любым непредвиденным обстоятельствам. Наличие финансового резерва обеспечивает вам
                        финансовую безопасность и спокойствие.
                    </p>
                    <p>Текущая средняя максимальная ставка в Банках - 17.1%</p>
                </div>
            </div>

            <div className='flex justify-between mb-[30px] max-sm:flex-col'>
                <nav className={style.finreserve_list}>
                    <span>{'Для создания финансового резерва лучше\nвсего подходят банковские вклады:'}:</span>
                    <ul>
                        <li>- высокий %</li>
                        <li>- застраховано в АСВ</li>
                        <li>- возможность снять в любой момент</li>
                    </ul>
                </nav>
            </div>

            <div className={styleG.footer_title}>
                <span>{'Ставка --\n'}</span>
                <span>
                    до
                    <span className={styleG.footer_title_wrap}>
                        {' '}{portfolioInitial.length ? `${portfolioInitial[0].percent}%` : `${target.potentialYield}%`}{' '}
                    </span>
                    годовых*
                </span>
            </div>

            <div className={style.finreserve_chart}>
                <Line data={dataChart} options={options} />
            </div>
        </ReportLayout>
    );
};

export default FinanceReserveReportComponent;
