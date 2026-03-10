import React, { useEffect } from 'react';
import { User, Phone } from 'lucide-react';
import type { CJMData } from '../CJMFlow';

interface StepClientDataProps {
    data: CJMData;
    setData: React.Dispatch<React.SetStateAction<CJMData>>;
    onNext: () => void;
}

const StepClientData: React.FC<StepClientDataProps> = ({ data, setData, onNext }) => {

    // Auto-generate UUID if missing
    useEffect(() => {
        if (!data.uuid) {
            setData(prev => ({ ...prev, uuid: crypto.randomUUID() }));
        }
    }, []);

    const handleChange = (field: keyof CJMData, value: string | number) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const isFormValid = () => {
        return !!data.fio && !!data.phone; // Gender and Age have defaults
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }} className="step-client-data">
            <style>{`
                .step-client-data .step-client-data-range::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid #C60C7F;
                    cursor: pointer;
                }
                .step-client-data .step-client-data-range::-moz-range-thumb {
                    width: 24px; height: 24px;
                    border-radius: 50%;
                    background: #fff;
                    border: 2px solid #C60C7F;
                    cursor: pointer;
                }
            `}</style>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '32px', textAlign: 'center' }}>
                Расскажите о себе
            </h2>

            {/* Client Identity Section */}
            <div style={{ marginBottom: '32px' }}>
                <div className="input-group" style={{ marginBottom: '16px' }}>
                    <label className="label">ФИО клиента</label>
                    <div style={{ position: 'relative' }}>
                        <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="text"
                            value={data.fio || ''}
                            onChange={(e) => handleChange('fio', e.target.value)}
                            placeholder="Иванов Иван Иванович"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

                <div className="input-group" style={{ marginBottom: '16px' }}>
                    <label className="label">Телефон</label>
                    <div style={{ position: 'relative' }}>
                        <Phone size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                        <input
                            type="tel"
                            value={data.phone || ''}
                            onChange={(e) => handleChange('phone', e.target.value)}
                            placeholder="+7 (999) 000-00-00"
                            style={{ paddingLeft: '40px' }}
                        />
                    </div>
                </div>

            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '32px 0' }}></div>

            <div style={{ marginBottom: '32px' }}>
                <label className="label" style={{ marginBottom: '12px', display: 'block' }}>Ваш пол</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <button
                        className="btn-gender"
                        onClick={() => handleChange('gender', 'male')}
                        style={{
                            padding: '16px',
                            borderRadius: '16px',
                            border: `2px solid ${data.gender === 'male' ? '#C60C7F' : '#9CA3AF'}`,
                            background: data.gender === 'male' ? '#fff' : '#E5E7EB',
                            color: data.gender === 'male' ? '#C60C7F' : '#000',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxShadow: data.gender === 'male' ? '0 4px 12px rgba(198,12,127,0.2)' : 'none'
                        }}
                    >
                        Мужской
                    </button>
                    <button
                        className="btn-gender"
                        onClick={() => handleChange('gender', 'female')}
                        style={{
                            padding: '16px',
                            borderRadius: '16px',
                            border: `2px solid ${data.gender === 'female' ? '#C60C7F' : '#9CA3AF'}`,
                            background: data.gender === 'female' ? '#fff' : '#E5E7EB',
                            color: data.gender === 'female' ? '#C60C7F' : '#000',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxShadow: data.gender === 'female' ? '0 4px 12px rgba(198,12,127,0.2)' : 'none'
                        }}
                    >
                        Женский
                    </button>
                </div>
            </div>

                <div style={{ marginBottom: '40px' }} className="step-client-data-age">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <label className="label">Ваш возраст</label>
                    <span style={{ color: '#000', fontWeight: 'bold', fontSize: '20px' }}>{data.age} лет</span>
                </div>
                <input
                    type="range"
                    min="18"
                    max="80"
                    value={data.age}
                    onChange={(e) => handleChange('age', parseInt(e.target.value))}
                    style={{ width: '100%', accentColor: '#C60C7F' }}
                    className="step-client-data-range"
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <span>18 лет</span>
                    <span>80 лет</span>
                </div>
            </div>

            <button
                className="btn-primary"
                onClick={onNext}
                disabled={!isFormValid()}
                style={{
                    width: '100%',
                    opacity: isFormValid() ? 1 : 0.5,
                    cursor: isFormValid() ? 'pointer' : 'not-allowed',
                    background: '#C60C7F',
                    color: '#fff',
                    border: 'none'
                }}
            >
                Далее
            </button>
        </div>
    );
};

export default StepClientData;
