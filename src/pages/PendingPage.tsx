import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

export const PendingPage: React.FC = () => {
  const { user, signOut, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (user?.is_active) {
    return <Navigate to="/" replace />;
  }

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="mb-6">
            <svg
              className="w-16 h-16 text-yellow-500 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            승인 대기 중
          </h1>
          <p className="text-gray-600 mb-4">
            계정이 아직 활성화되지 않았습니다.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            관리자가 계정을 승인하면 서비스를 이용할 수 있습니다.
          </p>
          
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              로그인 계정: <span className="font-medium">{user?.email}</span>
            </p>
            <button
              onClick={handleLogout}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              다른 계정으로 로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
