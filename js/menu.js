
'use strict';

// THE FOREST RESTAURANT — MENU

$(function () {

    if (!$('body').hasClass('menu-page')) return;

    const STORAGE_KEY = 'forestPreorder';
    const PHOTO_FOLDER = 'images/food/';

    let cart = [];

    // =====================================
    // 1. PRICE FORMAT
    // =====================================

    function formatPrice(value) {
        return Number(value).toLocaleString('en-US') + ' ₸';
    }

    // =====================================
    // 2. PHOTO PATHS
    // =====================================

    function slugify(name, removeAccents = true) {

        let value = String(name).toLowerCase();

        if (removeAccents) {
            value = value
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '');
        }

        return value
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');
    }

    function photoCandidates(name) {

        const slug = slugify(name);
        const originalSlug = slugify(name, false);

        const filenames = [];

        // Known filename variations
        const overrides = {

            'baursaki-with-chicken-pate-foie-gras-and-berry-sauce': [
                'baursaki-with-chicken-p-t-foie-gras-and-berry-sauce'
            ],

            'trout-with-spinach-red-caviar-and-cauliflower-puree': [
                'trout-with-spinach-red-caviar-and-cauliflower-pur-e',
                'trout-with-spinach-red-caviar-and-cauliflower-puree',
                'trout-with-spinach-red-caviar-and-cauliflower-pure-e'
            ]
        };

        if (overrides[slug]) {
            filenames.push(...overrides[slug]);
        }

        filenames.push(slug);

        if (originalSlug !== slug) {
            filenames.push(originalSlug);
        }

        const extensions = ['jpg', 'jpeg', 'png', 'webp'];

        const paths = [];

        [...new Set(filenames)].forEach(function (filename) {

            extensions.forEach(function (extension) {

                paths.push(
                    PHOTO_FOLDER + filename + '.' + extension
                );

            });

        });

        return paths;
    }

    // Try possible file paths until image loads
    function loadDishPhoto($image, name, $fallback) {

        const paths = photoCandidates(name);

        let index = 0;

        $image.off('load.forest error.forest');

        $image.on('load.forest', function () {

            $image.show();

            if ($fallback && $fallback.length) {
                $fallback.hide();
            }
        });

        $image.on('error.forest', function () {

            index++;

            if (index < paths.length) {

                $image.attr('src', paths[index]);

            } else {

                $image.hide();

                if ($fallback && $fallback.length) {
                    $fallback.show();
                }

                console.warn(
                    'Photo not found for: ' + name,
                    'Tried:', paths
                );
            }
        });

        if (paths.length) {
            $image.attr('src', paths[0]);
        }
    }

    // =====================================
    // 3. CREATE DISH CARD
    // =====================================

    function createDishCard(dish) {

        const $column = $('<div>', {
            class: 'col-12 col-md-6 col-xl-4 dish-column'
        });

        const $card = $('<article>', {
            class: 'dish-card h-100'
        });

        const $photo = $('<div>', {
            class: 'dish-photo'
        });

        const $fallback = $('<div>', {
            class: 'dish-photo-fallback'
        })
            .text('Photo coming soon')
            .hide();

        const $image = $('<img>', {
            alt: dish.name,
            loading: 'lazy',
            decoding: 'async'
        });

        $photo.append($fallback, $image);

        loadDishPhoto($image, dish.name, $fallback);

        const $information = $('<div>', {
            class: 'dish-information'
        });

        $('<h3>', {
            class: 'dish-name'
        })
            .text(dish.name)
            .appendTo($information);

        const $bottom = $('<div>', {
            class: 'dish-bottom'
        });

        $('<span>', {
            class: 'dish-price'
        })
            .text(formatPrice(dish.price))
            .appendTo($bottom);

        $('<button>', {
            type: 'button',
            class: 'btn add-to-cart',
            'data-name': dish.name,
            'data-price': dish.price,
            'aria-label': 'Add ' + dish.name + ' to cart'
        })
            .text('Add to Cart')
            .appendTo($bottom);

        $information.append($bottom);

        $('<p>', {
            class: 'dish-feedback',
            role: 'status',
            'aria-live': 'polite'
        }).appendTo($information);

        $card.append($photo, $information);

        return $column.append($card);
    }

    // =====================================
    // 4. BUILD MENU FROM HTML TABLES
    // =====================================

    function buildMenuCards() {

        $('.menu-section').each(function () {

            const $section = $(this);

            const $table = $section
                .find('table.menu-table')
                .first();

            if (!$table.length) return;

            const $grid = $('<div>', {
                class: 'row g-3 g-lg-4 dish-grid'
            });

            $table.find('tbody tr').each(function () {

                const $cells = $(this).find('td');

                if ($cells.length < 2) return;

                const name = $cells.eq(0)
                    .text()
                    .trim()
                    .replace(/\s+/g, ' ');

                const priceText = $cells.eq(1)
                    .text()
                    .replace(/[^0-9]/g, '');

                const price = Number(priceText);

                if (
                    !name ||
                    !priceText ||
                    !Number.isFinite(price)
                ) {
                    return;
                }

                $grid.append(
                    createDishCard({
                        name: name,
                        price: price
                    })
                );
            });

            if ($grid.children().length) {

                $table
                    .closest('.table-responsive')
                    .replaceWith($grid);
            }
        });

        // Remember original order
        $('.dish-grid').each(function () {

            $(this)
                .children('.dish-column')
                .each(function (index) {

                    $(this).data('originalIndex', index);

                });
        });
    }

    // =====================================
    // 5. SEARCH
    // =====================================

    function filterDishes() {

        const rawQuery = String(
            $('#menu-search').val() || ''
        )
            .trim()
            .toLowerCase();

        const query = rawQuery === 'bursa'
            ? 'baursaki'
            : rawQuery;

        let total = 0;

        $('.menu-section').each(function () {

            const $section = $(this);

            const category = $section
                .find('.category-heading')
                .text()
                .trim()
                .toLowerCase();

            let inSection = 0;

            $section.find('.dish-column').each(function () {

                const $column = $(this);

                const name = String(
                    $column.find('.add-to-cart')
                        .attr('data-name') || ''
                ).toLowerCase();

                const matches =
                    name.includes(query) ||
                    category.includes(query);

                $column.toggle(matches);

                if (matches) {
                    inSection++;
                }
            });

            $section.toggle(inSection > 0);

            total += inSection;

            $section.find('.category-count').text(
                inSection +
                (inSection === 1 ? ' dish' : ' dishes')
            );

            const id = $section.attr('id');

            $('.menu-category-link[href="#' + id + '"]')
                .toggleClass(
                    'has-no-matches',
                    inSection === 0
                );
        });

        $('#menu-search-result').text(
            rawQuery
                ? (
                    total
                        ? total + ' dishes found'
                        : 'No dishes found. Try another name.'
                )
                : ''
        );
    }

    // =====================================
    // 6. PRICE SORTING
    // =====================================

    function sortDishes() {

        const order = $('#menu-sort').val();

        $('.dish-grid').each(function () {

            const $grid = $(this);

            const cards = $grid
                .children('.dish-column')
                .get();

            cards.sort(function (a, b) {

                if (order === 'default') {

                    return (
                        $(a).data('originalIndex') -
                        $(b).data('originalIndex')
                    );
                }

                const priceA = Number(
                    $(a).find('.add-to-cart')
                        .attr('data-price')
                );

                const priceB = Number(
                    $(b).find('.add-to-cart')
                        .attr('data-price')
                );

                return order === 'asc'
                    ? priceA - priceB
                    : priceB - priceA;
            });

            $grid.append(cards);
        });
    }

    // =====================================
    // 7. LOAD CART
    // =====================================

    function loadCart() {

        try {

            const saved = JSON.parse(
                sessionStorage.getItem(STORAGE_KEY)
            );

            if (!Array.isArray(saved)) {
                cart = [];
                return;
            }

            cart = saved.map(function (item) {

                return {
                    name: String(item.name || ''),
                    price: Number(item.price),
                    quantity: Number(item.quantity)
                };

            }).filter(function (item) {

                return (
                    item.name &&
                    Number.isFinite(item.price) &&
                    item.price >= 0 &&
                    Number.isInteger(item.quantity) &&
                    item.quantity > 0
                );
            });

        } catch (error) {

            cart = [];
        }
    }

    // =====================================
    // 8. SAVE CART
    // =====================================

    function saveCart() {

        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cart)
        );
    }

    // =====================================
    // 9. CART QUANTITY
    // =====================================

    function changeQuantity(index, difference) {

        if (
            !Number.isInteger(index) ||
            !cart[index]
        ) {
            return;
        }

        cart[index].quantity += difference;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        saveCart();
        renderCart();
    }

    // =====================================
    // 10. ADD TO CART
    // =====================================

    function addToCart(name, price) {

        const existing = cart.find(function (item) {
            return item.name === name;
        });

        if (existing) {

            existing.quantity++;

        } else {

            cart.push({
                name: name,
                price: price,
                quantity: 1
            });
        }

        saveCart();
        renderCart();
    }

    // =====================================
    // 11. RENDER CART
    // =====================================

    function renderCart() {

        const $items = $('#cart-items').empty();

        let subtotal = 0;
        let count = 0;

        if (!cart.length) {

            const $empty = $('<div>', {
                class: 'cart-empty'
            });

            $('<div>', {
                class: 'cart-empty-icon',
                'aria-hidden': 'true'
            })
                .text('✦')
                .appendTo($empty);

            $('<h3>')
                .text('Your cart is empty')
                .appendTo($empty);

            $('<p>')
                .text('Discover something delicious from our menu.')
                .appendTo($empty);

            $('<button>', {
                type: 'button',
                class: 'btn btn-forest mt-2',
                'data-bs-dismiss': 'offcanvas'
            })
                .text('Explore Menu')
                .appendTo($empty);

            $items.append($empty);
        }

        cart.forEach(function (item, index) {

            subtotal += item.price * item.quantity;
            count += item.quantity;

            const $row = $('<div>', {
                class: 'cart-item'
            });

            const $image = $('<img>', {
                class: 'cart-item-photo',
                alt: '',
                loading: 'lazy'
            });

            loadDishPhoto($image, item.name);

            const $details = $('<div>', {
                class: 'cart-item-details'
            });

            $('<h3>', {
                class: 'cart-item-title'
            })
                .text(item.name)
                .appendTo($details);

            $('<p>', {
                class: 'cart-item-price'
            })
                .text(
                    formatPrice(
                        item.price * item.quantity
                    )
                )
                .appendTo($details);

            const $actions = $('<div>', {
                class: 'cart-item-actions'
            });

            function cartButton(text, action, label) {

                return $('<button>', {
                    type: 'button',
                    class: 'cart-quantity-button',
                    'data-action': action,
                    'data-index': index,
                    'aria-label': label + ' ' + item.name
                }).text(text);
            }

            $actions.append(
                cartButton(
                    '−',
                    'minus',
                    'Decrease quantity of'
                )
            );

            $('<span>', {
                class: 'cart-item-quantity'
            })
                .text(item.quantity)
                .appendTo($actions);

            $actions.append(
                cartButton(
                    '+',
                    'plus',
                    'Increase quantity of'
                )
            );

            $actions.append(
                cartButton(
                    'Remove',
                    'remove',
                    'Remove'
                )
            );

            $details.append($actions);

            $row
                .append($image, $details)
                .appendTo($items);
        });

        if (cart.length) {

            $('<button>', {
                type: 'button',
                id: 'clear-cart',
                class: 'clear-cart-button'
            })
                .text('Clear all items')
                .appendTo($items);
        }

        const service = Math.round(subtotal * 0.1);

        $('#cart-subtotal').text(formatPrice(subtotal));

        $('#cart-service').text(formatPrice(service));

        $('#cart-total').text(
            formatPrice(subtotal + service)
        );

        $('#cart-count').text(count);

        $('#continue-to-reservation')
            .toggleClass('disabled', !cart.length)
            .attr('aria-disabled', String(!cart.length))
            .attr('tabindex', cart.length ? '0' : '-1');
    }

    // =====================================
    // 12. ACTIVE CATEGORY
    // =====================================

    function setActiveCategory(hash) {

        $('.menu-category-link')
            .removeClass('is-active')
            .removeAttr('aria-current');

        $('.menu-category-link')
            .filter('[href="' + hash + '"]')
            .addClass('is-active')
            .attr('aria-current', 'location');
    }

    // =====================================
    // 13. BACK TO TOP
    // =====================================

    function setupBackToTop() {

        const $button = $('#back-to-top');

        function updateVisibility() {

            const visible = $(window).scrollTop() > 400;

            $button
                .toggleClass('is-visible', visible)
                .attr(
                    'tabindex',
                    visible ? '0' : '-1'
                );
        }

        $(window).on('scroll', updateVisibility);

        updateVisibility();

        $button.on('click', function () {

            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // =====================================
    // 14. INITIALIZE
    // =====================================

    buildMenuCards();

    loadCart();

    renderCart();

    setupBackToTop();

    filterDishes();

    // =====================================
    // 15. SEARCH EVENT
    // =====================================

    $('#menu-search').on('input', function () {

        filterDishes();

    });

    // =====================================
    // 16. SORT EVENT
    // =====================================

    $('#menu-sort').on('change', function () {

        sortDishes();

    });

    // =====================================
    // 17. CATEGORY EVENT
    // =====================================

    $('.menu-category-links').on(
        'click',
        '.menu-category-link',
        function () {

            // Clear search when choosing a category
            $('#menu-search').val('');

            filterDishes();

            setActiveCategory(
                $(this).attr('href')
            );
        }
    );

    // =====================================
    // 18. ADD DISH EVENT
    // =====================================

    $('.menu-section').on(
        'click',
        '.add-to-cart',
        function () {

            const $button = $(this);

            const name = String(
                $button.attr('data-name') || ''
            );

            const price = Number(
                $button.attr('data-price')
            );

            if (
                !name ||
                !Number.isFinite(price) ||
                price < 0
            ) {
                return;
            }

            addToCart(name, price);

            $button
                .closest('.dish-information')
                .find('.dish-feedback')
                .text('Added to cart ✓');

            $('#cart-message').text('');
        }
    );

    // =====================================
    // 19. CART BUTTON EVENTS
    // =====================================

    $('#cart-items').on(
        'click',
        '[data-action]',
        function () {

            const index = Number(
                $(this).attr('data-index')
            );

            const action = $(this).attr('data-action');

            if (action === 'plus') {

                changeQuantity(index, 1);

            } else if (action === 'minus') {

                changeQuantity(index, -1);

            } else if (
                action === 'remove' &&
                cart[index]
            ) {

                cart.splice(index, 1);

                saveCart();
                renderCart();
            }
        }
    );

    // =====================================
    // 20. CLEAR CART
    // =====================================

    $('#cart-items').on(
        'click',
        '#clear-cart',
        function () {

            cart = [];

            saveCart();
            renderCart();

            $('#cart-message').text(
                'Your order has been cleared.'
            );
        }
    );

    // =====================================
    // 21. CONTINUE TO RESERVATION
    // =====================================

    $('#continue-to-reservation').on(
        'click',
        function (event) {

            if (!cart.length) {
                event.preventDefault();
            }
        }
    );

});
