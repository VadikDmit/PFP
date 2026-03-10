import { useEffect, useState } from 'react';
import { useReport } from '@/context/ReportContext';
import { ReportTarget, PortfolioItem } from '@/types/report';
import ReportLayout from '@/layout/report';
import familyImg from '@/assets/images/report/health/family.png';
import style from './style.module.scss';

type HealthProtectionReportType = { number: number; target: ReportTarget };

const HealthProtectionReportComponent = ({ target, number }: HealthProtectionReportType) => {
    const { getPortfolio } = useReport();
    const [termOfYears, setTermOfYears] = useState(0);
    const [toolsInitialCapital, setToolsInitialCapital] = useState<PortfolioItem[]>([]);

    useEffect(() => {
        if (target.key) {
            getPortfolio(target.key).then(({ initialCapital }) => {
                setToolsInitialCapital(initialCapital);
            });
        }
        if (target) {
            const currentDate = new Date();
            currentDate.setUTCMonth(target.months + currentDate.getMonth());
            setTermOfYears(currentDate.getFullYear() - new Date().getFullYear());
        }
    }, [target]);

    const fmt = (val: number) => (val || 0).toLocaleString('ru-RU', {
        style: 'currency', currency: target.currency || 'RUB', maximumFractionDigits: 0,
    });

    return target ? (
        <ReportLayout title='Защита жизни. Резерв за счет НСЖ' number={`${number}`} isTarget>
            <p className={style.health_description}>
                НСЖ «Статус» включает широкий перечень страховых событий, предусматривающих заранее оговоренный объем выплат, которые стабилизируют Ваше финансовое положение даже в самых тяжелых жизненных ситуациях. Вы и ваши близкие получают значительный финансовый резерв с первого дня действия договора.
            </p>
            <div className={style.health__content}>
                <div className='flex w-full mb-[10px] max-sm:flex-col max-sm:gap-y-[20px]'>
                    <div className='pr-[50px] max-sm:pr-0'>
                        <div className={style.health__content_tools}>
                            <div className={style.health__content_tools_left}>
                                <span className={style.health__content_tools_left_text}>Годовой взнос</span>
                                {toolsInitialCapital.length ? toolsInitialCapital.map((tool, i) => (
                                    <span className={style.health__content_tools_left_text} key={i}>
                                        {`${(tool.sum || 0).toLocaleString('ru-RU', { style: 'currency', currency: tool.currency || 'RUB', maximumFractionDigits: 0 }).replace(/^(\D+)/, '$1 ').replace('CN', '')} `}
                                    </span>
                                )) : null}
                            </div>
                            <div className={style.health__content_tools_right}>
                                <span className={style.health__content_tools_right_text}>Продукт</span>
                                {toolsInitialCapital.length ? toolsInitialCapital.map((tool, i) => (
                                    <span key={i} className={style.health__content_tools_right_text}>{tool.title || 'Продукт неопознан'}</span>
                                )) : null}
                            </div>
                            <span className={style.health__content_tools_term}>
                                Срок действия программы
                                <span>{`${termOfYears} лет`}</span>
                            </span>
                        </div>
                        <div className={style.health__content_risk}>
                            <h2 className={style.health__content_risk_title}>Риски и выплаты</h2>
                            <ul className={style.health__content_risk_list}>
                                <li className={style.health__content_risk_list_item}>
                                    <span>{'Дожитие Застрахованного до даты\nокончания срока Договора'}</span>
                                    <span>{`до ${fmt(target.cost || 0)}`}</span>
                                </li>
                                <li className={style.health__content_risk_list_item}>
                                    <span>{'Налоговые вычеты, за весь срок\nдоговора*'}</span>
                                    <span>{`до ${fmt((target.initialCapital || 0) * (13 / 100) > 19_500 ? 19_500 * (target.months / 12) : (target.initialCapital || 0) * (13 / 100) * (target.months / 12))}`}</span>
                                </li>
                                <li className={style.health__content_risk_list_item}>
                                    <span>{'Уход из жизни из-за Несчастного\nслучая'}</span>
                                    <span>{`до ${fmt((target.cost || 0) * 2)}`}</span>
                                </li>
                                <li className={style.health__content_risk_list_item}>
                                    <span>Уход из жизни по любой причине**</span>
                                    <span>{`до ${fmt(target.cost || 0)}`}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className={style.health__content_img} style={{ backgroundImage: `url(${familyImg.src})` }} />
                </div>
            </div>
            <div className={`${style.health__content_risk} mb-[30px]`}>
                <h2 className={style.health__content_risk_title}>Дополнительные условия</h2>
                <ul className={style.health__content_risk_list}>
                    <li className={style.health__content_risk_list_item}>
                        <span>Первичное диагнастирование Смертельно-опасного заболевания</span>
                        <span>{`до ${fmt(4_000_000)}`}</span>
                    </li>
                    <li className={style.health__content_risk_list_item}>
                        <span>Инвалидность I и II группы***</span>
                        <span className='whitespace-break-spaces text-end'>{`до ${fmt(target.cost || 0)} и/или\nосвобождение от уплаты взносов`}</span>
                    </li>
                    <li className={style.health__content_risk_list_item}>
                        <span>Телесные повреждения, в результате НС</span>
                        <span>{`до ${fmt(1_000_000)}`}</span>
                    </li>
                </ul>
            </div>
            <nav className={style.health__footer}>
                <span className={style.health__footer_text}>
                    {`*- максимальная сумма ${((target.initialCapital || 0) * (13 / 100) > 19_500 ? 19_500 : (target.initialCapital || 0) * (13 / 100)).toLocaleString('ru-RU', { style: 'currency', currency: target.currency || 'RUB', maximumFractionDigits: 0 })} в год. Получение налоговых вычетов доступно только для плательщиков НДФЛ`}
                </span>
                <span className={style.health__footer_text}>**- риск СЛП вступает в действие со  2-го года страхования</span>
                <span className={style.health__footer_text}>***- в результате НС с 1-го года и по любой причине со 2-года</span>
                <span className={style.health__footer_text} style={{ paddingBlockStart: '10px' }}>
                    {`Рекомендация – ежемесячно пополнять накопительный счет на сумму не менее ${(target.initialReplenishment || 0).toLocaleString('ru-RU', { style: 'currency', currency: target.currency || 'RUB', maximumFractionDigits: 0 })} для оплаты очередного взноса`}
                </span>
            </nav>
        </ReportLayout>
    ) : null;
};

export default HealthProtectionReportComponent;
