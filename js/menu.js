
'use strict';

// The Forest — jQuery 3.7.1. jQuery must load before this file.
$(function () {
    // Guard against accidentally connecting the same script twice.
    if (window.forestMenuInitialized) return;
    window.forestMenuInitialized = true;

    const STORAGE_KEY = 'forestPreorder';
    let cart = [];

    try {
        const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
        if (Array.isArray(saved)) {
            cart = saved.filter(function (item) {
                return item && typeof item.name === 'string' &&
                    Number.isFinite(item.price) && item.price >= 0 &&
                    Number.isInteger(item.quantity) && item.quantity > 0;
            });
        }
    } catch (error) {
        cart = [];
    }

    // Feature 1: MENU SEARCH (Vanilla JS -> jQuery).
    // querySelectorAll/addEventListener/style.display became $(), .on(), .each(), .toggle().
    // jQuery is shorter for finding elements and updating their visibility.
    // Remove an old manually added search, if present, before creating one in JS.
    $('.menu-categories #menu-search').closest('.row').remove();
    $('.menu-categories #search-result').remove();

    const $searchBox = $('<div>', { class: 'row justify-content-center mb-4' });
    const $searchColumn = $('<div>', { class: 'col-12 col-md-6' });
    const $searchInput = $('<input>', {
        type: 'text',
        id: 'menu-search',
        class: 'form-control',
        placeholder: 'Search dishes...',
        'aria-label': 'Search dishes'
    });
    const $searchResult = $('<p>', {
        id: 'search-result',
        class: 'text-center mt-3 text-muted',
        'aria-live': 'polite'
    });

    $searchColumn.append($searchInput, $searchResult);
    $searchBox.append($searchColumn);
    $('.menu-categories .container').find('h2:first').after($searchBox);

    const $dishes = $('.forest-dish');
    const $sections = $('.menu-section');
    const $cartItems = $('#cart-items');
    const $cartResult = $('#cart-result');

    // Image errors are handled here, not in an inline HTML event attribute.
    $('.forest-dish-photo img').on('error', function () {
        $(this).prop('hidden', true);
    });

    function saveCart() {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    }

    function formatPrice(price) {
        return price.toLocaleString('en-US') + ' ₸';
    }

    function calculateSubtotal() {
        let total = 0;
        $.each(cart, function (index, item) {
            total += item.price * item.quantity;
        });
        return total;
    }

    function calculateQuantity() {
        let quantity = 0;
        $.each(cart, function (index, item) {
            quantity += item.quantity;
        });
        return quantity;
    }

    // Feature 2: CART RENDERING (Vanilla JS -> jQuery).
    // createElement/appendChild/replaceChildren became $('<...>'), .appendTo(), .html().
    // Building the cart is shorter; delegated events avoid listeners on each new button.
    function renderCart() {
        $cartItems.empty();

        if (cart.length === 0) {
            // .html() is safe here because this is fixed HTML, not user input.
            $cartItems.html('<p>Your pre-order is currently empty.</p>');
        } else {
            // All cart rows and buttons come from the cart array, not from HTML.
            $.each(cart, function (index, item) {
                const $row = $('<div>', {
                    class: 'd-flex flex-wrap justify-content-between align-items-center gap-3 mb-3'
                });
                const $information = $('<div>');
                const $actions = $('<div>', {
                    class: 'd-flex align-items-center gap-2'
                });

                $('<strong>').text(item.name).appendTo($information);
                $('<p>', { class: 'mb-0' })
                    .text(formatPrice(item.price * item.quantity))
                    .appendTo($information);

                $('<button>', {
                    type: 'button',
                    class: 'btn btn-outline-dark btn-sm cart-minus',
                    'data-index': index,
                    'aria-label': 'Decrease ' + item.name
                }).text('−').appendTo($actions);

                $('<span>').text(item.quantity).appendTo($actions);

                $('<button>', {
                    type: 'button',
                    class: 'btn btn-outline-dark btn-sm cart-plus',
                    'data-index': index,
                    'aria-label': 'Increase ' + item.name
                }).text('+').appendTo($actions);

                $('<button>', {
                    type: 'button',
                    class: 'btn btn-outline-danger btn-sm cart-remove',
                    'data-index': index
                }).text('Remove').appendTo($actions);

                // Chain: append() adds children; appendTo() places the row in #cart-items.
                $row.append($information, $actions).appendTo($cartItems);
            });

            $('<button>', {
                type: 'button',
                class: 'btn btn-outline-danger btn-sm mt-2 cart-clear'
            }).text('Clear Cart').appendTo($cartItems);
        }

        const subtotal = calculateSubtotal();
        const service = Math.round(subtotal * 0.10);

        $('#cart-subtotal').text(formatPrice(subtotal));
        $('#cart-service').text(formatPrice(service));
        $('#cart-total').text(formatPrice(subtotal + service));
        $('#cart-nav-link').text('Cart (' + calculateQuantity() + ')');

        $('#continue-to-reservation')
            .toggleClass('disabled', cart.length === 0)
            .attr('aria-disabled', String(cart.length === 0));
    }

    function addToCart(name, price, quantity) {
        const existing = cart.find(function (item) {
            return item.name === name;
        });

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({ name: name, price: price, quantity: quantity });
        }
        saveCart();
        renderCart();
    }

    function changeCartQuantity(index, difference) {
        if (!Number.isInteger(index) || !cart[index]) return;
        cart[index].quantity += difference;
        if (cart[index].quantity <= 0) cart.splice(index, 1);
        saveCart();
        renderCart();
    }

    function removeFromCart(index) {
        if (!Number.isInteger(index) || !cart[index]) return;
        cart.splice(index, 1);
        saveCart();
        renderCart();
    }

    function showCartMessage(message) {
        // Chain: stop() cancels an old animation; hide() resets visibility;
        // text() safely sets a message; fadeIn() reveals it to the visitor.
        $cartResult.stop(true, true).hide().text(message).fadeIn(250, function () {
            $(this).attr('role', 'status'); // Completion callback.
        });
    }

    // Delegation: cart buttons are created AFTER page load by renderCart().
    // Binding .on() directly to .cart-plus at startup would miss these buttons.
    $cartItems.on('click', '.cart-minus', function () {
        changeCartQuantity(Number($(this).attr('data-index')), -1);
    });

    $cartItems.on('click', '.cart-plus', function () {
        changeCartQuantity(Number($(this).attr('data-index')), 1);
    });

    $cartItems.on('click', '.cart-remove', function () {
        removeFromCart(Number($(this).attr('data-index')));
    });

    $cartItems.on('click', '.cart-clear', function () {
        cart = [];
        saveCart();
        renderCart();
        showCartMessage('Your cart has been cleared.');
    });

    // Menu quantity buttons: .siblings() finds the counter in the same control.
    $('.forest-dish-list').on('click', '.quantity-plus, .quantity-minus', function () {
        const $button = $(this);
        const $quantityValue = $button.siblings('.quantity-value');
        const $dish = $button.closest('.forest-dish');
        let quantity = Number($quantityValue.text()) || 1;

        if ($button.hasClass('quantity-plus')) {
            quantity++;
        } else if (quantity > 1) {
            quantity--;
        }

        $quantityValue.text(quantity);
        // .prop() changes the actual disabled property, not a text attribute.
        $dish.find('.quantity-minus').prop('disabled', quantity === 1);
    });

    $('.forest-dish-list').on('click', '.add-to-cart[data-price]', function () {
        // The selector above uses element class AND an attribute selector.
        const $button = $(this);
        const $dish = $button.closest('.forest-dish');
        const name = String($button.attr('data-name') || '').replace(/^🍽\s*/, '');
        const price = Number($button.attr('data-price'));
        const quantity = Number($dish.find('.quantity-value').text()) || 1;

        if (!name || !Number.isFinite(price) || price < 0) return;

        addToCart(name, price, quantity);
        $dish.find('.quantity-value').text('1');
        $dish.find('.quantity-minus').prop('disabled', true);
        showCartMessage(name + ' × ' + quantity + ' added to your cart.');
    });

    $searchInput.on('input', function () {
        const searchText = String($(this).val()).trim().toLowerCase();
        let found = 0;

        $dishes.each(function () {
            const $dish = $(this);
            const name = String(
                $dish.find('button[data-name]').attr('data-name') || ''
            ).toLowerCase();
            const matches = name.includes(searchText);
            $dish.toggle(matches);
            if (matches) found++;
        });

        $sections.each(function () {
            const $section = $(this);
            const visibleCount = $section.find('.forest-dish').filter(function () {
                return $(this).css('display') !== 'none';
            }).length;
            $section.toggle(visibleCount > 0);
        });

        const message = searchText === '' ? '' :
            (found === 0 ? 'No dishes found' : 'Found ' + found + ' dishes');

        if (message) {
            $searchResult.stop(true, true).hide().text(message).slideDown(200);
        } else {
            $searchResult.stop(true, true).slideUp(200, function () {
                $(this).text('');
            });
        }
    });

    $('#continue-to-reservation').on('click', function (event) {
        if ($(this).hasClass('disabled')) {
            // Without preventDefault(), the empty cart link would still navigate.
            event.preventDefault();
        }
    });

    // Initialize existing quantity controls and the cart.
    $('.forest-dish .quantity-minus').prop('disabled', true);
    renderCart();
});
