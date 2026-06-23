// Typed, cached product queries (Phase 2).
// Every shape is derived from /src/lib/types.ts — do not invent fields.
// RLS scopes all of these to the signed-in user's store; writes additionally
// require the admin role (enforced server-side by Phase 1 policies).
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { supabase } from '@/lib/supabase';
import type { Tables, TablesInsert } from '@/lib/types';

export type Product = Tables<'products'>;
export type NewProduct = TablesInsert<'products'>;

export const productKeys = {
  all: ['products'] as const,
  active: () => [...productKeys.all, 'active'] as const,
};

// List active products for the caller's store, alphabetised by name.
export function useActiveProducts() {
  return useQuery({
    queryKey: productKeys.active(),
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_active', true)
        .order('name', { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });
}

// Create a product. store_id must be the caller's store (RLS + admin check).
export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: NewProduct): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .insert(input)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// Update a product's price per square foot, bumping updated_at.
export function useUpdateProductPrice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (vars: {
      id: string;
      pricePerSqft: number;
    }): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update({
          price_per_sqft: vars.pricePerSqft,
          updated_at: new Date().toISOString(),
        })
        .eq('id', vars.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}

// Deactivate a product (soft delete) so it drops off active lists. Saved
// invoices keep their snapshotted item data and are unaffected.
export function useDeactivateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string): Promise<Product> => {
      const { data, error } = await supabase
        .from('products')
        .update({
          is_active: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all });
    },
  });
}
