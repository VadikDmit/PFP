export type TargetType =
    | 'PENSION'
    | 'EDUCATION'
    | 'EDUCATION_V2021_09'
    | 'FIN_RESERVE'
    | 'RESERVE'
    | 'HEALTH'
    | 'REAL_ESTATE'
    | 'INVESTMENT'
    | 'INVESTMENT_NO_REPLENISHMENT'
    | 'CAPITAL_MULTIPLICATION'
    | 'APARTMENT'
    | 'HOUSE'
    | 'RENT'
    | 'MORTGAGE'
    | 'SAVE_CAPITAL'
    | 'LOAN_REFINANCING'
    | 'OWN_BUSINESS'
    | 'STATE_PENSION'
    | 'HERITAGE'
    | 'OTHER'
    | 'VOID'
    | 'PENSION_SPOUSE'
    | 'OTHER$AUTO'
    | 'OTHER$ANOTHER'
    | 'OTHER$CAPITAL'
    | 'OTHER$MOVE'
    | 'OTHER$SAFETYBAG'
    | 'OTHER$TRAVEL'
    | 'OTHER$FIN_RESERVE'
    | 'OTHER$MORTGAGE_INITIAL'
    | 'OTHER$EDUCATION_APARTMENT'
    | 'OTHER$EDUCATION_AUTO'
    | 'TAX_PLANNING'
    | 'MORTGAGE$HOUSE'
    | 'MORTGAGE$APARTMENT'
    | 'MORTGAGE$CASH'
    | 'MORTGAGE$REFINANCE'
    | 'MORTGAGE$AUTO';

export type RiskProfile = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE' | 'SUPER_AGGRESSIVE';

export interface ReportTarget {
    key?: string;
    type: TargetType;
    name: string;
    months: number;
    cost?: number;
    currency?: string;
    inflation?: number;
    rate?: number;
    initialCapital?: number;
    initialReplenishment?: number;
    costWithInflation?: number;
    potentialYield?: number;
    monthlyIncome?: number;
    riskProfile?: RiskProfile;
    capitalRaising?: number[];
    costRaising?: number[];
    studyYears?: number;
    education?: boolean;
    mortgageMonthlyPayment?: number;
    mortgageRate?: number;
    mortgageMonths?: number;
    mortgageDownPayment?: number;
    loanLines?: LoanLineInfo[];
    statePensionTotal?: number;
    statePensionMonthlyPayments?: number;
}

export interface PortfolioItem {
    key: string;
    title: string;
    sum: number;
    percent: number;
    share: number;
    currency: string;
    targetMonths?: number;
    profitability?: number;
}

export interface CustomerInfo {
    id?: string;
    name?: string;
    birthDate?: Date;
    gender?: 'MALE' | 'FEMALE';
}

export interface TaxPlanningData {
    incomeBeforeTax?: number;
    spouseExists?: boolean;
    spouseIncomeBeforeTax?: number;
    iisDeduction?: number;
    nszDeduction?: number;
    apartmentDeduction?: number;
    mortgageDeduction?: number;
    childrenBenefit?: number;
    spouseIisDeduction?: number;
    spouseNszDeduction?: number;
    spouseApartmentDeduction?: number;
    spouseMortgageDeduction?: number;
    childrenCount?: number;
}

export interface LiabilityInfo {
    type?: string;
    amountRest: number;
    rate: number;
    payment: number;
    months?: number;
}

export interface LoanLineInfo {
    name: string;
    amount: number;
    interestRate: number;
    monthlyPayment: number;
    months: number;
}

export interface AssetInfo {
    type?: string;
    amount: number;
    profitability?: number;
    exitDate?: string;
    currency?: string;
}

export interface ToolInfo {
    key: string;
    name: string;
    type?: string;
    currency?: string;
    maxTaxDeduction?: number;
    profitability?: number;
}

export interface UniversalLinkInfo {
    productNumber?: number;
    link?: string;
    name?: string;
}

export interface LoanScheduleData {
    data: number[][];
    totalPercents: number;
    monthsLoanLines: number[];
    resPrepareDataChart: number[][];
}

export type AssetsReportDataProps = {
    share: number;
    title: string;
    sum: number;
    profitability?: number;
    percent?: number;
    currency: string;
};
