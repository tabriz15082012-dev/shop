export function getUser() {
    return localStorage.getItem('marketplace_user');
}

export function logout() {
    localStorage.removeItem('marketplace_user');
    location.reload();
}