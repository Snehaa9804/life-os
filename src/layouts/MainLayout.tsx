import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout = () => {
    return (
        <div className="flex w-full min-h-screen bg-background text-foreground transition-colors duration-400">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background">
                <Outlet />
            </main>
        </div>
    );
};

export default MainLayout;
