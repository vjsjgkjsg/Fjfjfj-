// Образовательный проект — Козыбаев Университет

const $ = sel => document.querySelector(sel);
const $$ = sel => [...document.querySelectorAll(sel)];

// === ЯЗЫК ===
let lang = localStorage.getItem('lang') || 'ru';
function setLang(l) {
  lang = l;
  localStorage.setItem('lang', l);
  document.documentElement.lang = l;
  $$('[data-ru]').forEach(el => {
    const t = el.dataset[l] || el.dataset.ru;
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') el.placeholder = t;
    else el.textContent = t;
  });
  $$('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === l));
}

// === НАВИГАЦИЯ ===
function markNav() {
  const page = location.pathname.split('/').pop() || 'index.html';
  $$('.nav-link').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    a.classList.toggle('active', href === page);
  });
}

// === SCROLL АНИМАЦИЯ ===
function initAnim() {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('fade-in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  $$('.card, .stat').forEach(el => io.observe(el));
}

// === СЧЁТЧИК ===
function animCounters() {
  $$('.stat-num').forEach(el => {
    const target = parseInt(el.dataset.count || el.textContent);
    const suffix = el.dataset.suffix || '';
    let cur = 0;
    const step = Math.ceil(target / 40);
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur + suffix;
      if (cur >= target) clearInterval(timer);
    }, 40);
  });
}

// === УВЕДОМЛЕНИЯ ===
function toast(msg, type = 'success') {
  const t = document.createElement('div');
  t.style.cssText = `position:fixed;top:100px;right:24px;z-index:9999;background:${type==='success'?'linear-gradient(135deg,#00C853,#00E676)':'linear-gradient(135deg,#FF6B35,#FF8A65)'};color:#fff;padding:18px 28px;border-radius:16px;font-weight:700;font-size:.95rem;box-shadow:0 12px 36px rgba(0,0,0,.3);animation:slideIn .4s cubic-bezier(.4,0,.2,1);display:flex;align-items:center;gap:12px;max-width:380px`;
  t.innerHTML = `<span style="font-size:1.4rem">${type==='success'?'✅':'❌'}</span>${msg}`;
  
  if (!$('#toast-style')) {
    const s = document.createElement('style');
    s.id = 'toast-style';
    s.textContent = '@keyframes slideIn{from{transform:translateX(150%);opacity:0}to{transform:translateX(0);opacity:1}}@keyframes slideOut{from{transform:translateX(0);opacity:1}to{transform:translateX(150%);opacity:0}}';
    document.head.appendChild(s);
  }
  
  document.body.appendChild(t);
  setTimeout(() => {
    t.style.animation = 'slideOut .4s cubic-bezier(.4,0,.2,1) forwards';
    setTimeout(() => t.remove(), 420);
  }, 3500);
}

// === PDF СКАЧИВАНИЕ ===
function initDownload() {
  $$('[data-download]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = $(btn.dataset.download);
      const title = btn.dataset.title || document.title;
      if (!target) { toast('Файл не найден', 'error'); return; }
      
      toast(`Готовим PDF: ${title}`);
      
      setTimeout(() => {
        const w = window.open('', '_blank');
        w.document.write(`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title><style>body{font-family:'Segoe UI',sans-serif;font-size:12pt;margin:40px;color:#1A1A2E;line-height:1.8}h1,h2{color:#1565C0;border-bottom:3px solid #1565C0;padding-bottom:10px;margin:28px 0 18px}h1{font-size:20pt}h2{font-size:16pt}h3{color:#00ACC1;font-size:13pt;margin:20px 0 12px}p,li{margin-bottom:10px}.highlight{background:#E3F2FD;border-left:5px solid #1565C0;padding:16px 20px;border-radius:0 12px 12px 0;margin:18px 0}ul,ol{padding-left:24px}@page{margin:28mm 20mm;size:A4}@media print{body{margin:0}}</style></head><body><h1>📚 ${title}</h1><p><strong>Университет имени М. Козыбаева</strong> | Образовательный проект | 2025</p><hr style="border:none;border-top:2px solid #E5E7EB;margin:20px 0">${target.innerHTML}</body></html>`);
        w.document.close();
        setTimeout(() => w.print(), 500);
      }, 700);
    });
  });
}

// === ФОРМА КОНТАКТОВ ===
function initForm() {
  const form = $('#contactForm');
  if (!form) return;
  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('[type=submit]');
    btn.textContent = '⏳ Отправка...';
    btn.disabled = true;
    setTimeout(() => {
      toast('Сообщение отправлено! Мы свяжемся с вами скоро.');
      form.reset();
      btn.textContent = '📤 Отправить сообщение';
      btn.disabled = false;
    }, 1600);
  });
}

