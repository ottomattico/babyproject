import fs from "fs";
import path from "path";

export type Product = {
  id: string;
  name: string;
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

export function getProducts(category?: string): Product[] {
  const filePath = path.join(process.cwd(), "data", "products.json");

  if (!fs.existsSync(filePath)) {
    return [];
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const all: Product[] = JSON.parse(raw);

  if (category) {
    return all.filter((p) => p.category === category);
  }
  return all;
}
