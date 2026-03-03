import PieChartComponent from '@/components/report/charts/PieChartComponent';
import { useEffect, useState } from 'react';
import ReportLayout from '@/layout/report';
import { AssetsReportDataProps } from '@/types/report';
import styles from './style.module.scss';

type AssetsReportProps = {
    title: string;
    subtitle: string;
    number: string;
    isBlue?: boolean;
    data: AssetsReportDataProps[];
    middleIncome: string;
    currency: string;
    addTaxResult?: number;
    disclaimerNsz?: string;
    disclaimerIsz?: string;
    disclaimerAdvisory?: string;
};

const AssetsReportComponent = ({
    title, subtitle, currency, number, disclaimerAdvisory, data, addTaxResult, middleIncome,
    disclaimerNsz, disclaimerIsz,
}: AssetsReportProps) => {
    const [sumTotal, setSumTotal] = useState<number>(0);

    useEffect(() => {
        setSumTotal(0);
        if (data.length) { setSumTotal(data.reduce((a, b) => (b.sum ? a + b.sum : a), 0)); }
    }, [data.length]);

    return data.length && sumTotal ? (
        <ReportLayout title={title} subtitle={subtitle} number={number}>
            <table className={styles.page_content__table}>
                <thead>
                    <tr>
                        <td>Доля</td>
                        <td>Наименование инструмента</td>
                        <td>{'Сумма\nинвестиций'}</td>
                        <td>{'Прогнозируемая\nдоходность'}</td>
                    </tr>
                </thead>
                <tbody>
                    {data.map((asset, i) => (asset.sum ? (
                        <tr key={i}>
                            <td>{`${((100 / sumTotal) * asset.sum).toFixed(0)}%`}</td>
                            <td>{asset.title}</td>
                            <td>
                                {(asset.sum).toLocaleString('ru-RU', {
                                    style: 'currency', currency, maximumFractionDigits: 0,
                                }).replace(/^(\D+)/, '$1 ').replace('CN', '')}
                            </td>
                            <td>{asset.profitability || asset.percent ? `${asset.profitability || asset.percent}%` : '-'}</td>
                        </tr>
                    ) : null))}
                </tbody>
            </table>

            <PieChartComponent currency={currency} data={data.filter((item) => item.sum)} />
            <span className={styles.content_footer}>{middleIncome}</span>
            {addTaxResult ? (<span className={styles.content_footer}>{`Дополнительная доходность за отчёт налоговых вычетов - ${Number(addTaxResult).toFixed(2)}%`}</span>) : null}
            {disclaimerNsz ? (
                <p style={{ display: 'block', fontSize: '8px', marginBlockStart: '10px' }}>
                    * -&nbsp;{disclaimerNsz}
                </p>
            ) : null}
            {disclaimerIsz ? (
                <p style={{ display: 'block', fontSize: '8px', marginBlockStart: '10px' }}>
                    * -&nbsp;{disclaimerIsz}
                </p>
            ) : null}
            {disclaimerAdvisory ? (
                <p style={{ display: 'block', fontSize: '8px', marginBlockStart: '5px' }}>
                    {disclaimerAdvisory}
                </p>
            ) : null}
        </ReportLayout>
    ) : null;
};

export default AssetsReportComponent;
