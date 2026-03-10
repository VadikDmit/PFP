import ReportLayout from '@/layout/report';
import { useReport } from '@/context/ReportContext';
import coverImg from '@/assets/images/report/taxPlanning/cover.jpg';
import style from './style.module.scss';

type TaxPlanningReportType = { number: number };

const TaxPlanningReportComponent = ({ number }: TaxPlanningReportType) => {
    const { taxPlanning } = useReport();

    const fmt = (val: number | undefined) => (val || 0).toLocaleString('ru-RU', {
        style: 'currency', currency: 'RUB', maximumFractionDigits: 0,
    });

    return (
        <ReportLayout title={`Налоговое планирование ${new Date().getFullYear()}`} number={`${number}`}>
            <div className={style.tax__content}>
                <p className={style.tax__content_text}>
                    {'В рамках персонального финансового плана в РФ, налоговое планирование проводится на текущий год. Это включает анализ и оптимизацию налоговых обязательств клиента с использованием доступных налоговых льгот и вычетов.\n\nВ начале следующего года, налоговый консультант поможет клиенту получить все причитающиеся выплаты, минимизировав налоговую нагрузку и улучшая финансовое благополучие.'}
                </p>
                <div className={style.tax__content_img_wrapper}>
                    <img className={style.tax__content_img} src={coverImg.src} alt='Налоговое планирование' />
                </div>
            </div>

            {taxPlanning.incomeBeforeTax || taxPlanning.spouseExists ? (
                <div className={style.tax__table_wrapper}>
                    <span className={style.tax__table_title}>Налоговая база с  дохода физических лиц</span>
                    <div className={`${style.tax__table_container} shadow-bgTable`}>
                        <table className={style.tax__table}>
                            <thead>
                                <tr><td /><td>Доход в месяц</td><td>Доход после уплаты НДФЛ</td><td>Налоговая база за год</td></tr>
                            </thead>
                            <tbody>
                                {taxPlanning.incomeBeforeTax ? (
                                    <tr>
                                        <td>Клиент</td>
                                        <td>{fmt(taxPlanning.incomeBeforeTax)}</td>
                                        <td>{fmt(taxPlanning.incomeBeforeTax * 0.87)}</td>
                                        <td>{fmt((taxPlanning.incomeBeforeTax * 0.13) * 12)}</td>
                                    </tr>
                                ) : null}
                                {taxPlanning.spouseExists ? (
                                    <tr>
                                        <td>Супруга</td>
                                        <td>{fmt(taxPlanning.spouseIncomeBeforeTax)}</td>
                                        <td>{fmt((taxPlanning.spouseIncomeBeforeTax || 0) * 0.87)}</td>
                                        <td>{fmt(((taxPlanning.spouseIncomeBeforeTax || 0) * 0.13) * 12)}</td>
                                    </tr>
                                ) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {taxPlanning.childrenBenefit ? (
                <div className={style.tax__table_wrapper}>
                    <span className={style.tax__table_title}>Социальные выплаты</span>
                    <div className={`${style.tax__table_container} pb-[5px] shadow-bgTable`}>
                        <table className={style.tax__table}>
                            <thead><tr><td>Тип выплаты</td><td>Выплаты в мес</td></tr></thead>
                            <tbody>
                                <tr>
                                    <td style={{ fontSize: 8 }}>За детей</td>
                                    <td>{fmt(taxPlanning.childrenBenefit)}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {taxPlanning.nszDeduction || taxPlanning.iisDeduction || taxPlanning.apartmentDeduction || taxPlanning.mortgageDeduction ? (
                <div className={style.tax__table_wrapper}>
                    <span className={style.tax__table_title}>{`План на налоговые вычеты за ${new Date().getFullYear()} год. Клиент`}</span>
                    <div className={`${style.tax__table_container} shadow-bgTable`}>
                        <table className={style.tax__table}>
                            <thead><tr><td>Тип вычета</td><td>Вычет</td></tr></thead>
                            <tbody>
                                {taxPlanning.nszDeduction ? (<tr><td>НСЖ</td><td>{fmt(taxPlanning.nszDeduction)}</td></tr>) : null}
                                {taxPlanning.iisDeduction ? (<tr><td>ИИС</td><td>{fmt(taxPlanning.iisDeduction)}</td></tr>) : null}
                                {taxPlanning.apartmentDeduction ? (<tr><td>Покупка квартиры</td><td>{fmt(taxPlanning.apartmentDeduction)}</td></tr>) : null}
                                {taxPlanning.mortgageDeduction ? (<tr><td>Проценты по ипотеке</td><td>{fmt(taxPlanning.mortgageDeduction)}</td></tr>) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}

            {taxPlanning.spouseExists ? (
                <div className={style.tax__table_wrapper}>
                    <span className={style.tax__table_title}>{`План на налоговые вычеты за ${new Date().getFullYear()} год. Супруга`}</span>
                    <div className={`${style.tax__table_container} shadow-bgTable`}>
                        <table className={style.tax__table}>
                            <thead><tr><td>Тип вычета</td><td>Вычет</td></tr></thead>
                            <tbody>
                                {taxPlanning.spouseApartmentDeduction ? (<tr><td>Покупка квартиры</td><td>{fmt(taxPlanning.spouseApartmentDeduction)}</td></tr>) : null}
                                {taxPlanning.spouseMortgageDeduction ? (<tr><td>Проценты по ипотеке</td><td>{fmt(taxPlanning.spouseMortgageDeduction)}</td></tr>) : null}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </ReportLayout>
    );
};

export default TaxPlanningReportComponent;
