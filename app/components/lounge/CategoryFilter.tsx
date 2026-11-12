'use client';

import { PostCategory, categoryDisplayMap, categoryIcons } from '@/types/posts';

interface CategoryFilterProps {
  selectedCategories: PostCategory[];
  onCategoryToggle: (category: PostCategory) => void;
}

export default function CategoryFilter({
  selectedCategories,
  onCategoryToggle,
}: CategoryFilterProps) {
  return (
    <div className="tabs" aria-label="Categories">
      {(Object.keys(categoryDisplayMap) as PostCategory[]).map((category) => {
        const active = selectedCategories.includes(category);
        return (
          <button
            key={category}
            type="button"
            onClick={() => onCategoryToggle(category)}
            className={'tab' + (active ? ' tab--on' : '')}
            aria-pressed={active}
          >
            <span>{categoryIcons[category]}</span>
            <span>{categoryDisplayMap[category]}</span>
          </button>
        );
      })}
    </div>
  );
}
