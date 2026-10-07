// ============================================================
//  ModHub — Основной JS (SPA, localStorage, имитация данных)
// ============================================================

// ---- ДАННЫЕ ----
const GAMES = [
    { id: 'minecraft', name: 'Minecraft', icon: '⛏️' },
    { id: 'skyrim', name: 'Skyrim', icon: '🐉' },
    { id: 'gta5', name: 'GTA V', icon: '🚗' },
    { id: 'cyberpunk', name: 'Cyberpunk 2077', icon: '🤖' },
    { id: 'stardew', name: 'Stardew Valley', icon: '🌾' },
    { id: 'terraria', name: 'Terraria', icon: '⚔️' },
];

// Начальные проекты (демо)
const INITIAL_PROJECTS = [
    {
        id: '1',
        title: 'OptiFine HD',
        game: 'minecraft',
        category: 'Мод',
        description: 'Улучшает производительность и графику Minecraft с поддержкой шейдеров.',
        image: 'https://via.placeholder.com/400x200/1c2333/58a6ff?text=OptiFine',
        downloadUrl: 'https://optifine.net',
        author: 'sp614x',
        authorId: 'user1',
        createdAt: '2026-01-15',
        downloads: 12543,
        likes: 892,
        views: 34200,
    },
    {
        id: '2',
        title: 'Beyond Skyrim - Bruma',
        game: 'skyrim',
        category: 'Карта',
        description: 'Огромное дополнение, добавляющее провинцию Брума с десятками квестов.',
        image: 'https://via.placeholder.com/400x200/1c2333/a371f7?text=Bruma',
        downloadUrl: 'https://nexusmods.com/skyrim/mods/84946',
        author: 'Beyond Team',
        authorId: 'user2',
        createdAt: '2026-02-01',
        downloads: 8760,
        likes: 654,
        views: 21300,
    },
    {
        id: '3',
        title: 'NaturalVision Evolved',
        game: 'gta5',
        category: 'Мод',
        description: 'Графический мод для GTA V с фотореалистичным освещением и текстурами.',
        image: 'https://via.placeholder.com/400x200/1c2333/3fb950?text=NaturalVision',
        downloadUrl: 'https://gta5-mods.com/misc/naturalvision-evolved',
        author: 'Razed',
        authorId: 'user3',
        createdAt: '2026-02-14',
        downloads: 15420,
        likes: 1240,
        views: 54100,
    },
    {
        id: '4',
        title: 'Cyber Engine Tweaks',
        game: 'cyberpunk',
        category: 'Мод',
        description: 'Набор инструментов для настройки производительности и конфигурации CP2077.',
        image: 'https://via.placeholder.com/400x200/1c2333/f85149?text=CET',
        downloadUrl: 'https://cyberpunkmods.com/cyber-engine-tweaks',
        author: 'yamashi',
        authorId: 'user4',
        createdAt: '2026-01-28',
        downloads: 9830,
        likes: 720,
        views: 27600,
    },
];

// ---- STATE ----
let state = {
    projects: [],
    users: [],
    currentUser: null,
    currentPage: 'home',
    currentProjectId: null,
};

// ---- DOM REFS ----
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ---- UTILITY ----
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
}

function getGameName(id) {
    const g = GAMES.find(g => g.id === id);
    return g ? g.name : id;
}

function getGameIcon(id) {
    const g = GAMES.find(g => g.id === id);
    return g ? g.icon : '🎮';
}

