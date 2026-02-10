import type { PackagingSpecificationData } from '../types';

// ============================================
// PDF 내보내기
// ============================================

export const exportToPDF = async (_data: PackagingSpecificationData): Promise<void> => {
  const element = document.getElementById('preview-content');
  if (!element) {
    alert('미리보기 컨텐츠를 찾을 수 없습니다.');
    return;
  }

  try {
    // html2pdf.js 동적 import
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
