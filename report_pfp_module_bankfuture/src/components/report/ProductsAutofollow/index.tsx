import ReportLayout from '@/layout/report';
import imgProductOne from '@/assets/images/report/products/one_autofollow.png';
import imgProductTwo from '@/assets/images/report/products/two_autofollow.png';
import imgProductThree from '@/assets/images/report/products/three_autofollow.png';
import Image from 'next/image';
import { UniversalLinkInfo } from '@/types/report';

type ProductsAutofollowReportType = {
    number: number;
    links?: (UniversalLinkInfo | undefined)[];
};

const ProductsAutofollowReportComponent = ({ number, links }: ProductsAutofollowReportType) => (
    <ReportLayout logoTop title='Продукты' number={`${number}`}>
        <span className='font-medium text-[14px] inline-block mb-[20px] max-sm:mr-[45%]'>Автоследование Common от брокера Финам</span>
        <div className='p-[10px] text-[12px] border-[#F1F0F5] border-[1px] rounded-[10px] leading-tight mb-[10px]'>
            <p className='mb-[5px]'>
                Вы можете попробовать торговать на бирже самостоятельно, но статистика показывает, что 85% новичков
                трейдеров в первые два года уходит в минус. Но потенциальная доходность активной торговли может быть
                вам так же интересна.
            </p>
            <p>
                Для тех, кто не хочет тратить время на обучение, а потом на трейдинг есть вариант
                Автоследование(copytading). Ваш капитал автоматически копирует сделки за выбранным трейдером.
            </p>
        </div>

        <p className='font-medium text-[14px] mb-[15px] leading-tight'>
            Примеры стратегий от профессионалов Finam InvestLAB:
        </p>

        <div className='flex gap-[9px] mb-[10px] max-sm:flex-col'>
            <a className='flex-1 max-sm:w-[60%]' href='https://www.comon.ru/strategies/113188/' target='_blank'>
                <Image quality={100} className='!relative' src={imgProductOne.src} alt='Стратегия Техническая классика NEW' fill />
            </a>
            <a className='flex-1 max-sm:w-[60%]' href='https://www.comon.ru/strategies/110121/' target='_blank'>
                <Image quality={100} className='!relative' src={imgProductTwo.src} alt='Стратегия Накопительная Акции РФ' fill />
            </a>
            <a className='flex-1 max-sm:w-[60%]' href='https://www.comon.ru/strategies/7467/' target='_blank'>
                <Image quality={100} className='!relative' src={imgProductThree.src} alt='Стратегия Семь Самураев' fill />
            </a>
        </div>

        <p className='text-[8px] text-gray-500'>* - параметры по стратегиям приведены на актуальную дату. Актуальные данные по среднегодовым доходностям вы можете найти, нажав на любую карточку Стратегии или кнопку &quot;Все стратегии&quot;</p>

        <div className='text-[10px] mb-[10px] max-sm:mb-[30px]'>
            <p className='mb-[10px]'>На площадке Common представлены более 500 стратегий:</p>
            <ul className='relative flex flex-wrap pl-[15px] mb-[10px]'>
                <li className='basis-1/2 max-sm:basis-full list-disc'>со среднегодовой доходностью более 100%</li>
                <li className='basis-1/2 max-sm:basis-full list-disc'>с историей более 5 лет</li>
                <li className='basis-1/2 max-sm:basis-full list-disc'>с минимальной суммой инвестирования от 10 000&#8381;</li>
                <li className='basis-1/2 max-sm:basis-full list-disc'>с пополнением и снятием без ограничений</li>
            </ul>
            <p>
                Активы остаются под вашим контролем, вы видите что покупается, продается на Ваш брокерский счет. Выйти из
                стратегии вы сможете в любой момент. Помните, что даже опытный трейдер может уйти в минус со своего пика
                на какой-то промежуток времени.
            </p>
        </div>

        <div className='flex flex-col w-[240px] mx-auto max-sm:mb-[20px]'>
            <a href={links ? (links[0]?.link || '#') : '#'} target='_blank' className='button_yellow px-[40px] py-[10px] text-[13px] mb-[10px] whitespace-nowrap'>
                Все стратегии
            </a>
            <a href={links ? (links[1]?.link || '#') : '#'} target='_blank' className='button_black px-[10px] py-[10px] text-[13px] mb-[10px] whitespace-nowrap'>
                Открыть брокерский счёт
            </a>
        </div>
    </ReportLayout>
);

export default ProductsAutofollowReportComponent;
