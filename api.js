import { CONFIG } from './config.js';

export function generateId() { 
    return Date.now() + '_' + Math.random().toString(36).substr(2, 4); 
}

export async function fetchAll() {
    const data = localStorage.getItem(CONFIG.STORAGE_KEY);
    return data ? JSON.parse(data) : { items: [] };
}

export async function saveAll(data) {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(data));
}

export async function getItemById(id) {
    const data = await fetchAll();
    return data.items.find(item => item.id === id);
}

export async function addItem(itemData, author) {
    const data = await fetchAll();
    const newItem = {
        ...itemData,
        id: generateId(),
        author: author,
        created: new Date().toISOString(),
        views: 0,
        status: 'active',
        reviews: []
    };
    data.items.push(newItem);
    await saveAll(data);
    return newItem;
}

export async function updateItem(id, updates) {
    const data = await fetchAll();
    const index = data.items.findIndex(i => i.id === id);
    if (index !== -1) {
        Object.assign(data.items[index], updates);
        await saveAll(data);
        return true;
    }
    return false;
}

export async function incrementViews(id) {
    const data = await fetchAll();
    const item = data.items.find(i => i.id === id);
    if (item) {
        item.views = (item.views || 0) + 1;
        await saveAll(data);
    }
}

export async function toggleFavorite(id) {
    let favorites = JSON.parse(localStorage.getItem('brikc_favorites') || '[]');
    if (favorites.includes(id)) favorites = favorites.filter(favId => favId !== id);
    else favorites.push(id);
    localStorage.setItem('brikc_favorites', JSON.stringify(favorites));
}

export function getFavorites() { return JSON.parse(localStorage.getItem('brikc_favorites') || '[]'); }

export async function addReview(id, author, text) {
    const data = await fetchAll();
    const item = data.items.find(i => i.id === id);
    if (item) {
        if (!item.reviews) item.reviews = [];
        item.reviews.push({
            author,
            text,
            date: new Date().toISOString()
        });
        await saveAll(data);
    }
}