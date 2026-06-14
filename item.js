import { getItemById, fetchAll, saveAll, incrementViews, toggleFavorite, getFavorites, addReview } from './api.js';
import { getUser } from './auth.js';

const params = new URLSearchParams(window.location.search);
const id = params.get('id');

async function init() {
    if (!id) return location.href = 'index.html';

    // Увеличиваем счетчик просмотров
    await incrementViews(id);
    
    const item = await getItemById(id);
    if (!item) {
        alert('Объявление не найдено');
        return location.href = 'index.html';
    }

    // Функция для отрисовки отзывов
    const renderReviews = (reviews) => {
        const list = document.getElementById('reviews-list');
        if (!reviews || reviews.length === 0) {
            list.innerHTML = '<p style="color: #999;">Отзывов пока нет.</p>';
            return;
        }
        list.innerHTML = reviews.map(r => `
            <div style="background: #f9fafb; padding: 12px; border-radius: 8px; margin-bottom: 10px;">
                <div style="font-weight: 600; font-size: 0.9rem;">${r.author} <span style="font-weight: 400; color: #999; margin-left: 8px;">${new Date(r.date).toLocaleDateString()}</span></div>
                <div style="margin-top: 4px;">${r.text}</div>
            </div>
        `).join('');
    };

    // Наполняем данными
    document.getElementById('view-title').textContent = item.title;
    document.getElementById('view-price').textContent = `${item.price.toLocaleString()} ₽`;
    document.getElementById('view-desc').textContent = item.description;
    document.getElementById('view-contact').innerHTML = `<strong>Контактные данные:</strong><br>${item.contact || 'Автор не оставил контактов'}`;
    document.getElementById('view-meta').innerHTML = `
        Категория: ${item.category}<br>
        Автор: ${item.author}<br>
        Просмотры: ${item.views || 0}<br>
        Дата: ${new Date(item.created).toLocaleString()}
    `;

    if (item.image) {
        document.getElementById('view-image').innerHTML = `<img src="${item.image}" style="width: 100%; height: 100%; object-fit: cover;">`;
    }

    renderReviews(item.reviews);

    // Обработка добавления отзыва
    document.getElementById('submit-review').onclick = async () => {
        const text = document.getElementById('review-text').value.trim();
        if (!text) return;
        
        await addReview(id, getUser() || 'Гость', text);
        document.getElementById('review-text').value = '';
        const updatedItem = await getItemById(id);
        renderReviews(updatedItem.reviews);
    };

    // Логика избранного
    const favBtn = document.getElementById('fav-btn');
    const updateFavBtn = () => {
        favBtn.textContent = getFavorites().includes(id) ? '⭐ В избранном' : '☆ В избранное';
    };
    updateFavBtn();
    favBtn.onclick = async () => { await toggleFavorite(id); updateFavBtn(); };

    // Кнопка купить
    const buyModal = document.getElementById('buy-modal');
    document.getElementById('buy-btn').onclick = () => {
        document.getElementById('buy-modal-text').innerHTML = 
            `Вы собираетесь приобрести этот товар.<br><br><strong>Свяжитесь с продавцом:</strong><br>${item.contact}`;
        buyModal.classList.add('active');
    };
    
    document.getElementById('cancel-buy-btn').onclick = () => buyModal.classList.remove('active');
    document.getElementById('confirm-buy-btn').onclick = () => buyModal.classList.remove('active');

    // Кнопки автора
    if (item.author === getUser()) {
        document.getElementById('author-actions').style.display = 'flex';
        document.getElementById('edit-btn').onclick = () => location.href = `create.html?id=${id}`;
        
        const confirmModal = document.getElementById('confirm-modal');
        document.getElementById('delete-btn').onclick = () => confirmModal.classList.add('active');
        document.getElementById('cancel-delete-btn').onclick = () => confirmModal.classList.remove('active');

        document.getElementById('confirm-delete-btn').onclick = async () => {
            const data = await fetchAll();
            data.items = data.items.filter(i => i.id !== id);
            await saveAll(data);
            location.href = 'index.html';
        };
    }
}

init();