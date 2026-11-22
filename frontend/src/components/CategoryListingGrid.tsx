import React, { useState } from 'react';
import { CATEGORY_GROUPS, SubCategoryItem } from '../data/categories';

interface Props {
  selectedSubCategory: string;
  onSelectSubCategory: (item: SubCategoryItem, groupTitle: string) => void;
}

export const CategoryListingGrid: React.FC<Props> = ({ selectedSubCategory, onSelectSubCategory }) => {
  const [activeGroupId, setActiveGroupId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredGroups = CATEGORY_GROUPS.filter((g) => activeGroupId === 'all' || g.id === activeGroupId)
    .map((g) => ({
      ...g,
      items: g.items.filter(
        (item) =>
          !searchQuery.trim() ||
          item.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
          g.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      ),
    }))
    .filter((g) => g.items.length > 0);

  return (
    <div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '1.15rem' }}>🗂️ প্রোডাক্ট লিস্টিং ক্যাটাগরি</h3>
          <small style={{ color: '#94a3b8' }}>যেকোনো ক্যাটাগরি বা সাব-ক্যাটাগরিতে ট্যাপ করে প্রোডাক্ট ফিল্টার করুন</small>
        </div>
        <input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="ক্যাটাগরি খুঁজুন (যেমন: হুডি, শাড়ি, ব্যাগ)..."
          style={{
            minWidth: '220px',
            padding: '9px 12px',
            borderRadius: '12px',
            border: '1px solid #334155',
            background: '#0b1220',
            color: '#fff',
            fontSize: '0.88rem',
          }}
        />
      </div>

      {/* Top Pill Filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setActiveGroupId('all')}
          style={{
            whiteSpace: 'nowrap',
            padding: '7px 14px',
            borderRadius: '999px',
            border: '1px solid rgba(56,189,248,0.4)',
            background: activeGroupId === 'all' ? '#38bdf8' : 'rgba(255,255,255,0.05)',
            color: activeGroupId === 'all' ? '#06101d' : '#e2e8f0',
            fontWeight: 700,
            fontSize: '0.82rem',
            cursor: 'pointer',
          }}
        >
          সব ক্যাটাগরি ({CATEGORY_GROUPS.length})
        </button>
        {CATEGORY_GROUPS.map((g) => {
          const active = activeGroupId === g.id;
          return (
            <button
              key={g.id}
              type="button"
              onClick={() => setActiveGroupId(g.id)}
              style={{
                whiteSpace: 'nowrap',
                padding: '7px 14px',
                borderRadius: '999px',
                border: `1px solid ${g.badgeColor}66`,
                background: active ? g.badgeColor : 'rgba(255,255,255,0.04)',
                color: active ? '#06101d' : '#f8fafc',
                fontWeight: 700,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              {g.title} ({g.totalCount})
            </button>
          );
        })}
      </div>

      {/* Category Banners + Subcategory Tiles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {filteredGroups.map((group) => (
          <div
            key={group.id}
            style={{
              borderRadius: '18px',
              padding: '14px',
              background: '#0b1220',
              border: '1px solid rgba(255,255,255,0.09)',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                marginBottom: '12px',
                background: `linear-gradient(90deg, ${group.badgeColor}2e, rgba(255,255,255,0.05), ${group.badgeColor}22)`,
                border: `1px solid ${group.badgeColor}55`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc' }}>
                ✦ {group.title} ({group.totalCount}) ✦
              </span>
              <span style={{ fontSize: '0.78rem', color: '#cbd5e1' }}>{group.items.length} আইটেম</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(112px, 1fr))', gap: '10px' }}>
              {group.items.map((item) => {
                const isSelected = selectedSubCategory === item.name;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectSubCategory(item, group.title)}
                    style={{
                      position: 'relative',
                      textAlign: 'center',
                      padding: '14px 8px 12px',
                      borderRadius: '14px',
                      border: isSelected ? `2px solid ${group.badgeColor}` : '1px solid rgba(255,255,255,0.1)',
                      background: isSelected ? 'rgba(56,189,248,0.14)' : '#0f172a',
                      color: '#f8fafc',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'transform 0.18s ease',
                    }}
                  >
                    <span
                      style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        padding: '2px 6px',
                        borderRadius: '999px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        background: 'rgba(168,85,247,0.22)',
                        color: '#e9d5ff',
                      }}
                    >
                      {item.count}
                    </span>
                    <span style={{ fontSize: '1.6rem', lineHeight: 1.2 }}>{item.emoji.trim()}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, lineHeight: 1.25 }}>{item.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryListingGrid;
