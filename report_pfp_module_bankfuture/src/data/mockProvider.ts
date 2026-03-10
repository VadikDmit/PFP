import { ReportDataProvider } from '@/types/dataProvider';
import {
    ReportTarget,
    PortfolioItem,
    CustomerInfo,
    TaxPlanningData,
    LiabilityInfo,
    AssetInfo,
    ToolInfo,
    UniversalLinkInfo,
    LoanScheduleData,
} from '@/types/report';

const generateGrowthCurve = (months: number, initial: number, monthly: number): number[] => {
    const result = [initial];
    for (let i = 1; i <= months; i++) {
        result.push(Math.round(result[i - 1] * 1.005 + monthly));
    }
    return result;
};

const generateCostCurve = (months: number, cost: number, inflationRate: number): number[] => {
    const result = [cost];
    const monthlyInflation = ((1 + inflationRate / 100) ** (1 / 12)) - 1;
    for (let i = 1; i <= months; i++) {
        result.push(Math.round(result[i - 1] * (1 + monthlyInflation)));
    }
    return result;
};

export const mockProvider: ReportDataProvider = {
    async getTargets(): Promise<ReportTarget[]> {
        return [
            {
                key: 'demo-finreserve',
                type: 'FIN_RESERVE',
                name: 'Финансовый резерв',
                months: 6,
                cost: 300000,
                initialCapital: 300000,
                initialReplenishment: 0,
                inflation: 0,
                currency: 'RUB',
                potentialYield: 17.1,
                riskProfile: 'CONSERVATIVE',
                costWithInflation: 300000,
                capitalRaising: generateGrowthCurve(6, 300000, 0),
                costRaising: generateCostCurve(6, 300000, 0),
            },
            {
                key: 'demo-pension',
                type: 'PENSION',
                name: 'Пассивный доход в будущем',
                months: 240,
                cost: 100000,
                inflation: 6,
                currency: 'RUB',
                initialCapital: 500000,
                initialReplenishment: 15000,
                costWithInflation: 265329,
                potentialYield: 8.7,
                riskProfile: 'BALANCED',
                capitalRaising: generateGrowthCurve(240, 500000, 15000),
                costRaising: generateCostCurve(240, 100000, 6),
            },
            {
                key: 'demo-invest',
                type: 'INVESTMENT',
                name: 'Инвестиции',
                months: 60,
                cost: 2000000,
                inflation: 6,
                currency: 'RUB',
                initialCapital: 800000,
                initialReplenishment: 20000,
                costWithInflation: 2676451,
                potentialYield: 11.2,
                riskProfile: 'AGGRESSIVE',
                capitalRaising: generateGrowthCurve(60, 800000, 20000),
                costRaising: generateCostCurve(60, 2000000, 6),
            },
            {
                key: 'demo-apartment',
                type: 'APARTMENT',
                name: 'Квартира',
                months: 120,
                cost: 8000000,
                inflation: 6,
                currency: 'RUB',
                initialCapital: 1500000,
                initialReplenishment: 30000,
                costWithInflation: 14326784,
                potentialYield: 9.5,
                riskProfile: 'BALANCED',
                capitalRaising: generateGrowthCurve(120, 1500000, 30000),
                costRaising: generateCostCurve(120, 8000000, 6),
            },
        ];
    },

    async getPortfolio(targetKey: string): Promise<{
        initialCapital: PortfolioItem[];
        monthlyReplenishment: PortfolioItem[];
    }> {
        const portfolios: Record<string, { initialCapital: PortfolioItem[]; monthlyReplenishment: PortfolioItem[] }> = {
            'demo-finreserve': {
                initialCapital: [
                    {
                        key: 'deposit', title: 'Банковский депозит', sum: 210000,
                        percent: 17.1, share: 70, currency: 'RUB',
                    },
                    {
                        key: 'bonds-gov', title: 'Гос. облигации', sum: 90000,
                        percent: 12.5, share: 30, currency: 'RUB',
                    },
                ],
                monthlyReplenishment: [],
            },
            'demo-pension': {
                initialCapital: [
                    {
                        key: 'deposit', title: 'Банковский депозит', sum: 150000,
                        percent: 17.1, share: 30, currency: 'RUB',
                    },
                    {
                        key: 'bonds', title: 'Корпоративные облигации', sum: 175000,
                        percent: 11.2, share: 35, currency: 'RUB',
                    },
                    {
                        key: 'stocks', title: 'Дивидендные акции', sum: 175000,
                        percent: 14.5, share: 35, currency: 'RUB',
                    },
                ],
                monthlyReplenishment: [
                    {
                        key: 'deposit-m', title: 'Банковский депозит', sum: 4500,
                        percent: 17.1, share: 30, currency: 'RUB',
                    },
                    {
                        key: 'bonds-m', title: 'Корпоративные облигации', sum: 5250,
                        percent: 11.2, share: 35, currency: 'RUB',
                    },
                    {
                        key: 'stocks-m', title: 'Дивидендные акции', sum: 5250,
                        percent: 14.5, share: 35, currency: 'RUB',
                    },
                ],
            },
            'demo-invest': {
                initialCapital: [
                    {
                        key: 'bonds', title: 'Корпоративные облигации', sum: 240000,
                        percent: 11.2, share: 30, currency: 'RUB',
                    },
                    {
                        key: 'stocks', title: 'Акции роста', sum: 320000,
                        percent: 16.8, share: 40, currency: 'RUB',
                    },
                    {
                        key: 'etf', title: 'ETF фонды', sum: 240000,
                        percent: 12.3, share: 30, currency: 'RUB',
                    },
                ],
                monthlyReplenishment: [
                    {
                        key: 'bonds-m', title: 'Корпоративные облигации', sum: 6000,
                        percent: 11.2, share: 30, currency: 'RUB',
                    },
                    {
                        key: 'stocks-m', title: 'Акции роста', sum: 8000,
                        percent: 16.8, share: 40, currency: 'RUB',
                    },
                    {
                        key: 'etf-m', title: 'ETF фонды', sum: 6000,
                        percent: 12.3, share: 30, currency: 'RUB',
                    },
                ],
            },
            'demo-apartment': {
                initialCapital: [
                    {
                        key: 'deposit', title: 'Банковский депозит', sum: 450000,
                        percent: 17.1, share: 30, currency: 'RUB',
                    },
                    {
                        key: 'bonds', title: 'Облигации', sum: 525000,
                        percent: 11.2, share: 35, currency: 'RUB',
                    },
                    {
                        key: 'stocks', title: 'Акции', sum: 525000,
                        percent: 13.5, share: 35, currency: 'RUB',
                    },
                ],
                monthlyReplenishment: [
                    {
                        key: 'deposit-m', title: 'Банковский депозит', sum: 9000,
                        percent: 17.1, share: 30, currency: 'RUB',
                    },
                    {
                        key: 'bonds-m', title: 'Облигации', sum: 10500,
                        percent: 11.2, share: 35, currency: 'RUB',
                    },
                    {
                        key: 'stocks-m', title: 'Акции', sum: 10500,
                        percent: 13.5, share: 35, currency: 'RUB',
                    },
                ],
            },
        };
        return portfolios[targetKey] || { initialCapital: [], monthlyReplenishment: [] };
    },

    async getCustomer(): Promise<CustomerInfo> {
        return {
            id: 'DEMO-001',
            name: 'Демонстрационный Клиент',
            birthDate: new Date('1985-06-15'),
            gender: 'MALE',
        };
    },

    async getTaxPlanning(): Promise<TaxPlanningData> {
        return {
            incomeBeforeTax: 200000,
            spouseExists: true,
            spouseIncomeBeforeTax: 120000,
            iisDeduction: 52000,
            nszDeduction: 15600,
            apartmentDeduction: 0,
            mortgageDeduction: 0,
            childrenBenefit: 2800,
            childrenCount: 2,
        };
    },

    async getLiabilities(): Promise<LiabilityInfo[]> {
        return [];
    },

    async getAssets(): Promise<AssetInfo[]> {
        return [
            { type: 'AVAILABLE_FUNDS', amount: 500000, currency: 'RUB' },
            { type: 'DEPOSIT', amount: 300000, profitability: 17.1, currency: 'RUB' },
        ];
    },

    async getAgentName(): Promise<string> {
        return 'Консультант Демо';
    },

    async getTools(): Promise<ToolInfo[]> {
        return [
            { key: 'deposit', name: 'Банковский депозит', currency: 'RUB', profitability: 17.1 },
            { key: 'bonds', name: 'Корпоративные облигации', currency: 'RUB', profitability: 11.2 },
            { key: 'bonds-gov', name: 'Государственные облигации', currency: 'RUB', profitability: 12.5 },
            { key: 'stocks', name: 'Дивидендные акции', currency: 'RUB', profitability: 14.5 },
            { key: 'etf', name: 'ETF фонды', currency: 'RUB', profitability: 12.3 },
        ];
    },

    async getPartnerLinks(): Promise<UniversalLinkInfo[]> {
        return [];
    },

    async calculateCapitalGrowth(target: ReportTarget): Promise<number[]> {
        return generateGrowthCurve(
            target.months,
            target.initialCapital || 0,
            target.initialReplenishment || 0,
        );
    },

    async calculateLoanSchedule(loanLines: LiabilityInfo[]): Promise<LoanScheduleData> {
        return {
            data: [],
            totalPercents: 0,
            monthsLoanLines: [],
            resPrepareDataChart: [],
        };
    },

    async getProductProfitability(productKey: string, months: number): Promise<number> {
        const rates: Record<string, number> = {
            deposit: 17.1,
            bonds: 11.2,
            'bonds-gov': 12.5,
            stocks: 14.5,
            etf: 12.3,
        };
        return rates[productKey] || 8.0;
    },

    async getRiskProfileLabel(riskScore: number, months: number): Promise<string | undefined> {
        if (riskScore < 2) return 'Консервативный';
        if (riskScore < 3.5) return 'Сбалансированный';
        if (riskScore < 5) return 'Агрессивный';
        return 'Сверхагрессивный';
    },
};
