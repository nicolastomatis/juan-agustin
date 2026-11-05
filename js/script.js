/* -----------------------------------------------------------
 * 1. CONTROL DE ESCENAS Y NAVEGACIÓN TIPO LIBRO DE CUENTOS
 * ----------------------------------------------------------- */
let currentScene = 0;
const totalScenes = 4;

function goToScene(targetIndex) {
    if (targetIndex === currentScene || targetIndex < 0 || targetIndex >= totalScenes) return;

    const currentEl = document.getElementById(`scene-${currentScene}`);
    const targetEl = document.getElementById(`scene-${targetIndex}`);

    // Efecto de sonido sutil de campanita estelar al cambiar de página
    playChimeSound(targetIndex);

    // Disparar una estrella fugaz celebratoria en el canvas
    spawnShootingStar(true);

    // Animación de salida de la escena actual
    currentEl.classList.remove('active');
    if (targetIndex > currentScene) {
        currentEl.classList.add('exit-up');
    }

    // Limpiar clases tras la transición
    setTimeout(() => {
        currentEl.classList.remove('exit-up');
    }, 850);

    // Activar nueva escena
    targetEl.classList.add('active');
    currentScene = targetIndex;

    // Actualizar indicadores superiores
    updateStepDots();
}

function updateStepDots() {
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((dot, idx) => {
        if (idx === currentScene) {
            dot.className = 'step-dot w-6 h-1.5 rounded-full bg-star-gold transition-all duration-500 shadow-[0_0_8px_#f4d06f]';
        } else if (idx < currentScene) {
            dot.className = 'step-dot w-2.5 h-1.5 rounded-full bg-star-gold/60 transition-all duration-500';
        } else {
            dot.className = 'step-dot w-2 h-1.5 rounded-full bg-bone/30 transition-all duration-500';
        }
    });
}

/* -----------------------------------------------------------
 * 2. CIELO ESTRELLADO INTERACTIVO EN CANVAS
 *    - Estrellas que titilan a distintas velocidades
 *    - Partículas de polvo de oro flotando hacia arriba
 *    - Estrellas fugaces ocasionales
 * ----------------------------------------------------------- */
const canvas = document.getElementById('starry-sky');
const ctx = canvas.getContext('2d');
const phoneFrame = document.getElementById('phone-frame');

let width = 0;
let height = 0;
let twinklingStars = [];
let goldenDust = [];
let shootingStars = [];

function resizeCanvas() {
    const rect = phoneFrame.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    initParticles();
}

function initParticles() {
    // 1. Estrellas fijas titilantes
    twinklingStars = [];
    const starCount = 85;
    for (let i = 0; i < starCount; i++) {
        twinklingStars.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 1.6 + 0.4,
            alpha: Math.random(),
            speed: (Math.random() * 0.02 + 0.005) * (Math.random() < 0.5 ? 1 : -1),
            isGold: Math.random() < 0.35
        });
    }

    // 2. Partículas doradas flotando suavemente hacia arriba
    goldenDust = [];
    const dustCount = 24;
    for (let i = 0; i < dustCount; i++) {
        goldenDust.push({
            x: Math.random() * width,
            y: Math.random() * height,
            radius: Math.random() * 2.2 + 0.8,
            vy: -(Math.random() * 0.35 + 0.12),
            vx: (Math.random() - 0.5) * 0.25,
            alpha: Math.random() * 0.65 + 0.2
        });
    }
}

function spawnShootingStar(guaranteed = false) {
    if (!guaranteed && Math.random() > 0.012) return;
    if (shootingStars.length >= 2 && !guaranteed) return;

    shootingStars.push({
        x: Math.random() * (width * 0.8) + width * 0.1,
        y: Math.random() * (height * 0.35) + 20,
        len: Math.random() * 65 + 45,
        speed: Math.random() * 6 + 6,
        angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1),
        alpha: 1
    });
}

