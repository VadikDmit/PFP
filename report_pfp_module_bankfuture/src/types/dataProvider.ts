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
} from './report';

/**
 * Interface for providing data to the report module.
 *
 * Implement this interface to connect the report to your backend.
 * See `src/data/mockProvider.ts` for a reference implementation with demo data.
 */
export interface ReportDataProvider {
    /** Fetch all financial targets/goals for the current client */
    getTargets(): Promise<ReportTarget[]>;

    /** Get portfolio allocation for a specific target by key */
    getPortfolio(targetKey: string): Promise<{
        initialCapital: PortfolioItem[];
        monthlyReplenishment: PortfolioItem[];
    }>;

    /** Get customer/client information */
    getCustomer(): Promise<CustomerInfo>;

    /** Get tax planning calculation results */
    getTaxPlanning(): Promise<TaxPlanningData>;

    /** Get customer liabilities (loans, credits) */
    getLiabilities(): Promise<LiabilityInfo[]>;

    /** Get customer current assets */
    getAssets(): Promise<AssetInfo[]>;

    /** Get advisor/agent display name */
    getAgentName(): Promise<string>;

    /** Get available investment tools/products */
    getTools(): Promise<ToolInfo[]>;

    /** Get partner product links for recommendations */
    getPartnerLinks(): Promise<UniversalLinkInfo[]>;

    /** Calculate capital growth projection for a target */
    calculateCapitalGrowth(target: ReportTarget): Promise<number[]>;

    /** Calculate loan refinancing amortization schedule */
    calculateLoanSchedule(loanLines: LiabilityInfo[]): Promise<LoanScheduleData>;

    /** Get investment product profitability by product key and time horizon */
    getProductProfitability(productKey: string, months: number): Promise<number>;

    /** Determine risk profile label based on score and investment horizon */
    getRiskProfileLabel(riskScore: number, months: number): Promise<string | undefined>;
}
