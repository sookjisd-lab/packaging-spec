import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { PackagingSpecification } from '../types/database';
import type { PackagingSpecificationData } from '../types';

export function useSpecifications() {
  const { user } = useAuth();
  const [specifications, setSpecifications] = useState<PackagingSpecification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSpecifications = useCallback(async () => {
    if (!user?.id) return;
    
    setLoading(true);
    setError(null);
    
    const { data, error } = await supabase
      .from('packaging_specifications')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) {
      setError(error.message);
      setSpecifications([]);
    } else {
      setSpecifications((data as PackagingSpecification[]) || []);
    }
    
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    fetchSpecifications();
  }, [fetchSpecifications]);

  const createSpecification = async (data: PackagingSpecificationData, title?: string) => {
    if (!user?.id) throw new Error('User not authenticated');
    
    const insertData = {
      user_id: user.id,
      title: title || '새 포장사양서',
      type_selection: JSON.parse(JSON.stringify(data.typeSelection)),
      packaging_method: JSON.parse(JSON.stringify(data.packagingMethod)),
      marking_forms: JSON.parse(JSON.stringify(data.markingForms)),
      label_forms: JSON.parse(JSON.stringify(data.labelForms)),
      palette_label: JSON.parse(JSON.stringify(data.paletteLabel)),
      loading_method: JSON.parse(JSON.stringify(data.loadingMethod)),
      additional_request: JSON.parse(JSON.stringify(data.additionalRequest)),
    };
    
    const { data: newSpec, error } = await supabase
      .from('packaging_specifications')
      .insert(insertData as never)
      .select()
      .single();

    if (error) throw new Error(error.message);
    
    setSpecifications(prev => [newSpec as PackagingSpecification, ...prev]);
    return newSpec as PackagingSpecification;
  };

  const updateSpecification = async (id: string, data: Partial<PackagingSpecificationData>, title?: string) => {
    const updateData: Record<string, unknown> = {};
    
    if (title !== undefined) updateData.title = title;
    if (data.typeSelection) updateData.type_selection = data.typeSelection;
    if (data.packagingMethod) updateData.packaging_method = data.packagingMethod;
    if (data.markingForms) updateData.marking_forms = data.markingForms;
    if (data.labelForms) updateData.label_forms = data.labelForms;
    if (data.paletteLabel) updateData.palette_label = data.paletteLabel;
    if (data.loadingMethod) updateData.loading_method = data.loadingMethod;
    if (data.additionalRequest) updateData.additional_request = data.additionalRequest;
    
    const { error } = await supabase
      .from('packaging_specifications')
      .update(updateData as never)
      .eq('id', id);

    if (error) throw new Error(error.message);
    
    await fetchSpecifications();
  };

  const deleteSpecification = async (id: string) => {
    const { error } = await supabase
      .from('packaging_specifications')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);
    
    setSpecifications(prev => prev.filter(spec => spec.id !== id));
  };

  return {
    specifications,
    loading,
    error,
    refetch: fetchSpecifications,
    createSpecification,
    updateSpecification,
    deleteSpecification,
  };
}
