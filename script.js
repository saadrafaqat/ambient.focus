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

document.getElementById('unlock-btn').onclick = () => {
    const key = prompt("Enter Access Key:");
    if (key === 'PRO_ACCESS_2026') {
        localStorage.setItem('isUnlocked', 'true');
        location.reload();
    } else {
        alert("Invalid Key.");
    }
};

// Audio Engine
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const masterGain = audioCtx.createGain();
masterGain.connect(audioCtx.destination);
document.getElementById('master-volume').oninput = (e) => masterGain.gain.value = e.target.value;

const mixer = document.getElementById('mixer');
sounds.forEach(s => {
    const audio = new Audio(s.url);
    audio.loop = true;
    const source = audioCtx.createMediaElementSource(audio);
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0.5;
    source.connect(gainNode).connect(masterGain);

    const div = document.createElement('div');
    div.className = 'flex flex-col gap-2';
    div.innerHTML = `
        <div class="flex justify-between items-center text-sm">
            <span>${s.name}</span>
            <button class="toggle-btn px-4 py-1 rounded-full border border-white/10 hover:bg-white/10 transition">OFF</button>
        </div>
        <input type="range" min="0" max="1" step="0.01" value="0.5" class="channel-slider w-full h-1 bg-white/10 rounded-full">
    `;

    const btn = div.querySelector('.toggle-btn');
    const slider = div.querySelector('.channel-slider');

    btn.onclick = () => {
        if(audioCtx.state === 'suspended') audioCtx.resume();
        audio.paused ? audio.play() : audio.pause();
        btn.innerText = audio.paused ? 'OFF' : 'ON';
        btn.classList.toggle('active-btn');
    };
    slider.oninput = (e) => gainNode.gain.value = e.target.value;
    mixer.appendChild(div);
});

checkAccess();
