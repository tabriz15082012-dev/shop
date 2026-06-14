import { addItem, updateItem, getItemById } from './api.js';
import { getUser } from './auth.js';

const params = new URLSearchParams(window.location.search);
const editId = params.get('id');
const form = document.getElementById('ad-form');
const titleTag = document.getElementById('page-title');

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
            document.getElementById('form-image').value = item.image || '';
            document.getElementById('form-category').value = item.category;
        }
    }
}

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
        image: document.getElementById('form-image').value,
        category: document.getElementById('form-category').value,
    };

    if (editId) await updateItem(editId, itemData);
    else await addItem(itemData, getUser());

    location.href = 'index.html';
});

init();