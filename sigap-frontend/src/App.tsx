import { useState, useEffect } from 'react';
import { Users, BookOpen, CalendarCheck2, Sparkles } from 'lucide-react';
import Layout from './components/Layout';
import AttendanceForm from './components/AttendanceForm';
import GradeForm from './components/GradeForm';
import ReportForm from './components/ReportForm';
import LoginForm from './components/LoginForm';

function DashboardOverview() {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <Users size={80} />
          </div>
          <h3 className="text-gray-500 font-medium mb-1">Total Siswa</h3>
          <p className="text-3xl font-bold text-gray-800">5</p>
          <div className="mt-4 text-sm text-green-600 font-medium">100% Terdaftar</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <BookOpen size={80} />
          </div>
          <h3 className="text-gray-500 font-medium mb-1">Mata Pelajaran</h3>
          <p className="text-3xl font-bold text-gray-800">5</p>
          <div className="mt-4 text-sm text-primary-600 font-medium">Semester Genap</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110">
            <CalendarCheck2 size={80} />
          </div>
          <h3 className="text-gray-500 font-medium mb-1">Kehadiran Hari Ini</h3>
          <p className="text-3xl font-bold text-gray-800">-</p>
          <div className="mt-4 text-sm text-gray-400 font-medium">Belum diinput</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-8">
        <div className="w-20 h-20 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Sparkles size={40} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Selamat Datang di SIGAP!</h3>
        <p className="text-gray-500 max-w-lg mx-auto">
          Sistem Informasi Administrasi Guru yang memudahkan Anda mengelola data absensi, nilai, dan rekap rapor siswa secara terpusat.
        </p>
      </div>
    </div>
  );
}

function App() {
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  if (!token) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <Layout activeMenu={activeMenu} setActiveMenu={setActiveMenu} onLogout={handleLogout}>
      {activeMenu === 'dashboard' && <DashboardOverview />}
      {activeMenu === 'attendance' && <AttendanceForm />}
      {activeMenu === 'grades' && <GradeForm />}
      {activeMenu === 'report' && <ReportForm />}
    </Layout>
  );
}

export default App;
