import React, { useState, useEffect } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';

interface PatientData {
  id: string;
  name: string;
  residentId: string;
  gender: string;
  phone: string;
  visitReason: string;
  submittedAt: string;
}

const AdminPanel: React.FC = () => {
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate fetching data from Google Sheets
  useEffect(() => {
    const fetchPatients = async () => {
      setIsLoading(true);
      try {
        // In a real application, you would fetch data from your backend
        // which would connect to Google Sheets API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data
        const mockPatients: PatientData[] = [
          {
            id: '1',
            name: '김영희',
            residentId: '620515-2******',
            gender: '여성',
            phone: '010-1234-5678',
            visitReason: '이가 시려요',
            submittedAt: '2025-06-10 09:15:22',
          },
          {
            id: '2',
            name: '이철수',
            residentId: '581122-1******',
            gender: '남성',
            phone: '010-9876-5432',
            visitReason: '임플란트',
            submittedAt: '2025-06-10 10:30:45',
          },
          {
            id: '3',
            name: '박미영',
            residentId: '650308-2******',
            gender: '여성',
            phone: '010-5555-7777',
            visitReason: '정기검진',
            submittedAt: '2025-06-10 11:45:12',
          },
        ];
        
        setPatients(mockPatients);
      } catch (error) {
        console.error('Error fetching patients:', error);
        toast.error('환자 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPatients();
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('환자 데이터가 새로고침되었습니다.');
    } catch (error) {
      toast.error('데이터 새로고침 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportCSV = () => {
    try {
      // Create CSV content
      const headers = ['이름', '주민등록번호', '성별', '연락처', '내원 목적', '제출 시간'];
      const csvContent = [
        headers.join(','),
        ...patients.map(patient => [
          patient.name,
          patient.residentId,
          patient.gender,
          patient.phone,
          patient.visitReason,
          patient.submittedAt
        ].join(','))
      ].join('\n');
      
      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `환자_문진표_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('CSV 파일이 다운로드되었습니다.');
    } catch (error) {
      toast.error('CSV 내보내기 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-cyan-400">오늘의 신규 환자</h2>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1 px-4 py-2 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
            새로고침
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
            disabled={isLoading || patients.length === 0}
          >
            <Download size={18} />
            CSV 내보내기
          </button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
        </div>
      ) : patients.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <p className="text-xl">오늘 등록된 신규 환자가 없습니다.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">이름</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">주민등록번호</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">성별</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">연락처</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">내원 목적</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">제출 시간</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{patient.residentId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{patient.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{patient.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{patient.visitReason}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{patient.submittedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      <div className="mt-6 text-center text-gray-400 text-sm">
        <p>환자 데이터는 Google 스프레드시트와 자동으로 동기화됩니다.</p>
      </div>
    </div>
  );
};

export default AdminPanel;