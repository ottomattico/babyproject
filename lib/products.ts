import { supabase } from "./supabase";

export type Product = {
  uid: string;
  id: string;
  name: string;
  brand: string | null;
  price: number | null;
  price_text: string;
  original_price: number | null;
  original_price_text: string | null;
  currency: string;
  card_bank: string | null;
  card_discount_pct: number | null;
  card_price: number | null;
  image_url: string;
  image_alt: string;
  product_url: string;
  store: string;
  category: string;
  subcategory: string | null;
  scraped_at: string;
};

export type Category = {
  id: string;
  label: string;
  parent_id: string | null;
  sort_order: number;
};

export async function getProducts(subcategory: string, allCategories?: Category[]): Promise<Product[]> {
  // Include products from child categories too (e.g. "movilidad-coches" includes "-ts", "-paseo", etc.)
  let slugs = [subcategory];
  if (allCategories) {
    const children = allCategories.filter((c) => c.parent_id === subcategory).map((c) => c.id);
    slugs = [subcategory, ...children];
  }

  const { data, error } = await supabase
    .from("products")
    .select("*")
    .in("subcategory", slugs)
    .order("store")
    .order("name");
  if (error) {
    console.error("Supabase error:", error.message);
    return [];
  }
  return data as Product[];
}

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("sort_order");
  if (error) {
    console.error("Supabase error:", error.message);
    return [];
  }
  return data as Category[];
}

export function buildTree(categories: Category[]): (Category & { children: Category[] })[] {
  const map = new Map(categories.map((c) => [c.id, { ...c, children: [] as Category[] }]));
  const roots: (Category & { children: Category[] })[] = [];
  for (const cat of map.values()) {
    if (!cat.parent_id) {
      roots.push(cat);
    } else {
      map.get(cat.parent_id)?.children.push(cat);
    }
  }
  return roots;
}
