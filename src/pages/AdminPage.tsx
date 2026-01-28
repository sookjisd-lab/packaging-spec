import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useUsers } from '../hooks/useUsers';
import { UserList } from '../components/admin/UserList';
import { CredentialSettings } from '../components/admin/CredentialSettings';
import { LogoutButton } from '../components/auth/LogoutButton';

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { users, loading, error, updateUserRole, updateUserActive, deleteUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              돌아가기
            </Link>
            <h1 className="text-xl font-bold text-gray-900">
              사용자 관리
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {currentUser?.name || currentUser?.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">등록된 사용자</h2>
                <p className="text-sm text-gray-500 mt-1">
                  총 {users.length}명의 사용자
                </p>
              </div>
              <div className="flex items-center gap-4">
                <input
                  type="text"
                  placeholder="이메일 또는 이름 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-500">
              오류가 발생했습니다: {error}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              {searchTerm ? '검색 결과가 없습니다.' : '등록된 사용자가 없습니다.'}
            </div>
          ) : (
            <UserList
              users={filteredUsers}
              onRoleChange={updateUserRole}
              onActiveChange={updateUserActive}
              onDelete={deleteUser}
            />
          )}
        </div>

        <div className="mt-8">
          <CredentialSettings />
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="text-sm font-medium text-yellow-800">주의사항</h3>
              <ul className="mt-1 text-sm text-yellow-700 list-disc list-inside">
                <li>자기 자신의 역할과 활성 상태는 변경할 수 없습니다.</li>
                <li>비활성화된 사용자는 서비스에 접근할 수 없습니다.</li>
                <li>관리자 권한을 부여하면 사용자 관리 페이지에 접근할 수 있습니다.</li>
                <li>삭제된 사용자는 복구할 수 없으며, 모든 데이터가 함께 삭제됩니다.</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
