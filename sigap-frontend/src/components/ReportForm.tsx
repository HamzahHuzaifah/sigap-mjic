import { useState, useEffect, useRef } from 'react';
import { Printer } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import api from '../api';

interface Student {
  id: number;
  nisn: string;
  name: string;
}

interface Grade {
  id: number;
  score: number;
  type: string;
  subject: {
    name: string;
  };
}

interface Attendance {
  id: number;
  date: string;
  status: string;
}

interface StudentSummary extends Student {
  grades: Grade[];
  attendances: Attendance[];
}

export default function ReportForm() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<number | ''>('');
  const [summary, setSummary] = useState<StudentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await api.get('/students');
      setStudents(response.data);
    } catch (error) {
      console.error('Failed to fetch students:', error);
    }
  };

  const fetchSummary = async (studentId: number) => {
    setIsLoading(true);
    try {
      const response = await api.get(`/students/${studentId}/summary`);
      setSummary(response.data);
    } catch (error) {
      console.error('Failed to fetch student summary:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedStudentId(val === '' ? '' : parseInt(val));
    if (val !== '') {
      fetchSummary(parseInt(val));
    } else {
      setSummary(null);
    }
  };

  const handleExportPDF = () => {
    if (!reportRef.current || !summary) return;
    
    const element = reportRef.current;
    const opt = {
      margin:       10,
      filename:     `Rapor_${summary.name}_${summary.nisn}.pdf`,
      image:        { type: 'jpeg' as const, quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
    };

    html2pdf().set(opt).from(element).save();
  };

  // Calculate stats
  const calculateAttendanceStats = () => {
    if (!summary) return { HADIR: 0, SAKIT: 0, IZIN: 0, ALFA: 0, TOTAL: 0 };
    const stats = { HADIR: 0, SAKIT: 0, IZIN: 0, ALFA: 0, TOTAL: summary.attendances.length };
    summary.attendances.forEach(a => {
      if (stats[a.status as keyof typeof stats] !== undefined) {
        stats[a.status as keyof typeof stats]++;
      }
    });
    return stats;
  };

  const calculateGradeAverages = () => {
    if (!summary) return [];
    
    // Group by subject
    const subjectGrades: Record<string, { total: number; count: number; types: Record<string, number> }> = {};
    
    summary.grades.forEach(g => {
      const subj = g.subject.name;
      if (!subjectGrades[subj]) {
        subjectGrades[subj] = { total: 0, count: 0, types: {} };
      }
      subjectGrades[subj].total += g.score;
      subjectGrades[subj].count++;
      subjectGrades[subj].types[g.type] = g.score;
    });

    return Object.entries(subjectGrades).map(([subject, data]) => ({
      subject,
      tugas: data.types['TUGAS'] || '-',
      uts: data.types['UTS'] || '-',
      uas: data.types['UAS'] || '-',
      average: (data.total / data.count).toFixed(1)
    }));
  };

  const attStats = calculateAttendanceStats();
  const subjectAverages = calculateGradeAverages();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
      {/* Selector Card */}
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Cetak Rapor Siswa</h3>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider block">Pilih Siswa</label>
            <select 
              value={selectedStudentId}
              onChange={handleStudentChange}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow bg-white"
            >
              <option value="">-- Cari Nama atau NISN --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.nisn} - {s.name}</option>
              ))}
            </select>
          </div>
          <button 
            onClick={handleExportPDF}
            disabled={!summary || isLoading}
            className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Printer size={18} /> Cetak PDF
          </button>
        </div>
      </div>

      {/* Report Preview */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
          <p className="text-gray-500 font-medium">Memuat data siswa...</p>
        </div>
      ) : summary ? (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm overflow-x-auto">
          {/* Printable Area */}
          <div ref={reportRef} className="p-8 bg-white min-w-[700px]">
            <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900">Rapor Hasil Belajar Siswa</h1>
              <p className="text-gray-600 font-medium mt-1">Sistem Informasi Administrasi Guru (SIGAP)</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-semibold text-gray-600 w-32 py-1">Nama Siswa</td>
                    <td className="text-gray-900 font-bold">: {summary.name}</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-600 w-32 py-1">NISN</td>
                    <td className="text-gray-900 font-bold">: {summary.nisn}</td>
                  </tr>
                </tbody>
              </table>
              <table className="w-full">
                <tbody>
                  <tr>
                    <td className="font-semibold text-gray-600 w-32 py-1">Semester</td>
                    <td className="text-gray-900 font-bold">: Genap</td>
                  </tr>
                  <tr>
                    <td className="font-semibold text-gray-600 w-32 py-1">Tahun Ajaran</td>
                    <td className="text-gray-900 font-bold">: 2026/2027</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">A. Capaian Akademik (Nilai)</h2>
              <table className="w-full text-left border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border border-gray-300 font-bold text-sm w-12 text-center">No</th>
                    <th className="py-2 px-4 border border-gray-300 font-bold text-sm">Mata Pelajaran</th>
                    <th className="py-2 px-4 border border-gray-300 font-bold text-sm text-center w-20">Tugas</th>
                    <th className="py-2 px-4 border border-gray-300 font-bold text-sm text-center w-20">UTS</th>
                    <th className="py-2 px-4 border border-gray-300 font-bold text-sm text-center w-20">UAS</th>
                    <th className="py-2 px-4 border border-gray-300 font-bold text-sm text-center w-24">Rata-Rata</th>
                  </tr>
                </thead>
                <tbody>
                  {subjectAverages.length === 0 ? (
                    <tr><td colSpan={6} className="py-4 text-center text-sm text-gray-500 border border-gray-300">Belum ada nilai yang diinput</td></tr>
                  ) : (
                    subjectAverages.map((sa, idx) => (
                      <tr key={sa.subject}>
                        <td className="py-2 px-4 border border-gray-300 text-sm text-center">{idx + 1}</td>
                        <td className="py-2 px-4 border border-gray-300 text-sm font-semibold">{sa.subject}</td>
                        <td className="py-2 px-4 border border-gray-300 text-sm text-center">{sa.tugas}</td>
                        <td className="py-2 px-4 border border-gray-300 text-sm text-center">{sa.uts}</td>
                        <td className="py-2 px-4 border border-gray-300 text-sm text-center">{sa.uas}</td>
                        <td className="py-2 px-4 border border-gray-300 text-sm text-center font-bold text-primary-700 bg-primary-50">{sa.average}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2 mb-4">B. Rekapitulasi Kehadiran</h2>
              <div className="inline-block border border-gray-300 rounded-lg overflow-hidden">
                <table className="text-left border-collapse">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-2 px-6 bg-gray-50 text-sm font-semibold text-gray-700 border-r border-gray-200">Hadir</td>
                      <td className="py-2 px-6 text-sm font-bold text-green-600">{attStats.HADIR} Hari</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-6 bg-gray-50 text-sm font-semibold text-gray-700 border-r border-gray-200">Sakit</td>
                      <td className="py-2 px-6 text-sm font-bold text-blue-600">{attStats.SAKIT} Hari</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-6 bg-gray-50 text-sm font-semibold text-gray-700 border-r border-gray-200">Izin</td>
                      <td className="py-2 px-6 text-sm font-bold text-yellow-600">{attStats.IZIN} Hari</td>
                    </tr>
                    <tr>
                      <td className="py-2 px-6 bg-gray-50 text-sm font-semibold text-gray-700 border-r border-gray-200">Tanpa Keterangan (Alfa)</td>
                      <td className="py-2 px-6 text-sm font-bold text-red-600">{attStats.ALFA} Hari</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-16 pt-8 flex justify-end text-sm">
              <div className="text-center">
                <p className="mb-16">Jakarta, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                <p className="font-bold underline decoration-gray-400 underline-offset-4">Guru Kelas / Wali Kelas</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
