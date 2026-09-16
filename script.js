/**
 * PORTOFOLIO MAYFA HAFIZA - JAVASCRIPT
 * Interaktivitas Navigasi, Audio Synthesizer Melodi, & Contact Form
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Ikon Lucide
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // 2. Navigasi & Mobile Menu Toggle
  const navbar = document.getElementById('navbar');
  const navMenu = document.getElementById('navMenu');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.querySelectorAll('.nav-link');

  // Sticky Navbar saat scroll
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    updateActiveNavLink();
  });

  // Toggle Menu Mobile
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      navToggle.setAttribute('aria-expanded', isOpen);
    });
  }

  // Tutup menu mobile ketika link diklik
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (navMenu.classList.contains('open')) {
        navMenu.classList.remove('open');
      }
    });
  });

  // ScrollSpy untuk menandai link aktif
  const sections = document.querySelectorAll('section[id]');
  function updateActiveNavLink() {
    const scrollY = window.pageYOffset + 140;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop;
      const sectionId = section.getAttribute('id');

      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${sectionId}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  // 3. Mini Audio Player & Web Audio API Melodi Synthesizer
  // Menghasilkan harmoni melodi orisinal secara langsung di browser Mayfa
  const tracks = [
    {
      title: "Melodi Senja di Temanggung",
      subtitle: "Akustik Nada Tenang & Refleksi Diri",
      duration: 32,
      noteSeries: [
        { freq: 261.63, dur: 0.8 }, // C4
        { freq: 329.63, dur: 0.8 }, // E4
        { freq: 392.00, dur: 0.8 }, // G4
        { freq: 523.25, dur: 1.2 }, // C5
        { freq: 440.00, dur: 0.8 }, // A4
        { freq: 392.00, dur: 0.8 }, // G4
        { freq: 349.23, dur: 0.8 }, // F4
        { freq: 329.63, dur: 1.4 }  // E4
      ]
    },
    {
      title: "Langkah di SMKN Tembarak",
      subtitle: "Irama Semangat Belajar & Koding",
      duration: 28,
      noteSeries: [
        { freq: 293.66, dur: 0.4 }, // D4
        { freq: 369.99, dur: 0.4 }, // F#4
        { freq: 440.00, dur: 0.6 }, // A4
        { freq: 554.37, dur: 0.8 }, // C#5
        { freq: 493.88, dur: 0.5 }, // B4
        { freq: 440.00, dur: 0.5 }, // A4
        { freq: 369.99, dur: 0.8 }  // F#4
      ]
    },
    {
      title: "Harmoni Paduan Suara",
      subtitle: "Nostalgia Paduan Suara SMP Temanggung",
      duration: 30,
      noteSeries: [
        { freq: 329.63, dur: 1.2 }, // E4
        { freq: 392.00, dur: 1.2 }, // G4
        { freq: 493.88, dur: 1.4 }, // B4
        { freq: 587.33, dur: 1.6 }, // D5
        { freq: 493.88, dur: 1.2 }, // B4
        { freq: 392.00, dur: 1.8 }  // G4
      ]
    }
  ];

  let currentTrackIndex = 0;
  let isPlaying = false;
  let currentPlaybackSeconds = 0;
  let playbackInterval = null;
  let audioCtx = null;
  let melodyLoopTimeout = null;

  const btnPlayPause = document.getElementById('btnPlayPause');
  const playIcon = document.getElementById('playIcon');
  const btnPrevTrack = document.getElementById('btnPrevTrack');
  const btnNextTrack = document.getElementById('btnNextTrack');
  const vinylDisc = document.getElementById('vinylDisc');
  const visualizer = document.getElementById('visualizer');
  const currentTrackTitle = document.getElementById('currentTrackTitle');
  const currentTimeText = document.getElementById('currentTimeText');
  const totalTimeText = document.getElementById('totalTimeText');
  const timelineProgress = document.getElementById('timelineProgress');
  const timelineBar = document.getElementById('timelineBar');
  const playlistItems = document.querySelectorAll('.playlist-item');

  function initAudioContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  // Membunyikan nada lembut (Warm Bell/Keyboard Synth)
  function playSynthTone(freq, duration) {
    if (!audioCtx || !isPlaying) return;

    try {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const oscHarmonic = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      oscHarmonic.type = 'triangle';
      oscHarmonic.frequency.setValueAtTime(freq * 2, now);

      // Envelope ADSR halus
      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.exponentialRampToValueAtTime(0.16, now + 0.08);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      oscHarmonic.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      osc.start(now);
      oscHarmonic.start(now);
      osc.stop(now + duration + 0.1);
      oscHarmonic.stop(now + duration + 0.1);
    } catch (e) {
      console.warn("Audio synthesis error:", e);
    }
  }

  // Memainkan sekuens melodi lagu
  function startMelodySequence() {
    if (!isPlaying) return;
    const track = tracks[currentTrackIndex];
    let step = 0;

    function playNextNote() {
      if (!isPlaying) return;
      const note = track.noteSeries[step % track.noteSeries.length];
      playSynthTone(note.freq, note.dur);
      step++;
      const nextDelay = (note.dur + 0.15) * 1000;
      melodyLoopTimeout = setTimeout(playNextNote, nextDelay);
    }

    playNextNote();
  }

  function stopMelodySequence() {
    if (melodyLoopTimeout) {
      clearTimeout(melodyLoopTimeout);
      melodyLoopTimeout = null;
    }
  }

  function updateTrackDisplay() {
    const track = tracks[currentTrackIndex];
    if (currentTrackTitle) {
      currentTrackTitle.textContent = track.title;
    }
    if (totalTimeText) {
      totalTimeText.textContent = `0:${track.duration < 10 ? '0' : ''}${track.duration}`;
    }

    playlistItems.forEach((item, index) => {
      if (index === currentTrackIndex) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }

  function togglePlay() {
    if (isPlaying) {
      pauseTrack();
    } else {
      playTrack();
    }
  }

  function playTrack() {
    initAudioContext();
    isPlaying = true;

    // Tampilan UI
    if (vinylDisc) vinylDisc.classList.add('playing');
    if (visualizer) visualizer.classList.add('active');
    if (playIcon) {
      playIcon.setAttribute('data-lucide', 'pause');
      if (window.lucide) window.lucide.createIcons();
    }

    startMelodySequence();

    const track = tracks[currentTrackIndex];
    clearInterval(playbackInterval);
    playbackInterval = setInterval(() => {
      currentPlaybackSeconds++;
      if (currentPlaybackSeconds > track.duration) {
        nextTrack();
        return;
      }
      updateTimelineUI();
    }, 1000);
  }

  function pauseTrack() {
    isPlaying = false;
    stopMelodySequence();
    clearInterval(playbackInterval);

    if (vinylDisc) vinylDisc.classList.remove('playing');
    if (visualizer) visualizer.classList.remove('active');
    if (playIcon) {
      playIcon.setAttribute('data-lucide', 'play');
      if (window.lucide) window.lucide.createIcons();
    }
  }

  function updateTimelineUI() {
    const track = tracks[currentTrackIndex];
    const mins = Math.floor(currentPlaybackSeconds / 60);
    const secs = currentPlaybackSeconds % 60;
    if (currentTimeText) {
      currentTimeText.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    const percent = Math.min(100, (currentPlaybackSeconds / track.duration) * 100);
    if (timelineProgress) {
      timelineProgress.style.width = `${percent}%`;
    }
  }

  function nextTrack() {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
    currentPlaybackSeconds = 0;
    updateTrackDisplay();
    updateTimelineUI();
    if (isPlaying) {
      stopMelodySequence();
      startMelodySequence();
    }
  }

  function prevTrack() {
    currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
    currentPlaybackSeconds = 0;
    updateTrackDisplay();
    updateTimelineUI();
    if (isPlaying) {
      stopMelodySequence();
      startMelodySequence();
    }
  }

  if (btnPlayPause) btnPlayPause.addEventListener('click', togglePlay);
  if (btnNextTrack) btnNextTrack.addEventListener('click', nextTrack);
  if (btnPrevTrack) btnPrevTrack.addEventListener('click', prevTrack);

  // Klik pada playlist item
  playlistItems.forEach(item => {
    item.addEventListener('click', () => {
      const trackIdx = parseInt(item.getAttribute('data-track'), 10);
      if (trackIdx !== currentTrackIndex) {
        currentTrackIndex = trackIdx;
        currentPlaybackSeconds = 0;
        updateTrackDisplay();
        updateTimelineUI();
        if (isPlaying) {
          stopMelodySequence();
          startMelodySequence();
        } else {
          playTrack();
        }
      } else {
        togglePlay();
      }
    });
  });

  // Klik pada timeline bar untuk scrub waktu
  if (timelineBar) {
    timelineBar.addEventListener('click', (e) => {
      const rect = timelineBar.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const width = rect.width;
      const percent = Math.max(0, Math.min(1, clickX / width));
      const track = tracks[currentTrackIndex];
      currentPlaybackSeconds = Math.floor(percent * track.duration);
      updateTimelineUI();
    });
  }

  // 4. Contact Form Submission & Toast
  const contactForm = document.getElementById('contactForm');
  const toastContainer = document.getElementById('toastContainer');

  function showToast(message) {
    if (!toastContainer) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      <span>${message}</span>
    `;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nameInput = document.getElementById('senderName');
      const name = nameInput ? nameInput.value.trim() : 'Teman';
      
      const btnSubmit = document.getElementById('btnSubmitForm');
      if (btnSubmit) {
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `<span class="status-pulse"></span> Mengirim Pesan...`;
      }

      setTimeout(() => {
        showToast(`Terima kasih, ${name}! Pesan Anda telah diterima. Mayfa akan segera merespons.`);
        contactForm.reset();
        if (btnSubmit) {
          btnSubmit.disabled = false;
          btnSubmit.innerHTML = `<i data-lucide="send"></i> Kirim Pesan Sekarang`;
          if (window.lucide) window.lucide.createIcons();
        }
      }, 1000);
    });
  }

  // 5. Intersection Observer untuk Animasi Fade-In Kartu
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.glass-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    revealObserver.observe(el);
  });
});
