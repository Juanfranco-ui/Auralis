export interface Category {
  id: string;
  label: string;
}

export const CATEGORIES: Category[] = [
  { id: 'all', label: 'Todas las historias' },
  { id: 'spanish', label: 'En Español' },
  { id: 'tales', label: 'Cuentos & Relatos' },
  { id: 'mystery', label: 'Misterio & Terror' },
  { id: 'adventure', label: 'Aventura' },
  { id: 'classics', label: 'Clásicos' },
  { id: 'poetry', label: 'Poesía & Lírica' },
  { id: 'scifi', label: 'Ciencia Ficción' },
];
