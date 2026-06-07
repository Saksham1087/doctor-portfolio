(function () {
  'use strict';

  let data = null;
  let carouselIndex = 0;
  let autoSlide = null;

  /* ---------------------------------------------------------------
   *  DATA INJECTION — querySelectorAll('[data-inject]')
   *
   *  For every element bearing a data-inject attribute, split the
   *  attribute value on '.' and walk the config object to retrieve
   *  the target value, then set it as the element's textContent.
   * ------------------------------------------------------------ */
  function injectField(el, obj) {
    const path = el.getAttribute('data-inject');
    if (!path) return;

    const keys = path.split('.');
    let value = obj;

    for (let i = 0; i < keys.length; i++) {
      if (value == null || typeof value !== 'object') {
        value = undefined;
        break;
      }
      value = value[keys[i]];
    }

    if (value === undefined || value === null) return;

    el.textContent = Array.isArray(value) ? value.join(', ') : value;
  }

  function injectAll() {
    document.querySelectorAll('[data-inject]').forEach(function (el) {
      injectField(el, data);
    });

    if (data.doctor) {
      document.title = data.doctor.name + ' — ' + data.doctor.title;
    }
  }

  /* ---------------------------------------------------------------
   *  SERVICES CARDS
   * ------------------------------------------------------------ */
  function buildServiceCards() {
    var grid = document.getElementById('services-grid');
    if (!grid || !data.services) return;

    grid.innerHTML = data.services.map(function (s) {
      return (
        '<div class="group bg-white rounded-2xl p-7 border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300">' +
          '<div class="w-12 h-12 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl mb-5 transition-colors">' +
            '<i class="fas ' + s.icon + '"></i>' +
          '</div>' +
          '<h3 class="text-lg font-bold text-gray-900 mb-2">' + s.title + '</h3>' +
          '<p class="text-gray-500 text-sm leading-relaxed">' + s.description + '</p>' +
        '</div>'
      );
    }).join('');
  }

  /* ---------------------------------------------------------------
   *  ARTICLES CARDS
   * ------------------------------------------------------------ */
  function buildArticleCards() {
    var grid = document.getElementById('articles-grid');
    if (!grid || !data.articles) return;

    function formatDate(iso) {
      var d = new Date(iso);
      return d.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
    }

    grid.innerHTML = data.articles.map(function (a) {
      return (
        '<a href="' + a.url + '" class="group bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-300 flex flex-col overflow-hidden">' +
          '<div class="h-40 bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center">' +
            '<i class="fas fa-newspaper text-4xl text-indigo-300 group-hover:text-indigo-400 transition-colors"></i>' +
          '</div>' +
          '<div class="p-6 flex flex-col flex-1">' +
            '<time class="text-xs text-gray-400 font-medium uppercase tracking-wider">' + formatDate(a.date) + '</time>' +
            '<h3 class="text-base font-bold text-gray-900 mt-1.5 mb-2 group-hover:text-indigo-700 transition-colors">' + a.title + '</h3>' +
            '<p class="text-sm text-gray-500 leading-relaxed flex-1">' + a.excerpt + '</p>' +
            '<span class="mt-4 text-indigo-700 text-sm font-semibold inline-flex items-center gap-1 group-hover:gap-2 transition-all">' +
              'Read More <i class="fas fa-arrow-right text-xs"></i>' +
            '</span>' +
          '</div>' +
        '</a>'
      );
    }).join('');
  }

  /* ---------------------------------------------------------------
   *  CAROUSEL
   * ------------------------------------------------------------ */
  function buildCarousel() {
    var container = document.getElementById('carousel-slides');
    var dotsContainer = document.getElementById('carousel-dots');
    if (!container || !dotsContainer || !data.services) return;

    container.innerHTML = data.services.map(function (s) {
      return (
        '<div class="min-w-full p-8 sm:p-10 flex flex-col items-center text-center">' +
          '<div class="w-16 h-16 bg-indigo-500/20 rounded-full flex items-center justify-center mb-5">' +
            '<i class="fas ' + s.icon + ' text-3xl text-indigo-400"></i>' +
          '</div>' +
          '<h3 class="text-2xl font-bold text-white mb-3">' + s.title + '</h3>' +
          '<p class="text-gray-300 max-w-md">' + s.description + '</p>' +
        '</div>'
      );
    }).join('');

    dotsContainer.innerHTML = data.services.map(function (_, i) {
      var active = i === 0 ? ' active-dot bg-white w-3' : ' bg-white/40 w-2.5';
      return (
        '<button class="carousel-dot h-2.5 rounded-full hover:bg-white/70 transition-all' + active + '" data-index="' + i + '"></button>'
      );
    }).join('');

    carouselIndex = 0;
    goToSlide(0);

    document.getElementById('carousel-prev').addEventListener('click', function () {
      stopAuto(); prevSlide();
    });
    document.getElementById('carousel-next').addEventListener('click', function () {
      stopAuto(); nextSlide();
    });
    dotsContainer.addEventListener('click', function (e) {
      var dot = e.target.closest('.carousel-dot');
      if (!dot) return;
      stopAuto();
      goToSlide(parseInt(dot.getAttribute('data-index'), 10));
    });

    startAuto();
  }

  function goToSlide(index) {
    var slides = document.getElementById('carousel-slides');
    var dots = document.querySelectorAll('.carousel-dot');
    if (!slides) return;

    var total = slides.children.length;
    carouselIndex = ((index % total) + total) % total;
    slides.style.transform = 'translateX(-' + (carouselIndex * 100) + '%)';

    dots.forEach(function (d, i) {
      if (i === carouselIndex) {
        d.classList.add('active-dot', 'bg-white', 'w-3');
        d.classList.remove('bg-white/40', 'w-2.5');
      } else {
        d.classList.remove('active-dot', 'bg-white', 'w-3');
        d.classList.add('bg-white/40', 'w-2.5');
      }
    });
  }

  function nextSlide() { goToSlide(carouselIndex + 1); }
  function prevSlide() { goToSlide(carouselIndex - 1); }

  function startAuto() { stopAuto(); autoSlide = setInterval(nextSlide, 5000); }
  function stopAuto() { if (autoSlide) { clearInterval(autoSlide); autoSlide = null; } }

  /* ---------------------------------------------------------------
   *  APPOINTMENT FORM
   * ------------------------------------------------------------ */
  function bindForm() {
    var form = document.getElementById('appointment-form');
    var success = document.getElementById('form-success');
    if (!form) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var name = document.getElementById('patient-name').value.trim();
      var phone = document.getElementById('patient-phone').value.trim();

      if (!name || !phone) {
        alert('Please fill in your name and phone number.');
        return;
      }

      form.reset();
      success.classList.remove('hidden');
      setTimeout(function () { success.classList.add('hidden'); }, 5000);
    });
  }

  /* ---------------------------------------------------------------
   *  INIT
   * ------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', function () {
    fetch('config.json')
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.json();
      })
      .then(function (json) {
        data = json;
        injectAll();
        buildServiceCards();
        buildArticleCards();
        buildCarousel();
        bindForm();
      })
      .catch(function (err) {
        console.error('Failed to load config.json:', err);
        var hero = document.getElementById('hero');
        if (hero) {
          hero.querySelector('h1').insertAdjacentHTML(
            'afterend',
            '<div class="mt-4 bg-red-500/20 text-red-300 border border-red-400/30 rounded-xl p-4 text-sm">Could not load configuration. Please ensure <code>config.json</code> is accessible.</div>'
          );
        }
      });
  });

})();
