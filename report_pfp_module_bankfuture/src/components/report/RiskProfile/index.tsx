import balanceProfileImg from '@/assets/images/report/riskProfile/balance.jpg';
import agressiveProfileImg from '@/assets/images/report/riskProfile/agressive.jpg';
import conservativeProfileImg from '@/assets/images/report/riskProfile/conservative.jpg';
import superAgressiveProfileImg from '@/assets/images/report/riskProfile/super_agressive.jpg';
import ReportLayout from '@/layout/report';
import style from './style.module.scss';

type RiskProfileReportType = { number: number };

const RiskProfileReportComponent = ({ number }: RiskProfileReportType) => (
    <ReportLayout title='Риск-профилирование' number={`${number}`} logoTop>
        <span className={style.riskProfile_title}>Риск-профилирование</span>
        <p className={style.riskProfile_text}>
            Риск-профиль для цели определяет, как вы готовы рискнуть своими средствами, чтобы достичь этой цели. Он влияет на стратегию достижения цели, определяя, какие инвестиционные инструменты будут использоваться и как они будут сочетаться для создания инвестиционного портфеля.
        </p>
        <ul className={style.riskProfile__list}>
            <li className={style.riskProfile__list_item}>
                <div className={style.riskProfile__list_item_img_wrapper}><img src={conservativeProfileImg.src} alt='Консервативный профиль' /></div>
                <div>
                    <span style={{ background: '#F1EBD5', color: 'black' }} className={style.riskProfile__list_item_title}>Консервативный профиль</span>
                    <p className={style.riskProfile__list_item_description}>Если ваша цель имеет консервативный риск-профиль, это означает, что вы предпочитаете сохранять свои средства и минимизировать риски. Ваш инвестиционный портфель, скорее всего, будет состоять из более безопасных и стабильных активов, таких как облигации и депозиты.</p>
                </div>
            </li>
            <li className={style.riskProfile__list_item}>
                <div className={style.riskProfile__list_item_img_wrapper}><img src={balanceProfileImg.src} alt='Сбалансированный профиль' /></div>
                <div>
                    <span style={{ background: '#D8E3F0', color: 'black' }} className={style.riskProfile__list_item_title}>Сбалансированный профиль</span>
                    <p className={style.riskProfile__list_item_description}>Если ваша цель имеет сбалансированный риск-профиль, это означает, что вы стремитесь к балансу между ростом и риском. Ваш инвестиционный портфель может включать в себя смесь активов с различным уровнем риска, включая акции, облигации и альтернативные инвестиции, чтобы максимизировать доходность при приемлемом уровне риска.</p>
                </div>
            </li>
            <li className={style.riskProfile__list_item}>
                <div className={style.riskProfile__list_item_img_wrapper}><img src={agressiveProfileImg.src} alt='Агрессивный профиль' /></div>
                <div>
                    <span style={{ background: '#FF6B6E' }} className={style.riskProfile__list_item_title}>Агрессивный профиль</span>
                    <p className={style.riskProfile__list_item_description}>Если ваша цель имеет агрессивный риск-профиль, это означает, что вы готовы принять повышенный риск для достижения более высокой доходности. Ваш инвестиционный портфель, вероятно, будет состоять в основном из акций и других активов с высоким уровнем риска, которые могут предложить высокую потенциальную доходность.</p>
                </div>
            </li>
            <li className={style.riskProfile__list_item}>
                <div className={style.riskProfile__list_item_img_wrapper}><img src={superAgressiveProfileImg.src} alt='Суперагрессивный профиль' /></div>
                <div>
                    <span style={{ background: '#cc0003' }} className={style.riskProfile__list_item_title}>Агрессивный профиль</span>
                    <p className={style.riskProfile__list_item_description}>Если ваша цель имеет сверхагрессивный риск-профиль, это означает, что вы готовы принять максимальный риск для достижения наивысшей возможной доходности. Ваш инвестиционный портфель, вероятно, будет состоять из акций, автоследований, торговли на бирже фьючерсами и опционами. Этот профиль подходит для инвесторов, которые обладают высокой толерантностью к рискам и готовы к значительным колебаниям стоимости портфеля ради потенциально значительных прибылей.</p>
                </div>
            </li>
        </ul>
    </ReportLayout>
);

export default RiskProfileReportComponent;