function showToast(message, type = 'info') {
    const toast = $('#toast');
    if (!toast) return;
    toast.textContent = message;
    toast.className = 'toast ' + type;
    toast.classList.add('show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ---- LOCALSTORAGE ----
function saveState() {
    try {
        localStorage.setItem('modhub_state', JSON.stringify({
            projects: state.projects,
            users: state.users,
            currentUser: state.currentUser,
        }));
    } catch (_) {}
}

function loadState() {
    try {
        const raw = localStorage.getItem('modhub_state');
        if (raw) {
            const data = JSON.parse(raw);
            state.projects = data.projects || [];
            state.users = data.users || [];
            state.currentUser = data.currentUser || null;
        }
    } catch (_) {}

    // Если данных нет — загружаем начальные
    if (state.projects.length === 0) {
        state.projects = [...INITIAL_PROJECTS];
    }
    if (state.users.length === 0) {
        state.users = [
            { id: 'user1', username: 'sp614x', email: 'sp@optifine.net', bio: 'Моддер' },
            { id: 'user2', username: 'Beyond Team', email: 'beyond@skyrim.com', bio: 'Команда разработчиков' },
            { id: 'user3', username: 'Razed', email: 'razed@gta.com', bio: 'Графический дизайнер' },
            { id: 'user4', username: 'yamashi', email: 'yamashi@cp.com', bio: 'Программист' },
        ];
        saveState();
    }
}

// ---- NAVIGATION ----
function navigateTo(page, data) {
    // Скрываем все страницы
    $$('.page').forEach(el => el.classList.remove('active'));

    const target = $(`#page-${page}`);
    if (target) {
        target.classList.add('active');
    } else {
        const home = $('#page-home');
        if (home) home.classList.add('active');
        page = 'home';
    }

    state.currentPage = page;

    // Обновляем навигацию
    $$('.nav__link').forEach(link => link.classList.remove('active'));
    const navLink = $(`.nav__link[data-page="${page}"]`);
    if (navLink) navLink.classList.add('active');

    // Вызываем рендеринг страниц
    if (page === 'home') renderHome();
    if (page === 'projects') renderProjects();
    if (page === 'project' && data) {
        state.currentProjectId = data;
        renderProjectDetail(data);
    }
    if (page === 'settings') renderSettings();
    if (page === 'auth') renderAuth();
    if (page === 'create') renderCreate();

    // Прокрутка вверх
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Обновляем UI авторизации
    updateAuthUI();
}

// ---- RENDER: HOME ----
function renderHome() {
    const grid = $('#featuredProjects');
    if (!grid) return;

    const sorted = [...state.projects].sort((a, b) => b.downloads - a.downloads);
    const featured = sorted.slice(0, 4);
    grid.innerHTML = featured.map(p => renderProjectCard(p)).join('');

    // Клики по карточкам
    grid.querySelectorAll('.project-card').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.id;
            if (id) navigateTo('project', id);
        });
    });

    // Игры
    const gamesGrid = $('#gamesGrid');
    if (gamesGrid) {
        gamesGrid.innerHTML = GAMES.map(g => `
            <div class="game-card" data-game="${g.id}">
                <span class="game-card__icon">${g.icon}</span>
                <div class="game-card__name">${g.name}</div>
            </div>
        `).join('');

        gamesGrid.querySelectorAll('.game-card').forEach(el => {
            el.addEventListener('click', () => {
                const gameId = el.dataset.game;
                navigateTo('projects');
                const filter = $('#filterGame');
                if (filter) filter.value = gameId;
                renderProjects();
            });
        });
    }
}

// ---- RENDER: PROJECT CARD ----
function renderProjectCard(p) {
    const isOwner = state.currentUser && p.authorId === state.currentUser.id;
    return `
        <div class="project-card" data-id="${p.id}">
            <img class="project-card__image" src="${p.image || 'https://via.placeholder.com/400x200/1c2333/8b949e?text=No+Image'}" alt="${p.title}" loading="lazy" />
            <div class="project-card__body">
                <div class="project-card__title">${p.title}</div>
                <div class="project-card__game">${getGameIcon(p.game)} ${getGameName(p.game)}</div>
                <div class="project-card__desc">${p.description}</div>
                <div class="project-card__meta">
                    <span class="project-card__author">👤 ${p.author}</span>
                    <div class="project-card__stats">
                        <span>⬇️ ${p.downloads}</span>
                        <span>❤️ ${p.likes}</span>
                        ${isOwner ? `<span style="color:var(--accent)">✏️</span>` : ''}
                    </div>
                </div>
            </div>
        </div>
    `;
}

