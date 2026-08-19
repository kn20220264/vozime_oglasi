import { useQuery } from '@tanstack/react-query';
import axios from '../api/axios';

/**
 * Dohvata marke filtrirane po kategoriji vozila.
 *
 * Marke u bazi pripadaju kategoriji (category_id), pa bez filtera
 * dropdown "Marka" prikazuje i moto/nautika/transport marke (i duplikate
 * poput BMW-a koji postoji i kao auto i kao moto marka).
 *
 * @param {string} categorySlug — slug iz vehicle_categories, npr. 'automobili'
 * @returns {Array} niz marki [{ id, name, slug, logo, country, category_id }]
 */
export function useMakesByCategory(categorySlug) {
    const { data: categoriesData } = useQuery({
        queryKey: ['categories'],
        queryFn: () => axios.get('/categories').then(r => r.data.data ?? r.data),
        staleTime: Infinity,
    });
    const categories = Array.isArray(categoriesData) ? categoriesData : [];
    const categoryId = categories.find(c => c.slug === categorySlug)?.id;

    const { data: makesData } = useQuery({
        queryKey: ['makes', categoryId],
        queryFn: () =>
            axios.get('/makes', { params: { category_id: categoryId } })
                .then(r => r.data.data ?? r.data),
        enabled: !!categoryId,
        staleTime: Infinity,
    });

    return Array.isArray(makesData) ? makesData : [];
}
