interface CalcParams {
    cost: number;
    inflation: number;
    months: number;
}

const calculateMonthlyContribution = (params: CalcParams): number => {
    const years = params.months / 12;
    return Math.ceil(params.cost * Math.pow(1 + params.inflation / 100, years));
};

export default calculateMonthlyContribution;
