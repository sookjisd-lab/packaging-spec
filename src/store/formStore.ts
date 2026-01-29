import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  CurrentStep,
  TypeSelectionData,
  PackagingMethodData,
  MarkingFormData,
  LabelFormData,
  PaletteLabelData,
  LoadingMethodData,
  AdditionalRequestData,
  PackagingSpecificationData,
  ProductConfigType,
  ProductCategory,
  PackagingMaterial,
  SetComponentInfo,
  MarkingComposition,
  CustomLabelItem,
  MarkingMethod,
  MarkingPosition,
} from '../types';

// ============================================
// 초기값 정의
// ============================================

const createDefaultMarkingComposition = (): MarkingComposition => ({
  hasManagementNumber: false,
  hasExpiryDate: false,
  hasManufactureDate: false,
  hasOther: false,
});

const createDefaultCustomLabelItem = (): CustomLabelItem => ({
  productName: false,
  quantity: false,
  managementNumber: false,
  expiryDate: false,
  packagingDate: false,
  clientProductCode: false,
  englishName: false,
  barcodeImage: false,
  barcodeNumber: false,
  others: [],
});

const createDefaultPaletteLabel = (): PaletteLabelData => ({
  formatType: undefined,
  attachPosition: 'shortSide',
  attachCount: 'single',
});

const createDefaultLoadingMethod = (): LoadingMethodData => ({
  paletteType: 'kpp',
  boxesPerLayer: 0,
  layerCount: 0,
  maxHeight: 0,
});

// ============================================
// 스토어 타입 정의
// ============================================

interface FormState {
  // 현재 스텝
  currentStep: CurrentStep;
  
  // Step1: 유형 선택
  typeSelection: TypeSelectionData;
  
  // Step2: 내용 입력
  packagingMethod: PackagingMethodData;
  markingForms: MarkingFormData[];
  labelForms: LabelFormData[];
  paletteLabel: PaletteLabelData;
  loadingMethod: LoadingMethodData;
  additionalRequest: AdditionalRequestData;
  
  // 저장된 문서 ID
  documentId: string | null;
  
  // 액션
  setCurrentStep: (step: CurrentStep) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Step1 액션
  setProductConfig: (config: ProductConfigType) => void;
  setProductCategories: (categories: ProductCategory[]) => void;
  setProductCategoryOther: (value: string) => void;
  setPackagingMaterials: (materials: PackagingMaterial[]) => void;
  addPackagingMaterial: (material: PackagingMaterial) => void;
  removePackagingMaterial: (index: number) => void;
  setSetComponents: (components: SetComponentInfo[]) => void;
  addSetComponent: (component: SetComponentInfo) => void;
  removeSetComponent: (id: string) => void;
  updateSetComponent: (id: string, updates: Partial<SetComponentInfo>) => void;
  
  // Step2 액션
  setPackagingMethod: (data: Partial<PackagingMethodData>) => void;
  addPackagingMethodImage: (image: string) => void;
  removePackagingMethodImage: (index: number) => void;
  
  generateMarkingForms: () => void;
  updateMarkingForm: (id: string, updates: Partial<MarkingFormData>) => void;
  updateMarkingComposition: (formId: string, updates: Partial<MarkingComposition>, isManualEdit?: boolean) => void;
  
  generateLabelForms: () => void;
  updateLabelForm: (id: string, updates: Partial<LabelFormData>) => void;
  updateCustomLabelItems: (formId: string, updates: Partial<CustomLabelItem>, isManualEdit?: boolean) => void;
  addCustomLabelOther: (formId: string, value: string) => void;
  removeCustomLabelOther: (formId: string, index: number) => void;
  
  // 팔레트 라벨 액션
  updatePaletteLabel: (updates: Partial<PaletteLabelData>) => void;
  updatePaletteLabelCustomItems: (updates: Partial<CustomLabelItem>) => void;
  
  // 적재방법 액션
  updateLoadingMethod: (updates: Partial<LoadingMethodData>) => void;
  
  // 기타 요청사항 액션
  setAdditionalRequest: (data: Partial<AdditionalRequestData>) => void;
  addAdditionalRequestImage: (image: string) => void;
  removeAdditionalRequestImage: (index: number) => void;
  
  // 전체 데이터 액션
  getFullData: () => PackagingSpecificationData;
  loadData: (data: PackagingSpecificationData) => void;
  resetForm: () => void;
}

// ============================================
// 유틸리티 함수
// ============================================

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};

// ============================================
// 스토어 생성
// ============================================

