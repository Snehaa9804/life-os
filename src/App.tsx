import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { StoreProvider } from './hooks/useStore';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import Habits from './pages/Habits';
import Finance from './pages/Finance';
import Growth from './pages/Growth';
import Health from './pages/Health';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import YouTube from './pages/YouTube';
import Tasks from './pages/Tasks';
import Login from './pages/Login';
import { useStore } from './hooks/useStore';

const AppContent = () => {
    const { isAuthenticated } = useStore();

    if (!isAuthenticated) {
        return <Login />;
    }

    return (
        <Routes>
            <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="habits" element={<Habits />} />
                <Route path="finance" element={<Finance />} />
                <Route path="health" element={<Health />} />
                <Route path="goals" element={<Goals />} />
                <Route path="growth" element={<Growth />} />
                <Route path="youtube" element={<YouTube />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="settings" element={<Settings />} />
            </Route>
        </Routes>
    );
};

function App() {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // If no client ID is found, we don't want to break the whole app, 
    // but the login service requires a string.
    const googleClientId = clientId || "loading";

    return (
        <ErrorBoundary>
            <StoreProvider>
                <GoogleOAuthProvider clientId={googleClientId}>
                    <BrowserRouter>
                        <AppContent />
                    </BrowserRouter>
                </GoogleOAuthProvider>
            </StoreProvider>
        </ErrorBoundary>
    );
}

export default App;
