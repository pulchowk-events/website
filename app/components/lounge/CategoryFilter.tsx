'use client';

import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';

interface CategoryFilterProps {
  selectedCategories: PostCategory[];
  onCategoryToggle: (category: PostCategory) => void;
}

export default function CategoryFilter({
  selectedCategories,
  onCategoryToggle
}: CategoryFilterProps) {
  console.log('Selected categories:', selectedCategories);

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {(Object.keys(categoryDisplayMap) as PostCategory[]).map((category) => (
        <button
          key={category}
          onClick={() => {
            console.log('Toggling category:', category);
            onCategoryToggle(category);
          }}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium
            transition-all duration-200
            ${selectedCategories.includes(category)
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-muted/50 hover:bg-accent text-muted-foreground hover:text-foreground'
            }
          `}
        >
          <span>{categoryIcons[category]}</span>
          <span>{categoryDisplayMap[category]}</span>
        </button>
      ))}
    </div>
  );
}