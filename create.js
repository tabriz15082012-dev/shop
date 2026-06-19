import { addItem, updateItem, getItemById, searchExternalImages } from './api.js';
import { getUser } from './auth.js';

const params = new URLSearchParams(window.location.search);
const editId = params.get('id');
const form = document.getElementById('ad-form');
const titleTag = document.getElementById('page-title');

// Элементы для работы с поиском картинок
const searchBtn = document.getElementById('search-image-btn');
const searchQuery = document.getElementById('search-image-query');
const resultsContainer = document.getElementById('image-search-results');
const hiddenImageUrl = document.getElementById('form-image-url');
const previewContainer = document.getElementById('selected-image-preview');
const previewImg = document.getElementById('preview-img');

// Тот самый последний код — функция, которая принимает данные из api.js и выводит на экран
async function searchImages() {
    const query = searchQuery.value.trim();
    if (!query) return alert('Введите текст для поиска картинок!');

    searchBtn.textContent = 'Ищу...';
    resultsContainer.innerHTML = '';

    // Вызываем функцию запроса из api.js
    const hits = await searchExternalImages(query);

    if (hits.length === 0) {
        resultsContainer.innerHTML = '<p style="font-size: 0.9rem; color: red; grid-column: 1/-1;">Ничего не найдено или произошла ошибка</p>';
        searchBtn.textContent = 'Найти фото';
        return;
    }

    // Рисуем картинки в форме
    hits.forEach(photo => {
        const img = document.createElement('img');
        img.src = photo.previewURL;
        img.style.width = '100%';
        img.style.height = '70px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '6px';
        img.style.cursor = 'pointer';

        img.onclick = () => {
            Array.from(resultsContainer.children).forEach(el => el.style.outline = 'none');
            img.style.outline = '3px solid #84cc16';
            hiddenImageUrl.value = photo.webformatURL; 
            previewImg.src = photo.webformatURL;
            previewContainer.style.display = 'block';
        };

        resultsContainer.appendChild(img);
    });

    searchBtn.textContent = 'Найти фото';
}

// Слушатели кликов
searchBtn.addEventListener('click', searchImages);
searchQuery.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault(); 
        searchImages();
    }
});

// Инициализация при редактировании
async function init() {
    if (editId) {
        const item = await getItemById(editId);
        if (item) {
            if (item.author !== getUser()) {
                alert('Это не ваше объявление!');
                location.href = 'index.html';
                return;
            }
            titleTag.textContent = 'Редактирование';
            document.getElementById('form-title').value = item.title;
            document.getElementById('form-description').value = item.description;
            document.getElementById('form-price').value = item.price;
            document.getElementById('form-contact').value = item.contact || '';
            document.getElementById('form-category').value = item.category;
            
            if (item.image) {
                hiddenImageUrl.value = item.image;
                previewImg.src = item.image;
                previewContainer.style.display = 'block';
            }
        }
    }
}

// Отправка формы на сохранение
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const price = Number(document.getElementById('form-price').value);
    
    if (price > 99999999) {
        alert('Цена слишком большая! Максимум 99,999,999 ₽');
        return;
    }

    const itemData = {
        title: document.getElementById('form-title').value,
        description: document.getElementById('form-description').value,
        price: price,
        contact: document.getElementById('form-contact').value,
        image: hiddenImageUrl.value, 
        category: document.getElementById('form-category').value,
    };

    if (editId) await updateItem(editId, itemData);
    else await addItem(itemData, getUser());

    location.href = 'index.html';
});

init();