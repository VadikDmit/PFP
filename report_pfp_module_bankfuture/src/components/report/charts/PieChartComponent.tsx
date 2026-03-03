import dynamic from 'next/dynamic';
import { AssetsReportDataProps } from '@/types/report';
import useWidth from '@/utils/hooks/useWidth';
import styles from './style.module.scss';

type PieChartProps = {
    data: AssetsReportDataProps[];
    currency: string;
};

const ChartBiz = dynamic(() => import('bizcharts').then((mod) => mod.DonutChart), { ssr: false });

const PieChartComponent = ({ data, currency }: PieChartProps) => {
    const windowWidth = useWidth();
    return (
        <div className={styles.pieChart_container}>
            <ChartBiz
                width={windowWidth > 1024 ? 550 : windowWidth - 100}
                color={['#FFC759', '#667DB5', '#FFC759', '#F37058', '#EEC960', '#CCE192', '#78B497', '#58595B']}
                data={data || []}
                autoFit
                height={windowWidth > 1024 ? 350 : 0}
                radius={0.8}
                padding={windowWidth > 1024 ? [0, 0, 0, -300] : [0, 0, 0, 0]}
                angleField='sum'
                colorField='title'
                legend={{
                    slidable: false,
                    offsetX: windowWidth > 1024 ? -100 : 0,
                    position: windowWidth > 1024 ? 'right' : 'bottom-left',
                    flipPage: false,
                }}
                pieStyle={{ stroke: 'white', lineWidth: 5 }}
                label={{ visible: false }}
                appendPadding={30}
                statistic={{
                    title: false,
                    content: {
                        style: { fontSize: '28px' },
                        formatter: (_, dataF) => dataF.reduce((a, b) => a + b.sum, 0).toLocaleString('ru-RU', {
                            style: 'currency', currency, maximumFractionDigits: 0,
                        }).replace(/^(\D+)/, '$1 ').replace('CN', ''),
                    },
                }}
            />
        </div>
    );
};

export default PieChartComponent;
