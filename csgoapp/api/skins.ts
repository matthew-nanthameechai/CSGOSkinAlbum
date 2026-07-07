export interface Weapon {
  id: string;
  weapon_id: number;
  name: string;
}

export interface Category {
  id: string;
  name: string;
}

export interface Pattern {
  id: string;
  name: string;
}

export interface Rarity {
  id: string;
  name: string;
  color: string;
}

export interface Wear {
  id: string;
  name: string;
}

export interface Collection {
  id: string;
  name: string;
  image: string;
}

export interface Crate {
  id: string;
  name: string;
  image: string;
}

export interface Team {
  id: string;
  name: string;
}

export interface CSSkin {
  id: string;
  name: string;
  description: string;
  weapon: Weapon;
  category: Category;
  pattern: Pattern;
  min_float: number;
  max_float: number;
  rarity: Rarity;
  stattrak: boolean;
  souvenir: boolean;
  paint_index: string;
  wears: Wear[];
  collections: Collection[];
  crates: Crate[];
  team: Team;
  legacy_model: boolean;
  image: string;
}