const sounds = [
    { name: 'Rain', url: 'https://actions.google.com/sounds/v1/weather/rain_heavy_wind.ogg' },
    { name: 'Library', url: 'https://actions.google.com/sounds/v1/ambiences/coffee_shop.ogg' },
    { name: 'Lo-Fi', url: 'https://actions.google.com/sounds/v1/ambiences/interior_room.ogg' },
    { name: 'White Noise', url: 'https://actions.google.com/sounds/v1/noise/white_noise.ogg' }
];

// Trial Gate Logic
function checkAccess() {
    const isUnlocked = localStorage.getItem('isUnlocked');
    if (isUnlocked === 'true') return;

    const start = localStorage.getItem('trialStartDate');
    if (!start) {
        localStorage.setItem('trialStartDate', Date.now());
    } else {
        const diff = (Date.now() - parseInt(start)) / (1000 * 60 * 60);
        if (diff > 48) {
            document.getElementById('lock-screen').classList.remove('hidden');
        }
    }
}

// Access Key Handler
const unlockBtn = document.getElementById('unlock-btn');
if (unlockBtn) {
    unlockBtn.onclick = () => {
        const key = prompt("Enter Access Key:");
        if (key === 'PRO_ACCESS_2026') {
            localStorage.setItem('isUnlocked', 'true');
            location.reload();
        } else {
            alert("Invalid Key.");
        }
    };
}

// Audio Engine
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);

// Master Volume Slider
const masterSlider = document.getElementById('master-volume');
if (masterSlider) {
    masterSlider.oninput = (e) => {
        masterGain.gain.value = e.target.value;
    };
}

const mixer = document.getElementById('mixer');
sounds.forEach(s => {
    const audio = new Audio(s.url);
    audio.loop = true;
    audio.crossOrigin = "anonymous";
    
    // Create nodes
    const source = audioCtx.createMediaElementSource(audio);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;
    
    source.connect(gainNode).connect(masterGain);

    const div = document.createElement('div');
    div.className = 'flex flex-col gap-2';
    div.innerHTML = `
        <div class="flex justify-between items-center text-sm">
            <span class="font-medium text-slate-300">${s.name}</span>
            <button class="toggle-btn px-5 py-1 rounded-full border border-white/10 hover:bg-white/10 transition text-xs tracking-wider">OFF</button>
        </div>
        <input type="range" min="0" max="1" step="0.01" value="0.5" class="channel-slider w-full h-1.5 bg-white/20 rounded-full appearance-none">
    `;

    const btn = div.querySelector('.toggle-btn');
    const slider = div.querySelector('.channel-slider');

    btn.onclick = async () => {
        // Essential: Resume AudioContext on user interaction
        if (audioCtx.state === 'suspended') {
            await audioCtx.resume();
        }

        if (audio.paused) {
            audio.play().catch(e => console.error("Playback Error:", e));
            btn.innerText = 'ON';
            btn.classList.add('active-btn');
        } else {
            audio.pause();
            btn.innerText = 'OFF';
            btn.classList.remove('active-btn');
        }
    };

    slider.oninput = (e) => {
        gainNode.gain.value = e.target.value;
    };

    mixer.appendChild(div);
});

// Run Trial Gate Check
checkAccess();
