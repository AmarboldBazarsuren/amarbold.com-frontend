import React from 'react';
import { Search, Filter } from 'lucide-react';

function DashboardFilters({ 
  searchQuery, 
  onSearchChange, 
  filterCategory, 
  onCategoryChange,
  showCategoryFilter = true 
}) {
  const categories = ['all', 'programming', 'design', 'business', 'marketing'];

  const getCategoryLabel = (cat) => {
    const labels = {
      'all': 'Бүгд',
      'programming': 'Програмчлал',
      'design': 'Дизайн',
      'business': 'Бизнес',
      'marketing': 'Маркетинг'
    };
    return labels[cat] || cat;
  };

  return (
    <div className="dashboard-filters">
      <div className="search-box">
        <Search size={20} />
        <input
          type="text"
          placeholder={showCategoryFilter ? 'Хичээл хайх...' : 'Багш хайх...'}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      {showCategoryFilter && (
        <div className="filter-buttons">
          <Filter size={20} />
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-btn ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat)}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardFilters;