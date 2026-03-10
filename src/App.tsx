import { useState, useCallback, useEffect } from 'react'
import './App.css'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import CJMFlow from './components/CJMFlow'
import ResultPage from './components/ResultPage'
import Header from './components/Header'
import MyPlansPage from './components/MyPlansPage'
import PresentPage from './components/PresentPage'
import PastPage from './components/PastPage'
import ReportPage from './components/ReportPage'
import type { Client } from './types/client'
import { clientApi, API_BASE_URL } from './api/clientApi'

type Page = 'loading' | 'landing' | 'login' | 'register' | 'past' | 'present' | 'future' | 'cjm' | 'result' | 'report'

function App() {
    const [currentPage, setCurrentPage] = useState<Page>(() => {
        return localStorage.getItem('token') ? 'loading' : 'landing';
    });
    const [calculationResult, setCalculationResult] = useState<any>(null);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [loadingPlan, setLoadingPlan] = useState(false);
    const [clientData, setClientData] = useState<Client | null>(null);
    const [autoOpenAddGoal, setAutoOpenAddGoal] = useState(false);
    const [reportClientId, setReportClientId] = useState<number | null>(null);

    const loadClientData = useCallback(async () => {
        try {
            const data = await clientApi.getMyPlan();
            setClientData(data);
            setSelectedClient(data);
            if (data?.goals_summary) {
                setCalculationResult(data.goals_summary);
                setCurrentPage('present');
            } else {
                // If no plan exists, redirect to onboarding
                setCurrentPage('cjm');
            }
        } catch (err: any) {
            console.error('Failed to load client data:', err);
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                setCurrentPage('landing');
            } else if (err.response?.status === 404) {
                setClientData(null);
                setCurrentPage('cjm');
            }
        }
    }, []);

    useEffect(() => {
        if (localStorage.getItem('token')) {
            loadClientData();
        }
    }, [loadClientData]);

    const handleNavigate = (page: 'past' | 'present' | 'future') => {
        setAutoOpenAddGoal(false); // Reset on normal nav
        if (page === 'future') {
            // Force go to result if we have any data to show
            if (calculationResult || clientData?.goals_summary) {
                if (!calculationResult && clientData?.goals_summary) {
                    setCalculationResult(clientData.goals_summary);
                }
                setCurrentPage('result');
            } else {
                // Only go to my plans if absolutely no summary exists
                setCurrentPage('future');
            }
        } else {
            setCurrentPage(page);
        }
    };

    const handleAddGoalClick = () => {
        setAutoOpenAddGoal(true);
        setCurrentPage('future');
    };

    const handleLoginSuccess = () => {
        loadClientData();
    };

    const handleRegisterSuccess = () => {
        loadClientData();
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setCurrentPage('landing');
        setCalculationResult(null);
        setSelectedClient(null);
        setClientData(null);
    };

    const handleCalculationComplete = async (result: any) => {
        console.log('Calculation Complete. Result:', result);

        try {
            // Force fetch full plan from server to ensure App state is perfectly in sync
            const fullClient = await clientApi.getMyPlan();
            setClientData(fullClient);
            setSelectedClient(fullClient);

            if (fullClient.goals_summary) {
                setCalculationResult(fullClient.goals_summary);
            } else {
                setCalculationResult(result);
            }
        } catch (err) {
            console.error('Failed to sync data after calculation:', err);
            // Fallback to what we have
            setCalculationResult(result);
            if (result?.client) {
                setClientData(result.client);
                setSelectedClient(result.client);
            }
        }

        setCurrentPage('result');
    };

    const handleViewPlan = (client: Client, result: any) => {
        setSelectedClient(client);
        setCalculationResult(result);
        setCurrentPage('result');
    };

    const handleRecalculate = useCallback(async (payload: any) => {
        console.log('handleRecalculate called with payload:', payload);

        const goalId = payload?.goal_id;

        if (!goalId) {
            console.error('No goal_id found in payload!');
            alert('Ошибка: ID цели не найден.');
            return null;
        }

        setLoadingPlan(true);
        try {
            const result = await clientApi.recalculate(goalId, payload);
            console.log('Recalculate success:', result);
            setCalculationResult(result);
            return result;
        } catch (error) {
            console.error('Recalculation failed:', error);
            alert('Не удалось произвести пересчёт. Проверьте данные.');
            return null;
        } finally {
            setLoadingPlan(false);
        }
    }, [loadClientData]);

    const handleAddGoal = useCallback(async (goal: any) => {
        if (!API_BASE_URL) {
            alert('Не удалось добавить цель: не настроен адрес API. Укажите NEXT_PUBLIC_API_URL в .env');
            return;
        }
        setLoadingPlan(true);
        try {
            const result = await clientApi.addGoal(goal);
            setCalculationResult(result);
            loadClientData();
        } catch (err: any) {
            console.error('Failed to add goal:', err);
            const status = err.response?.status;
            const msg = err.response?.data?.message ?? err.response?.data?.error ?? err.message;
            if (status === 401) {
                alert('Сессия истекла. Войдите снова.');
                loadClientData();
                return;
            }
            if (status === 404) {
                alert('Не удалось добавить цель: сервер не найден. Проверьте NEXT_PUBLIC_API_URL и что бэкенд запущен.');
                return;
            }
            alert(msg ? `Не удалось добавить цель: ${msg}` : 'Не удалось добавить цель. Проверьте подключение и данные.');
        } finally {
            setLoadingPlan(false);
        }
    }, [loadClientData]);

    const handleDeleteGoal = useCallback(async (goalId: number) => {
        if (!window.confirm('Вы уверены, что хотите удалить эту цель?')) return;
        setLoadingPlan(true);
        try {
            await clientApi.deleteGoal(goalId);
            loadClientData();
        } catch (err) {
            console.error('Failed to delete goal:', err);
            alert('Не удалось удалить цель.');
        } finally {
            setLoadingPlan(false);
        }
    }, [loadClientData]);

    const handleGoToReport = useCallback(() => {
        const cid = selectedClient?.id ?? clientData?.id;
        if (cid != null) {
            setReportClientId(cid);
            setCurrentPage('report');
        } else {
            alert('Ошибка: ID клиента не найден.');
        }
    }, [selectedClient, clientData]);

    // Auth pages (no header)
    if (currentPage === 'loading') {
        return (
            <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa' }}>
                <div style={{ padding: '24px', background: '#fff', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
                    <div className="animate-spin" style={{ width: '32px', height: '32px', border: '3px solid #f3f4f6', borderTopColor: '#C60C7F', borderRadius: '50%' }} />
                    <div style={{ fontWeight: '600', color: '#64748b' }}>Загрузка данных...</div>
                </div>
            </div>
        );
    }

    if (currentPage === 'login') {
        return (
            <div className="app-container">
                <LoginPage
                    onLoginSuccess={handleLoginSuccess}
                    onSwitchToRegister={() => setCurrentPage('register')}
                />
            </div>
        );
    }

    if (currentPage === 'landing') {
        return (
            <div className="app-container">
                <LandingPage
                    onStart={() => setCurrentPage('register')}
                    onLogin={() => setCurrentPage('login')}
                />
            </div>
        );
    }

    if (currentPage === 'register') {
        return (
            <div className="app-container">
                <RegisterPage
                    onRegisterSuccess={handleRegisterSuccess}
                    onSwitchToLogin={() => setCurrentPage('login')}
                />
            </div>
        );
    }

    // Main app with header
    const activeHeaderPage = (currentPage === 'past' || currentPage === 'present' || currentPage === 'future' || currentPage === 'result' || currentPage === 'report')
        ? (currentPage === 'result' || currentPage === 'report' ? 'future' : currentPage)
        : 'present';

    return (
        <div className="app-container">
            <Header
                activePage={activeHeaderPage}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
            />

            {currentPage === 'past' && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    <PastPage />
                </div>
            )}

            {currentPage === 'present' && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    <PresentPage
                        clientData={clientData}
                        onViewPlan={handleViewPlan}
                        onStartCJM={() => setCurrentPage('cjm')}
                        onAddGoalClick={handleAddGoalClick}
                    />
                </div>
            )}

            {currentPage === 'future' && (
                <MyPlansPage
                    onCreatePlan={() => setCurrentPage('cjm')}
                    onViewPlan={handleViewPlan}
                    autoOpenAddGoal={autoOpenAddGoal}
                    onOpenAddGoalHandled={() => setAutoOpenAddGoal(false)}
                />
            )}

            {currentPage === 'cjm' && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    <CJMFlow
                        onComplete={handleCalculationComplete}
                        onBack={() => setCurrentPage('present')}
                        isNewClient={!clientData?.goals_summary}
                    />
                </div>
            )}

            {currentPage === 'result' && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    {loadingPlan && (
                        <div style={{
                            position: 'fixed',
                            top: '80px',
                            right: '40px',
                            padding: '12px 24px',
                            background: '#C60C7F',
                            color: '#fff',
                            borderRadius: '12px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                            zIndex: 1000
                        }}>
                            Обновление расчёта...
                        </div>
                    )}
                    <ResultPage
                        data={calculationResult}
                        client={selectedClient}
                        onRestart={() => setCurrentPage('present')}
                        onRecalculate={handleRecalculate}
                        onAddGoal={handleAddGoal}
                        onDeleteGoal={handleDeleteGoal}
                        onGoToReport={handleGoToReport}
                        isCalculating={loadingPlan}
                    />
                </div>
            )}

            {currentPage === 'report' && reportClientId != null && (
                <div style={{ minHeight: 'calc(100vh - 64px)', background: '#f8f9fa' }}>
                    <ReportPage
                        clientId={reportClientId}
                        onBack={() => { setCurrentPage('result'); setReportClientId(null); }}
                        fallbackPlan={{ client: selectedClient, goalsSummary: calculationResult }}
                    />
                </div>
            )}
        </div>
    );
}


export default App;
