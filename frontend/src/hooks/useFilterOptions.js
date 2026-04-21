import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';

/**
 * Dohvata filter opcije iz baze.
 *
 * @param {string} filterType  — npr. 'fuel_type', 'body_type', 'transmission'
 * @param {string} category    — npr. 'auto', 'motocikl', 'nautika', 'transport' (ili null = sve)
 *
 * Vraća niz objekata: [{ id, value, label, metadata, children: [...] }]
 */
export function useFilterOptions(filterType, category = null) {
    return useQuery({
        queryKey: ['filter-options', filterType, category],
        queryFn: () => axios.get('/filter-options', {
            params: {
                type: filterType,
                category: category || undefined,
            }
        }).then(r => r.data),
        staleTime: 1000 * 60 * 10, // 10 minuta cache
        enabled: !!filterType,
    });
}

/**
 * Dohvata više tipova odjednom za određenu kategoriju.
 * Vraća objekt: { fuel_type: [...], body_type: [...], ... }
 *
 * @param {string[]} types    — lista tipova koje trebamo
 * @param {string}   category — kategorija vozila
 */
export function useMultipleFilterOptions(types, category = null) {
    return useQuery({
        queryKey: ['filter-options-multi', types, category],
        queryFn: async () => {
            const results = await Promise.all(
                types.map(type =>
                    axios.get('/filter-options', {
                        params: { type, category: category || undefined }
                    }).then(r => ({ type, data: r.data }))
                )
            );
            return results.reduce((acc, { type, data }) => {
                acc[type] = data;
                return acc;
            }, {});
        },
        staleTime: 1000 * 60 * 10,
        enabled: types.length > 0,
    });
}

// ─── Kategorija → slug mapa ───────────────────────────────────
// Mapiraj category_id na slug koji koristimo za filter API
export const CATEGORY_SLUGS = {
    1: 'auto',
    2: 'motocikl',
    3: 'nautika',
    4: 'transport',
};

// Tipovi filtera koji se koriste po kategoriji
export const FILTER_TYPES_BY_CATEGORY = {
    auto:      ['fuel_type', 'body_type', 'transmission', 'drive_type', 'condition', 'damage', 'emission_class', 'color_exterior', 'color_interior', 'seat_material'],
    motocikl:  ['fuel_type', 'body_type', 'transmission', 'condition', 'damage', 'color_exterior'],
    nautika:   ['fuel_type', 'body_type', 'condition', 'damage', 'color_exterior'],
    transport: ['fuel_type', 'body_type', 'transmission', 'drive_type', 'condition', 'damage', 'emission_class', 'color_exterior'],
};