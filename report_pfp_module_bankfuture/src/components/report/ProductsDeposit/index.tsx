import ReportLayout from '@/layout/report';
import { Line } from 'react-chartjs-2';
import type { ChartData } from 'chart.js';
import options, { datasetsOptions } from '@/constants/chart';
import style from '@/components/report/FinanceReserve/style.module.scss';
import { UniversalLinkInfo } from '@/types/report';

type ProductsDepositReportType = {
    number: number;
    link?: UniversalLinkInfo;
};

const ProductsDepositReportComponent = ({ number, link }: ProductsDepositReportType) => {
    const dataChart: ChartData<'line'> = {
        labels: ['01.08.2024', '01.07.2024', '01.06.2024', '01.05.2024', '01.04.2024', '01.03.2024', '01.02.2024', '01.01.2024', '01.12.2023', '01.11.2023', '01.10.2023', '01.09.2023', '01.08.2023', '01.07.2023', '01.06.2023', '01.05.2023', '01.04.2023', '01.03.2023', '01.02.2023', '01.01.2023', '01.12.2022', '01.11.2022', '01.10.2022', '01.09.2022', '01.08.2022', '01.07.2022', '01.06.2022', '01.05.2022', '01.04.2022', '01.03.2022', '01.02.2022', '01.01.2022', '01.12.2021', '01.11.2021', '01.10.2021', '01.09.2021', '01.08.2021', '01.07.2021', '01.06.2021', '01.05.2021', '01.04.2021', '01.03.2021', '01.02.2021', '01.01.2021'].reverse(),
        datasets: [
            { data: [17.68, 17.11, 16.088, 15.163, 14.922, 14.832, 14.789, 14.88, 14.753, 13.637, 12.036, 10.189, 9.661, 8.107, 7.827, 7.747, 7.636, 7.676, 7.676, 8.036, 8.177, 7.295, 6.839, 6.541, 6.835, 6.925, 7.723, 9.845, 12.995, 18.58, 8.587, 7.802, 7.738, 7.209, 6.701, 6.328, 6.173, 5.554, 5.255, 4.899, 4.719, 4.568, 4.509, 4.486].reverse(), ...datasetsOptions, borderColor: '#428400', backgroundColor: '#428400', pointBorderColor: '#428400' },
            { data: [18, 18, 16, 16, 16, 16, 16, 16, 16, 15, 15, 13, 12, 8.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 7.5, 8, 8, 9.5, 11, 14, 17, 20, 9.5, 8.5, 7.5, 7.5, 6.75, 6.5, 6.5, 6.5, 5.5, 5, 4.5, 4.25, 4.25, 4.25].reverse(), ...datasetsOptions, borderDash: [5, 5], borderColor: '#428400', backgroundColor: '#428400', pointBorderColor: '#428400' },
        ],
    };

    return (
        <ReportLayout logoTop title='Продукты' number={`${number}`}>
            <span className='font-medium text-[14px] inline-block mb-[20px]'>Банковский депозит</span>
            <div className='p-[10px] text-[12px] border-[#F1F0F5] border-[1px] rounded-[10px] leading-tight mb-[20px]'>
                <p>
                    Банковский депозит это консервативный инструмент для инвестирования средств. Обратите внимание на
                    налоги с %. Это дополнительно уменьшает доходность капитала. Кстати, доходность коррелирует со ставкой ЦБ
                </p>
            </div>

            <div className={`${style.finreserve_chart} px-[20px] py-[15px] rounded-[10px] bg-white shadow-lg !max-h-none !mb-[20px]`}>
                <span className='block text-[12px] font-medium mb-[15px] max-sm:w-10/12'>Ключевая ставка и средняя максимальная ставка по депозитам</span>
                <div className='min-h-[120px] max-h-[120px] min-w-full [&>canvas]:min-w-full'>
                    <Line
                        data={dataChart}
                        options={{
                            ...options,
                            maintainAspectRatio: false,
                            scales: {
                                ...options.scales,
                                y: { ...options.scales?.y, ticks: { ...options.scales?.y?.ticks, callback: (val) => val }, title: { display: true, text: '% годовых', font: { size: 8 }, padding: { top: 0 } } },
                            },
                        }}
                    />
                </div>
                <div>
                    <p className='flex items-center'><span className='border-dashed border-[1px] border-[#428400] w-[30px] block mr-[10px]' /><span className='text-[8px]'>график значения Ключевой ставки ЦБ по времени</span></p>
                    <p className='flex items-center'><span className='border-[1px] border-[#202023] w-[30px] block mr-[10px]' /><span className='text-[8px]'>график значения Средней максимальной ставки депозитов  по времени</span></p>
                </div>
            </div>

            <div>
                <p className='text-[12px] mb-[15px] leading-tight'>Маркетплейс Финуслуг (проект Мосбиржи) для выбора вклада из сотен предложений российских Банков:</p>
            </div>

            <div className='flex justify-center mb-[20px]'>
                <a href={link?.link || '#'} target='_blank' className='button_yellow px-[48px] py-[12px] text-[14px] whitespace-nowrap'>
                    Выбрать вклад
                </a>
            </div>
        </ReportLayout>
    );
};

export default ProductsDepositReportComponent;
