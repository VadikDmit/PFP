import { ReportTarget } from '@/types/report';
import TargetGoalReport from '@/components/report/_shared/TargetGoalReport';
import coverImg from '@/assets/images/report/invest/cover.png';

type GoalReportType = { number: number; target: ReportTarget };

const OtherMortgageInitialReportComponent = ({ number, target }: GoalReportType) => (
    <TargetGoalReport number={number} target={target} title='Первый взнос на ипотеку' coverImgSrc={coverImg.src} />
);

export default OtherMortgageInitialReportComponent;