// ---- RENDER: PROJECTS ----
function renderProjects() {
    const grid = $('#allProjectsGrid');
    if (!grid) return;

    const search = $('#searchProjects') ? $('#searchProjects').value.toLowerCase().trim() : '';
    const gameFilter = $('#filterGame') ? $('#filterGame').value : 'all';

    // Заполняем фильтр игр
    const filterSelect = $('#filterGame');
    if (filterSelect) {
        const currentVal = filterSelect.value;
        filterSelect.innerHTML = '<option value="all">Все игры</option>' +
            GAMES.map(g => `<option value="${g.id}">${g.icon} ${g.name}</option>`).join('');
        filterSelect.value = currentVal;
    }

    let filtered = [...state.projects];

    if (search) {
        filtered = filtered.filter(p =>
            p.title.toLowerCase().includes(search) ||
            p.description.toLowerCase().includes(search) ||
            p.author.toLowerCase().includes(search)
        );
    }
    if (gameFilter && gameFilter !== 'all') {
        filtered = filtered.filter(p => p.game === gameFilter);
    }

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="color:var(--text-muted);grid-column:1/-1;text-align:center;padding:40px 0;">Проектов не найдено 😔</p>`;
        return;
    }

    grid.innerHTML = filtered.map(p => renderProjectCard(p)).join('');

    grid.querySelectorAll('.project-card').forEach(el => {
        el.addEventListener('click', () => {
            const id = el.dataset.id;
            if (id) navigateTo('project', id);
        });
    });
}

// ---- RENDER: PROJECT DETAIL ----
function renderProjectDetail(projectId) {
    const container = $('#projectDetail');
    if (!container) return;

    const p = state.projects.find(pr => pr.id === projectId);

    if (!p) {
        container.innerHTML = `
            <p style="color:var(--text-muted);">Проект не найден</p>
            <a href="#" class="back-link" data-page="projects">← Назад к проектам</a>
        `;
        const back = container.querySelector('.back-link');
        if (back) {
            back.addEventListener('click', (e) => {
                e.preventDefault();
                navigateTo('projects');
            });
        }
        return;
    }

    const isOwner = state.currentUser && p.authorId === state.currentUser.id;

    container.innerHTML = `
        <a href="#" class="back-link" data-page="projects">← Назад к проектам</a>
        <img class="project-detail__image" src="${p.image || 'https://via.placeholder.com/800x400/1c2333/8b949e?text=No+Image'}" alt="${p.title}" />
        <div class="project-detail__header">
            <h1 class="project-detail__title">${p.title}</h1>
            <div class="project-detail__game">${getGameIcon(p.game)} ${getGameName(p.game)} · ${p.category}</div>
        </div>
        <div class="project-detail__meta">
            <span><strong>Автор:</strong> ${p.author}</span>
            <span><strong>Опубликован:</strong> ${formatDate(p.createdAt)}</span>
            <span><strong>⬇️ ${p.downloads}</strong> загрузок</span>
            <span><strong>❤️ ${p.likes}</strong> лайков</span>
            <span><strong>👁️ ${p.views}</strong> просмотров</span>
        </div>
        <div class="project-detail__body">${p.description}</div>
        <div class="project-detail__actions">
            ${p.downloadUrl ? `<a href="${p.downloadUrl}" target="_blank" class="btn btn--primary">📥 Скачать</a>` : ''}
            <button class="btn btn--outline" id="likeProjectBtn">❤️ Лайкнуть</button>
            ${isOwner ? `<button class="btn btn--danger" id="deleteProjectBtn">🗑️ Удалить</button>` : ''}
        </div>
    `;

    // Обработчики
    const back = container.querySelector('.back-link');
    if (back) {
        back.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo('projects');
        });
    }

    const likeBtn = container.querySelector('#likeProjectBtn');
    if (likeBtn) {
        likeBtn.addEventListener('click', () => {
            if (!state.currentUser) {
                showToast('Войдите, чтобы ставить лайки', 'error');
                return;
            }
            p.likes += 1;
            saveState();
            renderProjectDetail(projectId);
            showToast('❤️ Лайк поставлен!', 'success');
        });
    }

    const deleteBtn = container.querySelector('#deleteProjectBtn');
    if (deleteBtn) {
        deleteBtn.addEventListener('click', () => {
            if (confirm(`Удалить проект "${p.title}"?`)) {
                state.projects = state.projects.filter(pr => pr.id !== projectId);
                saveState();
                showToast('Проект удалён', 'info');
                navigateTo('projects');
            }
        });
    }
}

// ---- RENDER: SETTINGS ----
function renderSettings() {
    const form = $('#settingsForm');
    if (!form) return;
    if (state.currentUser) {
        $('#settingsUsername').value = state.currentUser.username || '';
        $('#settingsEmail').value = state.currentUser.email || '';
        $('#settingsBio').value = state.currentUser.bio || '';
    } else {
        form.querySelectorAll('input, textarea').forEach(el => el.value = '');
    }
}

// ---- RENDER: AUTH ----
function renderAuth() {
    // Переключатель табов
    $$('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            $$('.auth-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.authTab;
            $$('.auth-panel').forEach(p => p.classList.remove('active'));
            const panel = $(`#auth-${target}`);
            if (panel) panel.classList.add('active');
        });
    });
}

