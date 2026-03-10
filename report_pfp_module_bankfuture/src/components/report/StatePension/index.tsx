import { useReport } from '@/context/ReportContext';
import { ReportTarget } from '@/types/report';
import ReportLayout from '@/layout/report';
import pensionImg from '@/assets/images/report/statePension/cover.jpg';
import pensionSecImg from '@/assets/images/report/statePension/cover_sec.jpg';
import style from './style.module.scss';
import styleG from '../style.module.scss';

type GoalReportType = { number: number; target: ReportTarget };

const StatePensionReportComponent = ({ number, target }: GoalReportType) => {
    const { customer } = useReport();

    const retirementCalc = () => {
        const newDate = new Date();
        const birthDateCustomer = customer.birthDate ? new Date(customer.birthDate) : new Date();
        if (customer.gender === 'MALE') {
            newDate.setFullYear(65 + birthDateCustomer.getFullYear());
        }
        if (customer.gender === 'FEMALE') {
            newDate.setFullYear(60 + birthDateCustomer.getFullYear());
        }
        return newDate.getFullYear();
    };

    const fmt = (val: number, cur?: string) => (val || 0).toLocaleString('ru-RU', {
        style: 'currency', currency: cur || target.currency || 'RUB', maximumFractionDigits: 0,
    }).replace(/^(\D+)/, '$1 ').replace('CN', '');

    return (
        <ReportLayout title='Государственное пенсионное обеспечение' number={`${number}`} isTarget>
            <div className={`${styleG.container} items-center mb-[30px]`}>
                <div className={styleG.top}>
                    <ul className={styleG.top__list}>
                        <li className={styleG.top__list_item}>
                            <span className={styleG.top__list_item_text}>Выход на пенсию</span>
                            <span className={styleG.top__list_item_text__blue}>{`${retirementCalc()} г.`}</span>
                        </li>
                        <li className={styleG.top__list_item}>
                            <span className={styleG.top__list_item_text}>Социальные взносы, в мес</span>
                            <span className={styleG.top__list_item_text__blue}>{fmt(target.statePensionMonthlyPayments || 0)}</span>
                        </li>
                        <li className={styleG.top__list_item}>
                            <span className={styleG.top__list_item_text}>Инфляция, в год</span>
                            <span className={styleG.top__list_item_text__blue}>{`${target.inflation || 0}%`}</span>
                        </li>
                    </ul>
                </div>
                <div className={styleG.top}>
                    <div className={`${styleG.top_img} ${styleG.top_img__left}`} style={{ backgroundImage: `url(${pensionImg.src})` }} />
                </div>
            </div>
            <div className='mb-[30px] text-[12px] font-semibold'>
                <p className='mb-[6px]'>
                    <span className='inline-block mr-[15px]'>Прогноз гос.пенсии</span>
                    <span>{fmt(target.statePensionTotal || 0)}</span>
                </p>
            </div>
            <div className={`${styleG.container} items-center mb-[30px] max-sm:mb-[20px]`}>
                <div className={styleG.top}>
                    <div className={`${styleG.top_img} ${styleG.top_img__left}`} style={{ backgroundImage: `url(${pensionSecImg.src})` }} />
                </div>
                <div className={styleG.top}>
                    <span style={{ display: 'inline-block', marginBlockEnd: 20, fontSize: 12, fontWeight: 600 }}>
                        Программа долгосрочных сбережений
                    </span>
                </div>
            </div>
        </ReportLayout>
    );
};

export default StatePensionReportComponent;
