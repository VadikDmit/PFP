import React from 'react';
import type { CJMData } from '../CJMFlow';

interface StepProps {
    data: CJMData;
    setData: (data: CJMData) => void;
    onNext: () => void;
}

const StepGenderAge: React.FC<StepProps> = ({ data, setData, onNext }) => {
    return (
        <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Расскажите о себе</h2>

            <div style={{ marginBottom: '32px' }}>
                <label className="label">Ваш пол</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        className="btn-select"
                        style={{
                            flex: 1,
                            padding: '20px',
                            borderRadius: '16px',
                            border: `2px solid ${data.gender === 'male' ? '#C60C7F' : '#9CA3AF'}`,
                            background: data.gender === 'male' ? '#fff' : '#E5E7EB',
                            color: data.gender === 'male' ? '#C60C7F' : '#000000',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxShadow: data.gender === 'male' ? '0 4px 12px rgba(198,12,127,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onClick={() => setData({ ...data, gender: 'male' })}
                    >
                        Мужской
                    </button>
                    <button
                        className="btn-select"
                        style={{
                            flex: 1,
                            padding: '20px',
                            borderRadius: '16px',
                            border: `2px solid ${data.gender === 'female' ? '#C60C7F' : '#9CA3AF'}`,
                            background: data.gender === 'female' ? '#fff' : '#E5E7EB',
                            color: data.gender === 'female' ? '#C60C7F' : '#000000',
                            cursor: 'pointer',
                            fontWeight: '700',
                            fontSize: '16px',
                            transition: 'all 0.2s ease',
                            boxShadow: data.gender === 'female' ? '0 4px 12px rgba(198,12,127,0.2)' : 'inset 0 1px 2px rgba(0,0,0,0.05)'
                        }}
                        onClick={() => setData({ ...data, gender: 'female' })}
                    >
                        Женский
                    </button>
                </div>
            </div>

            <div style={{ marginBottom: '40px' }} className="step-gender-age-range-wrap">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <label className="label" style={{ marginBottom: 0 }}>Ваш возраст</label>
                    <span style={{ color: '#000', fontWeight: '700', fontSize: '20px' }}>{data.age} лет</span>
                </div>
                <input
                    type="range"
                    min="18"
                    max="80"
                    value={data.age}
                    onChange={(e) => setData({ ...data, age: parseInt(e.target.value) })}
                    style={{ width: '100%', accentColor: '#C60C7F' }}
                    className="step-gender-age-range"
                />
                <style>{`
                    .step-gender-age-range-wrap .step-gender-age-range::-webkit-slider-thumb {
                        -webkit-appearance: none;
                        width: 24px; height: 24px;
                        border-radius: 50%;
                        background: #fff;
                        border: 2px solid #C60C7F;
                        cursor: pointer;
                    }
                    .step-gender-age-range-wrap .step-gender-age-range::-moz-range-thumb {
                        width: 24px; height: 24px;
                        border-radius: 50%;
                        background: #fff;
                        border: 2px solid #C60C7F;
                        cursor: pointer;
                    }
                `}</style>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <span>18 лет</span>
                    <span>80 лет</span>
                </div>
            </div>

            <button className="btn-primary" onClick={onNext} style={{ background: '#C60C7F', color: '#fff', border: 'none' }}>Далее</button>
        </div>
    );
};

export default StepGenderAge;
