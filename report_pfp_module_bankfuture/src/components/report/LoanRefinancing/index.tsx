import { ReportTarget } from '@/types/report';
import ReportLayout from '@/layout/report';
import loanRefinancingImg from '@/assets/images/report/loanRefinancing/cover.jpg';
import style from '@/components/report/style.module.scss';

type GoalReportType = { number: number; target: ReportTarget };

const LoanRefinancingReportComponent = ({ number, target }: GoalReportType) => {
    const fmt = (val: number) => (val || 0).toLocaleString('ru-RU', {
        style: 'currency', currency: target.currency || 'RUB', maximumFractionDigits: 0,
    });

    return (
        <ReportLayout title='Досрочное погашение кредитов' number={`${number}`} isTarget>
            <div className={style.container} style={{ marginBlockEnd: 20 }}>
                <div className={style.top_container}>
                    <div className={style.top} style={{ fontSize: 10 }}>
                        <p style={{ marginBlockEnd: 10 }}>
                            Досрочное погашение кредитов - это важная часть финансового планирования, которая может
                            заметно улучшить ваше финансовое состояние.
                        </p>
                        <p>
                            <ol>
                                <li>
                                    Экономия на процентах: Когда вы погашаете кредит досрочно, вы экономите на
                                    процентах, которые вам пришлось бы заплатить за весь срок кредита.
                                </li>
                            </ol>
                            <ul className={style.footer__list} style={{ width: '100%', flexDirection: 'column', marginBlockEnd: 0 }}>
                                <li className={style.footer__list_item} style={{ display: 'flex', marginBlockEnd: 5 }}>
                                    <p style={{ textAlign: 'left' }}>Единовременное погашение</p>
                                    <span style={{ marginInlineStart: 10, inlineSize: 'auto', textAlign: 'center', color: '#B12087' }}>{fmt(target.initialCapital || 0)}</span>
                                </li>
                                <li className={style.footer__list_item} style={{ display: 'flex' }}>
                                    <p style={{ textAlign: 'left' }}>Дополнительное погашение</p>
                                    <span style={{ marginInlineStart: 10, inlineSize: 'auto', textAlign: 'center', color: '#B12087' }}>{fmt(target.initialReplenishment || 0)}</span>
                                </li>
                            </ul>
                        </p>
                    </div>
                    <div className={style.top} style={{ inlineSize: 240 }}>
                        <div className={style.top_img} style={{ inlineSize: 240, backgroundImage: `url(${loanRefinancingImg.src})` }} />
                    </div>
                </div>
            </div>

            {target.loanLines?.length ? (
                <div className={style.table_wrapper}>
                    <span className={style.table_title}>Предлагаемый план рефинансирования</span>
                    <div className={style.table_container}>
                        <table className={style.table}>
                            <thead>
                                <tr>
                                    <td />
                                    <td style={{ textAlign: 'center' }}>Сумма кредита</td>
                                    <td style={{ textAlign: 'center' }}>Ставка</td>
                                    <td style={{ textAlign: 'center' }}>Платеж</td>
                                    <td style={{ textAlign: 'center' }}>Срок, мес.</td>
                                </tr>
                            </thead>
                            <tbody>
                                {target.loanLines.map((line, i) => (
                                    <tr key={i}>
                                        <td style={{ width: 130 }}>{line.name}</td>
                                        <td style={{ textAlign: 'center' }}>{fmt(line.amount)}</td>
                                        <td style={{ textAlign: 'center' }}>{line.interestRate}</td>
                                        <td style={{ textAlign: 'center' }}>{fmt(line.monthlyPayment)}</td>
                                        <td style={{ paddingInlineEnd: 0, textAlign: 'center' }}>{line.months}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : null}
        </ReportLayout>
    );
};

export default LoanRefinancingReportComponent;
