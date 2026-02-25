import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { X, Menu, Rocket, ChevronRight, LogOut } from 'lucide-react';
import { useStore } from '../hooks/useStore';

const MobileNav = () => {
    const { settings, logout } = useStore();
    const [isOpen, setIsOpen] = useState(false);

    const mainItems = [
        { icon: 'grid_view', label: 'Home', path: '/' },
        { icon: 'task_alt', label: 'Tasks', path: '/tasks' },
        { icon: 'monitoring', label: 'Health', path: '/health' },
        { icon: 'account_balance_wallet', label: 'Money', path: '/finance' },
    ];

    const allItems = [
        { icon: 'grid_view', label: 'Dashboard', path: '/', category: 'Core' },
        { icon: 'task_alt', label: 'Tasks', path: '/tasks', category: 'Core' },
        { icon: 'monitoring', label: 'Health Hub', path: '/health', category: 'Core' },
        { icon: 'account_balance_wallet', label: 'Finances', path: '/finance', category: 'Core' },
        { icon: 'check_circle', label: 'Habit Adder', path: '/habits', category: 'Productivity' },
        { icon: 'track_changes', label: 'Goals', path: '/goals', category: 'Growth' },
        { icon: 'trending_up', label: 'Growth Hub', path: '/growth', category: 'Growth' },
        { icon: 'smart_display', label: 'YouTube Studio', path: '/youtube', category: 'Social' },
        { icon: 'settings', label: 'Settings', path: '/settings', category: 'System' },
    ];

    return (
        <>
            {/* Bottom Bar */}
            <nav className="lg:hidden fixed bottom-6 left-6 right-6 h-16 bg-card-bg/90 backdrop-blur-xl border border-border-color rounded-2xl flex items-center justify-around px-2 z-50 shadow-2xl">
                {mainItems.map((item) => (
                    <NavLink
                        key={item.label}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`
                        }
                    >
                        <span className={`material-symbols-outlined text-[20px] ${item.path === '/' ? 'fill-1' : ''}`}>
                            {item.icon}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-tighter">{item.label}</span>
                    </NavLink>
                ))}
                <button
                    onClick={() => setIsOpen(true)}
                    className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl text-gray-400"
                >
                    <Menu size={20} />
                    <span className="text-[9px] font-black uppercase tracking-tighter">More</span>
                </button>
            </nav>

            {/* Mobile Sidebar Menu Overlay */}
            <div className={`fixed inset-0 z-[60] lg:hidden transition-all duration-500 ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
                <div className="absolute inset-0 bg-background/60 backdrop-blur-md" onClick={() => setIsOpen(false)}></div>

                <div className={`absolute right-0 top-0 bottom-0 w-[80%] max-w-[320px] bg-card-bg border-l border-border-color shadow-2xl flex flex-col transition-transform duration-500 ease-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                    <div className="p-8 border-b border-border-color flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary size-8 rounded-lg flex items-center justify-center text-white">
                                <Rocket size={16} />
                            </div>
                            <h2 className="text-sm font-black italic uppercase tracking-tighter">System <span className="text-primary">Menu</span></h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="size-8 rounded-lg bg-primary/5 text-gray-400 flex items-center justify-center">
                            <X size={18} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                        {['Core', 'Productivity', 'Growth', 'Social', 'System'].map((cat) => (
                            <div key={cat} className="space-y-3">
                                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-2">{cat}</h3>
                                <div className="space-y-1">
                                    {allItems.filter(i => i.category === cat).map((item) => (
                                        <NavLink
                                            key={item.label}
                                            to={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={({ isActive }) =>
                                                `flex items-center justify-between p-3 rounded-xl transition-all ${isActive
                                                    ? 'bg-primary/10 text-primary font-bold'
                                                    : 'text-foreground/60 hover:bg-primary/5 active:scale-95'}`
                                            }
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="material-symbols-outlined text-lg">{item.icon}</span>
                                                <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                            </div>
                                            <ChevronRight size={14} className="opacity-20" />
                                        </NavLink>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 border-t border-border-color space-y-4">
                        <NavLink
                            to="/settings"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl"
                        >
                            <div className="bg-primary/20 size-8 rounded-full flex items-center justify-center text-primary font-bold text-[10px]">
                                {settings.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] font-black truncate">{settings.name}</p>
                                <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">Operator</p>
                            </div>
                        </NavLink>

                        <button
                            onClick={() => { if (confirm('Terminate secure session?')) { setIsOpen(false); logout(); } }}
                            className="w-full flex items-center gap-3 p-3 text-red-500 bg-red-500/5 rounded-2xl border-none cursor-pointer active:scale-95 transition-all"
                        >
                            <div className="bg-red-500/10 size-8 rounded-lg flex items-center justify-center">
                                <LogOut size={16} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">Terminate Session</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default MobileNav;
