import ReportLayout from '@/layout/report';
import { UniversalLinkInfo } from '@/types/report';
import style from './style.module.scss';

type ProductsAssetsReportType = {
    number: number;
    links?: (UniversalLinkInfo | undefined)[];
};

const ProductsAssetsReportComponent = ({ number, links }: ProductsAssetsReportType) => (
    <ReportLayout logoTop title='Продукты' number={`${number}`}>
        <span className='font-medium text-[14px] inline-block mb-[20px]'>Акции российских компаний</span>
        <div className='p-[10px] text-[12px] border-[#F1F0F5] border-[1px] rounded-[10px] leading-tight mb-[20px]'>
            <p className='mb-[5px]'>
                Стоимость акций может значительно колебаться в зависимости от финансового состояния компании,
                рыночных условий и других факторов.
            </p>
            <p>
                Инвестирование в акции может предложить значительный потенциал роста капитала, но также связано
                с более высоким уровнем риска по сравнению с облигациями.
            </p>
        </div>

        <div>
            <p className='text-[12px] mb-[5px] leading-tight'>
                Предугадать стоимость акций на горизонте, например, 5 лет сложно. Но есть тренд. Акции растут,
                несмотря на всевозможные кризисы.
            </p>
            <p className='text-[12px] mb-[15px] leading-tight'>
                В расчетах мы используем следующие прогнозы по доходности:
            </p>
        </div>

        <div className='flex flex-col w-[240px] mx-auto'>
            <a href={links ? (links[0]?.link || '#') : '#'} target='_blank' className='button_yellow px-[40px] py-[10px] text-[13px] mb-[10px] whitespace-nowrap'>
                Купить Акции
            </a>
            <a href={links ? (links[1]?.link || '#') : '#'} target='_blank' className='button_black px-[10px] py-[10px] text-[13px] mb-[10px] whitespace-nowrap'>
                Купить Акции на ИИС
            </a>
        </div>
        <p className='text-[8px] text-gray-600 mt-[20px]'>
            ИИР - Индивидуальная инвестиционная рекомендация.
            Создается инвестиционным советником, состоящий в реестре ЦБ. Регистрационный номер инвест.советника
            АО &quot;Финам&quot; в реестре ЦБ - №7
        </p>
    </ReportLayout>
);

export default ProductsAssetsReportComponent;
