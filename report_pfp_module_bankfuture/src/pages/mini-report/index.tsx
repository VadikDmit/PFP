import { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useReport } from '@/context/ReportContext';
import AssetsReportComponent from '@/components/report/Assets';
import DisclaimerReportComponent from '@/components/report/Disclaimer';
import styles from './style.module.scss';

const MiniReportPage = () => {
    const pdfExport = useRef<HTMLDivElement>(null);
    const { targets, loading } = useReport();
    const [isPrint, setIsPrint] = useState(false);

    const handleExport = useReactToPrint({
        content: () => pdfExport.current,
        copyStyles: true,
        onBeforePrint: () => setIsPrint(false),
    });

    if (loading) return <p>Загрузка...</p>;

    return (
        <div className = { styles.wrapper }>
            <button
                type = 'button'
                onClick = { () => {
                    setIsPrint(true);
                    setTimeout(() => handleExport(), 500);
                } }
                className = 'button_yellow'
            >
                Сохранить PDF
            </button>
            <div ref = { pdfExport } className = { isPrint ? 'pdfExport__print' : undefined }>
                <AssetsReportComponent
                    title = 'Мини-отчёт'
                    subtitle = 'Текущие активы'
                    number = '1'
                    currency = 'RUB'
                    data = { [] }
                    addTaxResult = { 0 }
                    middleIncome = ''
                />
                <DisclaimerReportComponent number = { 2 } />
            </div>
        </div>
    );
};

export default MiniReportPage;
