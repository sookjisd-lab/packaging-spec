import type { PackagingSpecificationData } from '../types';

const PDF_STYLES = `
  #preview-content {
    font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    background-color: #ffffff;
    padding: 32px;
    color: #111827;
    font-size: 14px;
    line-height: 1.5;
  }
  #preview-content h1 {
    font-size: 24px;
    font-weight: 700;
    color: #111827;
    text-align: center;
    margin-bottom: 8px;
  }
  #preview-content h2 {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid #d1d5db;
  }
  #preview-content h3 {
    font-size: 16px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 12px;
  }
  #preview-content h4 {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
  }
  #preview-content p {
    color: #6b7280;
    font-size: 14px;
  }
  #preview-content section {
    margin-bottom: 32px;
  }
  #preview-content table {
    width: 100%;
    font-size: 14px;
    border-collapse: collapse;
  }
  #preview-content table tr {
    border-bottom: 1px solid #e5e7eb;
  }
  #preview-content table td {
    padding: 8px 0;
  }
  #preview-content table td:first-child {
    font-weight: 500;
    color: #4b5563;
    width: 25%;
  }
  #preview-content .bg-gray-50 {
    background-color: #f9fafb;
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 16px;
  }
  #preview-content .bg-green-50 {
    background-color: #f0fdf4;
    padding: 12px;
    border-radius: 8px;
    border: 1px solid #bbf7d0;
    margin-top: 12px;
  }
  #preview-content .text-green-800 {
    color: #166534;
    font-weight: 500;
    margin-bottom: 8px;
    font-size: 14px;
  }
  #preview-content .text-green-700 {
    color: #15803d;
  }
  #preview-content .bg-purple-50 {
    background-color: #faf5ff;
    padding: 16px;
    border-radius: 8px;
    border: 1px solid #e9d5ff;
    margin-top: 24px;
  }
  #preview-content .text-purple-800 {
    color: #6b21a8;
    font-weight: 600;
    margin-bottom: 12px;
  }
  #preview-content .text-purple-700 {
    color: #7e22ce;
  }
  #preview-content .border-purple-200 {
    border-color: #e9d5ff;
  }
  #preview-content .font-mono {
    font-family: monospace;
    background-color: #ffffff;
    padding: 8px;
    border-radius: 4px;
    border: 1px solid #dcfce7;
  }
  #preview-content .border-b-2 {
    border-bottom: 2px solid #1f2937;
    padding-bottom: 16px;
    margin-bottom: 32px;
  }
  #preview-content img {
    max-width: 128px;
    max-height: 128px;
    object-fit: cover;
    border: 1px solid #e5e7eb;
    border-radius: 4px;
  }
`;

export const exportToPDF = async (_data: PackagingSpecificationData): Promise<void> => {
  const element = document.getElementById('preview-content');
  if (!element) {
    alert('미리보기 컨텐츠를 찾을 수 없습니다.');
    return;
  }

  try {
    const html2pdfModule = await import('html2pdf.js');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdf = (html2pdfModule.default || html2pdfModule) as any;

    const opt = {
      margin: 10,
      filename: `포장사양서_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        logging: false,
        onclone: (clonedDoc: Document) => {
          const existingStyles = clonedDoc.querySelectorAll('link[rel="stylesheet"], style');
          existingStyles.forEach((sheet) => sheet.remove());
          
          const styleEl = clonedDoc.createElement('style');
          styleEl.textContent = PDF_STYLES;
          clonedDoc.head.appendChild(styleEl);
        },
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait'
      },
    };

    await html2pdf()
      .from(element)
      .set(opt)
      .save();
  } catch (error) {
    console.error('PDF 내보내기 실패:', error);
    alert('PDF 내보내기에 실패했습니다. 다시 시도해주세요.');
  }
};

// ============================================
// JSON 저장/불러오기
// ============================================

export const saveToJSON = (data: PackagingSpecificationData): void => {
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = `포장사양서_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const loadFromJSON = (file: File): Promise<PackagingSpecificationData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        resolve(data);
      } catch (error) {
        reject(new Error('잘못된 파일 형식입니다.'));
      }
    };
    reader.onerror = () => reject(new Error('파일을 읽을 수 없습니다.'));
    reader.readAsText(file);
  });
};
