
'use strict';

const extraPhotos = [
    { src: 'images/gallery1.jpg', title: 'Restaurant Food' },
    { src: 'images/gallery2.png', title: 'Cozy Interior' },
    { src: 'images/gallery3.jpg', title: 'Dining Area' }
];

document.addEventListener('DOMContentLoaded', function () {
    const main = document.querySelector('main');
    const interior = document.querySelector('#interior');
    const box = document.querySelector('#gallery-lightbox');

    if (!main || !interior || !box) return;

    function photoTitle(photo) {
        return photo.title || photo.alt || 'The Forest';
    }

    const section = document.createElement('section');
    section.className = 'gallery-section py-5';

    section.innerHTML = `
        <div class="container">
            <p class="section-name text-center small text-uppercase">OUR MOMENTS</p>
            <h2 class="display-6 text-center mb-4">More from The Forest</h2>
            <div class="row g-4"></div>
        </div>`;

    extraPhotos.forEach(function (photo) {
        const card = document.createElement('div');
        card.className = 'col-12 col-md-6 col-lg-4';

        card.innerHTML = `
            <figure class="gallery-card h-100 rounded-3 overflow-hidden shadow-sm">
                <img src="${photo.src}" alt="${photoTitle(photo)}"
                     class="img-fluid w-100 object-fit-cover" loading="lazy">
                <figcaption class="p-3 text-center">${photoTitle(photo)}</figcaption>
            </figure>`;

        section.querySelector('.row').append(card);
    });

    interior.after(section);

    const photos = Array.from(
        main.querySelectorAll('.gallery-card img, #exterior img')
    );

    if (!photos.length) return;

    box.className = 'position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-none align-items-center justify-content-center p-3 z-3';

    box.innerHTML = `
        <div class="col-12 col-lg-9 mx-auto">
            <div class="bg-dark text-white rounded-4 shadow-lg p-3 p-md-4">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <span class="small text-white-50">THE FOREST • GALLERY</span>
                    <button id="gallery-close" type="button"
                            class="btn btn-outline-light btn-sm">✕ Close</button>
                </div>
                <div class="ratio ratio-16x9 bg-black rounded-3 overflow-hidden">
                    <img id="gallery-large-image"
                         class="w-100 h-100 object-fit-contain" alt="Gallery photo">
                </div>
                <div class="d-flex justify-content-between align-items-center gap-2 mt-3">
                    <button id="gallery-prev" type="button"
                            class="btn btn-outline-light btn-sm">← Previous</button>
                    <span id="gallery-counter" class="small text-white-50"></span>
                    <button id="gallery-next" type="button"
                            class="btn btn-outline-light btn-sm">Next →</button>
                </div>
            </div>
        </div>`;

    const image = box.querySelector('#gallery-large-image');
    const counter = box.querySelector('#gallery-counter');
    const close = box.querySelector('#gallery-close');

    let current = 0;
    let lastPhoto = null;

    function nextIndex(step) {
        return (current + step + photos.length) % photos.length;
    }

    function showPhoto(number) {
        current = number;
        image.src = photos[current].src;
        image.alt = photoTitle(photos[current]);
        counter.textContent = `Photo ${current + 1} of ${photos.length}`;
    }

    function closePhoto() {
        box.classList.replace('d-flex', 'd-none');
        document.body.classList.remove('overflow-hidden');
        if (lastPhoto) lastPhoto.focus();
    }

    photos.forEach(function (photo) {
        photo.classList.add('gallery-clickable');
        photo.tabIndex = 0;
        photo.setAttribute('role', 'button');
    });

    main.addEventListener('click', function (event) {
        const photo = event.target.closest('img.gallery-clickable');
        if (!photo) return;

        lastPhoto = photo;
        showPhoto(photos.indexOf(photo));
        box.classList.replace('d-none', 'd-flex');
        document.body.classList.add('overflow-hidden');
        close.focus();
    });

    main.addEventListener('keydown', function (event) {
        if ((event.key === 'Enter' || event.key === ' ') &&
            event.target.matches('img.gallery-clickable')) {
            event.preventDefault();
            event.target.click();
        }
    });

    close.addEventListener('click', closePhoto);

    box.querySelector('#gallery-prev').addEventListener('click', function () {
        showPhoto(nextIndex(-1));
    });

    box.querySelector('#gallery-next').addEventListener('click', function () {
        showPhoto(nextIndex(1));
    });

    document.addEventListener('keydown', function (event) {
        if (box.classList.contains('d-none')) return;

        if (event.key === 'Escape') closePhoto();
        if (event.key === 'ArrowLeft') showPhoto(nextIndex(-1));
        if (event.key === 'ArrowRight') showPhoto(nextIndex(1));
    });
});
