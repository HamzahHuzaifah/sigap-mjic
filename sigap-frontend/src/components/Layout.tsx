import { ReactNode } from 'react';
import { LayoutDashboard, ClipboardCheck, FileEdit, Printer, Bell, School, LogOut } from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeMenu: string;
  setActiveMenu: (menu: string) => void;
  onLogout: () => void;
}

export default function Layout({ children, activeMenu, setActiveMenu, onLogout }: LayoutProps) {
  const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: 'attendance', label: 'Input Absensi', icon: <ClipboardCheck size={20} /> },
    { id: 'grades', label: 'Input Nilai', icon: <FileEdit size={20} /> },
    { id: 'report', label: 'Cetak Rapor', icon: <Printer size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 flex-shrink-0 flex flex-col shadow-sm">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-md">
            <School size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary-700 to-primary-500 bg-clip-text text-transparent">
              SIGAP
            </h1>
            <p className="text-xs text-gray-500 font-medium tracking-wide">Admin Guru</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menus.map((menu) => (
            <button
              key={menu.id}
              onClick={() => setActiveMenu(menu.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-left font-medium ${
                activeMenu === menu.id
                  ? 'bg-primary-50 text-primary-700 shadow-sm border border-primary-100'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {menu.icon}
              {menu.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-3">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium text-sm"
          >
            <LogOut size={18} />
            Keluar
          </button>
          
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold">
              G
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold text-gray-700 truncate">Guru Pengajar</p>
              <p className="text-xs text-gray-500 truncate">Wali Kelas</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="glass px-8 py-5 flex items-center justify-between sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
            {menus.find((m) => m.id === activeMenu)?.label || 'Dashboard'}
          </h2>
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
              <Bell size={20} />
            </button>
          </div>
        </header>
        
        <div className="flex-1 overflow-auto p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
