import { useState, useEffect } from 'react';
import api from '../api';

interface Student {
  id: number;
  nisn: string;
  name: string;
}

interface Subject {
  id: number;
  name: string;
}

export default function GradeForm() {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [gradeType, setGradeType] = useState<string>('TUGAS');
  
  // Store scores by studentId
  const [scores, setScores] = useState<Record<number, string>>({});
  
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, subjectsRes] = await Promise.all([
        api.get('/students'),
        api.get('/subjects')
      ]);
      setStudents(studentsRes.data);
      setSubjects(subjectsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    }
  };

  const handleScoreChange = (studentId: number, value: string) => {
    // Only allow numbers between 0-100
    if (value === '' || (/^\d+$/.test(value) && parseInt(value) >= 0 && parseInt(value) <= 100)) {
      setScores((prev) => ({ ...prev, [studentId]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjectId === '') {
      setMessage({ type: 'error', text: 'Pilih mata pelajaran terlebih dahulu!' });
      return;
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Filter out empty scores
      const validSubmissions = students
        .filter(student => scores[student.id] !== undefined && scores[student.id] !== '')
        .map(student => ({
          studentId: student.id,
          subjectId: selectedSubjectId,
          type: gradeType,
          score: parseFloat(scores[student.id])
        }));

      if (validSubmissions.length === 0) {
        setMessage({ type: 'error', text: 'Tidak ada nilai yang diinput. Harap isi setidaknya satu nilai.' });
        setIsLoading(false);
        return;
      }

      const promises = validSubmissions.map((data) => 
        api.post('/grades', data)
      );

      await Promise.all(promises);
      setMessage({ type: 'success', text: 'Data nilai berhasil disimpan!' });
      
      // Clear scores after successful save
      setScores({});
    } catch (error) {
      console.error('Error saving grades:', error);
      setMessage({ type: 'error', text: 'Gagal menyimpan data nilai.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm animate-in fade-in slide-in-from-bottom-4">
      <div className="mb-6 pb-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800">Input Nilai Siswa</h3>
          <p className="text-gray-500 text-sm mt-1">Masukkan nilai Tugas, UTS, atau UAS per kelas</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Mata Pelajaran</label>
            <select 
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value === '' ? '' : parseInt(e.target.value))}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow bg-white min-w-[200px]"
            >
              <option value="">-- Pilih Mata Pelajaran --</option>
              {subjects.map(sub => (
                <option key={sub.id} value={sub.id}>{sub.name}</option>
              ))}
            </select>
          </div>
          
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Tipe Nilai</label>
            <select 
              value={gradeType}
              onChange={(e) => setGradeType(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow bg-white"
            >
              <option value="TUGAS">Tugas</option>
              <option value="UTS">UTS</option>
              <option value="UAS">UAS</option>
            </select>
          </div>
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
                <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-32">NISN</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700">Nama Siswa</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-700 w-32 text-center">Nilai (0-100)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">Memuat data...</td>
                </tr>
              ) : (
                students.map((student, index) => (
                  <tr key={student.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-500">{index + 1}</td>
                    <td className="py-3 px-4 text-sm font-medium text-gray-600">{student.nisn}</td>
                    <td className="py-3 px-4 text-sm font-bold text-gray-800">{student.name}</td>
                    <td className="py-3 px-4">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0"
                        value={scores[student.id] || ''}
                        onChange={(e) => handleScoreChange(student.id, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 text-center font-bold text-gray-800 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none transition-shadow"
                      />
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
            disabled={isLoading || students.length === 0 || selectedSubjectId === ''}
            className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Menyimpan...' : 'Simpan Nilai'}
          </button>
        </div>
      </form>
    </div>
  );
}
