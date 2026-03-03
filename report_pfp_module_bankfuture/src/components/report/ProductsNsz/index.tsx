import ReportLayout from '@/layout/report';
import imgKapitalLife from '@/assets/images/partners/kapital_life.png';
import Image from 'next/image';

type ProductsNszReportType = { number: number };

const ProductsNszReportComponent = ({ number }: ProductsNszReportType) => (
    <ReportLayout logoTop title='Продукты' number={`${number}`}>
        <span className='font-medium text-[14px] inline-block mb-[20px]'>НСЖ</span>
        <p className='text-[14px] mb-[10px] leading-tight'>
            По Накопительному Страхованию Жизни, ИСЖ мы работаем с компанией
        </p>

        <Image className='mb-[30px]' src={imgKapitalLife.src} alt='Капитл Лайф Лого' width={139} height={37} />

        <div className='flex gap-[13px] rounded-[10px] bg-[#F1F0F5] p-[20px] mb-[20px] max-sm:flex-col'>
            <div className='flex-1'>
                <span className='block text-[16px]'>&#8470;1</span>
                <p className='text-[10px] leading-tight'>
                    по количеству действующих договоров накопительного страхования жизни в России - 616 тыс. договоров
                    (по данным ВСС за 2023 год)
                </p>
            </div>
            <div className='flex-1'>
                <span className='block text-[16px]'>&#8470;2</span>
                <p className='text-[10px] leading-tight'>
                    КАПИТАЛ LIFE обладает крупнейшим уставным капиталом среди всех российских страховщиков жизни -- 4,1 млрд рублей.
                </p>
            </div>
            <div className='flex-1'>
                <span className='block text-[16px]'>&#8470;3</span>
                <p className='text-[10px] leading-tight'>
                    по количеству урегулированных страховых случаев среди страховщиков жизни, по данным ВСС за 2023 год.
                    Компания урегулировала 1,2 млн страховых случаев в 2023 году.
                </p>
            </div>
        </div>

        <p className='text-[14px] mb-[30px] leading-tight'>
            Для получения предложения и консультации, оставьте заявку, мы передадим сотруднику компании, который сможем квалифицированно ответить на любые ваши вопросы.
        </p>

        <div className='flex justify-center'>
            <a target='_blank' href='#' className='button_yellow pl-[25px] pr-[24px] pt-[12px] pb-[13px] text-[16px] max-sm:text-[14px] mb-[10px max-sm:mb-[20px]'>
                Получить консультацию
            </a>
        </div>
    </ReportLayout>
);

export default ProductsNszReportComponent;
