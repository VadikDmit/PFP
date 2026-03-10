import Background from '@/assets/images/report/cover/background.png';
import { months } from '@/components/report/archive/const/date';
import { useReport } from '@/context/ReportContext';
import LogoSVG from '@/assets/svgs/Logo';
import styles from '@/layout/report/style.module.scss';
import style from './style.module.scss';

const CoverReportComponent = () => {
    const { customer, agentName } = useReport();
    const date = new Date();
    const dateDay = date.getDate();
    const dateMonth = months[date.getMonth()];
    const dateYear = date.getFullYear();

    return (
        <div
            className={`${style.general_page} ${styles.page} page`}
            style={{
                height: 840,
                background: `url(${Background.src}) no-repeat`,
                backgroundSize: 'cover',
                marginBlockStart: 0,
            }}
        >
            <div style={{ width: '595px', height: '842px' }}>
                <div className={style.footer_logo}>
                    <LogoSVG width={190} />
                </div>
                <div className={style.content__big_content}>
                    <p
                        className={style.content__big_content_bot}
                        style={{ fontSize: 15, marginBlockEnd: 10 }}
                    >
                        {`# ${customer.id || ''}`}
                    </p>
                    <p className={style.content__big_content_top}>ПЕРСОНАЛЬНОЕ</p>
                    <p className={style.content__big_content_top} style={{ marginBlockEnd: '10px' }}>
                        ФИНАНСОВОЕ РЕШЕНИЕ
                    </p>
                    <p className={style.content__big_content_bot}>
                        {`${dateDay} ${dateMonth} ${dateYear}`}
                    </p>
                </div>
                <div className={style.cover__author}>
                    <span className={style.cover__author_name}>{agentName}</span>
                </div>
            </div>
        </div>
    );
};

export default CoverReportComponent;
