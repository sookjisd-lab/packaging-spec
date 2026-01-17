import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, UserRole } from '../types/database';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      setError(error.message);
      setUsers([]);
    } else {
      setUsers((data as User[]) || []);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUserRole = async (userId: string, role: UserRole) => {
    const { error } = await supabase
      .from('users')
      .update({ role } as never)
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
    
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, role } : user
      )
    );
  };

  const updateUserActive = async (userId: string, isActive: boolean) => {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive } as never)
      .eq('id', userId);

    if (error) {
      throw new Error(error.message);
    }
    
    setUsers(prev => 
      prev.map(user => 
        user.id === userId ? { ...user, is_active: isActive } : user
      )
    );
  };

  return {
    users,
    loading,
    error,
    refetch: fetchUsers,
    updateUserRole,
    updateUserActive,
  };
}
