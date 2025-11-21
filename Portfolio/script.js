// ---------- Small utilities ----------
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// Update year
document.getElementById('year').textContent = new Date().getFullYear();

// ---------- Loader (animated) ----------
const loader = document.getElementById('siteLoader');
function hideLoader() {
  if (!loader) return;
  loader.style.opacity = '0';
  loader.style.transform = 'translateY(-8px)';
  setTimeout(() => { loader.remove(); }, 450);
}
window.addEventListener('load', () => {
  // short delay so user sees the animation (feels polished)
  setTimeout(hideLoader, 300);
});

// ---------- Scroll Progress ----------
const progressBar = document.getElementById('progressBar');
function updateProgress(){
  const scrolled = window.scrollY;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? (scrolled / docHeight) * 100 : 0;
  if (progressBar) progressBar.style.width = pct + '%';
}
window.addEventListener('scroll', updateProgress);
window.addEventListener('resize', updateProgress);
updateProgress();

// ---------- Theme Toggle (persists) ----------
const themeToggle = document.getElementById('themeToggle');
(function initTheme(){
  const saved = localStorage.getItem('site-theme'); // "dark" or "light"
  const body = document.body;
  if (saved === 'light') body.setAttribute('data-theme', 'light');
  else body.setAttribute('data-theme', 'dark');
  if (themeToggle) {
    themeToggle.textContent = body.getAttribute('data-theme') === 'light' ? '☀' : '☾';
    themeToggle.addEventListener('click', () => {
      const isLight = document.body.getAttribute('data-theme') === 'light';
      document.body.setAttribute('data-theme', isLight ? 'dark' : 'light');
      themeToggle.textContent = isLight ? '☾' : '☀';
      localStorage.setItem('site-theme', isLight ? 'dark' : 'light');
    });
  }
})();

// ---------- Mobile menu toggle ----------
const mobileBtn = document.getElementById('mobileMenuBtn');
const navLinks = document.querySelector('.nav-links');
if (mobileBtn) {
  mobileBtn.addEventListener('click', () => {
    const visible = getComputedStyle(navLinks).display === 'flex';
    navLinks.style.display = visible ? 'none' : 'flex';
    navLinks.style.flexDirection = 'column';
  });
}

// ---------- Active nav section using IntersectionObserver ----------
const sections = $$('section, header#home');
const navItems = $$('.nav-link');

const ioOptions = { root: null, rootMargin: '0px 0px -40% 0px', threshold: 0 };
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const id = entry.target.id;
    const link = document.querySelector(`.nav-link[data-target="${id}"]`);
    if (entry.isIntersecting) {
      navItems.forEach(n => n.classList.remove('active'));
      if (link) link.classList.add('active');
    }
  });
}, ioOptions);

sections.forEach(s => observer.observe(s));

// Smooth nav click behavior (also closes mobile nav)
navItems.forEach(a => {
  a.addEventListener('click', (e) => {
    // default anchor behavior will scroll; ensure mobile menu hides
    if (navLinks && window.innerWidth <= 980) navLinks.style.display = 'none';
  });
});

// ---------- Project modal logic ----------
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalTech = document.getElementById('modalTech');
const modalLive = document.getElementById('modalLive');
const modalCode = document.getElementById('modalCode');
const modalClose = document.getElementById('modalClose');
const modalBackdrop = document.getElementById('modalBackdrop');

function openModal(data){
  modal.setAttribute('aria-hidden','false');
  modalTitle.textContent = data.title || 'Untitled Project';
  modalDesc.textContent = data.desc || '';
  modalTech.textContent = data.tech || 'HTML, CSS, JS';
  if (modalLive) modalLive.href = data.live || '#';
  if (modalCode) modalCode.href = data.code || '#';
  document.body.style.overflow = 'hidden';
}
function closeModal(){
  modal.setAttribute('aria-hidden','true');
  document.body.style.overflow = '';
}

$$('.open-modal').forEach(btn => {
  btn.addEventListener('click', (e) => {
    const article = e.target.closest('.project-card');
    const raw = article.getAttribute('data-project');
    let data = {};
    try { data = JSON.parse(raw); } catch(err){ data = { title: article.querySelector('h3')?.textContent || 'Project' }; }
    openModal(data);
  });
});
if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });

// ---------- Resume -> PDF (jsPDF) ----------
(async function setupPdf(){
  const { jsPDF } = window.jspdf || {};
  const btn = document.getElementById('downloadPdfBtn');
  if (!btn || !jsPDF) return;
  btn.addEventListener('click', () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const resumeBox = document.getElementById('resumeContent');
    const lines = resumeBox.innerText.split('\n').map(l => l.trim()).filter(Boolean);
    const left = 40, startY = 60, lineHeight = 16;
    doc.setFontSize(12);
    doc.setTextColor(20,20,20);
    doc.setFillColor(250,250,250);
    // Title
    doc.setFontSize(18); doc.text("Résumé — SAWAN YADAV", left, startY);
    doc.setFontSize(11);
    let y = startY + 28;
    lines.forEach((ln) => {
      const split = doc.splitTextToSize(ln, 520);
      doc.text(split, left, y);
      y += lineHeight * split.length;
      if (y > 750) { doc.addPage(); y = 60; }
    });
    doc.save("Resume-SAWAN-YADAV.pdf");
  });
})();

// ---------- EmailJS Contact (client-side) ----------
(function initEmailJS(){
  // Replace with your EmailJS values when ready
  const YOUR_SERVICE_ID = "YOUR_SERVICE_ID";
  const YOUR_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
  const YOUR_USER_ID = "YOUR_USER_ID";

  if (window.emailjs) {
    try { emailjs.init(YOUR_USER_ID); } catch(e) { /* ignore until configured */ }
  }

  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');
  if (!form) return;

  form.addEventListener('submit', function(e){
    e.preventDefault();
    status.textContent = "Sending...";
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;

    const formData = new FormData(form);
    const data = {};
    formData.forEach((v,k) => data[k] = v);

    if (window.emailjs && YOUR_SERVICE_ID !== "YOUR_SERVICE_ID") {
      emailjs.send(YOUR_SERVICE_ID, YOUR_TEMPLATE_ID, data)
      .then(() => {
        status.textContent = "Message sent ✓";
        form.reset();
        submitBtn.disabled = false;
        setTimeout(()=> status.textContent = "", 3000);
      }, (err) => {
        console.error('EmailJS error', err);
        status.textContent = "Error sending message. Try again later.";
        submitBtn.disabled = false;
      });
    } else {
      status.innerHTML = "Demo mode — EmailJS not configured. <br>To enable: replace YOUR_SERVICE_ID/YOUR_TEMPLATE_ID/YOUR_USER_ID in script.js with your EmailJS values.";
      submitBtn.disabled = false;
    }
  });
})();

// ---------- Accessibility small improvements ----------
document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('keydown', (e) => { if (e.key === 'Enter') el.click(); });
});
