import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import helmet from 'helmet';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet({
    contentSecurityPolicy: false, // Disable for development flexibility with CDNs
}));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(session({
    secret: 'portfolio-cinematic-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Multer Storage for Uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Auth Middleware
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// --- AUTH ROUTES ---

app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.get("SELECT * FROM users WHERE username = ?", [username], async (err, user) => {
        if (err) return res.status(500).json({ error: 'Database error' });
        if (!user) return res.status(401).json({ error: 'Invalid credentials' });

        const isValid = await bcrypt.compare(password, user.password);
        if (isValid) {
            req.session.user = { id: user.id, username: user.username };
            res.json({ success: true, user: req.session.user });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    });
});

app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

app.get('/api/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({ authenticated: true, user: req.session.user });
    } else {
        res.json({ authenticated: false });
    }
});

// --- CONTENT ROUTES (Public) ---

app.get('/api/content', (req, res) => {
    const content = {};
    db.get("SELECT * FROM hero", [], (err, hero) => {
        content.hero = hero;
        db.get("SELECT * FROM about", [], (err, about) => {
            content.about = about;
            db.all("SELECT * FROM portfolio_items", [], (err, portfolio) => {
                content.portfolio = portfolio;
                res.json(content);
            });
        });
    });
});

app.post('/api/contact', (req, res) => {
    const { name, email, subject, message } = req.body;
    db.run(`INSERT INTO messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
        [name, email, subject, message],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

// --- ADMIN ROUTES (Protected) ---

app.post('/api/admin/hero', isAuthenticated, (req, res) => {
    const { title, description, typing_roles } = req.body;
    db.run(`UPDATE hero SET title = ?, description = ?, typing_roles = ? WHERE id = 1`,
        [title, description, typing_roles],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.post('/api/admin/about', isAuthenticated, (req, res) => {
    const { bio_lead, bio_text1, bio_text2, exp_years, projects_count, match_rating, portrait_url } = req.body;
    db.run(`UPDATE about SET bio_lead = ?, bio_text1 = ?, bio_text2 = ?, exp_years = ?, projects_count = ?, match_rating = ?, portrait_url = ? WHERE id = 1`,
        [bio_lead, bio_text1, bio_text2, exp_years, projects_count, match_rating, portrait_url],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.get('/api/admin/messages', isAuthenticated, (req, res) => {
    db.all("SELECT * FROM messages ORDER BY created_at DESC", [], (err, messages) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(messages);
    });
});

app.get('/api/admin/portfolio', isAuthenticated, (req, res) => {
    db.all("SELECT * FROM portfolio_items", [], (err, items) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(items);
    });
});

app.post('/api/admin/portfolio', isAuthenticated, (req, res) => {
    const { title, description, category, logo, image_url, year, match_score, maturity_rating, tags, github_url, live_url, commands_json } = req.body;
    db.run(`INSERT INTO portfolio_items (title, description, category, logo, image_url, year, match_score, maturity_rating, tags, github_url, live_url, commands_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description, category, logo, image_url, year, match_score, maturity_rating, tags, github_url, live_url, commands_json],
        function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: this.lastID });
        }
    );
});

app.put('/api/admin/portfolio/:id', isAuthenticated, (req, res) => {
    const { title, description, category, logo, image_url, year, match_score, maturity_rating, tags, github_url, live_url, commands_json } = req.body;
    db.run(`UPDATE portfolio_items SET title = ?, description = ?, category = ?, logo = ?, image_url = ?, year = ?, match_score = ?, maturity_rating = ?, tags = ?, github_url = ?, live_url = ?, commands_json = ? WHERE id = ?`,
        [title, description, category, logo, image_url, year, match_score, maturity_rating, tags, github_url, live_url, commands_json, req.params.id],
        (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        }
    );
});

app.delete('/api/admin/portfolio/:id', isAuthenticated, (req, res) => {
    db.run(`DELETE FROM portfolio_items WHERE id = ?`, [req.params.id], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true });
    });
});

app.post('/api/admin/upload', isAuthenticated, upload.single('image'), (req, res) => {
    if (req.file) {
        res.json({ success: true, url: `/uploads/${req.file.filename}` });
    } else {
        res.status(400).json({ error: 'No file uploaded' });
    }
});

// Serve frontend files explicitly if needed (fallback)
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'admin.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'login.html')));

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
