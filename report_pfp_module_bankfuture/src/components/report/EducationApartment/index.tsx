import { ReportTarget } from '@/types/report';
import TargetGoalReport from '@/components/report/_shared/TargetGoalReport';
import coverImg from '@/assets/images/report/education/cover.png';

type GoalReportType = { number: number; target: ReportTarget };

const EducationApartmentReportComponent = ({ number, target }: GoalReportType) => (
    <TargetGoalReport number={number} target={target} title='Образование + Квартира' coverImgSrc={coverImg.src} />
);

export default EducationApartmentReportComponent;
