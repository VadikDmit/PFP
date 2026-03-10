import ReportLayout from '@/layout/report';
import { UniversalLinkInfo } from '@/types/report';
import style from './style.module.scss';

type ProductsObligationsReportType = {
    number: number;
    links?: (UniversalLinkInfo | undefined)[];
};

const ProductsObligationsReportComponent = ({ number, links }: ProductsObligationsReportType) => (
    <ReportLayout logoTop title='Продукты' number={`${number}`}>
        <span className='font-medium text-[14px] inline-block mb-[20px] max-sm:mr-[40%]'>
            Корпоративные облигации, ОФЗ, Флоатеры
        </span>
        <div className='p-[10px] text-[12px] border-[#F1F0F5] border-[1px] rounded-[10px] leading-tight mb-[20px]'>
            <p>
                Облигации есть как с фиксированным купоном (выплатой %), так и флоатеры (выплата по бумагам
                зависит от ключевой ставки ЦБ или ROUNIA). Не забывайте, что стоимость облигаций может как
                расти, так и падать. Флоатеры, как правило, более стабильны в плане цены, но ставка динамически
                меняется.
            </p>
            <p>
                Купить и продать облигации можно на бирже через Брокера Финам. Так же не забывайте о
                преимуществах покупки облигаций на ИИС
            </p>
        </div>

        <div>
            <p className='text-[12px] mb-[5px] leading-tight'>
                Инфляция пока не снижается. ЦБ может еще поднимать ставку.
            </p>
            <p className='text-[12px] mb-[15px] leading-tight'>
                В расчетах мы используем следующие прогнозы по доходности:
            </p>
        </div>

        <div className='flex flex-col w-[240px] mx-auto'>
            <a href={links ? (links[0]?.link || '#') : '#'} target='_blank' className='button_yellow px-[40px] py-[10px] text-[13px] mb-[10px] whitespace-nowrap'>
                Купить облигации
            </a>
            <a href={links ? (links[1]?.link || '#') : '#'} target='_blank' className='button_black px-[10px] py-[10px] text-[13px] mb-[10px] whitespace-nowrap'>
                Купить облигации на ИИС
            </a>
        </div>
        <p className='text-[8px] text-gray-600 mt-[20px]'>ИИР - Индивидуальная инвестиционная рекомендация. Создается инвестиционным советником, состоящий в реестре ЦБ. Регистрационный номер инвест.советника АО &quot;Финам&quot; в реестре ЦБ - №7</p>
    </ReportLayout>
);

export default ProductsObligationsReportComponent;
