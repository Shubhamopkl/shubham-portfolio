document.addEventListener('DOMContentLoaded', () => {
    // --- AUTH CHECK ---
    fetch('/api/auth/status')
        .then(res => res.json())
        .then(data => {
            if (!data.authenticated) {
                window.location.href = '/login';
            }
        });

    // --- TAB SWITCHING ---
    const navLinks = document.querySelectorAll('nav a');
    const sections = document.querySelectorAll('main section');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const target = link.getAttribute('data-section');
            
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(target).classList.add('active');
            
            loadData(target);
        });
    });

    // --- DATA LOADING ---
    async function loadData(sectionId) {
        const response = await fetch('/api/content');
        const data = await response.json();

        if (sectionId === 'hero-section') {
            document.getElementById('hero-title').value = data.hero.title;
            document.getElementById('hero-desc').value = data.hero.description;
            document.getElementById('hero-roles').value = data.hero.typing_roles;
        } else if (sectionId === 'about-section') {
            document.getElementById('about-lead').value = data.about.bio_lead;
            document.getElementById('about-text1').value = data.about.bio_text1;
            document.getElementById('about-text2').value = data.about.bio_text2;
            document.getElementById('about-exp').value = data.about.exp_years;
            document.getElementById('about-projects').value = data.about.projects_count;
            document.getElementById('about-match').value = data.about.match_rating;
            document.getElementById('about-portrait').value = data.about.portrait_url;
        } else if (sectionId === 'portfolio-section') {
            renderPortfolio(data.portfolio);
        } else if (sectionId === 'messages-section') {
            loadMessages();
        }
    }

    // Initial load
    loadData('hero-section');

    // --- HERO FORM ---
    document.getElementById('hero-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById('hero-title').value,
            description: document.getElementById('hero-desc').value,
            typing_roles: document.getElementById('hero-roles').value
        };

        const res = await fetch('/api/admin/hero', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) alert('Hero section updated!');
    });

    // --- ABOUT FORM ---
    document.getElementById('about-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const payload = {
            bio_lead: document.getElementById('about-lead').value,
            bio_text1: document.getElementById('about-text1').value,
            bio_text2: document.getElementById('about-text2').value,
            exp_years: document.getElementById('about-exp').value,
            projects_count: document.getElementById('about-projects').value,
            match_rating: document.getElementById('about-match').value,
            portrait_url: document.getElementById('about-portrait').value
        };

        const res = await fetch('/api/admin/about', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (res.ok) alert('About section updated!');
    });

    // --- PORTFOLIO MANAGEMENT ---
    function renderPortfolio(items) {
        const list = document.getElementById('portfolio-list');
        list.innerHTML = '';
        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'item-card';
            card.innerHTML = `
                <div class="item-img" style="background-image: url('${item.image_url}')"></div>
                <div class="item-info">
                    <h3>${item.title}</h3>
                    <p style="font-size: 12px; color: #888;">${item.category}</p>
                </div>
                <div class="item-actions">
                    <button class="btn btn-primary btn-sm edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i> Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i> Delete</button>
                </div>
            `;
            list.appendChild(card);
        });

        // Add Listeners
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', () => editItem(btn.dataset.id));
        });
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', () => deleteItem(btn.dataset.id));
        });
    }

    const modal = document.getElementById('portfolio-modal');
    const closeBtn = document.querySelector('.close-modal');

    document.getElementById('add-item-btn').addEventListener('click', () => {
        document.getElementById('portfolio-form').reset();
        document.getElementById('item-id').value = '';
        document.getElementById('modal-title').innerText = 'Add Portfolio Item';
        modal.style.display = 'flex';
    });

    closeBtn.onclick = () => modal.style.display = 'none';
    window.onclick = (e) => { if (e.target == modal) modal.style.display = 'none'; };

    async function editItem(id) {
        const res = await fetch('/api/admin/portfolio');
        const items = await res.json();
        const item = items.find(i => i.id == id);

        document.getElementById('item-id').value = item.id;
        document.getElementById('item-title').value = item.title;
        document.getElementById('item-desc').value = item.description;
        document.getElementById('item-category').value = item.category;
        document.getElementById('item-logo').value = item.logo;
        document.getElementById('item-img-url').value = item.image_url;
        document.getElementById('item-year').value = item.year;
        document.getElementById('item-match').value = item.match_score;
        document.getElementById('item-maturity').value = item.maturity_rating;
        document.getElementById('item-tags').value = item.tags;
        document.getElementById('item-github').value = item.github_url;
        document.getElementById('item-live').value = item.live_url;
        document.getElementById('item-commands').value = item.commands_json;

        document.getElementById('modal-title').innerText = 'Edit Portfolio Item';
        modal.style.display = 'flex';
    }

    async function deleteItem(id) {
        if (confirm('Are you sure you want to delete this item?')) {
            await fetch(`/api/admin/portfolio/${id}`, { method: 'DELETE' });
            loadData('portfolio-section');
        }
    }

    document.getElementById('portfolio-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const id = document.getElementById('item-id').value;
        const payload = {
            title: document.getElementById('item-title').value,
            description: document.getElementById('item-desc').value,
            category: document.getElementById('item-category').value,
            logo: document.getElementById('item-logo').value,
            image_url: document.getElementById('item-img-url').value,
            year: document.getElementById('item-year').value,
            match_score: document.getElementById('item-match').value,
            maturity_rating: document.getElementById('item-maturity').value,
            tags: document.getElementById('item-tags').value,
            github_url: document.getElementById('item-github').value,
            live_url: document.getElementById('item-live').value,
            commands_json: document.getElementById('item-commands').value
        };

        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/portfolio/${id}` : '/api/admin/portfolio';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            modal.style.display = 'none';
            loadData('portfolio-section');
        }
    });

    // --- MESSAGES ---
    async function loadMessages() {
        const res = await fetch('/api/admin/messages');
        const messages = await res.json();
        const list = document.getElementById('messages-list');
        list.innerHTML = '';
        messages.forEach(msg => {
            const date = new Date(msg.created_at).toLocaleString();
            const row = document.createElement('tr');
            row.className = 'msg-row';
            row.innerHTML = `
                <td style="white-space: nowrap;">${date}</td>
                <td>${msg.name}</td>
                <td><a href="mailto:${msg.email}" style="color: var(--primary);">${msg.email}</a></td>
                <td>${msg.subject}</td>
                <td style="font-size: 13px;">${msg.message}</td>
            `;
            list.appendChild(row);
        });
    }

    // --- IMAGE UPLOADS ---
    document.querySelectorAll('.image-upload').forEach(input => {
        input.addEventListener('change', async () => {
            if (input.files.length > 0) {
                const formData = new FormData();
                formData.append('image', input.files[0]);
                
                const res = await fetch('/api/admin/upload', {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    const targetId = input.getAttribute('data-target');
                    document.getElementById(targetId).value = data.url;
                    alert('Image uploaded successfully!');
                }
            }
        });
    });

    // --- LOGOUT ---
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await fetch('/api/logout', { method: 'POST' });
        window.location.href = '/login';
    });
});
