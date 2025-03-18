import React, { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import QRCodeGenerator from './components/QRCodeGenerator';
import PatientQuestionnaire from './components/PatientQuestionnaire';
import AdminPanel from './components/AdminPanel';

function App() {
  const [view, setView] = useState<'admin' | 'patient' | 'qr'>('admin');
  
  // Check if URL has a specific parameter to show patient view
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'patient') {
      setView('patient');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900">
      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
      
      {view === 'admin' && (
        <div className="p-6 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-center mb-8 text-cyan-400">샤인치과 문진표 관리 시스템</h1>
          <div className="flex gap-4 mb-8 justify-center">
            <button 
              onClick={() => setView('qr')}
              className="bg-cyan-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-cyan-700 transition-colors"
            >
              QR 코드 생성
            </button>
          </div>
          <AdminPanel />
        </div>
      )}

      {view === 'qr' && (
        <div className="p-6 max-w-4xl mx-auto">
          <button 
            onClick={() => setView('admin')}
            className="mb-4 text-cyan-400 hover:text-cyan-300 flex items-center"
          >
            ← 관리자 화면으로 돌아가기
          </button>
          <QRCodeGenerator />
        </div>
      )}

      {view === 'patient' && (
        <PatientQuestionnaire />
      )}
    </div>
  );
}

export default App;