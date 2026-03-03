import ReportLayout from '@/layout/report';
import pensionImg from '@/assets/images/report/statePension/cover.jpg';
import styleG from '@/components/report/style.module.scss';
import style from './style.module.scss';

type GoalReportType = { number: number };

const MethodSatePensionReportComponent = ({ number }: GoalReportType) => (
    <ReportLayout title='Методика расчетов. Гос.пенсия ' number={`${number}`}>
        <div className={styleG.container} style={{ alignItems: 'center', marginBlockEnd: 30 }}>
            <div className={styleG.top}>
                <p className={style.methodSPension_p} style={{ marginBlockEnd: 10 }}>
                    ПФР из текущих взносов застрахованных выплачивает пенсии сейчас.
                </p>
                <p className={style.methodSPension_p} style={{ fontSize: 12, fontWeight: 500, marginBlockEnd: 10 }}>
                    В будущем ПФР обещает так же выплачивать пенсии за счет взносов следующего поколения.
                </p>
                <p className={style.methodSPension_p} style={{ fontSize: 12, fontWeight: 500 }}>
                    Мы рассчитываем будущую пенсию, исходя из настоящей практики.
                </p>
            </div>
            <div className={styleG.top}>
                <div className={`${styleG.top_img} ${styleG.top_img__left}`} style={{ backgroundImage: `url(${pensionImg.src})` }} />
            </div>
        </div>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 20 }}>Пенсия = ИПК*Стоимость балла + фиксированная выплата</p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 15 }}>
            <b>Стоимость балла в 2024г. =</b>{' '}<span className={style.methodSPension_color}>133&#8381;</span>{' '}(индексация в 2024 г - 7.5%)
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 15 }}>
            <b>Фиксированная выплата в 2024 г. =</b>{' '}<span className={style.methodSPension_color}>8 134&#8381;</span>{' '}(индексация в 2024г. - 7.5%)
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 15 }}>
            <b>ИПК в год = (Взносы в ПФР в год/предельный взнос в ПФР)*10,</b>{' '}но не более 10
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 20 }}>
            Текущий предельный взнос в ПФР{' '}<span className={style.methodSPension_color}>489 500&#8381;</span>
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 15 }}>
            {'ПФР каждый год индексирует стоимость баллов ИПК\nи Фиксированную выплату на величину инфляции'}
        </p>
        <span className={style.methodSPension_color} style={{ marginBlockEnd: 20, fontSize: 12, color: 'black' }}>
            Программа долгосрочных сбережений
        </span>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 15 }}>
            Государство софинансирует в течении 3 лет взносы, но не более 3 000&#8381;/мес.
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 20 }}>
            При этом софинансирование зависит от белого дохода.
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 15 }}>
            Если доход в месяц{' '}<b>менее 80 000&#8381;</b>, то на 1&#8381; государство добавит 1&#8381;
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 15 }}>
            Если доход в месяц{' '}<b>от 80 001&#8381; до 150 000&#8381;</b>, то государство добавит на 1&#8381; 50 копеек
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 20 }}>
            Если доход в месяц{' '}<b>от 150 000&#8381;</b>, то только 25 копеек.
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 10 }}>
            {'Так же можно перевести на эту программу капитал с ОПС\n(Обязательное пенсионное страхование).'}
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 10 }}>
            Капитал инвестируется в облигации ОФЗ, российских компаний. Так же НПФ может инветсировать (но не более 10% от капитала) в акции.
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 10 }}>
            Полученный к моменту выхода на пенсию капитал используется для выплаты.
        </p>
        <p className={style.methodSPension_p} style={{ marginBlockEnd: 10 }}>
            Если бессрочно, то капитал делится на период дожития (22 г.) и выплачивается.
        </p>
        <p className={style.methodSPension_p}>
            Если в течении 10 лет -- то капитал делится на 120.
        </p>
    </ReportLayout>
);

export default MethodSatePensionReportComponent;
