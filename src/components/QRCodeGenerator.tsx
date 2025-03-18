import React, { useState } from 'react';
import QRCode from 'react-qr-code';
import { Copy } from 'lucide-react';
import { toast } from 'react-toastify';

const QRCodeGenerator: React.FC = () => {
  const [qrValue, setQrValue] = useState('');
  
  // Generate the QR code URL when the component mounts
  React.useEffect(() => {
    // Get the current URL and add the patient view parameter
    const baseUrl = window.location.origin + window.location.pathname;
    const qrUrl = `${baseUrl}?view=patient`;
    setQrValue(qrUrl);
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue)
      .then(() => {
        toast.success('링크가 클립보드에 복사되었습니다.');
      })
      .catch(() => {
        toast.error('링크 복사에 실패했습니다.');
      });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>치과 문진표 QR 코드</title>
            <style>
              body {
                font-family: Arial, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                margin: 0;
                padding: 20px;
              }
              .qr-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                border: 1px solid #ccc;
                padding: 20px;
                border-radius: 10px;
              }
              h1 {
                font-size: 24px;
                margin-bottom: 10px;
                text-align: center;
              }
              p {
                font-size: 16px;
                margin-bottom: 20px;
                text-align: center;
              }
              .qr-code {
                margin-bottom: 20px;
              }
              .url {
                font-size: 14px;
                word-break: break-all;
                max-width: 300px;
                text-align: center;
              }
            </style>
          </head>
          <body>
            <div class="qr-container">
              <h1>치과 문진표 QR 코드</h1>
              <p>스마트폰으로 QR 코드를 스캔하여 문진표를 작성해주세요.</p>
              <div class="qr-code">
                <img src="${document.getElementById('qr-code')?.querySelector('svg')?.outerHTML ? 
                  'data:image/svg+xml;charset=utf-8,' + 
                  encodeURIComponent(document.getElementById('qr-code')?.querySelector('svg')?.outerHTML || '') : 
                  ''}" width="200" height="200" />
              </div>
              <div class="url">${qrValue}</div>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="bg-gray-800 p-8 rounded-lg shadow-lg max-w-md mx-auto border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-center text-cyan-400">문진표 QR 코드</h2>
      <p className="text-lg mb-6 text-center text-gray-300">
        이 QR 코드를 환자가 스캔하면 문진표를 작성할 수 있습니다.
      </p>
      
      <div 
        id="qr-code"
        className="flex justify-center mb-6 p-4 bg-white rounded-lg border-2 border-gray-700"
      >
        {qrValue && (
          <QRCode
            value={qrValue}
            size={200}
            level="H"
          />
        )}
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div className="text-sm text-gray-300 break-all mr-2">{qrValue}</div>
          <button 
            onClick={handleCopyLink}
            className="flex-shrink-0 text-cyan-400 hover:text-cyan-300"
            title="링크 복사"
          >
            <Copy size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex justify-center">
        <button
          onClick={handlePrint}
          className="bg-cyan-600 text-white px-6 py-3 rounded-lg text-lg font-medium hover:bg-cyan-700 transition-colors"
        >
          QR 코드 인쇄
        </button>
      </div>
    </div>
  );
};

export default QRCodeGenerator;