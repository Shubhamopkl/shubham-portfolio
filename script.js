/**
 * script.js - Shubham Patel Premium Cinematic Portfolio Website
 * Author: Shubham Patel
 * Date: June 2026
 * Features:
 *  - Custom Preloader with smooth fade
 *  - Web Audio API Epic Ambient Synth Drone & Ta-Dum sound effects
 *  - Dynamic Gold Particle Canvas background
 *  - Netflix-inspired typing role cycler
 *  - Smooth horizontal scrolling carousels with arrow navigation
 *  - Interactive Skill categorization
 *  - Scroll reveal animations using Intersection Observer
 *  - Modal trigger with customizable golden code rain and terminal simulator
 *  - Contact Form handling with interactive success popup
 */

document.addEventListener('DOMContentLoaded', () => {
    // =========================================================================
    // 0. DYNAMIC CONTENT LOADING
    // =========================================================================
    let roles = ["FULL-STACK WEB DEVELOPMENT.", "CREATIVE TECH DIRECTION.", "SCALABLE SYSTEMS DESIGN.", "IMMERSIVE UI ENGINEERING."];
    let projectShowcases = {};

    async function loadDynamicContent() {
        try {
            const res = await fetch('/api/content');
            const data = await res.json();

            // Update Hero
            if (data.hero) {
                document.querySelector('.hero-title').textContent = data.hero.title;
                document.querySelector('.hero-description').textContent = data.hero.description;
                roles = data.hero.typing_roles.split(',');
            }

            // Update About
            if (data.about) {
                document.querySelector('.about-bio-lead').textContent = data.about.bio_lead;
                const bioTexts = document.querySelectorAll('.about-bio-text');
                if (bioTexts[0]) bioTexts[0].textContent = data.about.bio_text1;
                if (bioTexts[1]) bioTexts[1].textContent = data.about.bio_text2;

                const statNumbers = document.querySelectorAll('.stat-number');
                if (statNumbers[0]) statNumbers[0].textContent = data.about.exp_years;
                if (statNumbers[1]) statNumbers[1].textContent = data.about.projects_count;
                if (statNumbers[2]) statNumbers[2].textContent = data.about.match_rating;

                const avatar = document.querySelector('.avatar-img');
                if (avatar) avatar.src = data.about.portrait_url;
            }

            // Update Portfolio
            if (data.portfolio) {
                renderDynamicPortfolio(data.portfolio);
                
                // Update Project Showcases for modal
                projectShowcases.main = {
                    title: data.hero.title,
                    genre: "GENRE: FULL STACK ENGINEERING & IMMERSIVE VISUALS",
                    desc: "Compiling full architectural developer profile...",
                    commands: [
                        { type: "prompt", text: "shubham@patel-pc:~$ ./play_showreel" },
                        { type: "success", text: "Initializing digital showcase environment... [OK]" },
                        { type: "info", text: "Loading UI framework engines... [LOADED]" },
                        { type: "code", text: JSON.stringify({ experience: data.about.exp_years, projects: data.about.projects_count, match: data.about.match_rating }) }
                    ]
                };

                data.portfolio.forEach(item => {
                    const key = item.title.toLowerCase().split(' ')[0];
                    projectShowcases[key] = {
                        title: item.title,
                        genre: `GENRE: ${item.category}`,
                        desc: item.description,
                        commands: JSON.parse(item.commands_json || "[]")
                    };
                });
            }
        } catch (err) {
            console.error('Error loading dynamic content:', err);
        }
    }

    function renderDynamicPortfolio(items) {
        const tracks = {
            "Trending Now": document.getElementById('trending-track'),
            "Award-Winning Masterpieces": document.getElementById('acclaimed-track')
        };

        // Clear existing items but keep some structure if needed, or just replace
        Object.values(tracks).forEach(t => { if(t) t.innerHTML = ''; });

        items.forEach(item => {
            const track = tracks[item.category] || tracks["Trending Now"];
            if (!track) return;

            const card = document.createElement('div');
            card.className = 'project-card';
            const key = item.title.toLowerCase().split(' ')[0];
            
            card.innerHTML = `
                <div class="project-card-image" style="background-image: url('${item.image_url}');">
                    <div class="card-gradient"></div>
                    <div class="card-logo">${item.logo}</div>
                    <div class="hover-details">
                        <div class="hover-icon-row">
                            <button class="hover-circle-btn play-proj-btn" data-project="${key}" title="Play Project Showreel"><i class="fas fa-play"></i></button>
                            <button class="hover-circle-btn git-btn" data-link="${item.github_url}" title="View Source"><i class="fab fa-github"></i></button>
                            <button class="hover-circle-btn link-btn" data-link="${item.live_url}" title="Live Stream Link"><i class="fas fa-external-link-alt"></i></button>
                        </div>
                        <div class="hover-meta">
                            <span class="match-score">${item.match_score} Match</span>
                            <span class="maturity-rating">${item.maturity_rating}</span>
                            <span class="proj-year">${item.year}</span>
                        </div>
                        <h4 class="hover-proj-title">${item.title}</h4>
                        <p class="hover-proj-desc">${item.description}</p>
                        <div class="hover-tags">
                            ${item.tags.split(',').map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                    </div>
                </div>
            `;
            track.appendChild(card);
        });

        // Re-attach listeners for new buttons
        document.querySelectorAll('.play-proj-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const projectKey = btn.getAttribute('data-project');
                openShowcaseModal(projectKey);
            });
        });
        document.querySelectorAll('.git-btn, .link-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const url = btn.getAttribute('data-link');
                if (url) window.open(url, '_blank');
            });
        });
    }

    loadDynamicContent();

    // =========================================================================
    // 1. SYSTEM INITIALIZATION & STATE
    // =========================================================================
    const state = {
        audioContext: null,
        ambientSynth: null,
        ambientGain: null,
        isMuted: true,
        terminalTimer: null
    };

    // Preloader Fade Out
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => {
            if (preloader) {
                preloader.classList.add('fade-out');
                setTimeout(() => {
                    preloader.style.display = 'none';
                }, 600);
            }
        }, 1500);
    });

    // =========================================================================
    // 2. WEB AUDIO API - EPIC CINEMATIC SOUNDS
    // =========================================================================
    const soundToggle = document.getElementById('sound-toggle');
    const soundTooltip = soundToggle ? soundToggle.querySelector('.sound-tooltip') : null;

    function initAudio() {
        if (state.audioContext) return;
        
        // Setup Audio Context
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        state.audioContext = new AudioContext();
    }

    function playCinematicTaDum() {
        initAudio();
        const ctx = state.audioContext;
        if (!ctx) return;

        // Resume if suspended (browser security)
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;
        
        // Double-beat impact (Netflix "Ta-Dum" styled, but customized in Gold)
        // First Beat: Low rumble
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(55, now); // Low A
        osc1.frequency.exponentialRampToValueAtTime(45, now + 0.35);
        
        gain1.gain.setValueAtTime(0.01, now);
        gain1.gain.exponentialRampToValueAtTime(0.4, now + 0.05);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

        // Filter for low rumble
        const filter1 = ctx.createBiquadFilter();
        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(150, now);

        osc1.connect(filter1);
        filter1.connect(gain1);
        gain1.connect(ctx.destination);

        // Second Beat: Heavy metallic synth chord (0.1s later)
        const delay = 0.12;
        const oscs = [110, 165, 220, 330]; // Power chord in A (A2, E3, A3, E4)
        
        oscs.forEach((freq, idx) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
            osc.frequency.setValueAtTime(freq, now + delay);
            osc.frequency.linearRampToValueAtTime(freq * 1.005, now + delay + 0.8); // slight detune
            
            // Sweep filter for metallic cinematic feel
            const sweepFilter = ctx.createBiquadFilter();
            sweepFilter.type = 'lowpass';
            sweepFilter.frequency.setValueAtTime(800, now + delay);
            sweepFilter.frequency.exponentialRampToValueAtTime(200, now + delay + 0.6);
            
            gain.gain.setValueAtTime(0.01, now + delay);
            gain.gain.exponentialRampToValueAtTime(0.25, now + delay + 0.08);
            gain.gain.exponentialRampToValueAtTime(0.01, now + delay + 1.2);
            
            osc.connect(sweepFilter);
            sweepFilter.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start(now + delay);
            osc.stop(now + delay + 1.3);
        });

        osc1.start(now);
        osc1.stop(now + 0.6);
    }

    function startAmbientSynth() {
        initAudio();
        const ctx = state.audioContext;
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const now = ctx.currentTime;
        state.ambientGain = ctx.createGain();
        state.ambientGain.gain.setValueAtTime(0, now);
        state.ambientGain.gain.linearRampToValueAtTime(0.12, now + 2.0); // Fade in smoothly

        // Low frequency carrier (Warm Cinematic Synth Pad)
        const oscLow1 = ctx.createOscillator();
        const oscLow2 = ctx.createOscillator();
        const filter = ctx.createBiquadFilter();

        oscLow1.type = 'triangle';
        oscLow1.frequency.setValueAtTime(65.41, now); // Low C2
        
        oscLow2.type = 'sawtooth';
        oscLow2.frequency.setValueAtTime(98.00, now); // Low G2 (Fifth)

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, now);
        
        // Slowly modulate filter frequency (LFO)
        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(0.15, now); // Slow sweep 0.15Hz
        lfoGain.gain.setValueAtTime(40, now);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        // Connect nodes
        oscLow1.connect(filter);
        oscLow2.connect(filter);
        filter.connect(state.ambientGain);
        state.ambientGain.connect(ctx.destination);

        oscLow1.start(now);
        oscLow2.start(now);
        lfo.start(now);

        state.ambientSynth = {
            osc1: oscLow1,
            osc2: oscLow2,
            lfo: lfo,
            filter: filter
        };
    }

    function stopAmbientSynth() {
        if (!state.ambientSynth || !state.ambientGain || !state.audioContext) return;
        
        const now = state.audioContext.currentTime;
        state.ambientGain.gain.cancelScheduledValues(now);
        state.ambientGain.gain.setValueAtTime(state.ambientGain.gain.value, now);
        state.ambientGain.gain.linearRampToValueAtTime(0, now + 0.5); // Fast fade out

        setTimeout(() => {
            if (state.ambientSynth) {
                try {
                    state.ambientSynth.osc1.stop();
                    state.ambientSynth.osc2.stop();
                    state.ambientSynth.lfo.stop();
                } catch (e) {}
                state.ambientSynth = null;
            }
        }, 600);
    }

    if (soundToggle) {
        soundToggle.addEventListener('click', () => {
            state.isMuted = !state.isMuted;
            
            if (state.isMuted) {
                soundToggle.innerHTML = '<i class="fas fa-volume-mute"></i><span class="sound-tooltip">Enable Epic Ambient Sound</span>';
                stopAmbientSynth();
            } else {
                soundToggle.innerHTML = '<i class="fas fa-volume-up"></i><span class="sound-tooltip">Disable Epic Ambient Sound</span>';
                playCinematicTaDum();
                setTimeout(() => {
                    if (!state.isMuted) startAmbientSynth();
                }, 1000);
            }
        });
    }

    // =========================================================================
    // 3. GOLD PARTICLE BACKGROUND CANVAS (HERO SECTION)
    // =========================================================================
    const canvas = document.getElementById('hero-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationFrameId;

        const resizeCanvas = () => {
            canvas.width = canvas.parentElement.clientWidth;
            canvas.height = canvas.parentElement.clientHeight;
        };

        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        // Particle Class
        class GoldParticle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height + canvas.height; // Start bottom
                this.size = Math.random() * 2.5 + 0.5; // Small dust size
                this.speedY = Math.random() * 0.6 + 0.2; // Slow vertical drift
                this.speedX = Math.sin(Math.random() * Math.PI * 2) * 0.15; // Subtle wave drift
                this.alpha = Math.random() * 0.5 + 0.1; // Soft alpha
                this.fadeSpeed = Math.random() * 0.003 + 0.001;
                this.scale = 1;
            }

            update() {
                this.y -= this.speedY;
                this.x += this.speedX;
                
                // Slowly fluctuate size (glowing effect)
                this.scale += Math.sin(Date.now() * 0.002 + this.size) * 0.01;
                
                // If out of bounds or completely faded, reset to bottom
                if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
                    this.x = Math.random() * canvas.width;
                    this.y = canvas.height + 10;
                    this.size = Math.random() * 2.5 + 0.5;
                    this.alpha = Math.random() * 0.5 + 0.1;
                }
            }

            draw() {
                ctx.save();
                ctx.beginPath();
                ctx.arc(this.x, this.y, Math.abs(this.size * this.scale), 0, Math.PI * 2);
                
                // Premium Cinematic Gold Radial Glow
                const grad = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
                grad.addColorStop(0, `rgba(243, 229, 171, ${this.alpha})`); // light gold highlight
                grad.addColorStop(0.3, `rgba(212, 175, 55, ${this.alpha * 0.6})`); // metallic gold
                grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
                
                ctx.fillStyle = grad;
                ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
                ctx.shadowBlur = this.size * 2;
                ctx.fill();
                ctx.restore();
            }
        }

        // Initialize particles
        const initParticles = () => {
            particles = [];
            const count = Math.min(60, Math.floor(canvas.width / 20));
            for (let i = 0; i < count; i++) {
                const p = new GoldParticle();
                p.y = Math.random() * canvas.height; // distribute throughout viewport initially
                particles.push(p);
            }
        };

        initParticles();

        // Animation Loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            particles.forEach(p => {
                p.update();
                p.draw();
            });

            // Draw subtle glowing light rays from top left
            const rayGrad = ctx.createRadialGradient(0, 0, 100, 0, 0, canvas.width * 0.8);
            rayGrad.addColorStop(0, 'rgba(212, 175, 55, 0.04)');
            rayGrad.addColorStop(0.5, 'rgba(212, 175, 55, 0.01)');
            rayGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = rayGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    // =========================================================================
    // 4. NETFLIX-STYLE TYPING EFFECT (HERO SECTION)
    // =========================================================================
    const typedTextSpan = document.getElementById('typed-text');
    const typingSpeed = 75;
    const erasingSpeed = 40;
    const newRoleDelay = 2000; // Delay between roles
    let roleIdx = 0;
    let charIdx = 0;

    function type() {
        if (!typedTextSpan) return;
        
        if (charIdx < roles[roleIdx].length) {
            typedTextSpan.textContent += roles[roleIdx].charAt(charIdx);
            charIdx++;
            setTimeout(type, typingSpeed);
        } else {
            setTimeout(erase, newRoleDelay);
        }
    }

    function erase() {
        if (!typedTextSpan) return;

        if (charIdx > 0) {
            typedTextSpan.textContent = roles[roleIdx].substring(0, charIdx - 1);
            charIdx--;
            setTimeout(erase, erasingSpeed);
        } else {
            roleIdx++;
            if (roleIdx >= roles.length) roleIdx = 0;
            setTimeout(type, typingSpeed + 300);
        }
    }

    // Start typing cycler
    if (typedTextSpan) {
        setTimeout(type, 1000);
    }

    // =========================================================================
    // 5. NAV SCROLL EFFECT & ACTIVE SECTION MONITOR
    // =========================================================================
    const navbar = document.querySelector('.navbar');
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        // Scroll solid header background transition
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        }

        // Active Section highlighting
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - varNavHeight();
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= sectionTop - 100) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}`) {
                link.classList.add('active');
            }
        });
    });

    function varNavHeight() {
        return navbar ? navbar.clientHeight : 70;
    }

    // Smooth Scroll Links (Desktop + Mobile)
    const setupSmoothScroll = (linksSelector) => {
        document.querySelectorAll(linksSelector).forEach(link => {
            link.addEventListener('click', function(e) {
                const targetId = this.getAttribute('href');
                if (targetId.startsWith('#')) {
                    e.preventDefault();
                    const targetSection = document.querySelector(targetId);
                    if (targetSection) {
                        const topOffset = targetSection.offsetTop - varNavHeight();
                        window.scrollTo({
                            top: topOffset,
                            behavior: 'smooth'
                        });

                        // Close mobile menu if open
                        if (mobileMenu && mobileMenu.classList.contains('active')) {
                            mobileMenu.classList.remove('active');
                        }
                    }
                }
            });
        });
    };

    setupSmoothScroll('.nav-link');
    setupSmoothScroll('.mobile-link');
    setupSmoothScroll('a[href^="#"]');

    // More Info Button -> smooth scroll to about
    const infoBtn = document.getElementById('info-btn');
    if (infoBtn) {
        infoBtn.addEventListener('click', () => {
            const aboutSec = document.getElementById('about');
            if (aboutSec) {
                window.scrollTo({
                    top: aboutSec.offsetTop - varNavHeight(),
                    behavior: 'smooth'
                });
            }
        });
    }

    // =========================================================================
    // 6. PORTFOLIO CAROUSELS NAVIGATION (HORIZONTAL SLIDER)
    // =========================================================================
    const carousels = document.querySelectorAll('.carousel-container');

    carousels.forEach(carousel => {
        const track = carousel.querySelector('.carousel-track');
        const leftArrow = carousel.querySelector('.left-arrow');
        const rightArrow = carousel.querySelector('.right-arrow');
        
        if (!track || !leftArrow || !rightArrow) return;

        // Slide distance based on visible width
        const getSlideAmount = () => track.clientWidth * 0.75;

        rightArrow.addEventListener('click', () => {
            track.scrollBy({ left: getSlideAmount(), behavior: 'smooth' });
        });

        leftArrow.addEventListener('click', () => {
            track.scrollBy({ left: -getSlideAmount(), behavior: 'smooth' });
        });

        // Hide/Show arrows depending on scroll bounds
        const toggleArrows = () => {
            const scrollLeft = track.scrollLeft;
            const maxScrollLeft = track.scrollWidth - track.clientWidth;
            
            // Left arrow visibility
            if (scrollLeft <= 5) {
                leftArrow.style.opacity = '0';
                leftArrow.style.pointerEvents = 'none';
            } else {
                leftArrow.style.opacity = '1';
                leftArrow.style.pointerEvents = 'auto';
            }

            // Right arrow visibility
            if (scrollLeft >= maxScrollLeft - 5) {
                rightArrow.style.opacity = '0';
                rightArrow.style.pointerEvents = 'none';
            } else {
                rightArrow.style.opacity = '1';
                rightArrow.style.pointerEvents = 'auto';
            }
        };

        track.addEventListener('scroll', toggleArrows);
        window.addEventListener('resize', toggleArrows);
        
        // Initial setup trigger
        setTimeout(toggleArrows, 500);
    });

    // =========================================================================
    // 7. INTERACTIVE SKILLS FILTERING (GENRES SELECT)
    // =========================================================================
    const tabButtons = document.querySelectorAll('.tab-btn');
    const skillCards = document.querySelectorAll('.skill-card-cinematic');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all tabs
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterGenre = btn.getAttribute('data-tab');

            skillCards.forEach(card => {
                const cardGenre = card.getAttribute('data-genre');
                
                if (filterGenre === 'all' || cardGenre === filterGenre) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0) scale(1)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px) scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 350);
                }
            });
        });
    });

    // =========================================================================
    // 8. SCROLL REVEAL ANIMATIONS (INTERSECTION OBSERVER)
    // =========================================================================
    const revealElements = document.querySelectorAll('.scroll-reveal');

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                    observer.unobserve(entry.target); // Trigger only once
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(elem => {
            revealObserver.observe(elem);
        });
    } else {
        // Fallback for older browsers
        revealElements.forEach(elem => elem.classList.add('active'));
    }

    // =========================================================================
    // 9. DYNAMIC MODAL COMPILER (PLAY SHOWREEL)
    // =========================================================================
    const playBtn = document.getElementById('play-btn');
    const modal = document.getElementById('showreel-modal');
    const modalClose = document.getElementById('modal-close');
    const modalTitle = document.getElementById('modal-media-title');
    const modalDesc = document.getElementById('modal-media-desc');
    const modalGenre = document.getElementById('modal-media-genre');
    const terminalContent = document.getElementById('terminal-content');
    
    // Project databases for modal overlay injection
    

    // Modal Matrix Code Rain Effect (GOLDEN VERSION)
    const modalCanvas = document.getElementById('modal-matrix-canvas');
    let modalCanvasId;
    
    function runGoldenMatrixCode() {
        if (!modalCanvas) return;
        const mCtx = modalCanvas.getContext('2d');
        
        const resizeModalCanvas = () => {
            modalCanvas.width = modalCanvas.parentElement.clientWidth;
            modalCanvas.height = modalCanvas.parentElement.clientHeight;
        };
        
        resizeModalCanvas();
        
        // Matrix characters (Binary, hex, and cinematic symbols)
        const alphabet = "01010101ABCDEFUX<>[]{}/\\*&^%$#@!+=-";
        const fontSize = 10;
        const columns = modalCanvas.width / fontSize;
        
        const rainDrops = [];
        for (let x = 0; x < columns; x++) {
            rainDrops[x] = Math.random() * -50; // staggered offset starts
        }
        
        const drawMatrix = () => {
            // Semi-transparent background creates a trailing fade effect
            mCtx.fillStyle = 'rgba(10, 10, 10, 0.08)';
            mCtx.fillRect(0, 0, modalCanvas.width, modalCanvas.height);
            
            mCtx.fillStyle = '#D4AF37'; // Golden code
            mCtx.font = fontSize + 'px monospace';
            
            for (let i = 0; i < rainDrops.length; i++) {
                const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
                
                // Highlight lead character with bright golden white
                if (Math.random() > 0.98) {
                    mCtx.fillStyle = '#FFFFFF';
                } else if (Math.random() > 0.9) {
                    mCtx.fillStyle = '#F3E5AB'; // light gold
                } else {
                    mCtx.fillStyle = '#AA7C11'; // dark gold
                }
                
                mCtx.fillText(text, i * fontSize, rainDrops[i] * fontSize);
                
                // Reset drop to top if it exceeds bottom of canvas or randomly
                if (rainDrops[i] * fontSize > modalCanvas.height && Math.random() > 0.975) {
                    rainDrops[i] = 0;
                }
                
                rainDrops[i]++;
            }
        };
        
        const matrixInterval = setInterval(drawMatrix, 35);
        return matrixInterval;
    }

    // Terminal typing visual simulator
    function simulateTerminalLines(commands) {
        if (!terminalContent) return;
        terminalContent.innerHTML = '';
        
        let cmdIdx = 0;
        
        function addNextLine() {
            if (cmdIdx >= commands.length) return;
            
            const cmd = commands[cmdIdx];
            const line = document.createElement('span');
            line.className = `term-line ${cmd.type}`;
            
            if (cmd.type === 'prompt') {
                line.innerHTML = cmd.text;
                terminalContent.appendChild(line);
                terminalContent.appendChild(document.createElement('br'));
                cmdIdx++;
                state.terminalTimer = setTimeout(addNextLine, 500);
            } else {
                // Simulate typing text
                let charPos = 0;
                const typingSpan = document.createElement('span');
                typingSpan.className = `term-line ${cmd.type}`;
                terminalContent.appendChild(typingSpan);
                terminalContent.appendChild(document.createElement('br'));
                
                function typeChar() {
                    if (charPos < cmd.text.length) {
                        typingSpan.textContent += cmd.text.charAt(charPos);
                        charPos++;
                        state.terminalTimer = setTimeout(typeChar, 10);
                    } else {
                        cmdIdx++;
                        state.terminalTimer = setTimeout(addNextLine, 300);
                    }
                    // Keep scroll down
                    terminalContent.scrollTop = terminalContent.scrollHeight;
                }
                typeChar();
            }
        }
        
        addNextLine();
    }

    function openShowcaseModal(projectKey) {
        const showcase = projectShowcases[projectKey] || projectShowcases.main;
        
        // Inject info
        if (modalTitle) modalTitle.textContent = showcase.title;
        if (modalGenre) modalGenre.textContent = showcase.genre;
        if (modalDesc) modalDesc.textContent = showcase.desc;
        
        if (modal) {
            modal.classList.remove('hide');
            document.body.style.overflow = 'hidden'; // Lock scrolling
        }
        
        // Sounds!
        if (!state.isMuted) {
            playCinematicTaDum();
        }
        
        // Run matrix rain and save interval ID to clear on close
        modalCanvasId = runGoldenMatrixCode();
        
        // Run Terminal typing simulator
        simulateTerminalLines(showcase.commands);
    }

    function closeShowcaseModal() {
        if (modal) {
            modal.classList.add('hide');
            document.body.style.overflow = ''; // Unlock scrolling
        }
        
        // Stop code rain and terminal
        if (modalCanvasId) {
            clearInterval(modalCanvasId);
        }
        if (state.terminalTimer) {
            clearTimeout(state.terminalTimer);
        }
        if (terminalContent) {
            terminalContent.innerHTML = '';
        }
    }

    // Modal Listeners
    if (playBtn) {
        playBtn.addEventListener('click', () => openShowcaseModal('main'));
    }

    // Connect portfolio play buttons
    document.querySelectorAll('.play-proj-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Avoid triggering card hover events redundantly
            const projectKey = btn.getAttribute('data-project');
            openShowcaseModal(projectKey);
        });
    });

    if (modalClose) {
        modalClose.addEventListener('click', closeShowcaseModal);
    }

    // Close modal on escape key press
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hide')) {
            closeShowcaseModal();
        }
    });

    // Close modal on dark overlay click
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeShowcaseModal();
            }
        });
    }

    // =========================================================================
    // 10. PREMIUM FLOATING LABEL AND FOCUS HIGHLIGHTS (CONTACT FORM)
    // =========================================================================
    const formInputs = document.querySelectorAll('.form-input');

    formInputs.forEach(input => {
        // Double check validation status to keep labels floating on browser auto-fill
        if (input.value.trim() !== '') {
            input.classList.add('has-content');
        }

        input.addEventListener('blur', () => {
            if (input.value.trim() !== '') {
                input.classList.add('has-content');
            } else {
                input.classList.remove('has-content');
            }
        });
    });

    // =========================================================================
    // 11. CONTACT FORM REAL-TIME TRANSMISSION & POPUP
    // =========================================================================
    const contactForm = document.getElementById('cinematic-contact-form');
    const formFeedback = document.getElementById('form-feedback');
    const closeFeedbackBtn = document.getElementById('close-feedback-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Collect Form Values
            const formData = {
                name: document.getElementById('contact-name').value,
                email: document.getElementById('contact-email').value,
                subject: document.getElementById('contact-subject').value,
                message: document.getElementById('contact-message').value
            };
            
            try {
                const response = await fetch('https://formspree.io/f/mjgqgprw', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    // Trigger transmission "Ta-Dum" chime if not muted
                    if (!state.isMuted) {
                        playCinematicTaDum();
                    }
                    
                    // Open Success Popup
                    if (formFeedback) {
                        formFeedback.classList.remove('hide');
                    }
                }
            } catch (err) {
                console.error('Submission error:', err);
            }
        });
    }

    if (closeFeedbackBtn) {
        closeFeedbackBtn.addEventListener('click', () => {
            if (formFeedback) {
                formFeedback.classList.add('hide');
            }
            // Reset contact form fields
            if (contactForm) {
                contactForm.reset();
                formInputs.forEach(input => input.classList.remove('has-content'));
            }
        });
    }

    // =========================================================================
    // 12. MOBILE HAMBURGER TOGGLE MENU
    // =========================================================================
    const mobileNavToggle = document.querySelector('.mobile-nav-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');

    if (mobileNavToggle && mobileMenu) {
        mobileNavToggle.addEventListener('click', () => {
            mobileMenu.classList.add('active');
        });
    }

    if (mobileMenuClose && mobileMenu) {
        mobileMenuClose.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    }

    // Close mobile menu on clicking backdrop area
    window.addEventListener('click', (e) => {
        if (mobileMenu && mobileMenu.classList.contains('active')) {
            if (e.target !== mobileMenu && !mobileNavToggle.contains(e.target) && !mobileMenu.contains(e.target)) {
                mobileMenu.classList.remove('active');
            }
        }
    });

    // Handle generic links carrying external projects (e.g. GitHub/Live URLs)
    document.querySelectorAll('.git-btn, .link-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation(); // Block opening the modal since client clicked direct link
            const url = btn.getAttribute('data-link');
            if (url) {
                window.open(url, '_blank');
            }
        });
    });
});