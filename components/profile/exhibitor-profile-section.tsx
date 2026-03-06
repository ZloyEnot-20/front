'use client';

import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { Search, Settings, Bell, Download, Plus, ChevronDown, X, ArrowUpDown, Calendar, MapPin, Users, Upload } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { useAdmin } from '@/lib/admin-context';
import { useLocale } from '@/lib/i18n';
import { leadsApi, registrationsApi, exhibitionsApi, type ApiLeadRow, type ApiRegistration } from '@/lib/api';
import { PersonalInfoSection } from '@/components/profile/personal-info-section';
import { UniversityProfileSection } from '@/components/profile/university-profile-section';
import { SecuritySection } from '@/components/profile/security-section';
import { Skeleton } from '@/components/ui/skeleton';
import type { Exhibition } from '@/lib/types';

function formatExhibitionDate(d: Date | string) {
  return new Date(d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

const STATUS_LABELS: Record<string, string> = {
  registered: 'Зарегистрирован',
  visited: 'Посетил выставку',
};

// Data Table Component — лиды: данные из профиля + статус + выставка
function DataTable({ data, selectedIds, onSelectAll, onSelectRow, onSort, sortConfig }: any) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const SortHeader = ({ column, label }: any) => (
    <button
      onClick={() => onSort(column)}
      className="flex items-center gap-1 hover:text-primary transition font-medium text-sm"
    >
      {label}
      <ArrowUpDown
        size={14}
        className={`transition ${
          sortConfig?.key === column
            ? 'text-primary opacity-100'
            : 'text-muted-foreground opacity-50'
        }`}
      />
    </button>
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-red-500',
      'bg-yellow-500',
      'bg-green-500',
      'bg-teal-500',
      'bg-indigo-500',
    ];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const cellCls = 'px-4 py-2 border border-border overflow-hidden';
  const textCls = 'block truncate text-foreground';

  return (
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse border border-border">
        <thead className="sticky top-0 z-10 bg-card shadow-[0_1px_0_0_hsl(var(--border))]">
          <tr className="border-b border-border">
            <th className="px-4 py-2 text-left border border-border bg-card">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={(e) => onSelectAll(e.target.checked)}
                className="rounded cursor-pointer w-4 h-4"
              />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card">
              <SortHeader column="name" label="Имя" />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card">
              <SortHeader column="email" label="Email" />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card">
              <SortHeader column="phone" label="Телефон" />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card w-28 max-w-28">
              <SortHeader column="city" label="Город" />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card">
              <SortHeader column="status" label="Статус" />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card w-36 max-w-36">
              <SortHeader column="exhibitionTitle" label="Выставка" />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card">
              <SortHeader column="interest" label="Интерес" />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card">
              <SortHeader column="countryOfInterest" label="Страна интереса" />
            </th>
            <th className="px-4 py-2 text-left border border-border bg-card">
              <SortHeader column="admissionPlan" label="План поступления" />
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row: ApiLeadRow) => (
            <tr key={row.id} className="hover:bg-muted/30 transition">
              <td className={cellCls}>
                <input
                  type="checkbox"
                  checked={selectedIds.includes(row.id)}
                  onChange={() => onSelectRow(row.id)}
                  className="rounded cursor-pointer w-4 h-4"
                />
              </td>
              <td className={cellCls}>
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-full ${getAvatarColor(
                      row.name
                    )} flex items-center justify-center text-white font-medium text-sm flex-shrink-0`}
                  >
                    {getInitials(row.name)}
                  </div>
                  <span className={`font-medium ${textCls}`}>{row.name}</span>
                </div>
              </td>
              <td className={cellCls}><span className={textCls}>{row.email}</span></td>
              <td className={cellCls}><span className={textCls}>{row.phone || '—'}</span></td>
              <td className={`${cellCls} w-28 max-w-28`}><span className={textCls}>{row.city || '—'}</span></td>
              <td className={cellCls}>
                <Badge
                  className={
                    row.status === 'visited'
                      ? 'border-transparent bg-green-600 text-white hover:bg-green-600'
                      : 'border-transparent bg-purple-600 text-white hover:bg-purple-600'
                  }
                >
                  {STATUS_LABELS[row.status] ?? row.status}
                </Badge>
              </td>
              <td className={`${cellCls} w-36 max-w-36`}><span className={textCls}>{row.exhibitionTitle || '—'}</span></td>
              <td className={cellCls}><span className={textCls}>{row.interest || '—'}</span></td>
              <td className={cellCls}><span className={textCls}>{row.countryOfInterest || '—'}</span></td>
              <td className={cellCls}><span className={textCls}>{row.admissionPlan || '—'}</span></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Sidebar Component
function Sidebar({
  filters,
  setFilters,
  exhibitorExhibitions,
  onApply,
}: {
  filters: {
    name: string;
    exhibitionIds: string[];
    status: string;
    interest?: string[];
    countryOfInterest?: string[];
    admissionPlan?: string[];
    [k: string]: unknown;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    name: string;
    exhibitionIds: string[];
    status: string;
    interest?: string[];
    countryOfInterest?: string[];
    admissionPlan?: string[];
    [k: string]: unknown;
  }>>;
  exhibitorExhibitions: { id: string; title: string }[];
  onApply: () => void;
}) {
  const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
  const sidebarRef = useRef<HTMLDivElement>(null);

  const toggleDropdown = (key: string) => {
    setOpenDropdowns(prev => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    const hasOpen = Object.values(openDropdowns).some(Boolean);
    if (!hasOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (sidebarRef.current?.contains(e.target as Node)) return;
      setOpenDropdowns({});
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdowns]);

  const handleRemoveFilter = (key: string, value: string) => {
    const arr = Array.isArray(filters[key]) ? filters[key] : [];
    setFilters((f: typeof filters) => ({ ...f, [key]: arr.filter((v: string) => v !== value) }));
  };

  const handleAddFilter = (key: string, value: string) => {
    const arr = Array.isArray(filters[key]) ? filters[key] : [];
    if (!arr.includes(value)) {
      setFilters((f: typeof filters) => ({ ...f, [key]: [...arr, value] }));
    }
  };

  const toggleExhibition = (id: string, checked: boolean) => {
    setFilters((f: typeof filters) => ({
      ...f,
      exhibitionIds: checked
        ? [...(f.exhibitionIds || []), id]
        : (f.exhibitionIds || []).filter((x: string) => x !== id),
    }));
  };

  const clearAllFilters = () => {
    setFilters((f: typeof filters) => ({
      ...f,
      name: '',
      exhibitionIds: [],
      status: '__all__',
      interest: [],
      countryOfInterest: [],
      admissionPlan: [],
      title: [],
      location: [],
      industry: [],
      companySize: [],
      salary: [],
      keyword: [],
      skills: [],
    }));
  };

  const activeCount = [
    !!filters.name,
    (filters.exhibitionIds || []).length > 0,
    filters.status && filters.status !== '__all__',
    (filters.interest || []).length > 0,
    (filters.countryOfInterest || []).length > 0,
    (filters.admissionPlan || []).length > 0,
    filters.title?.length,
    filters.location?.length,
    filters.industry?.length,
    filters.companySize?.length,
    filters.salary?.length,
    filters.keyword?.length,
    filters.skills?.length,
  ].filter(Boolean).length;

  return (
    <div ref={sidebarRef} className="w-72 h-full min-h-0 bg-card flex flex-col overflow-hidden">
      <div className="p-6 space-y-4 flex-1 min-h-0 overflow-y-auto">
        {/* Name Filter */}
        <div>
          <div className="flex items-center gap-3 px-3 py-3 border border-border rounded-lg bg-card hover:border-foreground/30 transition focus-within:border-foreground/50">
            <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            <input
              type="text"
              placeholder="Имя"
              className="bg-transparent outline-none text-sm flex-1 placeholder-muted-foreground text-foreground"
              value={filters.name}
              onChange={(e) => setFilters((f: typeof filters) => ({ ...f, name: e.target.value }))}
            />
          </div>
        </div>

        {/* Выставки (множественный выбор — выставки, где универ участник) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('exhibitions')}
            className="w-full flex items-center justify-between gap-3 px-3 py-3 border border-border rounded-lg bg-card hover:border-foreground/30 transition min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
              <svg className="w-5 h-5 text-muted-foreground flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
              <div className="flex items-center gap-2 flex-wrap text-left min-w-0 overflow-hidden">
                {(filters.exhibitionIds || []).length > 0 ? (
                  (filters.exhibitionIds || []).map((id: string) => {
                    const ex = exhibitorExhibitions.find((e) => e.id === id);
                    return (
                      <span
                        key={id}
                        className="inline-flex items-center gap-1 bg-muted px-2 py-1 rounded text-xs font-medium text-foreground"
                      >
                        {ex?.title ?? id}
                        <X
                          size={14}
                          className="cursor-pointer hover:text-destructive flex-shrink-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleExhibition(id, false);
                          }}
                        />
                      </span>
                    );
                  })
                ) : (
                  <span className="text-sm text-foreground">Выставки</span>
                )}
              </div>
            </div>
            <ChevronDown
              size={18}
              className={`text-muted-foreground flex-shrink-0 transition ${openDropdowns.exhibitions ? 'rotate-180' : ''}`}
            />
          </button>
          {openDropdowns.exhibitions && exhibitorExhibitions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg p-3 space-y-2 animate-in fade-in duration-200 z-50 shadow-lg max-h-60 overflow-y-auto">
              {exhibitorExhibitions.map((ex) => (
                <label key={ex.id} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={(filters.exhibitionIds || []).includes(ex.id)}
                    onChange={(e) => toggleExhibition(ex.id, e.target.checked)}
                    className="rounded w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground truncate">{ex.title}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Статус */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('status')}
            className="w-full flex items-center justify-between gap-3 px-3 py-3 border border-border rounded-lg bg-card hover:border-foreground/30 transition min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
              <span className="text-sm text-foreground truncate">
                {filters.status === 'visited'
                  ? 'Посетил выставку'
                  : filters.status === 'registered'
                    ? 'Зарегистрирован'
                    : 'Статус'}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-muted-foreground flex-shrink-0 transition ${openDropdowns.status ? 'rotate-180' : ''}`}
            />
          </button>
          {openDropdowns.status && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg p-3 space-y-2 animate-in fade-in duration-200 z-50 shadow-lg">
              {[
                { value: '__all__', label: 'Все' },
                { value: 'registered', label: 'Зарегистрирован' },
                { value: 'visited', label: 'Посетил выставку' },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setFilters((f: typeof filters) => ({ ...f, status: value }));
                    setOpenDropdowns((prev) => ({ ...prev, status: false }));
                  }}
                  className={`w-full text-left px-3 py-2 rounded transition text-sm ${
                    (filters.status || '__all__') === value
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'hover:bg-muted/50 text-foreground'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Интерес */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('interest')}
            className="w-full flex items-center justify-between gap-3 px-3 py-3 border border-border rounded-lg bg-card hover:border-foreground/30 transition min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
              <span className="text-sm text-foreground truncate">
                {(filters.interest || []).length > 0
                  ? `Интерес (${(filters.interest || []).length})`
                  : 'Интерес'}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-muted-foreground flex-shrink-0 transition ${openDropdowns.interest ? 'rotate-180' : ''}`}
            />
          </button>
          {openDropdowns.interest && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg p-3 space-y-2 animate-in fade-in duration-200 z-50 shadow-lg max-h-60 overflow-y-auto">
              {['Bachelor', 'Master', 'MBA', 'Short Courses', 'School'].map((val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={(filters.interest || []).includes(val)}
                    onChange={(e) =>
                      e.target.checked ? handleAddFilter('interest', val) : handleRemoveFilter('interest', val)
                    }
                    className="rounded w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">{val}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Страна интереса */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('countryOfInterest')}
            className="w-full flex items-center justify-between gap-3 px-3 py-3 border border-border rounded-lg bg-card hover:border-foreground/30 transition min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
              <span className="text-sm text-foreground truncate">
                {(filters.countryOfInterest || []).length > 0
                  ? `Страна интереса (${(filters.countryOfInterest || []).length})`
                  : 'Страна интереса'}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-muted-foreground flex-shrink-0 transition ${openDropdowns.countryOfInterest ? 'rotate-180' : ''}`}
            />
          </button>
          {openDropdowns.countryOfInterest && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg p-3 space-y-2 animate-in fade-in duration-200 z-50 shadow-lg max-h-60 overflow-y-auto">
              {['Россия', 'США', 'Великобритания', 'Германия', 'Франция', 'Канада', 'Австралия', 'Нидерланды', 'Италия', 'Испания', 'Швейцария', 'Китай', 'Япония', 'Южная Корея'].map((val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={(filters.countryOfInterest || []).includes(val)}
                    onChange={(e) =>
                      e.target.checked ? handleAddFilter('countryOfInterest', val) : handleRemoveFilter('countryOfInterest', val)
                    }
                    className="rounded w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">{val}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* План поступления */}
        <div className="relative">
          <button
            type="button"
            onClick={() => toggleDropdown('admissionPlan')}
            className="w-full flex items-center justify-between gap-3 px-3 py-3 border border-border rounded-lg bg-card hover:border-foreground/30 transition min-w-0 overflow-hidden"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
              <span className="text-sm text-foreground truncate">
                {(filters.admissionPlan || []).length > 0
                  ? `План поступления (${(filters.admissionPlan || []).length})`
                  : 'План поступления'}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`text-muted-foreground flex-shrink-0 transition ${openDropdowns.admissionPlan ? 'rotate-180' : ''}`}
            />
          </button>
          {openDropdowns.admissionPlan && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg p-3 space-y-2 animate-in fade-in duration-200 z-50 shadow-lg">
              {['0-3', '3-6', '6-12', '12+'].map((val) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                  <input
                    type="checkbox"
                    checked={(filters.admissionPlan || []).includes(val)}
                    onChange={(e) =>
                      e.target.checked ? handleAddFilter('admissionPlan', val) : handleRemoveFilter('admissionPlan', val)
                    }
                    className="rounded w-4 h-4 cursor-pointer"
                  />
                  <span className="text-sm text-foreground">{val} мес.</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons — fixed at bottom */}
      <div className="shrink-0 p-6 pt-4 border-t border-border bg-card">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 border border-border rounded-lg bg-card text-destructive hover:text-white hover:bg-destructive hover:border-transparent"
            onClick={clearAllFilters}
          >
            Очистить {activeCount > 0 ? `(${activeCount})` : ''}
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={onApply}
          >
            Применить
          </Button>
        </div>
      </div>
    </div>
  );
}

// Вкладка «Выставки» — карточки кампаний, макс. ширина 400px
function ExhibitionsTabContent({ exhibitions }: { exhibitions: Exhibition[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'participants' | 'name'>('date');
  const [openFilters, setOpenFilters] = useState<Record<string, boolean>>({});
  const filtersBarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasOpen = Object.values(openFilters).some(Boolean);
    if (!hasOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (filtersBarRef.current?.contains(e.target as Node)) return;
      setOpenFilters({});
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openFilters]);

  const uniqueCities = useMemo(
    () =>
      Array.from(
        new Set(
          exhibitions.flatMap((e) => (e.cities ?? []).map((c) => (typeof c === 'object' && c !== null && 'name' in c ? c.name : String(c))))
        )
      ).sort(),
    [exhibitions]
  );

  const toggleFilter = (filterName: string) => {
    setOpenFilters((prev) => ({ ...prev, [filterName]: !prev[filterName] }));
  };

  const toggleCity = (city: string) => {
    setSelectedCities((prev) => (prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]));
  };

  const filteredExhibitions = useMemo(() => {
    let list = exhibitions.filter((ex) => {
      const cityNames = (ex.cities ?? []).map((c) => (typeof c === 'object' && c !== null && 'name' in c ? c.name : String(c)));
      const matchesSearch =
        ex.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cityNames.some((city) => city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (ex.description ?? '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCities =
        selectedCities.length === 0 ||
        cityNames.some((city) => selectedCities.some((s) => city.toLowerCase().includes(s.toLowerCase())));
      let matchesDate = true;
      if (dateFrom || dateTo) {
        const start = new Date(ex.startDate).getTime();
        const end = new Date(ex.endDate).getTime();
        if (dateFrom) matchesDate = matchesDate && start >= new Date(dateFrom).getTime();
        if (dateTo) matchesDate = matchesDate && end <= new Date(dateTo).getTime();
      }
      return matchesSearch && matchesCities && matchesDate;
    });
    if (sortBy === 'date') {
      list = [...list].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    } else if (sortBy === 'participants') {
      list = [...list].sort((a, b) => (b.registrations ?? 0) - (a.registrations ?? 0));
    } else if (sortBy === 'name') {
      list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return list;
  }, [exhibitions, searchTerm, selectedCities, dateFrom, dateTo, sortBy]);

  return (
    <div className="flex-1 overflow-auto p-4 px-[15%]">
      <div className="space-y-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Выставки</h1>
            <p className="text-muted-foreground mt-1">Выставки и мероприятия, в которых вы участвуете</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" className="gap-2">
              <Upload size={16} />
              Экспорт
            </Button>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
              <Link href="/exhibitions">Новая выставка</Link>
            </Button>
          </div>
        </div>

        <div ref={filtersBarRef} className="flex gap-3 items-center flex-wrap">
          <div className="relative">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toggleFilter('date')}>
              <Calendar size={16} />
              {dateFrom || dateTo ? `${dateFrom || 'Начало'} — ${dateTo || 'Конец'}` : 'Даты'}
            </Button>
            {openFilters.date && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg p-4 space-y-3 z-50 shadow-lg min-w-72">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">С</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-foreground/50"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">По</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground text-sm focus:outline-none focus:border-foreground/50"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => {
                      setDateFrom('');
                      setDateTo('');
                    }}
                  >
                    Очистить
                  </Button>
                  <Button size="sm" className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground" onClick={() => toggleFilter('date')}>
                    Применить
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toggleFilter('city')}>
              <MapPin size={16} />
              {selectedCities.length > 0 ? `Города (${selectedCities.length})` : 'Город'}
            </Button>
            {openFilters.city && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg p-3 space-y-2 z-50 shadow-lg min-w-60 max-h-60 overflow-y-auto">
                {uniqueCities.map((city) => (
                  <label key={city} className="flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-2 rounded transition">
                    <input
                      type="checkbox"
                      checked={selectedCities.includes(city)}
                      onChange={() => toggleCity(city)}
                      className="rounded w-4 h-4 cursor-pointer"
                    />
                    <span className="text-sm text-foreground">{city}</span>
                  </label>
                ))}
              </div>
            )}
          </div>

          <div className="relative">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => toggleFilter('sort')}>
              Сортировка
            </Button>
            {openFilters.sort && (
              <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-lg p-3 space-y-2 z-50 shadow-lg min-w-48">
                {[
                  { value: 'date' as const, label: 'По дате' },
                  { value: 'participants' as const, label: 'По участникам' },
                  { value: 'name' as const, label: 'По названию (А–Я)' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setSortBy(option.value);
                      toggleFilter('sort');
                    }}
                    className={`w-full text-left px-3 py-2 rounded transition ${
                      sortBy === option.value ? 'bg-primary/10 border border-primary text-primary' : 'hover:bg-muted/50 text-foreground'
                    }`}
                  >
                    <span className="text-sm font-medium">{option.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="ml-auto flex-1 min-w-0 max-w-xs">
            <div className="flex items-center bg-card rounded-lg px-3 py-2 gap-2 text-sm border border-border focus-within:border-foreground/50 transition">
              <Search size={16} className="text-muted-foreground flex-shrink-0" />
              <input
                type="text"
                placeholder="Поиск"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent outline-none w-full placeholder-muted-foreground text-foreground"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 items-stretch">
          {filteredExhibitions.map((ex) => {
            const cityNames = (ex.cities ?? []).map((c) => (typeof c === 'object' && c !== null && 'name' in c ? c.name : String(c)));
            const locationLine = [ex.venue, cityNames.length ? cityNames.join(' | ') : ''].filter(Boolean).join(' · ') || '—';
            return (
              <div
                key={ex.id}
                className="bg-card rounded-lg border border-border p-6 hover:shadow-md transition cursor-pointer max-w-[400px] w-full h-full min-h-[320px] flex flex-col"
              >
                <div className="mb-4 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-foreground mb-1 line-clamp-1">{ex.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{ex.description || '—'}</p>
                </div>
                <div className="mb-4 pb-4 border-b border-border flex-shrink-0">
                  <div className="flex items-start gap-2">
                    <Calendar size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground">
                        {formatExhibitionDate(ex.startDate)} — {formatExhibitionDate(ex.endDate)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mb-4 pb-4 border-b border-border flex-shrink-0 min-w-0">
                  <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <p className="text-sm font-medium text-foreground truncate" title={locationLine}>
                      {locationLine}
                    </p>
                  </div>
                </div>
                <div className="mb-6 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-primary" />
                    <p className="text-sm font-medium text-foreground">
                      {ex.registrations ?? 0} <span className="text-muted-foreground">участников</span>
                    </p>
                  </div>
                </div>
                <Button className="w-full mt-auto bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 flex-shrink-0" asChild>
                  <Link href={`/exhibitions/${ex.id}`}>Показать</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {filteredExhibitions.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground">Выставки не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}

const EXHIBITOR_ADMIN_TABS = [
  { id: 'leads', label: 'Лиды' },
  { id: 'exhibitions', label: 'Выставки' },
  { id: 'university', label: 'Профиль Университета' },
  { id: 'mail', label: 'Почта и Пароль' },
] as const;

const VISITOR_TABS = [
  { id: 'myExhibitions', label: 'Мои выставки' },
  { id: 'profile', label: 'Личные данные' },
  { id: 'mail', label: 'Почта и Пароль' },
] as const;

function getProfileTabs(role: string | undefined, t: (key: string) => string): { id: string; label: string }[] {
  if (role === 'exhibitor' || role === 'admin') {
    return EXHIBITOR_ADMIN_TABS.map((tab) => ({ id: tab.id, label: tab.label }));
  }
  return VISITOR_TABS.map((tab) => ({
    id: tab.id,
    label: tab.id === 'profile' ? 'Личные данные' : tab.id === 'myExhibitions' ? t('myExhibitions') : tab.label,
  }));
}

// Скелетон для «Мои выставки»
function MyExhibitionsSkeleton() {
  return (
    <div className="flex-1 overflow-auto p-4 px-[15%]">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-full max-w-md" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border bg-card p-6 flex flex-col">
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-24 mb-4" />
              <Skeleton className="h-4 w-full mb-4" />
              <Skeleton className="w-44 h-44 mx-auto rounded-lg mb-4" />
              <Skeleton className="h-10 w-full rounded-md mt-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Контент «Мои выставки» для посетителя: регистрации с QR-кодом (данные приходят из родителя, загрузка только при первом входе)
function MyExhibitionsTabContent({
  registrations,
  exhibitions,
  loading,
}: {
  registrations: ApiRegistration[];
  exhibitions: Exhibition[];
  loading: boolean;
}) {
  if (loading) {
    return <MyExhibitionsSkeleton />;
  }

  const activeRegs = registrations.filter((r) => r.status === 'registered' || !r.cancelledAt);

  return (
    <div className="flex-1 overflow-auto p-4 px-[15%]">
      <div className="max-w-[1400px] mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Мои выставки</h1>
          <p className="text-muted-foreground mt-1">Выставки, на которые вы зарегистрированы. QR-код для входа ниже.</p>
        </div>
        {activeRegs.length === 0 ? (
          <div className="rounded-lg border bg-card p-12 text-center">
            <p className="text-muted-foreground mb-4">Вы ещё не зарегистрированы ни на одну выставку</p>
            <Button asChild>
              <Link href="/exhibitions">Смотреть выставки</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {activeRegs.map((reg) => {
              const ex = exhibitions.find((e) => e.id === reg.exhibitionId);
              const startDate = ex?.startDate ? formatExhibitionDate(ex.startDate) : null;
              const endDate = ex?.endDate ? formatExhibitionDate(ex.endDate) : null;
              return (
                <div key={reg.id} className="rounded-xl border bg-card p-6 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-lg font-semibold">{ex?.title ?? 'Выставка'}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{reg.city}</p>
                  </div>
                  {(startDate || endDate) && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                      <Calendar size={16} />
                      {startDate && endDate ? `${startDate} — ${endDate}` : startDate || endDate}
                    </div>
                  )}
                  {reg.qrCode && (
                    <div className="rounded-lg border bg-muted/30 p-4 mb-4 flex flex-col items-center gap-2">
                      <img src={reg.qrCode} alt="QR-код для входа" className="w-44 h-44 object-contain" loading="lazy" />
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin size={12} />
                        Покажите QR-код на входе
                      </span>
                    </div>
                  )}
                  <Button variant="outline" className="w-full mt-auto" asChild>
                    <Link href={`/exhibitions/${reg.exhibitionId}`}>Подробнее о выставке</Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Header Component: слева лого, по центру вкладки профиля, справа языки и профиль
function Header({
  tabs,
  profileSectionTab,
  onProfileSectionTab,
}: {
  tabs: { id: string; label: string }[];
  profileSectionTab: string;
  onProfileSectionTab: (id: string) => void;
}) {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLocale();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white font-bold shrink-0">
              E
            </div>
            <span className="font-bold text-lg hidden sm:inline">{t('appName')}</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2 h-full">
          {tabs.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => onProfileSectionTab(id)}
              className={`relative flex items-center h-full text-sm font-medium transition-colors px-1 ${
                profileSectionTab === id ? 'text-primary' : 'text-foreground/80 hover:text-foreground'
              }`}
            >
              {label}
              {profileSectionTab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" aria-hidden />
              )}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3 border-l border-border/60 pl-4 shrink-0">
          <div className="flex gap-1 text-xs text-muted-foreground">
            {(['uz', 'ru', 'en'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-1.5 py-0.5 rounded ${lang === l ? 'bg-primary/20 text-primary font-medium' : 'hover:text-foreground'}`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline text-sm">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuLabel className="text-xs font-normal text-muted-foreground capitalize">
                    {user.role === 'exhibitor' ? t('roleExhibitor') : user.role === 'admin' ? 'Админ' : user.role}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">{t('profile')}</Link>
                  </DropdownMenuItem>
                  {user.role === 'admin' && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">{t('adminPanel')}</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    {t('logout')}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">{t('login')}</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">{t('signup')}</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

// Main Page Component
export function ExhibitorProfileSection() {
  const { user } = useAuth();
  const { t } = useLocale();
  const { exhibitions: allExhibitions } = useAdmin();
  const profileTabs = useMemo(() => getProfileTabs(user?.role, t), [user?.role, t]);
  const initialTab = user?.role === 'exhibitor' || user?.role === 'admin' ? 'leads' : 'myExhibitions';
  const [profileSectionTab, setProfileSectionTab] = useState(initialTab);

  // Синхронизировать вкладку при смене роли (например после логина)
  useEffect(() => {
    const expected = user?.role === 'exhibitor' || user?.role === 'admin' ? 'leads' : 'myExhibitions';
    const validIds = profileTabs.map((tab) => tab.id);
    if (!validIds.includes(profileSectionTab)) {
      setProfileSectionTab(validIds[0] ?? expected);
    }
  }, [user?.role, profileTabs, profileSectionTab]);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [leadsData, setLeadsData] = useState<{ items: ApiLeadRow[]; total: number; page: number; rowsPerPage: number; totalPages: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [rowsPerPage] = useState(19);
  const [filters, setFilters] = useState({
    name: '',
    exhibitionIds: [] as string[],
    status: '__all__',
    interest: [] as string[],
    countryOfInterest: [] as string[],
    admissionPlan: [] as string[],
  });
  const [appliedFilters, setAppliedFilters] = useState({
    name: '',
    exhibitionIds: [] as string[],
    status: '__all__',
    interest: [] as string[],
    countryOfInterest: [] as string[],
    admissionPlan: [] as string[],
  });

  // «Мои выставки»: загрузка только при первом входе на вкладку или перезагрузке страницы
  const [myExhibitionsRegistrations, setMyExhibitionsRegistrations] = useState<ApiRegistration[]>([]);
  const [myExhibitionsExhibitions, setMyExhibitionsExhibitions] = useState<Exhibition[]>([]);
  const [myExhibitionsLoading, setMyExhibitionsLoading] = useState(false);
  const [myExhibitionsHasFetched, setMyExhibitionsHasFetched] = useState(false);

  useEffect(() => {
    if (profileSectionTab !== 'myExhibitions' || myExhibitionsHasFetched) return;
    let cancelled = false;
    setMyExhibitionsLoading(true);
    Promise.all([registrationsApi.list(), exhibitionsApi.list()])
      .then(([regs, exList]) => {
        if (cancelled) return;
        setMyExhibitionsRegistrations(regs);
        setMyExhibitionsExhibitions((exList ?? []) as unknown as Exhibition[]);
        setMyExhibitionsHasFetched(true);
      })
      .catch(() => {
        if (!cancelled) setMyExhibitionsRegistrations([]);
        if (!cancelled) setMyExhibitionsHasFetched(true);
      })
      .finally(() => {
        if (!cancelled) setMyExhibitionsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [profileSectionTab, myExhibitionsHasFetched]);

  const exhibitorExhibitionIds =
    allExhibitions?.filter((e) => (e.participants ?? []).some((p) => (typeof p === 'object' ? p.id : p) === user?.id)).map((e) => e.id) ?? [];
  const exhibitorExhibitions = (allExhibitions ?? []).filter((e) => exhibitorExhibitionIds.includes(e.id));

  const fetchLeads = useCallback(async () => {
    if (user?.role !== 'exhibitor' || exhibitorExhibitionIds.length === 0) {
      setLeadsData({ items: [], total: 0, page: 1, rowsPerPage: 19, totalPages: 0 });
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await leadsApi.list({
        page,
        rowsPerPage,
        search: appliedFilters.name || undefined,
        exhibitionIds: appliedFilters.exhibitionIds.length ? appliedFilters.exhibitionIds : undefined,
        status: appliedFilters.status === '__all__' ? undefined : appliedFilters.status || undefined,
        interest: appliedFilters.interest?.length ? appliedFilters.interest : undefined,
        countryOfInterest: appliedFilters.countryOfInterest?.length ? appliedFilters.countryOfInterest : undefined,
        admissionPlan: appliedFilters.admissionPlan?.length ? appliedFilters.admissionPlan : undefined,
      });
      setLeadsData(res);
    } catch {
      setLeadsData({ items: [], total: 0, page: 1, rowsPerPage: 19, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  }, [user?.role, exhibitorExhibitionIds.length, page, rowsPerPage, appliedFilters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const sortedData = useMemo(() => {
    const items = leadsData?.items ?? [];
    if (!sortConfig) return items;
    return [...items].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof ApiLeadRow] ?? '';
      const bVal = b[sortConfig.key as keyof ApiLeadRow] ?? '';
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { sensitivity: 'base' });
      return sortConfig.direction === 'asc' ? cmp : -cmp;
    });
  }, [leadsData?.items, sortConfig]);

  const handleApplyFilters = () => {
    setAppliedFilters({
      name: filters.name,
      exhibitionIds: filters.exhibitionIds || [],
      status: filters.status || '__all__',
      interest: filters.interest || [],
      countryOfInterest: filters.countryOfInterest || [],
      admissionPlan: filters.admissionPlan || [],
    });
    setPage(1);
  };

  const handleSort = (key: string) => {
    setSortConfig((current) =>
      current?.key === key && current.direction === 'asc' ? { key, direction: 'desc' } : { key, direction: 'asc' }
    );
  };

  const handleSelectAll = (checked: boolean) => {
    const items = leadsData?.items ?? [];
    setSelectedIds(checked ? items.map((d) => d.id) : []);
  };

  const handleSelectRow = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleDownloadCSV = () => {
    const items = leadsData?.items ?? [];
    const rows = items.map((row) => [
      row.name,
      row.email,
      row.phone ?? '',
      row.city ?? '',
      STATUS_LABELS[row.status] ?? row.status,
      row.exhibitionTitle ?? '',
      row.interest ?? '',
      row.countryOfInterest ?? '',
      row.admissionPlan ?? '',
    ]);
    const csv = [['Имя', 'Email', 'Телефон', 'Город', 'Статус', 'Выставка', 'Интерес', 'Страна интереса', 'План поступления'], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `leads_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex flex-col h-screen bg-muted/40">
      <Header tabs={profileTabs} profileSectionTab={profileSectionTab} onProfileSectionTab={setProfileSectionTab} />

      {profileSectionTab === 'leads' && (
      <>
        {/* Второй хедер: заголовок и описание слева, кнопки справа */}
        <div className="w-full shrink-0 border-b border-border bg-card px-6 pt-4 pb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Лиды</h2>
            <p className="text-sm text-muted-foreground">
              Контакты участников ваших выставок: зарегистрированные и посетившие. Используйте фильтры и экспорт в CSV.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button variant="outline" size="sm" onClick={handleDownloadCSV} className="gap-2">
              <Download size={16} />
              Скачать CSV
            </Button>
            <Button size="sm" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus size={16} />
              Добавить в список
            </Button>
          </div>
        </div>

        {/* Контент: слева панель фильтров, справа таблица на всю высоту; одинаковая высота */}
        <div className="flex flex-1 min-h-0 overflow-hidden p-4 gap-4">
          <div className="h-full min-h-0 w-72 shrink-0 bg-card rounded-lg shadow-sm overflow-hidden flex flex-col">
            <Sidebar
              filters={filters}
              setFilters={setFilters}
              exhibitorExhibitions={exhibitorExhibitions.map((e) => ({ id: e.id, title: e.title }))}
              onApply={handleApplyFilters}
            />
          </div>

          <div className="flex-1 min-h-0 overflow-auto bg-card rounded-lg shadow-sm">
            {loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">Загрузка…</div>
            ) : (
              <DataTable
                data={sortedData}
                selectedIds={selectedIds}
                onSelectAll={handleSelectAll}
                onSelectRow={handleSelectRow}
                onSort={handleSort}
                sortConfig={sortConfig}
              />
            )}
          </div>
        </div>

        {/* Нижняя панель: пагинация — без границ, цвет как у фона */}
        <div className="w-full shrink-0 bg-muted/40 px-4 py-4 flex items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="w-72 shrink-0" aria-hidden />
          <div className="flex-1 flex items-center justify-between min-w-0">
            <div>
              Элементов на странице: <span className="font-medium text-foreground">{leadsData?.items?.length ?? 0}</span>
            </div>
            <div>
              Страница: <span className="font-medium text-foreground">{leadsData?.page ?? 1} из {leadsData?.totalPages || 1}</span>
              {leadsData != null && <span className="ml-2">(всего {leadsData.total})</span>}
            </div>
          </div>
        </div>
      </>
      )}

      {profileSectionTab === 'exhibitions' && (
        <ExhibitionsTabContent exhibitions={exhibitorExhibitions} />
      )}

      {profileSectionTab === 'university' && (
        <div className="flex-1 min-h-0 overflow-auto flex flex-col p-4 md:p-6">
          {user ? (
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-card rounded-lg border border-border shadow-sm p-6 md:p-8">
                <UniversityProfileSection user={user} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-muted-foreground">Загрузка…</div>
          )}
        </div>
      )}

      {profileSectionTab === 'myExhibitions' && (
        <MyExhibitionsTabContent
          registrations={myExhibitionsRegistrations}
          exhibitions={myExhibitionsExhibitions}
          loading={myExhibitionsLoading}
        />
      )}

      {profileSectionTab === 'profile' && user && (
        <div className="flex-1 min-h-0 overflow-auto flex flex-col p-4 md:p-6">
          <div className="max-w-4xl mx-auto w-full">
            <div className="bg-card rounded-lg border border-border shadow-sm p-6 md:p-8">
              <PersonalInfoSection user={user} />
            </div>
          </div>
        </div>
      )}

      {profileSectionTab === 'mail' && (
        <div className="flex-1 min-h-0 overflow-auto flex flex-col">
          <SecuritySection />
        </div>
      )}
    </div>
  );
}
