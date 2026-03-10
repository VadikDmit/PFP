import type { AppProps } from 'next/app';
import { ReportProvider } from '@/context/ReportContext';
import '@/assets/styles/normalize.css';
import '@/styles/globals.css';

const App = ({ Component, pageProps }: AppProps) => (
    <ReportProvider>
        <Component { ...pageProps } />
    </ReportProvider>
);

export default App;
