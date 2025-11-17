import React from 'react';
import { Search, Filter } from 'lucide-react';
import api from '../../config/api';  


function DashboardFilters({ 
  searchQuery, 
  onSearchChange, 
  filterCategory, 
  onCategoryChange,
  showCategoryFilter = true 
}) {
  const [categories, setCategories] = React.useState([]);

  React.useEffect(() => {
    if (showCategoryFilter) {
      fetchCategories();
    }
  }, [showCategoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await api.get('/api/categories');
      if (response.data.success) {
        setCategories(response.data.data || []);
      }
    } catch (error) {
      console.error('Ангилал татахад алдаа:', error);
    }
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
          <button
            className={`filter-btn ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => onCategoryChange('all')}
          >
            Бүгд
          </button>
          {categories.map(cat => (
            <button
              key={cat.slug}
              className={`filter-btn ${filterCategory === cat.slug ? 'active' : ''}`}
              onClick={() => onCategoryChange(cat.slug)}
            >
              {cat.icon && `${cat.icon} `}{cat.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default DashboardFilters;