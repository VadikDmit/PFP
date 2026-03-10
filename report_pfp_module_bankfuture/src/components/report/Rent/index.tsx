import { ReportTarget } from '@/types/report';
import TargetGoalReport from '@/components/report/_shared/TargetGoalReport';
import coverImg from '@/assets/images/report/apartment/cover.png';

type GoalReportType = { number: number; target: ReportTarget };

const RentReportComponent = ({ number, target }: GoalReportType) => (
    <TargetGoalReport number={number} target={target} title='Рентный доход' coverImgSrc={coverImg.src} />
);

export default RentReportComponent;
