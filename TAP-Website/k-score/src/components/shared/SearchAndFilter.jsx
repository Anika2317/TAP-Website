import React from 'react';
import { Search, X } from 'lucide-react';

export default function SearchAndFilter({ search, onSearch, tags, activeTag, onTagChange }) {
  return (
    <div className="mb-5 space-y-3">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={search}
          onChange={e => onSearch(e.target.value)}
          placeholder="Search by topic or thinker..."
          className="w-full pl-9 pr-8 py-2.5 rounded-2xl bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
        />
        {search && (
          <button
            onClick={() => onSearch('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Tag pills */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
        {tags.map(tag => (
          <button
            key={tag.value}
            onClick={() => onTagChange(activeTag === tag.value ? 'all' : tag.value)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
              activeTag === tag.value
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {tag.emoji && <span>{tag.emoji}</span>}
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  );
}