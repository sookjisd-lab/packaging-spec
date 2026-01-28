import React from 'react';
import type { User, UserRole } from '../../types/database';
import { useAuth } from '../../hooks/useAuth';

interface UserListProps {
  users: User[];
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
  onActiveChange: (userId: string, isActive: boolean) => Promise<void>;
  onDelete: (userId: string) => Promise<void>;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onRoleChange,
  onActiveChange,
  onDelete,
}) => {
  const { user: currentUser } = useAuth();
  const [loadingStates, setLoadingStates] = React.useState<Record<string, boolean>>({});

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    try {
      await onRoleChange(userId, role);
    } catch (error) {
      console.error('Failed to update role:', error);
      alert('권한 변경에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleActiveChange = async (userId: string, isActive: boolean) => {
    setLoadingStates(prev => ({ ...prev, [userId]: true }));
    try {
      await onActiveChange(userId, isActive);
    } catch (error) {
      console.error('Failed to update active status:', error);
      alert('상태 변경에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handleDelete = async (userId: string, userName: string | null) => {
    const confirmed = window.confirm(
      `정말 "${userName || '이름 없음'}" 사용자를 삭제하시겠습니까?\n이 작업은 되돌릴 수 없습니다.`
    );
    
    if (!confirmed) return;

    setLoadingStates(prev => ({ ...prev, [`delete-${userId}`]: true }));
    try {
      await onDelete(userId);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('사용자 삭제에 실패했습니다.');
    } finally {
      setLoadingStates(prev => ({ ...prev, [`delete-${userId}`]: false }));
    }
  };

  const isCurrentUser = (userId: string) => currentUser?.id === userId;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              사용자
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              역할
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              상태
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              가입일
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              삭제
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className={isCurrentUser(user.id) ? 'bg-blue-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  {user.avatar_url ? (
                    <img
                      className="h-10 w-10 rounded-full"
                      src={user.avatar_url}
                      alt=""
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {user.name?.[0] || user.email[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.name || '(이름 없음)'}
                      {isCurrentUser(user.id) && (
                        <span className="ml-2 text-xs text-blue-600">(나)</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user.id, e.target.value as UserRole)}
                  disabled={isCurrentUser(user.id) || loadingStates[user.id]}
                  className={`text-sm rounded-md border-gray-300 ${
                    isCurrentUser(user.id) 
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
                      : 'focus:border-blue-500 focus:ring-blue-500'
                  }`}
                >
                  <option value="admin">관리자</option>
                  <option value="user">사용자</option>
                </select>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleActiveChange(user.id, !user.is_active)}
                  disabled={isCurrentUser(user.id) || loadingStates[user.id]}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                    user.is_active ? 'bg-green-500' : 'bg-gray-200'
                  } ${isCurrentUser(user.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      user.is_active ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className={`ml-2 text-sm ${user.is_active ? 'text-green-600' : 'text-gray-500'}`}>
                  {user.is_active ? '활성' : '비활성'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(user.created_at).toLocaleDateString('ko-KR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <button
                  onClick={() => handleDelete(user.id, user.name)}
                  disabled={isCurrentUser(user.id) || loadingStates[`delete-${user.id}`]}
                  className={`text-red-600 hover:text-red-900 disabled:opacity-50 disabled:cursor-not-allowed ${
                    loadingStates[`delete-${user.id}`] ? 'animate-pulse' : ''
                  }`}
                  title={isCurrentUser(user.id) ? '자기 자신은 삭제할 수 없습니다' : '사용자 삭제'}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
