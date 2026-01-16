import React, { useRef } from 'react';
import { PreviewSection } from './PreviewSection';
import { useFormStore } from '../../store/formStore';
import { exportToPDF, exportToExcel, saveToJSON, loadFromJSON } from '../../utils/exportUtils';

export const Step3Preview: React.FC = () => {
  const { prevStep, getFullData, loadData, resetForm } = useFormStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportPDF = async () => {
    const data = getFullData();
    await exportToPDF(data);
  };

  const handleExportExcel = async () => {
    const data = getFullData();
    await exportToExcel(data);
  };

  const handleSaveJSON = () => {
    const data = getFullData();
    saveToJSON(data);
  };

  const handleLoadJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await loadFromJSON(file);
      loadData(data);
      alert('파일을 불러왔습니다.');
    } catch (error) {
      alert(error instanceof Error ? error.message : '파일 불러오기 실패');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleReset = () => {
    if (confirm('작성 중인 내용이 모두 삭제됩니다. 계속하시겠습니까?')) {
      resetForm();
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Step 3: 미리보기 및 출력</h2>
        <p className="text-gray-600 mt-1">작성한 포장사양서를 확인하고 내보내세요.</p>
      </div>

      {/* 액션 버튼 (인쇄 시 숨김) */}
      <div className="mb-6 p-4 bg-gray-100 rounded-lg no-print">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleExportPDF}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            PDF 다운로드
          </button>
          
          <button
            type="button"
            onClick={handleExportExcel}
            className="btn-success flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Excel 다운로드
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            인쇄
          </button>
          
          <div className="flex-1"></div>
          
          <button
            type="button"
            onClick={handleSaveJSON}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            저장
          </button>
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            불러오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleLoadJSON}
            className="hidden"
          />
          
          <button
            type="button"
            onClick={handleReset}
            className="btn-danger flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            초기화
          </button>
        </div>
      </div>

      {/* 미리보기 */}
      <PreviewSection />

      {/* 하단 네비게이션 (인쇄 시 숨김) */}
      <div className="flex justify-between mt-8 no-print">
        <button
          type="button"
          onClick={prevStep}
          className="btn-secondary"
        >
          <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          이전 단계로
        </button>
      </div>
    </div>
  );
};

export { PreviewSection } from './PreviewSection';
