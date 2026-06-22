import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'portfolio.db');

const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        initializeDatabase();
    }
});

async function initializeDatabase() {
    db.serialize(async () => {
        // Users table
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT
        )`);

        // Hero table
        db.run(`CREATE TABLE IF NOT EXISTS hero (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            typing_roles TEXT
        )`);

        // About table
        db.run(`CREATE TABLE IF NOT EXISTS about (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            bio_lead TEXT,
            bio_text1 TEXT,
            bio_text2 TEXT,
            exp_years TEXT,
            projects_count TEXT,
            match_rating TEXT,
            portrait_url TEXT
        )`);

        // Portfolio items table
        db.run(`CREATE TABLE IF NOT EXISTS portfolio_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            description TEXT,
            category TEXT,
            logo TEXT,
            image_url TEXT,
            year TEXT,
            match_score TEXT,
            maturity_rating TEXT,
            tags TEXT,
            github_url TEXT,
            live_url TEXT,
            commands_json TEXT
        )`);

        // Messages table
        db.run(`CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT,
            subject TEXT,
            message TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Seed Admin User
        const adminPassword = await bcrypt.hash('admin123', 10);
        db.run(`INSERT OR IGNORE INTO users (username, password) VALUES (?, ?)`, ['admin', adminPassword]);

        // Seed Initial Content if tables are empty
        seedContent();
    });
}

function seedContent() {
    db.get("SELECT COUNT(*) as count FROM hero", [], (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO hero (title, description, typing_roles) VALUES (?, ?, ?)`, [
                "SHUBHAM PATEL",
                "Directing high-performance digital experiences. Specializing in cutting-edge frontend architecture, full-stack pipelines, and visually stunning interactive solutions designed to scale. Rated 'E' for Excellent, now streaming globally.",
                "FULL-STACK WEB DEVELOPMENT.,CREATIVE TECH DIRECTION.,SCALABLE SYSTEMS DESIGN.,IMMERSIVE UI ENGINEERING."
            ]);
        }
    });

    db.get("SELECT COUNT(*) as count FROM about", [], (err, row) => {
        if (row && row.count === 0) {
            db.run(`INSERT INTO about (bio_lead, bio_text1, bio_text2, exp_years, projects_count, match_rating, portrait_url) VALUES (?, ?, ?, ?, ?, ?, ?)`, [
                '"An extraordinary journey of turning complex system logic into elegant digital art."',
                "Shubham Patel is a seasoned Full-Stack Engineer and Creative Technologist who directs and shapes modern web architectures. With a sharp eye for microscopic design details and an uncompromising passion for clean, robust backend pipelines, Shubham designs software that operates at peak performance, ensuring cinematic visual rendering alongside bulletproof business logic.",
                "Whether architecting reactive web systems with React and TypeScript, engineering scalable REST/GraphQL endpoints via Node.js and Python, or fine-tuning cloud deployment frameworks, Shubham handles every project with the rigor of a blockbuster director crafting an Oscar-winning masterpiece.",
                "5+",
                "40+",
                "99%",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
            ]);
        }
    });

    db.get("SELECT COUNT(*) as count FROM portfolio_items", [], (err, row) => {
        if (row && row.count === 0) {
            const items = [
                {
                    title: "Aura Analytics",
                    description: "Cinematic enterprise business intelligence platform rendering complex data visualizations in real-time with sub-millisecond response times.",
                    category: "Trending Now",
                    logo: "AURA",
                    image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=80",
                    year: "2026",
                    match_score: "98%",
                    maturity_rating: "PG-13",
                    tags: "React,FastAPI,D3.js,Redis",
                    github_url: "https://github.com",
                    live_url: "https://google.com",
                    commands_json: JSON.stringify([
                        { type: "prompt", text: "aura@node1:~$ npm run monitor" },
                        { type: "info", text: "Connecting to FastAPI websocket cluster... [CONNECTED]" },
                        { type: "info", text: "Subscribed to global telemetry streams: /analytics/telemetry" },
                        { type: "success", text: "Active buffer pipeline: 48,251 actions/sec [OK]" },
                        { type: "code", text: "[REDIS CACHE] Hit rate: 98.4% | Load: 4% | latency: 0.8ms" },
                        { type: "prompt", text: "aura@node1:~$ exit" }
                    ])
                },
                {
                    title: "Chronos CMS",
                    description: "Highly customizable cinematic Content Management System featuring instantaneous block layouts and high-speed AWS image pipelines.",
                    category: "Trending Now",
                    logo: "CHRONOS",
                    image_url: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=500&q=80",
                    year: "2025",
                    match_score: "95%",
                    maturity_rating: "G",
                    tags: "Next.js,Node.js,AWS S3,MongoDB",
                    github_url: "https://github.com",
                    live_url: "https://google.com",
                    commands_json: JSON.stringify([
                        { type: "prompt", text: "chronos@aws:~$ ./deploy_edge.sh" },
                        { type: "info", text: "Checking Next.js static asset routes..." },
                        { type: "success", text: "Revalidation trigger initialized: CloudFront [INVALIDATED]" },
                        { type: "success", text: "Asset pipeline optimized via AWS S3 Lambda. Compression ratio: 74%" },
                        { type: "code", text: "SSG builds completed in 4.2 seconds. Edge Cache: 100% active" },
                        { type: "prompt", text: "chronos@aws:~$ _" }
                    ])
                },
                {
                    title: "Nebula Engine",
                    description: "3D immersive particle engine utilizing HTML5 Canvas and WebGL to compose cinematic gravity and black hole effects.",
                    category: "Trending Now",
                    logo: "NEBULA",
                    image_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=500&q=80",
                    year: "2025",
                    match_score: "97%",
                    maturity_rating: "PG",
                    tags: "JavaScript,WebGL,Three.js,CSS3",
                    github_url: "https://github.com",
                    live_url: "https://google.com",
                    commands_json: JSON.stringify([
                        { type: "prompt", text: "nebula@webgl:~$ ./compile_shaders" },
                        { type: "info", text: "Initializing WebGL context (OpenGL ES 3.0)..." },
                        { type: "info", text: "Compiling Vertex Shader: gravitational_lens.vert... [OK]" },
                        { type: "info", text: "Compiling Fragment Shader: gold_corona_ring.frag... [OK]" },
                        { type: "success", text: "Instanced particle arrays allocated: 150,000 points" },
                        { type: "code", text: "Active viewport FPS: 60.0 (locked) | GPU usage: 12.5%" }
                    ])
                }
            ];

            const stmt = db.prepare(`INSERT INTO portfolio_items (title, description, category, logo, image_url, year, match_score, maturity_rating, tags, github_url, live_url, commands_json) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
            items.forEach(item => {
                stmt.run(item.title, item.description, item.category, item.logo, item.image_url, item.year, item.match_score, item.maturity_rating, item.tags, item.github_url, item.live_url, item.commands_json);
            });
            stmt.finalize();
        }
    });
}

export default db;
