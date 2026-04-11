'use server'

import { getDb } from '@/db';
import { recipes } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getRecipesByCategory(category: string) {
  const db = await getDb();
  return await db.select().from(recipes).where(eq(recipes.category, category)).all();
}

export async function getRecipeById(id: number) {
  const db = await getDb();
  const result = await db.select().from(recipes).where(eq(recipes.id, id)).get();
  return result || null;
}

export async function addRecipe(data: {
  title: string;
  category: string;
  ingredients: string;
  instructions: string;
  sourceUrl?: string;
}) {
  const db = await getDb();
  const [newRecipe] = await db.insert(recipes).values(data).returning();
  revalidatePath('/');
  return newRecipe;
}
