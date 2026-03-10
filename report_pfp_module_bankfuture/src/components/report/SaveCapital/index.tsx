import { ReportTarget } from '@/types/report';
import TargetGoalReport from '@/components/report/_shared/TargetGoalReport';
import coverImg from '@/assets/images/report/saveCapital/cover.jpg';

type GoalReportType = { number: number; target: ReportTarget };

const SaveCapitalReportComponent = ({ number, target }: GoalReportType) => (
    <TargetGoalReport number={number} target={target} title='Защитить Капитал' coverImgSrc={coverImg.src} />
);

export default SaveCapitalReportComponent;
