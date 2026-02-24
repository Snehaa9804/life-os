import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

function App() {
    return (
        <ErrorBoundary>
            <StoreProvider>
                <BrowserRouter>
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
                </BrowserRouter>
            </StoreProvider>
        </ErrorBoundary>
    );
}

export default App;
