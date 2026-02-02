# AGENTS.md - Packaging Specification System

This document provides guidelines for AI agents working on this codebase.

## Project Overview

포장사양서(Packaging Specification) 입력 시스템 - React + TypeScript + Vite 기반 웹 애플리케이션.
화장품 제조업체의 포장 사양 입력 및 관리를 위한 3단계 폼 애플리케이션.

## Tech Stack

- **Frontend**: React 19, TypeScript 5.9, Vite 7
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand 5 (with persist middleware)
- **Database**: Supabase
- **Export**: xlsx, html2pdf.js
- **Routing**: react-router-dom 7

## Build/Lint/Test Commands

```bash
# Development
npm run dev              # Start dev server (localhost:5173)

# Build & Lint
npm run build            # TypeScript check + Vite build
npm run lint             # ESLint check

# Database (Supabase)
npm run db:start         # Start local Supabase
npm run db:stop          # Stop local Supabase
npm run db:reset         # Reset database
npm run db:push          # Push migrations
npm run db:generate-types # Generate TypeScript types
```

**Note**: No test framework configured. Verify changes via `npm run build`.

## Project Structure

```
src/
├── components/
│   ├── common/          # Reusable UI components (FormSection, Dropdown, Checkbox, etc.)
│   ├── Step1/           # 유형 선택 (Product config, type, packaging materials)
│   ├── Step2/           # 내용 입력 (Marking, Label, Loading method)
│   │   ├── Marking/     # 착인 관련 컴포넌트
│   │   └── Label/       # 라벨 관련 컴포넌트
│   ├── Step3/           # 미리보기 & 내보내기
│   ├── auth/            # Authentication components
│   └── admin/           # Admin panel components
├── store/
│   └── formStore.ts     # Zustand store (single source of truth)
├── types/
│   └── index.ts         # All TypeScript types and constants
├── utils/
│   └── exportUtils.ts   # Excel/PDF export utilities
├── context/             # React contexts (Auth)
├── hooks/               # Custom hooks
├── lib/                 # External library configs (Supabase)
└── pages/               # Page components
```

## Code Style Guidelines

### TypeScript

- **Strict mode enabled** - No implicit any, unused locals/parameters checked
- Use `type` keyword for type aliases, `interface` for object shapes
- Export types from `src/types/index.ts`
- Use union types for enums: `type Status = 'active' | 'pending' | 'done'`

```typescript
// Good
export type ProductCategory = 'basic' | 'tube' | 'mask' | 'other';
export interface MarkingFormData {
  id: string;
  targetName: string;
  method: MarkingMethod;
}

// Bad - Don't use TypeScript enums
enum Status { Active, Pending }
```

### Imports

- Group imports: React → external libraries → internal modules → types
- Use barrel exports from `index.ts` files
- Import types with `type` keyword

```typescript
import React from 'react';
import { useFormStore } from '../../store/formStore';
import { FormSection, FormGroup, Checkbox } from '../common';
import type { ProductCategory, MarkingFormData } from '../../types';
```

### React Components

- Use functional components with `React.FC<Props>` typing
- Define props interface inline or above component
- Export named components (no default exports)

```typescript
interface MarkingFormProps {
  data: MarkingFormData;
  onUpdate: (updates: Partial<MarkingFormData>) => void;
}

export const MarkingForm: React.FC<MarkingFormProps> = ({ data, onUpdate }) => {
  // ...
};
```

### Naming Conventions

| Item | Convention | Example |
|------|------------|---------|
| Components | PascalCase | `MarkingForm`, `ProductTypeSelect` |
| Files (components) | PascalCase.tsx | `MarkingForm.tsx` |
| Files (utils/hooks) | camelCase.ts | `formStore.ts`, `useAuth.ts` |
| Types/Interfaces | PascalCase | `MarkingFormData`, `ProductCategory` |
| Constants (labels) | SCREAMING_SNAKE | `PRODUCT_CATEGORY_LABELS` |
| Functions | camelCase | `handleSubmit`, `generateMarkingForms` |
| Boolean props | is/has prefix | `isFirstComponent`, `hasIndividualBox` |

### Zustand Store Pattern

- Single store in `formStore.ts` with persist middleware
- Actions defined in store interface
- Use `get()` for reading state in actions, `set()` for updates

```typescript
// Reading state
const state = get();
const { productConfig } = state.typeSelection;

// Updating state
set((state) => ({
  typeSelection: { ...state.typeSelection, productConfig: value }
}));
```

### Tailwind CSS

- Use utility classes directly in JSX
- Custom classes defined in `index.css` (e.g., `form-section`, `badge-blue`)
- Responsive: mobile-first with `md:`, `lg:` breakpoints

```tsx
<div className="p-4 bg-white rounded-lg border border-gray-200 shadow-sm">
  <span className="badge-blue">{label}</span>
</div>
```

### Error Handling

- No empty catch blocks
- Use optional chaining for potentially undefined values
- Provide fallback values with nullish coalescing

```typescript
// Good
const name = component.name || `구성품 ${index + 1}`;
const categories = state.typeSelection.setComponents?.map(c => c.productCategory) ?? [];

// Bad
try { ... } catch(e) { }
```

### Type Safety

- **NEVER** use `as any`, `@ts-ignore`, `@ts-expect-error`
- Define proper types for all function parameters and return values
- Use discriminated unions for state variants

## Domain-Specific Notes

### 3-Step Form Flow

1. **Step1 (유형 선택)**: Product config → Product type → Packaging materials
2. **Step2 (내용 입력)**: Marking (착인) → Labels (라벨) → Loading method (적재)
3. **Step3 (미리보기)**: Preview and export (PDF/Excel)

### Key Concepts

- **구성품 (Component)**: Individual product item
- **단상자 (Individual Box)**: Single product box
- **세트상자 (Set Box)**: Box containing multiple products
- **착인 (Marking)**: Product coding/engraving (관리번호, 사용기한, 제조일자)
- **파우치 (Pouch)**: Individual pouch packaging

### Form Generation

`generateMarkingForms()` and `generateLabelForms()` in formStore auto-generate form entries based on Step1 selections. Re-running regenerates forms (existing data may be lost).

## Common Pitfalls

1. **State persistence**: Zustand persists to localStorage. Clear storage when testing fresh states.
2. **Form regeneration**: Changing Step1 options triggers form regeneration in Step2.
3. **Type sync**: When adding new type values, update both the type union AND the corresponding `_LABELS` constant.
