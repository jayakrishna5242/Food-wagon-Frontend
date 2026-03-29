
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SUPERMARKET_ITEMS } from '../../supermarketData';
import MenuItem from '../../components/MenuItem';

const Supermarket: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = Array.from(new Set(SUPERMARKET_ITEMS.map(item => item.category)));

  const filteredItems = SUPERMARKET_ITEMS.filter(item => {
    const matchesCategory = selectedCategory ? item.category === selectedCategory : true;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="bg-white relative z-30 shadow-sm">
        <div className="container mx-auto max-w-7xl px-4 h-16 flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="w-6 h-6 text-dark" />
          </Link>
          <h1 className="text-xl font-bold text-dark">Feasti Mart</h1>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input 
            type="text" 
            placeholder="Search for groceries, snacks, household items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-none py-4 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        {/* Categories */}
        <div className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-dark uppercase">Shop by Category</h2>
            <button onClick={() => setSelectedCategory(null)} className={`text-sm font-semibold flex items-center gap-1 transition-colors ${selectedCategory === null ? 'text-primary underline' : 'text-gray-500 hover:text-primary'}`}>
              View All Items <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <motion.button 
                key={cat}
                whileHover={{ y: -2 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition-all border ${selectedCategory === cat ? 'bg-primary/10 border-primary text-primary' : 'bg-white border-gray-200 text-dark hover:border-primary'} shadow-sm hover:shadow-md`}
              >
                {cat}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Items */}
        <div>
          <h2 className="text-xl font-semibold text-dark mb-6 uppercase">{selectedCategory || 'All Items'}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item) => (
              <MenuItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Supermarket;
