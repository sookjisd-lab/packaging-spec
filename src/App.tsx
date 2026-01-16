import React from 'react';
import { useFormStore } from './store/formStore';
import { Step1TypeSelection } from './components/Step1';
import { Step2ContentInput } from './components/Step2';
import { Step3Preview } from './components/Step3';

const StepIndicator: React.FC = () => {
  const { currentStep, setCurrentStep } = useFormStore();

  const steps = [
    { number: 1, title: '유형 선택' },
    { number: 2, title: '내용 입력' },
    { number: 3, title: '미리보기' },
  ];

  return (
    <div className="flex items-center justify-center mb-8 no-print">
      {steps.map((step, index) => (
        <React.Fragment key={step.number}>
          <button
            onClick={() => {
              // 이전 단계로만 이동 가능
              if (step.number < currentStep) {
                setCurrentStep(step.number as 1 | 2 | 3);
              }
            }}
            disabled={step.number > currentStep}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full transition-colors
              ${currentStep === step.number 
                ? 'bg-blue-600 text-white' 
                : step.number < currentStep
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200 cursor-pointer'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            <span className={`
              w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold
              ${currentStep === step.number 
                ? 'bg-white text-blue-600' 
                : step.number < currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-500'
              }
            `}>
              {step.number < currentStep ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step.number
              )}
            </span>
            <span className="hidden sm:inline font-medium">{step.title}</span>
          </button>
          
          {index < steps.length - 1 && (
            <div className={`
              w-12 h-0.5 mx-2
              ${step.number < currentStep ? 'bg-blue-600' : 'bg-gray-200'}
            `} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const { currentStep } = useFormStore();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white shadow-sm no-print">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            신제품 포장사양서 작성
          </h1>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <StepIndicator />
        
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8">
          {currentStep === 1 && <Step1TypeSelection />}
          {currentStep === 2 && <Step2ContentInput />}
          {currentStep === 3 && <Step3Preview />}
        </div>
      </main>

      {/* 푸터 */}
      <footer className="bg-white border-t border-gray-200 mt-auto no-print">
        <div className="max-w-5xl mx-auto px-4 py-4 text-center text-sm text-gray-500">
          포장사양서 작성 시스템 &copy; {new Date().getFullYear()}
        </div>
      </footer>
    </div>
  );
};

export default App;
