import { useState, useMemo, useEffect } from 'react';
import { createFuseInstance, processSearchQuery } from '../utils/searchUtils';

export function useProductSearch(products, categories) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [selectedSubcategory, setSelectedSubcategory] = useState(null);
    const [sortOrder, setSortOrder] = useState(null); // null, 'asc', 'desc'
    const [visibleCount, setVisibleCount] = useState(20);
    const [searchHistory, setSearchHistory] = useState([]);
    const [suggestions, setSuggestions] = useState([]);

    // Load history from localStorage
    useEffect(() => {
        const savedHistory = localStorage.getItem('searchHistory');
        if (savedHistory) {
            setSearchHistory(JSON.parse(savedHistory));
        }
    }, []);

    const addToHistory = (term) => {
        if (!term || !term.trim()) return;
        const cleanTerm = term.trim();
        setSearchHistory(prev => {
            const newHistory = [cleanTerm, ...prev.filter(t => t !== cleanTerm)].slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const removeFromHistory = (term) => {
        setSearchHistory(prev => {
            const newHistory = prev.filter(t => t !== term);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
            return newHistory;
        });
    };

    const clearHistory = () => {
        setSearchHistory([]);
        localStorage.removeItem('searchHistory');
    };
    useEffect(() => {
        setVisibleCount(20);
    }, [selectedCategory, selectedSubcategory, searchQuery]);

    const filteredProducts = useMemo(() => {
        let result = products;

        if (searchQuery) {
            const processedQuery = processSearchQuery(searchQuery);
            const fuse = createFuseInstance(products);
            const searchResults = fuse.search(processedQuery);
            result = searchResults.map(r => r.item);

            // If no results, try to find suggestions
            if (result.length === 0) {
                // Try with a lower threshold for suggestions
                const looseFuse = createFuseInstance(products, { threshold: 0.6 });
                const looseResults = looseFuse.search(processedQuery);
                const suggestedItems = looseResults.slice(0, 3).map(r => r.item);

                // Avoid setting state during render, so we might need a useEffect or just return it
                // But useMemo expects to return filteredProducts. 
                // We can't set state here easily.
                // Let's return suggestions as part of the hook return, but calculated here?
                // No, side effects in useMemo are bad.
                // Let's calculate suggestions separately.
            }
        } else {
            if (selectedCategory) {
                result = result.filter(product => product.category === selectedCategory);
            }
            if (selectedSubcategory) {
                result = result.filter(product => product.subcategory === selectedSubcategory);
            }
        }

        return [...result].sort((a, b) => {
            if (sortOrder === 'asc') return a.price - b.price;
            if (sortOrder === 'desc') return b.price - a.price;
            return 0;
        });
    }, [products, selectedCategory, selectedSubcategory, searchQuery, sortOrder]);

    // Calculate suggestions when filteredProducts is empty
    useEffect(() => {
        if (searchQuery && filteredProducts.length === 0) {
            const processedQuery = processSearchQuery(searchQuery);
            const looseFuse = createFuseInstance(products, { threshold: 0.5 }); // Looser threshold
            const looseResults = looseFuse.search(processedQuery);
            setSuggestions(looseResults.slice(0, 4).map(r => r.item));
        } else {
            setSuggestions([]);
        }
    }, [searchQuery, filteredProducts, products]);

    const filteredCategories = useMemo(() => {
        if (!searchQuery) return categories;
        const processedQuery = processSearchQuery(searchQuery).toLowerCase();
        return categories.filter(cat => cat.name.toLowerCase().includes(processedQuery));
    }, [categories, searchQuery]);

    const visibleProducts = filteredProducts.slice(0, visibleCount);

    const clearFilters = () => {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setSearchQuery('');
        setSortOrder(null);
    };

    return {
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        selectedSubcategory,
        setSelectedSubcategory,
        sortOrder,
        setSortOrder,
        visibleCount,
        setVisibleCount,
        filteredProducts,
        filteredCategories,
        visibleProducts,
        clearFilters,
        searchHistory,
        addToHistory,
        removeFromHistory,
        clearHistory,
        suggestions // Export suggestions
    };
}
