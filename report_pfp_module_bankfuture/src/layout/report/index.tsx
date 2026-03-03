import { ReactNode, useEffect, useState } from 'react';
import { monthsNominative } from '@/components/report/archive/const/date';
import { RISK_PROFILE_LABELS } from '@/constants/report';
import { useReport } from '@/context/ReportContext';
import LogoSVG from '@/assets/svgs/Logo';
import LogoReportSVG from '@/assets/svgs/LogoReport';
import styles from './style.module.scss';

type ReportLayoutProps = {
    children: Iterable<ReactNode>;
    title: string;
    isTitleRed?: boolean;
    subtitle?: string;
    number: string;
    isTarget?: boolean;
    riskScoreTotal?: number;
    months?: number;
    logoTop?: boolean;
};

const ReportLayout = ({
    children, title, isTitleRed, isTarget, subtitle, number, riskScoreTotal, months, logoTop,
}: ReportLayoutProps) => {
    const { getRiskProfileLabel } = useReport();
    const date = new Date();
    if (months) date.setMonth(months);
    const dateOfMonth = date.getMonth();
    const dateOfYear = date.getFullYear();
    const [curRiskProfile, setCurRiskProfile] = useState<string>();

    useEffect(() => {
        if (months && riskScoreTotal) {
            getRiskProfileLabel(riskScoreTotal, months).then((label) => {
                setCurRiskProfile(label || undefined);
            });
        }
    }, [months, riskScoreTotal]);

    return (
        <div className = { `${styles.page} page` }>
            <div className = { `${styles.page_container} page_container ${isTarget ? 'max-sm:!pt-[50px]' : 'max-sm:!pt-[20px]'}` }>
                { isTarget ? <span className = { styles.page_numberTarget }>{ `Цель ${Number(number) - 5}` }</span> : null }
                <div style = { { display: 'flex', alignItems: 'flex-start' } }>
                    <h1 className = { styles.page_container_title }>
                        { curRiskProfile
                            ? `${title}. ${monthsNominative[dateOfMonth ? dateOfMonth - 1
                                : dateOfMonth]} ${dateOfYear}г.`
                            : title }
                    </h1>
                    { curRiskProfile ? (
                        <span className = { styles.page_container_title_risk }>
                            { `${curRiskProfile} портфель` }
                        </span>
                    ) : null }
                </div>
                { subtitle ? <p className = { styles.page_container_subtitle }>{ subtitle }</p> : null }
                { children }
                <div className = { `${styles.page_footer} ${logoTop || isTarget ? '!hidden' : ''}` }>
                    <LogoSVG width = { 130 } />
                    { number !== '0' ? <span className = { styles.page_footer_number }>{ number }</span> : null }
                </div>
                { logoTop ? (
                    <div className = 'absolute top-[30px] right-[30px]'>
                        <LogoReportSVG />
                    </div>
                ) : null }
            </div>
        </div>
    );
};

ReportLayout.defaultProps = {
    riskScoreTotal: 0,
};

export default ReportLayout;
