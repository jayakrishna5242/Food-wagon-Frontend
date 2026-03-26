
import React from 'react';
import { motion } from 'motion/react';

interface CategoryChipsProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryChips: React.FC<CategoryChipsProps> = ({ categories, activeCategory, onCategoryChange }) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-4 px-4 -mx-4">
      {categories.map((category) => (
        <motion.button
          key={category}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onCategoryChange(category)}
          className={`px-6 py-2.5 rounded-full text-sm font-bold shadow-sm transition-all whitespace-nowrap ${
            activeCategory === category
              ? 'bg-primary text-white shadow-md'
              : 'bg-white text-gray-600 border border-gray-100 hover:bg-gray-50'
          }`}
        >
          {category}
        </motion.button>
      ))}
    </div>
  );
};

export default CategoryChips;
