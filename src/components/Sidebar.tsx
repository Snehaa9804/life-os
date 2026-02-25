import { NavLink } from 'react-router-dom';
import { useStore } from '../hooks/useStore';

const Sidebar = () => {
    const { settings } = useStore();
    const menuItems = [
        { icon: 'grid_view', label: 'Dashboard', path: '/', delay: 'delay-100' },
        { icon: 'task_alt', label: 'Task List', path: '/tasks', delay: 'delay-200' },
        { icon: 'check_circle', label: 'Habit Adder', path: '/habits', delay: 'delay-300' },
        { icon: 'account_balance_wallet', label: 'Finances', path: '/finance', delay: 'delay-400' },
        { icon: 'monitoring', label: 'Health', path: '/health', delay: 'delay-500' },
        { icon: 'track_changes', label: 'Goals', path: '/goals', delay: 'delay-100' },
        { icon: 'trending_up', label: 'Growth Hub', path: '/growth', delay: 'delay-200' },
        { icon: 'smart_display', label: 'YouTube Studio', path: '/youtube', delay: 'delay-300' },
        { icon: 'settings', label: 'Settings', path: '/settings', delay: 'delay-400' },
    ];

    return (
        <aside className="hidden lg:flex w-64 flex-shrink-0 bg-card-bg border-r border-border-color flex flex-col justify-between p-6 h-screen sticky top-0 overflow-hidden">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-3">
                    <div className="bg-primary size-10 rounded-xl flex items-center justify-center text-white">
                        <span className="material-symbols-outlined">rocket_launch</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-foreground text-base font-black leading-none italic uppercase tracking-tighter">Life OS</h1>
                        <p className="text-primary text-[9px] font-black uppercase tracking-[0.2em] mt-1">Command Center</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-1">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.label}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 animate-slide-in-right ${item.delay} ${isActive
                                    ? 'bg-primary/10 text-primary font-bold shadow-sm border border-primary/10 glass'
                                    : 'text-gray-400 hover:bg-primary/5 hover:text-primary font-semibold hover:translate-x-1'
                                }`
                            }
                        >
                            <span className="material-symbols-outlined text-lg transition-transform duration-300 group-hover:scale-110">
                                {item.icon}
                            </span>
                            <p className="text-xs uppercase tracking-widest font-black leading-none">{item.label}</p>
                        </NavLink>
                    ))}
                </nav>
            </div>

            <NavLink to="/settings" className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl group transition-all hover:bg-primary/10 border border-transparent hover:border-primary/10 mt-auto">
                <div
                    className="bg-primary/20 aspect-square rounded-full size-10 flex items-center justify-center text-primary font-bold border border-primary/20"
                >
                    {settings.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black truncate">{settings.name}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Self-Custody</p>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary transition-colors text-lg">settings</span>
            </NavLink>
        </aside>
    );
};

export default Sidebar;
