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
  image_url: string;
  image_alt: string;
  product_url: string;
  store: string;
  category: string;
  scraped_at: string;
};

export async function getProducts(category?: string): Promise<Product[]> {
  let query = supabase.from("products").select("*").order("store").order("name");
  if (category) {
    query = query.eq("category", category);
  }
  const { data, error } = await query;
  if (error) {
    console.error("Supabase error:", error.message);
    return [];
  }
  return data as Product[];
}
