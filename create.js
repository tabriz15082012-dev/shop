import { addItem, updateItem, getItemById } from './api.js';
import { getUser } from './auth.js';

const params = new URLSearchParams(window.location.search);
const editId = params.get('id');
const form = document.getElementById('ad-form');
const titleTag = document.getElementById('page-title');

// Функция для перевода картинки в Base64
function readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

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

    // Обработка картинки
    const imageFile = document.getElementById('form-image-file').files[0];
    let imageData = "";
    
    if (imageFile) {
        imageData = await readFileAsBase64(imageFile);
    } else if (editId) {
        const oldItem = await getItemById(editId);
        imageData = oldItem.image;
    }

    const itemData = {
        title: document.getElementById('form-title').value,
        description: document.getElementById('form-description').value,
        price: price,
        contact: document.getElementById('form-contact').value,
        image: imageData,
        category: document.getElementById('form-category').value,
    };

    if (editId) await updateItem(editId, itemData);
    else await addItem(itemData, getUser());

    location.href = 'index.html';
});

init();