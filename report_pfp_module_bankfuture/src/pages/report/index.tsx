import { useEffect, useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
import { useReport } from '@/context/ReportContext';
import { ReportTarget, AssetsReportDataProps, PortfolioItem } from '@/types/report';
import { TargetTypeEnum } from '@/constants/report';

import AssetsReportComponent from '@/components/report/Assets';
import CoverReportComponent from '@/components/report/Cover';
import FinanceReserveReportComponent from '@/components/report/FinanceReserve';
import DisclaimerReportComponent from '@/components/report/Disclaimer';
import HealthProtectionReportComponent from '@/components/report/HealthProtection';
import EducationReportComponent from '@/components/report/Education';
import InvestReportComponent from '@/components/report/Invest';
import CapitalMultiplicationReportComponent from '@/components/report/CapitalMultiplication';
import PensionReportComponent from '@/components/report/Pension';
import ApartmentReportComponent from '@/components/report/Apartment';
import EducationAutoReportComponent from '@/components/report/EducationAuto';
import EducationApartmentReportComponent from '@/components/report/EducationApartment';
import RentReportComponent from '@/components/report/Rent';
import TaxGoalReportComponent from '@/components/report/TaxGoal';
import RiskDeclarationReportComponent from '@/components/report/RiskDeclaration';
import RiskProfileReportComponent from '@/components/report/RiskProfile';
import TaxPlanningReportComponent from '@/components/report/TaxPlanning';
import HouseReportComponent from '@/components/report/House';
import MortgageReportComponent from '@/components/report/Mortgage';
import MortgageHouseReportComponent from '@/components/report/MortgageHouse';
import MortgageCashReportComponent from '@/components/report/MortgageCash';
import OtherMoveReportComponent from '@/components/report/OtherMove';
import SaveCapitalReportComponent from '@/components/report/SaveCapital';
import OtherTravelReportComponent from '@/components/report/OtherTravel';
import OtherReportComponent from '@/components/report/Other';
import AutoReportComponent from '@/components/report/Auto';
import OwnBusinessReportComponent from '@/components/report/OwnBusiness';
import LoanRefinancingReportComponent from '@/components/report/LoanRefinancing';
import StatePensionReportComponent from '@/components/report/StatePension';
import MethodSatePensionReportComponent from '@/components/report/MethodSatePension';
import OtherMortgageInitialReportComponent from '@/components/report/OtherMortgageInitial';
import OtherFinReserveReportComponent from '@/components/report/OtherFinReserve';
import MortgageRefinanceReportComponent from '@/components/report/MortgageRefinance';
import ProductsDepositReportComponent from '@/components/report/ProductsDeposit';
import ProductsObligationsReportComponent from '@/components/report/ProductsObligations';
import ProductsAssetsReportComponent from '@/components/report/ProductsAssets';
import ProductsAutofollowReportComponent from '@/components/report/ProductsAutofollow';
import ProductsNszReportComponent from '@/components/report/ProductsNsz';

import styles from './style.module.scss';

const TARGET_COMPONENT_MAP: Record<string, React.ComponentType<{ target: ReportTarget; number: number }>> = {
    [TargetTypeEnum.FinReserve]: FinanceReserveReportComponent,
    [TargetTypeEnum.EducationV202109]: EducationReportComponent,
    [TargetTypeEnum.Health]: HealthProtectionReportComponent,
    [TargetTypeEnum.Investment]: InvestReportComponent,
    [TargetTypeEnum.CapitalMultiplication]: CapitalMultiplicationReportComponent,
    [TargetTypeEnum.Pension]: PensionReportComponent,
    [TargetTypeEnum.Apartment]: ApartmentReportComponent,
    [TargetTypeEnum.OtherAuto]: AutoReportComponent,
    [TargetTypeEnum.House]: HouseReportComponent,
    [TargetTypeEnum.StatePension]: StatePensionReportComponent,
    [TargetTypeEnum.MortgageApartment]: MortgageReportComponent,
    [TargetTypeEnum.MortgageHouse]: MortgageHouseReportComponent,
    [TargetTypeEnum.MortgageCash]: MortgageCashReportComponent,
    [TargetTypeEnum.MortgageRefinance]: MortgageRefinanceReportComponent,
    [TargetTypeEnum.SaveCapital]: SaveCapitalReportComponent,
    [TargetTypeEnum.LoanRefinancing]: LoanRefinancingReportComponent,
    [TargetTypeEnum.OwnBusiness]: OwnBusinessReportComponent,
    [TargetTypeEnum.Other]: OtherReportComponent,
    [TargetTypeEnum.OtherCapital]: OtherReportComponent,
    [TargetTypeEnum.OtherMove]: OtherMoveReportComponent,
    [TargetTypeEnum.OtherFinReserve]: OtherFinReserveReportComponent,
    [TargetTypeEnum.OtherTravel]: OtherTravelReportComponent,
    [TargetTypeEnum.OtherMortgageInitial]: OtherMortgageInitialReportComponent,
    [TargetTypeEnum.OtherEducationAuto]: EducationAutoReportComponent,
    [TargetTypeEnum.OtherEducationApartment]: EducationApartmentReportComponent,
    [TargetTypeEnum.Rent]: RentReportComponent,
};

const ReportPage = () => {
    const pdfExport = useRef<HTMLDivElement>(null);
    const { targets, loading, getPortfolio, taxPlanning } = useReport();

    const [leftData, setLeftData] = useState<AssetsReportDataProps[]>([]);
    const [rightData, setRightData] = useState<AssetsReportDataProps[]>([]);
    const [isPrint, setIsPrint] = useState(false);

    const handleExport = useReactToPrint({
        content: () => pdfExport.current,
        copyStyles: true,
        onBeforePrint: () => setIsPrint(false),
    });

    useEffect(() => {
        if (!targets.length) return;

        const aggregatePortfolios = async () => {
            const leftAgg: Record<string, AssetsReportDataProps> = {};
            const rightAgg: Record<string, AssetsReportDataProps> = {};

            await Promise.all(targets.map(async (target) => {
                if (!target.key) return;
                const portfolio = await getPortfolio(target.key);

                portfolio.initialCapital.forEach((item: PortfolioItem) => {
                    if (leftAgg[item.key]) {
                        leftAgg[item.key].sum += item.sum;
                    } else {
                        leftAgg[item.key] = {
                            share: item.share,
                            title: item.title,
                            sum: item.sum,
                            profitability: item.percent,
                            currency: item.currency || 'RUB',
                        };
                    }
                });

                portfolio.monthlyReplenishment.forEach((item: PortfolioItem) => {
                    if (rightAgg[item.key]) {
                        rightAgg[item.key].sum += item.sum;
                    } else {
                        rightAgg[item.key] = {
                            share: item.share,
                            title: item.title,
                            sum: item.sum,
                            profitability: item.percent,
                            currency: item.currency || 'RUB',
                        };
                    }
                });
            }));

            setLeftData(Object.values(leftAgg));
            setRightData(Object.values(rightAgg));
        };

        aggregatePortfolios();
    }, [targets.length]);

    if (loading) {
        return (
            <div style = { { display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' } }>
                <p>Загрузка отчёта...</p>
            </div>
        );
    }

    const calculateMiddleIncome = (data: AssetsReportDataProps[]): string => {
        const totalWeighted = data.reduce((a, b) => ((b.sum * (b.profitability || 0)) / 100) + a, 0);
        const totalSum = data.reduce((a, b) => a + b.sum, 0);
        const percent = totalSum ? ((totalWeighted / totalSum) * 100).toFixed(2) : '0';
        return `Прогнозируемая доходность портфеля на ближайшие полгода-год — ${percent}%`;
    };

    return (
        <div className = { styles.wrapper }>
            <div className = { `flex flex-col gap-[20px] ${styles.main_button} z-50 max-sm:hidden` }>
                <button
                    type = 'button'
                    onClick = { () => {
                        setIsPrint(true);
                        setTimeout(() => handleExport(), 500);
                    } }
                    className = 'button_yellow whitespace-nowrap leading-tight'
                >
                    Сохранить PDF
                </button>
            </div>
            <div
                className = { `${styles.pdfExport} ${isPrint ? 'pdfExport__print' : null}` }
                ref = { pdfExport }
            >
                <CoverReportComponent />

                { targets.map((target, i) => {
                    const Component = TARGET_COMPONENT_MAP[target.type];
                    if (!Component) return null;
                    return <Component key = { target.key || i } target = { target } number = { i + 5 } />;
                }) }

                <TaxPlanningReportComponent number = { 5 + targets.length } />

                { leftData.length ? (
                    <AssetsReportComponent
                        title = 'Резюме'
                        subtitle = 'Распределение текущего капитала'
                        number = { String(6 + targets.length) }
                        currency = 'RUB'
                        data = { leftData }
                        addTaxResult = { 0 }
                        middleIncome = { calculateMiddleIncome(leftData) }
                    />
                ) : null }

                { rightData.length ? (
                    <AssetsReportComponent
                        title = 'Резюме'
                        subtitle = 'Ежемесячные расходы на достижение всех целей'
                        number = { String(7 + targets.length) }
                        currency = 'RUB'
                        data = { rightData }
                        addTaxResult = { 0 }
                        middleIncome = { calculateMiddleIncome(rightData) }
                    />
                ) : null }

                <ProductsDepositReportComponent number = { 8 + targets.length } />
                <ProductsObligationsReportComponent number = { 8 + targets.length } />
                <ProductsAssetsReportComponent number = { 8 + targets.length } />
                <ProductsAutofollowReportComponent number = { 8 + targets.length } />
                <ProductsNszReportComponent number = { 8 + targets.length } />

                <DisclaimerReportComponent number = { 8 + targets.length } />
                <RiskDeclarationReportComponent number = { 9 + targets.length } />
                <TaxGoalReportComponent number = { 10 + targets.length } />
                <RiskProfileReportComponent number = { 11 + targets.length } />
                { targets.some((t) => t.type === TargetTypeEnum.StatePension) ? (
                    <MethodSatePensionReportComponent number = { 12 + targets.length } />
                ) : null }
            </div>
        </div>
    );
};

export default ReportPage;
