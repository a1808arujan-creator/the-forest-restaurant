
'use strict';

$(function () {

    const STORAGE_KEY = 'forestPreorder';
    const isMenuPage = $('body').hasClass('menu-page');

    // READ CART
    function readCart() {
        try {
            const saved = JSON.parse(
                sessionStorage.getItem(STORAGE_KEY)
            );

            if (!Array.isArray(saved)) return [];

            return saved.map(function (item) {
                return {
                    name: String(item.name || ''),
                    price: Number(item.price),
                    quantity: Number(item.quantity)
                };
            }).filter(function (item) {
                return item.name &&
                    Number.isFinite(item.price) &&
                    item.price >= 0 &&
                    Number.isInteger(item.quantity) &&
                    item.quantity > 0;
            });

        } catch (error) {
            return [];
        }
    }

    // SAVE CART
    function saveCart(items) {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(items)
        );

        renderSharedCart();
    }

    function formatPrice(value) {
        return Number(value).toLocaleString('en-US') + ' ₸';
    }

    // ACTIVE NAVIGATION
    const currentPage = decodeURIComponent(
        window.location.pathname.split('/').pop()
    ) || 'index.html';

    $('.site-header .nav-link').each(function () {
        const $link = $(this);
        const page = $link.attr('href');

        const active = page === currentPage;

        $link.toggleClass('active', active);

        if (active) {
            $link.attr('aria-current', 'page');
        } else {
            $link.removeAttr('aria-current');
        }
    });

    // CREATE DRAWER ON OTHER PAGES
    // Menu already has its own drawer.
    if (!$('#forest-cart').length) {

        $('body').append(`
            <div class="offcanvas offcanvas-end forest-cart-panel"
                 tabindex="-1"
                 id="forest-cart"
                 aria-labelledby="forest-cart-title">

                <div class="offcanvas-header">
                    <div>
                        <p class="cart-eyebrow">THE FOREST</p>
                        <h2 class="offcanvas-title"
                            id="forest-cart-title">
                            Your Order
                        </h2>
                    </div>

                    <button type="button"
                            class="btn-close"
                            data-bs-dismiss="offcanvas"
                            aria-label="Close cart">
                    </button>
                </div>

                <div class="offcanvas-body d-flex flex-column">

                    <div id="cart-items"
                         class="flex-grow-1"></div>

                    <div class="cart-summary">

                        <div class="cart-total-row">
                            <span>Subtotal</span>
                            <span id="cart-subtotal">0 ₸</span>
                        </div>

                        <div class="cart-total-row">
                            <span>Service (10%)</span>
                            <span id="cart-service">0 ₸</span>
                        </div>

                        <div class="cart-total-row cart-total-strong">
                            <span>Total</span>
                            <span id="cart-total">0 ₸</span>
                        </div>

                        <a href="contact.html#reservation"
                           id="continue-to-reservation"
                           class="btn btn-forest w-100 mt-3">
                            Continue to Reservation
                        </a>

                        <p id="cart-message"
                           class="cart-notice"
                           role="status"></p>
                    </div>
                </div>
            </div>
        `);
    }

    // RENDER CART
    function renderSharedCart() {

        const cart = readCart();

        const count = cart.reduce(function (sum, item) {
            return sum + item.quantity;
        }, 0);

        $('#cart-count').text(count);

        // Menu.js handles the drawer on Menu Page.
        if (isMenuPage) return;

        const $items = $('#cart-items').empty();

        let subtotal = 0;

        if (!cart.length) {
            const $empty = $('<div>', {
                class: 'cart-empty'
            });

            $('<h3>')
                .text('Your cart is empty')
                .appendTo($empty);

            $('<p>')
                .text('Explore our menu and discover your favorites.')
                .appendTo($empty);

            $('<a>', {
                href: 'menu.html',
                class: 'btn btn-forest'
            })
                .text('Explore Menu')
                .appendTo($empty);

            $items.append($empty);
        }

        cart.forEach(function (item, index) {

            subtotal += item.price * item.quantity;

            const $row = $('<div>', {
                class: 'cart-item'
            });

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
                .text(formatPrice(item.price * item.quantity))
                .appendTo($details);

            const $actions = $('<div>', {
                class: 'cart-item-actions'
            });

            function makeButton(label, action) {
                return $('<button>', {
                    type: 'button',
                    class: 'cart-quantity-button',
                    'data-action': action,
                    'data-index': index,
                    'aria-label': action + ' ' + item.name
                }).text(label);
            }

            $actions.append(makeButton('−', 'minus'));

            $('<span>', {
                class: 'cart-item-quantity'
            })
                .text(item.quantity)
                .appendTo($actions);

            $actions.append(makeButton('+', 'plus'));
            $actions.append(makeButton('Remove', 'remove'));

            $details.append($actions);
            $row.append($details).appendTo($items);
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
        $('#cart-total').text(formatPrice(subtotal + service));

        $('#continue-to-reservation')
            .toggleClass('disabled', !cart.length)
            .attr('aria-disabled', String(!cart.length))
            .attr('tabindex', cart.length ? '0' : '-1');
    }

    // CART QUANTITY AND REMOVE
    if (!isMenuPage) {

        $('#cart-items').on('click', '[data-action]', function () {

            const index = Number($(this).attr('data-index'));
            const action = $(this).attr('data-action');
            const cart = readCart();

            if (!cart[index]) return;

            if (action === 'plus') {
                cart[index].quantity++;
            }

            if (action === 'minus') {
                cart[index].quantity--;

                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }
            }

            if (action === 'remove') {
                cart.splice(index, 1);
            }

            saveCart(cart);
        });

        $('#cart-items').on('click', '#clear-cart', function () {
            saveCart([]);
            $('#cart-message').text('Your cart has been cleared.');
        });

        $('#continue-to-reservation').on('click', function (event) {
            if (!readCart().length) {
                event.preventDefault();
            }
        });
    }

    // REFRESH CART BEFORE OPENING
    $('.header-cart').on('click', function () {
        renderSharedCart();
    });

    // REFRESH WHEN RETURNING TO THE PAGE
    $(window).on('pageshow', function () {
        renderSharedCart();
    });

    // INITIAL RENDER
    renderSharedCart();

});


$(function () {
    if ($('body').hasClass('menu-page')) return;
    if (window.forestBackToTopReady) return;

    window.forestBackToTopReady = true;

    let $button = $('#back-to-top');

    if (!$button.length) {
        $button = $('<button>', {
            type: 'button',
            id: 'back-to-top',
            class: 'back-to-top',
            title: 'Back to top',
            'aria-label': 'Back to top',
            tabindex: '-1'
        })
            .text('↑')
            .appendTo('body');
    }

    function updateBackToTop() {
        const visible = $(window).scrollTop() > 400;

        $button
            .toggleClass('is-visible', visible)
            .attr('tabindex', visible ? '0' : '-1');
    }

    $(window).on('scroll', updateBackToTop);

    $button.on('click', function () {
        window.scrollTo({
            top: 0,
            behavior: window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches ? 'instant' : 'smooth'
        });
    });

    updateBackToTop();
});