// === ВИКТОРИНА (для страницы игр) ===
const quiz = [
  {q:"🏙️ В каком году основан Петропавловск?",opts:["1752","1800","1900","1650"],ans:0},
  {q:"🌊 Какая река протекает через Петропавловск?",opts:["Иртыш","Ишим","Урал","Тобол"],ans:1},
  {q:"🇰🇿 В какой области находится Петропавловск?",opts:["Карагандинской","Акмолинской","Северо-Казахстанской","Костанайской"],ans:2},
  {q:"🎭 Как называется главный праздник весны у казахов?",opts:["Курбан-айт","Наурыз","Масленица","День города"],ans:1},
  {q:"❄️ Какая погода бывает в Петропавловске зимой?",opts:["Тёплая и влажная","Снежная с морозами до -40°C","Дождливая","Туманная"],ans:1}
];
let qIdx=0,score=0,answered=false;

function startQuiz() {
  qIdx=0; score=0; answered=false;
  $('#quizStart').style.display='none';
  $('#quizOpts').style.display='grid';
  renderQ();
}
function renderQ() {
  if (qIdx >= quiz.length) {
    $('#quizQ').textContent = 'Игра окончена! 🎉';
    $('#quizOpts').style.display = 'none';
    $('#quizNext').style.display = 'none';
    $('#quizResult').style.display = 'block';
    $('#quizResult').textContent = `Твой результат: ${score} из ${quiz.length}! ${score>=4?'Отлично! 🌟':score>=2?'Хорошо! 👍':'Попробуй ещё раз! 💪'}`;
    $('#quizScore').textContent = `Финал: ${score}/${quiz.length}`;
    $('#quizBar').style.width = '100%';
    $('#quizStart').style.display = 'block';
    $('#quizStart').textContent = '🔄 Играть снова';
    return;
  }
  const q = quiz[qIdx];
  $('#quizQ').textContent = q.q;
  $('#quizScore').textContent = `Вопрос ${qIdx+1} из ${quiz.length} · Очки: ${score}`;
  $('#quizBar').style.width = (qIdx/quiz.length*100)+'%';
  $('#quizResult').style.display = 'none';
  $('#quizNext').style.display = 'none';
  answered = false;
  const opts = $('#quizOpts');
  opts.innerHTML = '';
  q.opts.forEach((o,i) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.textContent = o;
    btn.onclick = () => answer(i);
    opts.appendChild(btn);
  });
}
function answer(i) {
  if (answered) return;
  answered = true;
  const q = quiz[qIdx];
  $$('.quiz-opt').forEach((b,idx) => {
    if (idx === q.ans) b.classList.add('correct');
    else if (idx === i) b.classList.add('wrong');
    b.disabled = true;
  });
  if (i === q.ans) {
    score++;
    $('#quizResult').textContent = '✅ Правильно!';
    $('#quizResult').style.color = '#00C853';
  } else {
    $('#quizResult').textContent = `❌ Неверно. Правильно: ${q.opts[q.ans]}`;
    $('#quizResult').style.color = '#FF6B35';
  }
  $('#quizResult').style.display = 'block';
  $('#quizNext').style.display = 'block';
  $('#quizScore').textContent = `Вопрос ${qIdx+1} из ${quiz.length} · Очки: ${score}`;
}
function nextQ() { qIdx++; renderQ(); }

// === ФИЛЬТРЫ ===
function initFilters() {
  $$('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const bar = btn.closest('.filter-bar');
      bar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const filter = btn.dataset.filter;
      const target = btn.dataset.target || '.filterable';
      const container = $(target);
      if (!container) return;
      
      container.querySelectorAll('[data-cat]').forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.display = show ? '' : 'none';
        if (show) card.classList.add('fade-in');
      });
    });
  });
}

// === ИНИТ ===
document.addEventListener('DOMContentLoaded', () => {
  setLang(lang);
  markNav();
  initAnim();
  initDownload();
  initForm();
  initFilters();
  
  const statsEl = $('.stats');
  if (statsEl) {
    new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) animCounters();
    }, { threshold: 0.5 }).observe(statsEl);
  }
  
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => setLang(btn.dataset.lang));
  });
});

// Экспорт для inline использования
window.toast = toast;
window.startQuiz = startQuiz;
window.nextQ = nextQ;