const initialState = {
  currentStep: 1 as CurrentStep,
  typeSelection: {
    productConfig: 'single' as ProductConfigType,
    productCategories: [] as ProductCategory[],
    packagingMaterials: [] as PackagingMaterial[],
  },
  packagingMethod: {
    description: '',
    images: [],
  },
  markingForms: [] as MarkingFormData[],
  labelForms: [] as LabelFormData[],
  paletteLabel: createDefaultPaletteLabel(),
  loadingMethod: createDefaultLoadingMethod(),
  additionalRequest: {
    description: '',
    images: [],
  },
  documentId: null,
};

export const useFormStore = create<FormState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // 스텝 관리
      setCurrentStep: (step) => set({ currentStep: step }),
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 3) as CurrentStep 
      })),
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 1) as CurrentStep 
      })),
      
      // Step1: 유형 선택
      setProductConfig: (config) => set((state) => ({
        typeSelection: { ...state.typeSelection, productConfig: config },
      })),
      
      setProductCategories: (categories) => set((state) => ({
        typeSelection: { ...state.typeSelection, productCategories: categories },
      })),
      
      setProductCategoryOther: (value) => set((state) => ({
        typeSelection: { ...state.typeSelection, productCategoryOther: value },
      })),
      
      setPackagingMaterials: (materials) => set((state) => ({
        typeSelection: { ...state.typeSelection, packagingMaterials: materials },
      })),
      
      addPackagingMaterial: (material) => set((state) => ({
        typeSelection: {
          ...state.typeSelection,
          packagingMaterials: [...state.typeSelection.packagingMaterials, material],
        },
      })),
      
      removePackagingMaterial: (index) => set((state) => ({
        typeSelection: {
          ...state.typeSelection,
          packagingMaterials: state.typeSelection.packagingMaterials.filter((_, i) => i !== index),
        },
      })),
      
      setSetComponents: (components) => set((state) => ({
        typeSelection: { ...state.typeSelection, setComponents: components },
      })),
      
      addSetComponent: (component) => set((state) => ({
        typeSelection: {
          ...state.typeSelection,
          setComponents: [...(state.typeSelection.setComponents || []), component],
        },
      })),
      
      removeSetComponent: (id) => set((state) => ({
        typeSelection: {
          ...state.typeSelection,
          setComponents: state.typeSelection.setComponents?.filter((c) => c.id !== id),
        },
      })),
      
      updateSetComponent: (id, updates) => set((state) => ({
        typeSelection: {
          ...state.typeSelection,
          setComponents: state.typeSelection.setComponents?.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        },
      })),
      
      // Step2: 포장방법
      setPackagingMethod: (data) => set((state) => ({
        packagingMethod: { ...state.packagingMethod, ...data },
      })),
      
      addPackagingMethodImage: (image) => set((state) => ({
        packagingMethod: {
          ...state.packagingMethod,
          images: [...state.packagingMethod.images, image],
        },
      })),
      
      removePackagingMethodImage: (index) => set((state) => ({
        packagingMethod: {
          ...state.packagingMethod,
          images: state.packagingMethod.images.filter((_, i) => i !== index),
        },
      })),
      
      generateMarkingForms: () => {
        const state = get();
        const { productConfig, productCategories, setComponents } = state.typeSelection;
        const forms: MarkingFormData[] = [];
        let isFirstComponentMarked = false;
        
        const getDefaultsForCategory = (category?: ProductCategory): { 
          method: MarkingMethod; 
          position: MarkingPosition;
        } => {
          if (category === 'tube') {
            return { method: 'engraving', position: 'sealingFace' };
          }
          if (category === 'mask') {
            return { method: 'engraving', position: 'backBottom' };
          }
          if (category === 'sachet') {
            return { method: 'coding', position: 'backBottom' };
          }
          return { method: 'coding', position: 'bottom' };
        };
        
        const createMarkingForm = (
          targetName: string,
          targetType: 'component' | 'individualBox' | 'setBox',
          category?: ProductCategory
        ): MarkingFormData => {
          const isFirstComp = targetType === 'component' && !isFirstComponentMarked;
          if (isFirstComp) isFirstComponentMarked = true;
          
          const defaults = targetType === 'component' ? getDefaultsForCategory(category) : { method: 'coding' as MarkingMethod, position: 'bottom' as MarkingPosition };
          
          return {
            id: generateId(),
            targetName,
            targetType,
            isFirstComponent: isFirstComp,
            productCategory: targetType === 'component' ? category : undefined,
            method: defaults.method,
            position: defaults.position,
            composition: createDefaultMarkingComposition(),
            isCompositionManuallyEdited: false,
            isExpiryBasisManuallyEdited: false,
          };
        };
        
        if (productConfig === 'single' || productConfig === 'unboxed') {
          const category = productCategories[0];
          forms.push(createMarkingForm('구성품', 'component', category));
          if (productConfig === 'single') {
            forms.push(createMarkingForm('단상자', 'individualBox'));
          }
        } else if (productConfig === 'set' && setComponents) {
          setComponents.forEach((comp, index) => {
            forms.push(createMarkingForm(comp.name || `구성품 ${index + 1}`, 'component', comp.productCategory));
            if (comp.hasIndividualBox) {
              forms.push(createMarkingForm(`${comp.name || `구성품 ${index + 1}`} 단상자`, 'individualBox'));
            }
          });
          forms.push(createMarkingForm('세트상자', 'setBox'));
        }
        
        set({ markingForms: forms });
      },
      
      updateMarkingForm: (id, updates) => set((state) => ({
        markingForms: state.markingForms.map((form) =>
          form.id === id ? { ...form, ...updates } : form
        ),
      })),
      
      updateMarkingComposition: (formId, updates, isManualEdit = true) => {
        const state = get();
        const targetForm = state.markingForms.find(f => f.id === formId);
        if (!targetForm) return;
        
        const updatedComposition = { ...targetForm.composition, ...updates };
        const isExpiryBasisUpdate = 'expiryBasis' in updates || 'expiryMonths' in updates;
        
        if (targetForm.isFirstComponent && isManualEdit) {
          const compositionKeysToSync: (keyof MarkingComposition)[] = [
            'hasManagementNumber', 'managementNumberType', 'cosmaxNumberFormat', 
            'clientNumberDescription', 'managementNumberLine',
            'hasExpiryDate', 'expiryDateFormat', 'expiryDateCustom', 'expiryDateLine',
            'hasManufactureDate', 'manufactureDateFormat', 'manufactureDateCustom', 'manufactureDateLine',
            'hasOther', 'otherDescription', 'otherLine',
          ];
          
          const expiryBasisKeys: (keyof MarkingComposition)[] = ['expiryBasis', 'expiryMonths'];
          
          set((s) => ({
            markingForms: s.markingForms.map((form) => {
              if (form.id === formId) {
                return { 
                  ...form, 
                  composition: updatedComposition,
                  isCompositionManuallyEdited: true,
                };
              }
              
              if (form.isCompositionManuallyEdited) return form;
              
              const syncedComp = { ...form.composition };
              compositionKeysToSync.forEach((key) => {
                if (key in updates) {
                  (syncedComp as Record<string, unknown>)[key] = updates[key as keyof typeof updates];
                }
              });
              
              if (isExpiryBasisUpdate && !form.isExpiryBasisManuallyEdited && form.targetType !== 'setBox') {
                expiryBasisKeys.forEach((key) => {
                  if (key in updates) {
                    (syncedComp as Record<string, unknown>)[key] = updates[key as keyof typeof updates];
                  }
                });
              }
              
              return { ...form, composition: syncedComp };
            }),
          }));
        } else {
          set((s) => ({
            markingForms: s.markingForms.map((form) =>
              form.id === formId
                ? { 
                    ...form, 
                    composition: updatedComposition,
                    isCompositionManuallyEdited: isManualEdit,
                    isExpiryBasisManuallyEdited: isExpiryBasisUpdate ? isManualEdit : form.isExpiryBasisManuallyEdited,
                  }
                : form
            ),
          }));
        }
      },
      
      generateLabelForms: () => {
        const state = get();
        const { packagingMaterials } = state.typeSelection;
        
        const forms: LabelFormData[] = packagingMaterials.map((material) => ({
          id: generateId(),
          packagingMaterialType: material.type,
          packagingMaterialName: material.customName || material.type,
          formatType: undefined,
          attachPosition: 'shortSide',
          attachCount: 'single',
          hasTaping: material.type !== 'zipperBag',
          tapingType: 'straight',
          isCustomItemsManuallyEdited: false,
        }));
        
        set({ labelForms: forms });
      },
      
      updateLabelForm: (id, updates) => {
        const state = get();
        const formIndex = state.labelForms.findIndex(f => f.id === id);
        
        if (formIndex === -1) return;
        
        if ('formatType' in updates && updates.formatType === 'custom' && formIndex > 0) {
          const firstForm = state.labelForms[0];
          if (firstForm.formatType === 'custom' && firstForm.customLabelItems && !state.labelForms[formIndex].isCustomItemsManuallyEdited) {
            set((s) => ({
              labelForms: s.labelForms.map((form, idx) => {
                if (idx !== formIndex) return form;
                const checkboxItems: Partial<CustomLabelItem> = {
                  productName: firstForm.customLabelItems!.productName,
                  quantity: firstForm.customLabelItems!.quantity,
                  managementNumber: firstForm.customLabelItems!.managementNumber,
                  expiryDate: firstForm.customLabelItems!.expiryDate,
                  packagingDate: firstForm.customLabelItems!.packagingDate,
                  clientProductCode: firstForm.customLabelItems!.clientProductCode,
                  englishName: firstForm.customLabelItems!.englishName,
                  barcodeImage: firstForm.customLabelItems!.barcodeImage,
                  barcodeNumber: firstForm.customLabelItems!.barcodeNumber,
                  others: [...(firstForm.customLabelItems!.others || [])],
                };
                return { 
                  ...form, 
                  ...updates, 
                  customLabelItems: {
                    ...(form.customLabelItems || createDefaultCustomLabelItem()),
                    ...checkboxItems,
                  },
                };
              }),
            }));
            return;
          }
        }
        
        set((s) => ({
          labelForms: s.labelForms.map((form) =>
            form.id === id ? { ...form, ...updates } : form
          ),
        }));
      },
      
      updateCustomLabelItems: (formId, updates, isManualEdit = true) => {
        const state = get();
        const formIndex = state.labelForms.findIndex(f => f.id === formId);
        
        set((s) => ({
          labelForms: s.labelForms.map((form) =>
            form.id === formId
              ? {
                  ...form,
                  customLabelItems: {
                    ...(form.customLabelItems || createDefaultCustomLabelItem()),
                    ...updates,
                  },
                  isCustomItemsManuallyEdited: formIndex > 0 && isManualEdit ? true : form.isCustomItemsManuallyEdited,
                }
              : form
          ),
        }));
      },
      
      addCustomLabelOther: (formId, value) => set((state) => ({
        labelForms: state.labelForms.map((form) =>
          form.id === formId
            ? {
                ...form,
                customLabelItems: {
                  ...(form.customLabelItems || createDefaultCustomLabelItem()),
                  others: [...(form.customLabelItems?.others || []), value],
                },
              }
            : form
        ),
      })),
      
      removeCustomLabelOther: (formId, index) => set((state) => ({
        labelForms: state.labelForms.map((form) =>
          form.id === formId
            ? {
                ...form,
                customLabelItems: {
                  ...(form.customLabelItems || createDefaultCustomLabelItem()),
                  others: form.customLabelItems?.others?.filter((_, i) => i !== index) || [],
                },
              }
            : form
        ),
      })),
      
      // 팔레트 라벨
      updatePaletteLabel: (updates) => set((state) => ({
        paletteLabel: { ...state.paletteLabel, ...updates },
      })),
      
      updatePaletteLabelCustomItems: (updates) => set((state) => ({
        paletteLabel: {
          ...state.paletteLabel,
          customLabelItems: {
            ...(state.paletteLabel.customLabelItems || createDefaultCustomLabelItem()),
            ...updates,
          },
        },
      })),
      
      // 적재방법
      updateLoadingMethod: (updates) => set((state) => ({
        loadingMethod: { ...state.loadingMethod, ...updates },
      })),
      
      // 기타 요청사항
      setAdditionalRequest: (data) => set((state) => ({
        additionalRequest: { ...state.additionalRequest, ...data },
      })),
      
      addAdditionalRequestImage: (image) => set((state) => ({
        additionalRequest: {
          ...state.additionalRequest,
          images: [...state.additionalRequest.images, image],
        },
      })),
      
      removeAdditionalRequestImage: (index) => set((state) => ({
        additionalRequest: {
          ...state.additionalRequest,
          images: state.additionalRequest.images.filter((_, i) => i !== index),
        },
      })),
      
      // 전체 데이터 조회
      getFullData: (): PackagingSpecificationData => {
        const state = get();
        const now = new Date().toISOString();
        return {
          id: state.documentId || generateId(),
          createdAt: now,
          updatedAt: now,
          typeSelection: state.typeSelection,
          packagingMethod: state.packagingMethod,
          markingForms: state.markingForms,
          labelForms: state.labelForms,
          paletteLabel: state.paletteLabel,
          loadingMethod: state.loadingMethod,
          additionalRequest: state.additionalRequest,
        };
      },
      
      // 데이터 로드
      loadData: (data) => set({
        documentId: data.id,
        typeSelection: data.typeSelection,
        packagingMethod: data.packagingMethod,
        markingForms: data.markingForms,
        labelForms: data.labelForms,
        paletteLabel: data.paletteLabel,
        loadingMethod: data.loadingMethod,
        additionalRequest: data.additionalRequest,
        currentStep: 1,
      }),
      
      // 폼 초기화
      resetForm: () => set({
        ...initialState,
        documentId: null,
      }),
    }),
    {
      name: 'packaging-spec-storage',
      partialize: (state) => ({
        typeSelection: state.typeSelection,
        packagingMethod: state.packagingMethod,
        markingForms: state.markingForms,
        labelForms: state.labelForms,
        paletteLabel: state.paletteLabel,
        loadingMethod: state.loadingMethod,
        additionalRequest: state.additionalRequest,
        documentId: state.documentId,
      }),
    }
  )
);
