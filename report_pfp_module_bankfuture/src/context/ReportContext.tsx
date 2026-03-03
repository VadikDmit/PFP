import React, {
    createContext, useContext, useState, useEffect, ReactNode,
} from 'react';
import { ReportDataProvider } from '@/types/dataProvider';
import {
    ReportTarget, PortfolioItem, CustomerInfo, TaxPlanningData, ToolInfo, UniversalLinkInfo,
} from '@/types/report';
import { mockProvider } from '@/data/mockProvider';

interface ReportContextType {
    targets: ReportTarget[];
    customer: CustomerInfo;
    taxPlanning: TaxPlanningData;
    tools: ToolInfo[];
    agentName: string;
    partnerLinks: UniversalLinkInfo[];
    getPortfolio: (targetKey: string) => Promise<{
        initialCapital: PortfolioItem[];
        monthlyReplenishment: PortfolioItem[];
    }>;
    getRiskProfileLabel: (riskScore: number, months: number) => Promise<string | undefined>;
    loading: boolean;
}

const ReportContext = createContext<ReportContextType | null>(null);

export const useReport = () => {
    const ctx = useContext(ReportContext);
    if (!ctx) throw new Error('useReport must be used within ReportProvider');
    return ctx;
};

interface ReportProviderProps {
    provider?: ReportDataProvider;
    children: ReactNode;
}

export const ReportProvider = ({ provider = mockProvider, children }: ReportProviderProps) => {
    const [targets, setTargets] = useState<ReportTarget[]>([]);
    const [customer, setCustomer] = useState<CustomerInfo>({});
    const [taxPlanning, setTaxPlanning] = useState<TaxPlanningData>({});
    const [tools, setTools] = useState<ToolInfo[]>([]);
    const [agentName, setAgentName] = useState('');
    const [partnerLinks, setPartnerLinks] = useState<UniversalLinkInfo[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            provider.getTargets(),
            provider.getCustomer(),
            provider.getTaxPlanning(),
            provider.getTools(),
            provider.getAgentName(),
            provider.getPartnerLinks(),
        ]).then(([t, c, tp, tl, a, pl]) => {
            setTargets(t);
            setCustomer(c);
            setTaxPlanning(tp);
            setTools(tl);
            setAgentName(a);
            setPartnerLinks(pl);
            setLoading(false);
        });
    }, []);

    return (
        <ReportContext.Provider value = { {
            targets,
            customer,
            taxPlanning,
            tools,
            agentName,
            partnerLinks,
            getPortfolio: provider.getPortfolio.bind(provider),
            getRiskProfileLabel: provider.getRiskProfileLabel.bind(provider),
            loading,
        } }>
            { children }
        </ReportContext.Provider>
    );
};
