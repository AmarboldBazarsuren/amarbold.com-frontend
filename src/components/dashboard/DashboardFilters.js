import React from 'react';
import { Search, Filter, X } from 'lucide-react';
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
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      marginBottom: '40px',
      padding: '24px',
      background: 'rgba(26, 26, 26, 0.6)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: '20px'
    }}>
      {/* 🔍 ХАЙЛТЫН ХЭСЭГ */}
      <div style={{
        position: 'relative',
        width: '100%'
      }}>
        <div style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
          zIndex: 2
        }}>
          <Search size={20} color="#808080" />
        </div>
        
        <input
          type="text"
          placeholder={showCategoryFilter ? 'Хичээл хайх...' : 'Багш хайх...'}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 48px 16px 48px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '2px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#ffffff',
            fontSize: '15px',
            fontWeight: '500',
            outline: 'none',
            transition: 'all 0.3s ease'
          }}
          onFocus={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.08)';
            e.target.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            e.target.style.boxShadow = '0 0 0 3px rgba(0, 212, 255, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.background = 'rgba(255, 255, 255, 0.05)';
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            e.target.style.boxShadow = 'none';
          }}
        />

        {searchQuery && (
          <button
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              color: '#ff3b30',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 59, 48, 0.2)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 59, 48, 0.1)';
              e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
            }}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* 🏷️ АНГИЛЛЫН ХЭСЭГ */}
      {showCategoryFilter && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <Filter size={20} color="#00d4ff" />
            <span style={{
              fontSize: '14px',
              fontWeight: '700',
              color: '#b0b0b0',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Ангилал
            </span>
          </div>

          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* БҮГД ТОВЧ */}
            <button
              onClick={() => onCategoryChange('all')}
              style={{
                padding: '10px 20px',
                background: filterCategory === 'all' 
                  ? 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
                  : 'rgba(255, 255, 255, 0.05)',
                border: filterCategory === 'all'
                  ? '2px solid rgba(0, 212, 255, 0.6)'
                  : '2px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                color: filterCategory === 'all' ? '#ffffff' : '#b0b0b0',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: filterCategory === 'all'
                  ? '0 4px 16px rgba(0, 212, 255, 0.3)'
                  : 'none'
              }}
              onMouseOver={(e) => {
                if (filterCategory !== 'all') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                  e.currentTarget.style.color = '#00d4ff';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }
              }}
              onMouseOut={(e) => {
                if (filterCategory !== 'all') {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                  e.currentTarget.style.color = '#b0b0b0';
                  e.currentTarget.style.transform = 'translateY(0)';
                }
              }}
            >
              Бүгд
            </button>

            {/* АНГИЛАЛ ТОВЧУУД */}
            {categories.map(cat => (
              <button
                key={cat.slug}
                onClick={() => onCategoryChange(cat.slug)}
                style={{
                  padding: '10px 20px',
                  background: filterCategory === cat.slug
                    ? 'linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: filterCategory === cat.slug
                    ? '2px solid rgba(0, 212, 255, 0.6)'
                    : '2px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '10px',
                  color: filterCategory === cat.slug ? '#ffffff' : '#b0b0b0',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: filterCategory === cat.slug
                    ? '0 4px 16px rgba(0, 212, 255, 0.3)'
                    : 'none'
                }}
                onMouseOver={(e) => {
                  if (filterCategory !== cat.slug) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.3)';
                    e.currentTarget.style.color = '#00d4ff';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }
                }}
                onMouseOut={(e) => {
                  if (filterCategory !== cat.slug) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
                    e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.currentTarget.style.color = '#b0b0b0';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }
                }}
              >
                {cat.icon && <span style={{ fontSize: '16px' }}>{cat.icon}</span>}
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 📊 ҮЗҮҮЛЭЛТҮҮД */}
      {(searchQuery || filterCategory !== 'all') && (
        <div style={{
          padding: '12px 16px',
          background: 'rgba(0, 212, 255, 0.1)',
          border: '1px solid rgba(0, 212, 255, 0.3)',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#00d4ff',
            fontWeight: '600'
          }}>
            {searchQuery && `Хайлт: "${searchQuery}"`}
            {filterCategory !== 'all' && categories.find(c => c.slug === filterCategory) && 
              ` | Ангилал: ${categories.find(c => c.slug === filterCategory).name}`
            }
          </span>
          <button
            onClick={() => {
              onSearchChange('');
              onCategoryChange('all');
            }}
            style={{
              padding: '6px 12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.15)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <X size={14} />
            Цэвэрлэх
          </button>
        </div>
      )}
    </div>
  );
}

export default DashboardFilters;