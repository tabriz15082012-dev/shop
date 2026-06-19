import { fetchAll, getFavorites } from './api.js';
import { getUser } from './auth.js';

let currentPage = 1;
const itemsPerPage = 10;

function checkAuth() {
    const user = getUser();
    if (!user) {
        const modal = document.getElementById('login-modal');
        modal.classList.add('active');
        document.getElementById('save-username-btn').onclick = () => {
            const input = document.getElementById('username-input').value.trim();
            if (input) {
                localStorage.setItem('marketplace_user', input);
                modal.classList.remove('active');
                // Запускаем рендер ТОЛЬКО после того, как пользователь вошел
                render(); 
            }
        };
    } else {
        // Если пользователь уже авторизован — просто рендерим
        render(); 
    }
}

async function render() {
    const data = await fetchAll();
    const searchInput = document.getElementById('search');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    const category = document.getElementById('category-filter').value;
    const sort = document.getElementById('sort-filter').value;
    const currentUser = getUser() || 'Гость';
    const favorites = getFavorites();
    
    document.getElementById('user-display').textContent = `Пользователь: ${currentUser}`;

    let filtered = data.items.filter(item => {
        const matchSearch = !search || item.title.toLowerCase().includes(search);
        const matchCat = category === 'all' || item.category === category;
        return matchSearch && matchCat && item.status === 'active';
    });

    // Сортировка
    if (sort === 'newest') filtered.sort((a, b) => new Date(b.created) - new Date(a.created));
    else if (sort === 'oldest') filtered.sort((a, b) => new Date(a.created) - new Date(b.created));
    else if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
    else if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);

    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    
    // Защита от вылета за пределы страниц при фильтрации
    if (currentPage > totalPages && totalPages > 0) {
        currentPage = totalPages;
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filtered.slice(startIndex, startIndex + itemsPerPage);

    // Рендер пагинации
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = i === currentPage ? 'btn-primary' : 'btn-secondary';
        btn.onclick = () => { currentPage = i; render(); };
        paginationContainer.appendChild(btn);
    }

    // Рендер карточек
    const list = document.getElementById('ads-list');
    if (paginatedItems.length === 0) {
        list.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted);">Объявлений не найдено</p>';
        return;
    }

    list.innerHTML = paginatedItems.map(item => `
        <div class="card" onclick="location.href='item.html?id=${item.id}'">
            <div style="height: 150px; background: #eee; border-radius: 8px; margin-bottom: 10px; display: flex; align-items: center; justify-content: center; overflow: hidden;">
                ${item.image ? `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">` : '<span style="color: #999;">Нет фото</span>'}
            </div>
            <h3 style="display: flex; justify-content: space-between; gap: 10px;">
                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.title}</span>
                ${favorites.includes(item.id) ? '<span>⭐</span>' : ''}
            </h3>
            <div class="price">${Number(item.price).toLocaleString()} ₽</div>
            <div class="desc" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">${item.description}</div>
            <div class="meta">
                ${item.category} | ${item.author}<br>
                👁️ ${item.views || 0} | ${new Date(item.created).toLocaleDateString()}
            </div>
        </div>
    `).join('');
}

let timer;
document.getElementById('search').addEventListener('input', () => {
    currentPage = 1; // Сбрасываем страницу при поиске
    clearTimeout(timer);
    timer = setTimeout(render, 300);
});

document.getElementById('category-filter').addEventListener('change', () => {
    currentPage = 1; // Сбрасываем страницу при смене категории
    render();
});
document.getElementById('sort-filter').addEventListener('change', render);

// Запуск логики
checkAuth();