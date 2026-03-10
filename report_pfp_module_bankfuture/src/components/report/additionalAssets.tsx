import { AssetInfo } from '@/types/report';

type AdditionalAssetsProps = {
    assets: AssetInfo[];
};

const AdditionalAssets = ({ assets }: AdditionalAssetsProps) => {
    if (!assets.length) return null;

    return (
        <div className='mb-[20px]'>
            <span className='block text-[12px] font-medium mb-[10px]'>Дополнительные активы</span>
            <table className='w-full text-[10px]'>
                <thead>
                    <tr>
                        <td className='font-medium pb-[5px]'>Тип</td>
                        <td className='font-medium pb-[5px]'>Сумма</td>
                        <td className='font-medium pb-[5px]'>Доходность</td>
                        <td className='font-medium pb-[5px]'>Дата выхода</td>
                    </tr>
                </thead>
                <tbody>
                    {assets.map((asset, i) => (
                        <tr key={i}>
                            <td>{asset.type || '-'}</td>
                            <td>
                                {(asset.amount || 0).toLocaleString('ru-RU', {
                                    style: 'currency',
                                    currency: asset.currency || 'RUB',
                                    maximumFractionDigits: 0,
                                }).replace(/^(\D+)/, '$1 ').replace('CN', '')}
                            </td>
                            <td>{asset.profitability ? `${asset.profitability}%` : '-'}</td>
                            <td>{asset.exitDate || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default AdditionalAssets;
