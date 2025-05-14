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
  // Add debug log
  console.log('Selected categories:', selectedCategories);

  return (
    <div className="mb-8 flex flex-wrap gap-2">
      {(Object.keys(categoryDisplayMap) as PostCategory[]).map((category) => (
        <button
          key={category}
          onClick={() => {
            console.log('Toggling category:', category); // Debug log
            onCategoryToggle(category);
          }}
          className={`
            flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium 
            transition-all duration-200 
            ${selectedCategories.includes(category)
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-zinc-800/50 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300'
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