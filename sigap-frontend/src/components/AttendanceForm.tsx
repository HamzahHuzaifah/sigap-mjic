import { useState, useEffect } from 'react';
import api from '../api';

interface Student {
  id: number;
  nisn: string;
  name: string;
}

export default function AttendanceForm() {
  const [students, setStudents] = useState<Student[]>([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<number, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
      
      // Initialize all with 'HADIR'
      const initial: Record<number, string> = {};
      response.data.forEach((student: Student) => {
        initial[student.id] = 'HADIR';
      });
      setAttendance(initial);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const handleStatusChange = (studentId: number, status: string) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const promises = students.map((student) => 
        api.post('/attendances', {
          date: new Date(date).toISOString(),
          studentId: student.id,
          status: attendance[student.id]
        })
      );

      await Promise.all(promises);
      setMessage({ type: 'success', text: 'Data absensi berhasil disimpan!' });
    } catch (error) {
      console.error('Error saving attendance:', error);
      setMessage({ type: 'error', text: 'Gagal menyimpan data absensi. Mungkin data pada tanggal ini sudah ada.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 pb-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Input Absensi Harian</h3>
          <p className="text-gray-500 text-sm mt-1">Catat kehadiran siswa untuk hari ini</p>
        </div>
        
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-700">Tanggal:</label>
          <input 
            type="date" 
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
          />
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-16">No</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700">NISN</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700">Nama Siswa</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700 text-center w-64">Status Kehadiran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">Memuat data siswa...</td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-600">{student.nisn}</td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-800">{student.name}</td>
                    <td className="py-3 px-4">
                      <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['HADIR', 'SAKIT', 'IZIN', 'ALFA'].map((status) => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`flex-1 text-xs font-bold py-1.5 px-2 rounded-md transition-all ${
                              attendance[student.id] === status 
                                ? status === 'HADIR' ? 'bg-green-500 text-white shadow-sm' 
                                : status === 'SAKIT' ? 'bg-blue-500 text-white shadow-sm'
                                : status === 'IZIN' ? 'bg-yellow-500 text-white shadow-sm'
                                : 'bg-red-500 text-white shadow-sm'
                                : 'text-gray-500 hover:bg-gray-200'
                            }`}
                          >
                            {status.charAt(0)}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button 
            type="submit" 
            disabled={isLoading || students.length === 0}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Absensi'}
          </button>
        </div>
      </form>
    </div>
  );
}
