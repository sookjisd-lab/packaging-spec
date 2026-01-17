import React from 'react';
import type { User, UserRole } from '../../types/database';
import { useAuth } from '../../hooks/useAuth';

interface UserListProps {
  users: User[];
  onRoleChange: (userId: string, role: UserRole) => Promise<void>;
  onActiveChange: (userId: string, isActive: boolean) => Promise<void>;
}

export const UserList: React.FC<UserListProps> = ({
  users,
  onRoleChange,
  onActiveChange,
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
