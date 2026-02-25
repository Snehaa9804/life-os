import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';

const MainLayout = () => {
    return (
        <div className="flex w-full min-h-screen bg-background text-foreground transition-colors duration-400">
            <Sidebar />
            <main className="flex-1 flex flex-col h-screen overflow-hidden bg-background relative pb-24 lg:pb-0">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <Outlet />
                </div>
                <MobileNav />
            </main>
        </div>
    );
};

export default MainLayout;
