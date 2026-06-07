document.addEventListener("DOMContentLoaded", () => {
    fetch('./config.json')
        .then(response => response.json())
        .then(data => {
            // 1. Handle all standard text injections (e.g., doctor.name, doctor.about)
            const injectors = document.querySelectorAll('[data-inject]');
            injectors.forEach(element => {
                const path = element.getAttribute('data-inject');
                const keys = path.split('.');
                
                let value = data;
                keys.forEach(key => {
                    if (value) value = value[key];
                });
                
                if (value !== undefined && value !== null) {
                    element.textContent = value;
                }
            });

            // 2. Handle the Services Carousel layout generation
            const servicesWrapper = document.getElementById('carousel-wrapper') || document.querySelector('.relative.h-48');
            if (servicesWrapper && data.services) {
                servicesWrapper.innerHTML = data.services.map((service, idx) => `
                    <div class="space-y-4 ${idx === 0 ? '' : 'hidden'}" data-slide="${idx}">
                        <div class="text-4xl">${service.icon || '🤱'}</div>
                        <h4 class="text-xl font-bold text-white">${service.title}</h4>
                        <p class="text-slate-300 text-sm leading-relaxed">${service.description}</p>
                    </div>
                `).join('');
            }
        })
        .catch(error => console.error('Error loading config:', error));
});