// ---- RENDER: CREATE ----
function renderCreate() {
    const gameSelect = $('#projectGame');
    if (gameSelect) {
        gameSelect.innerHTML = '<option value="">Выберите игру</option>' +
            GAMES.map(g => `<option value="${g.id}">${g.icon} ${g.name}</option>`).join('');
    }
}

// ---- AUTH UI ----
function updateAuthUI() {
    const authBtns = $('#authButtons');
    const userMenu = $('#userMenu');
    const nameDisplay = $('#userNameDisplay');

    if (!authBtns || !userMenu) return;

    if (state.currentUser) {
        authBtns.style.display = 'none';
        userMenu.style.display = 'flex';
        if (nameDisplay) nameDisplay.textContent = `👤 ${state.currentUser.username}`;
    } else {
        authBtns.style.display = 'flex';
        userMenu.style.display = 'none';
    }
}

// ---- ИНИЦИАЛИЗАЦИЯ СОБЫТИЙ ----
function initEvents() {
    // Навигация по ссылкам с data-page
    document.addEventListener('click', (e) => {
        const link = e.target.closest('[data-page]');
        if (link) {
            e.preventDefault();
            const page = link.dataset.page;
            if (page === 'auth') {
                navigateTo('auth');
            } else if (page === 'project') {
                const id = link.dataset.id || state.currentProjectId;
                if (id) navigateTo('project', id);
            } else {
                navigateTo(page);
            }
        }
    });

    // Логин
    const loginForm = $('#loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = $('#loginEmail').value.trim();
            const password = $('#loginPassword').value.trim();

            const user = state.users.find(u => u.email === email && password.length > 0);
            if (user) {
                state.currentUser = user;
                saveState();
                showToast(`Добро пожаловать, ${user.username}!`, 'success');
                navigateTo('home');
                updateAuthUI();
            } else {
                showToast('Неверный email или пароль', 'error');
            }
        });
    }

    // Регистрация
    const registerForm = $('#registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = $('#regUsername').value.trim();
            const email = $('#regEmail').value.trim();
            const password = $('#regPassword').value.trim();

            if (!username || !email || !password) {
                showToast('Заполните все поля', 'error');
                return;
            }

            if (state.users.find(u => u.email === email)) {
                showToast('Пользователь с таким email уже существует', 'error');
                return;
            }
            if (state.users.find(u => u.username === username)) {
                showToast('Пользователь с таким именем уже существует', 'error');
                return;
            }

            const newUser = {
                id: generateId(),
                username,
                email,
                bio: '',
            };
            state.users.push(newUser);
            state.currentUser = newUser;
            saveState();
            showToast(`Регистрация успешна! Добро пожаловать, ${username}`, 'success');
            navigateTo('home');
            updateAuthUI();
        });
    }

    // Выход
    const logoutBtn = $('#logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            state.currentUser = null;
            saveState();
            updateAuthUI();
            showToast('Вы вышли из аккаунта', 'info');
            navigateTo('home');
        });
    }

    // Социальные кнопки
    $$('.social-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const provider = btn.dataset.provider;
            let demoUser = state.users.find(u => u.email === `demo@${provider}.com`);
            if (!demoUser) {
                demoUser = {
                    id: generateId(),
                    username: `user_${provider}`,
                    email: `demo@${provider}.com`,
                    bio: `Зарегистрирован через ${provider}`,
                };
                state.users.push(demoUser);
            }
            state.currentUser = demoUser;
            saveState();
            updateAuthUI();
            showToast(`Вход через ${provider} выполнен (демо)`, 'success');
            navigateTo('home');
        });
    });

    // Создание проекта
    const createForm = $('#createProjectForm');
    if (createForm) {
        createForm.addEventListener('submit', (e) => {
            e.preventDefault();

            if (!state.currentUser) {
                showToast('Войдите, чтобы создать проект', 'error');
                return;
            }

            const title = $('#projectTitle').value.trim();
            const game = $('#projectGame').value;
            const category = $('#projectCategory').value;
            const description = $('#projectDescription').value.trim();
            const downloadUrl = $('#projectDownloadUrl').value.trim();
            const image = $('#projectImage').value.trim();

            if (!title || !game || !description) {
                showToast('Заполните все обязательные поля', 'error');
                return;
            }

            const newProject = {
                id: generateId(),
                title,
                game,
                category,
                description,
                downloadUrl: downloadUrl || '',
                image: image || '',
                author: state.currentUser.username,
                authorId: state.currentUser.id,
                createdAt: new Date().toISOString().split('T')[0],
                downloads: 0,
                likes: 0,
                views: 0,
            };

            state.projects.unshift(newProject);
            saveState();
            showToast('✅ Проект успешно опубликован!', 'success');
            createForm.reset();
            navigateTo('projects');
        });
    }

    // Настройки
    const settingsForm = $('#settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (!state.currentUser) {
                showToast('Войдите, чтобы изменить настройки', 'error');
                return;
            }
            state.currentUser.username = $('#settingsUsername').value.trim() || state.currentUser.username;
            state.currentUser.email = $('#settingsEmail').value.trim() || state.currentUser.email;
            state.currentUser.bio = $('#settingsBio').value.trim() || '';
            saveState();
            updateAuthUI();
            showToast('Настройки сохранены', 'success');
        });
    }

    // Кнопки на главной
    const heroCreate = $('#heroCreateBtn');
    if (heroCreate) {
        heroCreate.addEventListener('click', () => {
            if (!state.currentUser) {
                showToast('Войдите, чтобы создать проект', 'error');
                navigateTo('auth');
                return;
            }
            navigateTo('create');
        });
    }

    const heroBrowse = $('#heroBrowseBtn');
    if (heroBrowse) {
        heroBrowse.addEventListener('click', () => navigateTo('projects'));
    }

    const createBtn = $('#createProjectBtn');
    if (createBtn) {
        createBtn.addEventListener('click', () => {
            if (!state.currentUser) {
                showToast('Войдите, чтобы создать проект', 'error');
                navigateTo('auth');
                return;
            }
            navigateTo('create');
        });
    }

    const loginBtn = $('#loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', () => navigateTo('auth'));
    }

    const registerBtn = $('#registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', () => {
            navigateTo('auth');
            setTimeout(() => {
                const regTab = document.querySelector('.auth-tab[data-auth-tab="register"]');
                if (regTab) regTab.click();
            }, 100);
        });
    }

    // Поиск и фильтр
    const searchInput = $('#searchProjects');
    if (searchInput) {
        let searchTimer;
        searchInput.addEventListener('input', () => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => renderProjects(), 300);
        });
    }

    const filterGame = $('#filterGame');
    if (filterGame) {
        filterGame.addEventListener('change', renderProjects);
    }
}

// ---- ИНИЦИАЛИЗАЦИЯ ----
function init() {
    loadState();
    initEvents();
    navigateTo('home');
    updateAuthUI();
}

// Запускаем после загрузки DOM
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
