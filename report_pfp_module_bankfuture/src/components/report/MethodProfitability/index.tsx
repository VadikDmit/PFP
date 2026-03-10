import coverOneImg from '@/assets/images/report/methodProfitability/cover_one.jpg';
import coverTwoImg from '@/assets/images/report/methodProfitability/cover_two.jpg';
import ReportLayout from '@/layout/report';
import style from './style.module.scss';

type MethodProfitabilityReportType = { chart: number; number: number };

const MethodProfitabilityReportComponent = ({ chart, number }: MethodProfitabilityReportType) => (chart === 1 ? (
    <ReportLayout title='Методика расчета потенциальной доходности' number={`${number}`}>
        <span className={style.taxGoal_title}>1. Расчет Среднеговодой доходности класса актива Акции</span>
        <p className={style.taxGoal_text}>
            Информация, представленная в данном финансовом плане, основана на исторических данных о доходности активов
            типа &quot;Акции&quot; за последние 10 лет. Расчеты проводились с использованием средней доходности ПИФов и ETF-ов,
            продаваемых на фондовом рынке, таких как ОПИФ Акции Альфа Банк, ОПИФ Акции ГАЗПРОМбанк, ETF Акции Сбер и ETF
            Акции IT Сбер.
        </p>
        <div className={style.taxGoal_img_wrapper}>
            <img src={coverOneImg.src} alt='Расчет Среднеговодой доходности класса актива Акции' className={style.taxGoal_img} />
        </div>
        <p className={style.taxGoal_text}>Формула расчет СГД _класс_акции (среднегодовая доходность)</p>
        <p className={style.taxGoal_text}>{'Параметры:\nP - массив стоимости акции на начало каждого года\nN - количество лет\nDn = (P[n+1] - P[n]) / P[n] * 100%\nDn -- доходность продукта в соответствующий год'}</p>
        <p className={style.taxGoal_text}>{'Средняя годовая доходность i-го продукта :\nСГД_i = (Σ(Dn)) / N, где n от 1 до N'}</p>
        <p className={style.taxGoal_text}>{'СГД_класс_акции = (Σ(СГД_i)) / m\nm - количество продуктов в наблюдении'}</p>
        <p className={style.taxGoal_text}>Данный материал предоставляется исключительно в информационных целях и не должен рассматриваться как инвестиционный совет или рекомендация к покупке или продаже какого-либо инвестиционного продукта.</p>
        <p className={style.taxGoal_text}>Обратите внимание, что прошлая доходность не является гарантией будущих результатов. Фактическая доходность может отличаться от расчетной из-за изменений на рынке, экономических условий или других факторов.</p>
    </ReportLayout>
) : (
    <ReportLayout title='Методика расчета потенциальной доходности' number={`${number}`}>
        <span className={style.taxGoal_title}>2. Расчет Среднеговодой доходности класса актива Облигации</span>
        <p className={style.taxGoal_text}>
            Информация, представленная в данном финансовом плане, основана на исторических данных о доходности активов
            типа &quot;Акции&quot; за последние 10 лет. Расчеты проводились с использованием средней доходности ПИФов и ETF-ов,
            продаваемых на фондовом рынке:
        </p>
        <div className={style.taxGoal_img_wrapper}>
            <img src={coverTwoImg.src} alt='Расчет Среднеговодой доходности класса актива Облигации' className={style.taxGoal_img} />
        </div>
        <p className={style.taxGoal_text}>Формула расчет СГД _класс_акции (среднегодовая доходность)</p>
        <p className={style.taxGoal_text}>{'Параметры:\nPn - стоимость продукта на начало соответствующего года\nN - количество лет\nDn = (P[n+1] - P[n]) / P[n] * 100%\nDn -- доходность продукта в соответствующий год'}</p>
        <p className={style.taxGoal_text}>{'Средняя годовая доходность i-го продукта :\nСГД_i = (Σ(Dn)) / N, где n от 1 до N'}</p>
        <p className={style.taxGoal_text}>{'СГД_класс_облигации = (Σ(СГД_i)) / m\nm-количество продуктов в наблюдении'}</p>
        <p className={style.taxGoal_text}>Данный материал предоставляется исключительно в информационных целях и не должен рассматриваться как инвестиционный совет или рекомендация к покупке или продаже какого-либо инвестиционного продукта.</p>
        <p className={style.taxGoal_text}>Обратите внимание, что прошлая доходность не является гарантией будущих результатов. Фактическая доходность может отличаться от расчетной из-за изменений на рынке, экономических условий или других факторов.</p>
    </ReportLayout>
));

export default MethodProfitabilityReportComponent;