function renderSky() {
    ctx.clearRect(0, 0, width, height);

    // Dibujar estrellas titilantes
    for (let s of twinklingStars) {
        s.alpha += s.speed;
        if (s.alpha >= 1) {
            s.alpha = 1;
            s.speed = -s.speed;
        } else if (s.alpha <= 0.15) {
            s.alpha = 0.15;
            s.speed = -s.speed;
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
        ctx.fillStyle = s.isGold
            ? `rgba(244, 208, 111, ${s.alpha})`
            : `rgba(248, 249, 250, ${s.alpha})`;
        ctx.fill();
    }

    // Dibujar partículas doradas ascendentes
    for (let p of goldenDust) {
        p.y += p.vy;
        p.x += p.vx;

        if (p.y < -10) {
            p.y = height + 10;
            p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 2.8);
        grad.addColorStop(0, `rgba(255, 183, 3, ${p.alpha})`);
        grad.addColorStop(1, 'rgba(255, 183, 3, 0)');

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    }

    // Probar aparición de estrella fugaz ocasional
    spawnShootingStar(false);

    // Dibujar estrellas fugaces activas
    for (let i = shootingStars.length - 1; i >= 0; i--) {
        const st = shootingStars[i];
        st.x -= Math.cos(st.angle) * st.speed;
        st.y += Math.sin(st.angle) * st.speed;
        st.alpha -= 0.022;

        if (st.alpha <= 0) {
            shootingStars.splice(i, 1);
            continue;
        }

        const tailX = st.x + Math.cos(st.angle) * st.len;
        const tailY = st.y - Math.sin(st.angle) * st.len;

        const shootGrad = ctx.createLinearGradient(st.x, st.y, tailX, tailY);
        shootGrad.addColorStop(0, `rgba(255, 243, 176, ${st.alpha})`);
        shootGrad.addColorStop(0.4, `rgba(244, 208, 111, ${st.alpha * 0.6})`);
        shootGrad.addColorStop(1, 'rgba(244, 208, 111, 0)');

        ctx.beginPath();
        ctx.moveTo(st.x, st.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = shootGrad;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Cabeza brillante de la estrella fugaz
        ctx.beginPath();
        ctx.arc(st.x, st.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
        ctx.fill();
    }

    requestAnimationFrame(renderSky);
}

/* -----------------------------------------------------------
 * 3. CUENTA REGRESIVA HASTA EL 28 DE NOVIEMBRE A LAS 12:00 HS
 * ----------------------------------------------------------- */
function getTargetBirthdayDate() {
    const now = new Date();
    let year = now.getFullYear();
    // Mes 10 en JavaScript es Noviembre (0-indexado)
    let target = new Date(year, 10, 28, 12, 0, 0);

    // Si ya pasó por más de 24 horas el 28 de noviembre de este año, apunta al próximo
    if (now.getTime() - target.getTime() > 86400000) {
        target = new Date(year + 1, 10, 28, 12, 0, 0);
    }
    return target;
}

const birthdayTarget = getTargetBirthdayDate();

function updateCountdown() {
    const now = new Date().getTime();
    const diff = birthdayTarget.getTime() - now;

    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');
    const statusEl = document.getElementById('cd-status');

    if (diff <= 0) {
        daysEl.textContent = '00';
        hoursEl.textContent = '00';
        minutesEl.textContent = '00';
        secondsEl.textContent = '00';
        statusEl.classList.remove('hidden');
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    daysEl.textContent = String(days).padStart(2, '0');
    hoursEl.textContent = String(hours).padStart(2, '0');
    minutesEl.textContent = String(minutes).padStart(2, '0');
    secondsEl.textContent = String(seconds).padStart(2, '0');
}

/* -----------------------------------------------------------
 * 4. CAJITA DE MÚSICA ESTELAR (SINTETIZADOR WEB AUDIO API)
 *    Sin archivos MP3 externos para máxima velocidad y compatibilidad
 * ----------------------------------------------------------- */
let audioCtx = null;
let isMusicPlaying = false;
let musicInterval = null;
let noteCursor = 0;

// Notas de una melodía de cuna / cajita musical inspirada en estrellas (Frecuencias en Hz)
const lullabyNotes = [
    523.25, 659.25, 783.99, 1046.50, 783.99, 659.25,
    587.33, 698.46, 880.00, 1174.66, 880.00, 698.46,
    523.25, 659.25, 783.99, 1046.50, 987.77, 783.99,
    659.25, 587.33, 523.25, 659.25, 523.25, 392.00
];

function initAudio() {
    if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            audioCtx = new AudioContextClass();
        }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

function playBellNote(freq, duration = 1.4, volume = 0.05) {
    if (!audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(volume, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + duration);
}

function playChimeSound(stepIndex) {
    if (!isMusicPlaying && !audioCtx) return;
    initAudio();
    const chords = [523.25, 659.25, 783.99, 1046.50];
    const baseFreq = chords[stepIndex % chords.length];
    playBellNote(baseFreq, 0.9, 0.04);
    setTimeout(() => playBellNote(baseFreq * 1.5, 1.1, 0.03), 110);
}

function toggleMusic() {
    initAudio();
    const iconEl = document.getElementById('audio-icon');
    const labelEl = document.getElementById('audio-label');

    isMusicPlaying = !isMusicPlaying;

    if (isMusicPlaying) {
        iconEl.textContent = '✨';
        labelEl.textContent = 'Sonando';
        playBellNote(lullabyNotes[noteCursor], 1.5, 0.045);
        musicInterval = setInterval(() => {
            noteCursor = (noteCursor + 1) % lullabyNotes.length;
            playBellNote(lullabyNotes[noteCursor], 1.5, 0.045);
        }, 650);
    } else {
        iconEl.textContent = '🎵';
        labelEl.textContent = 'Melodía';
        if (musicInterval) clearInterval(musicInterval);
    }
}

/* -----------------------------------------------------------
 * 5. INICIALIZACIÓN AL CARGAR LA VENTANA
 * ----------------------------------------------------------- */
window.addEventListener('resize', resizeCanvas);

window.onload = function () {
    resizeCanvas();
    renderSky();
    updateCountdown();
    setInterval(updateCountdown, 1000);
};