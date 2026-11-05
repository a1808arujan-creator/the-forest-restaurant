
'use strict';

$(function () {
    if (!$('body').hasClass('menu-page') || window.forestMenuInitialized) return;
    window.forestMenuInitialized = true;

    const STORAGE_KEY = 'forestPreorder';
    const PHOTO_FOLDER = 'images/food/';
    const menuData = [];
    let cart = [];

    function photoPath(name) {
        const filename = name
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        return PHOTO_FOLDER + filename + '.jpg';
    }

    function formatPrice(value) {
        return Number(value).toLocaleString('en-US') + ' ₸';
    }

    function makeCard(dish) {
        const $column = $('<div>', {
            class: 'col-12 col-md-6 col-lg-4 dish-column'
        });

        const $card = $('<div>', {
            class: 'card h-100 border-0 shadow-sm rounded-3 overflow-hidden'
        });

        const $photo = $('<div>', {
            class: 'ratio ratio-4x3 bg-light'
        });

        const $placeholder = $('<div>', {
            class: 'd-flex align-items-center justify-content-center text-muted small'
        }).text('Photo coming soon');

        const $image = $('<img>', {
            alt: dish.name,
            loading: 'lazy',
            class: 'w-100 h-100 object-fit-cover'
        });

        $image.on('load', function () {
            $placeholder.hide();
        });

        $image.on('error', function () {
            $image.hide();
            $placeholder.show();
        });

        $photo.append($placeholder, $image);
        $image.attr('src', photoPath(dish.name));

        const $body = $('<div>', {
            class: 'card-body d-flex flex-column'
        });

        $('<h3>', {
            class: 'card-title h5'
        }).text(dish.name).appendTo($body);

        $('<p>', {
            class: 'fw-semibold mb-3'
        }).text(formatPrice(dish.price)).appendTo($body);

        const $controls = $('<div>', {
            class: 'mt-auto'
        });

        const $quantity = $('<div>', {
            class: 'd-flex align-items-center gap-3 mb-3'
        });

        $('<button>', {
            type: 'button',
            class: 'btn btn-outline-secondary btn-sm quantity-change',
            'data-change': -1,
            'aria-label': 'Decrease quantity'
        })
        .text('−')
        .prop('disabled', true)
        .appendTo($quantity);

        $('<span>', {
            class: 'quantity-value fw-bold'
        }).text('1').appendTo($quantity);

        $('<button>', {
            type: 'button',
            class: 'btn btn-outline-secondary btn-sm quantity-change',
            'data-change': 1,
            'aria-label': 'Increase quantity'
        })
        .text('+')
        .appendTo($quantity);

        $controls.append($quantity);

        $('<button>', {
            type: 'button',
            class: 'btn btn-forest w-100 add-to-cart',
            'data-name': dish.name,
            'data-price': dish.price
        })
        .text('Add to Cart')
        .appendTo($controls);

        $('<p>', {
            class: 'small text-success mt-2 mb-0 add-message',
            role: 'status'
        })
        .hide()
        .appendTo($controls);

        $body.append($controls);
        $card.append($photo, $body);

        return $column.append($card);
    }

    function buildMenu() {
        $('.menu-section').each(function () {
            const $section = $(this);
            const $table = $section.find('table.menu-table').first();

            if (!$table.length) return;

            const category = {
                id: $section.attr('id'),
                dishes: []
            };

            const $grid = $('<div>', {
                class: 'row g-4 dish-grid'
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

                if (!name || !priceText || !Number.isFinite(price)) return;

                const dish = {
                    name: name,
                    price: price
                };

                category.dishes.push(dish);
                $grid.append(makeCard(dish));
            });

            if (category.dishes.length) {
                menuData.push(category);

                $table
                    .closest('.table-responsive')
                    .replaceWith($grid);
            }
        });
    }

    function buildSearch() {
        const $row = $('<div>', {
            class: 'row justify-content-center mb-4'
        });

        const $box = $('<div>', {
            class: 'col-12 col-md-8 col-lg-6'
        });

        const $input = $('<input>', {
            type: 'search',
            id: 'menu-search',
            class: 'form-control',
            placeholder: 'Search dishes...',
            'aria-label': 'Search dishes'
        });

        const $result = $('<p>', {
            class: 'small text-muted mt-2',
            'aria-live': 'polite'
        }).hide();

        $box.append($input, $result);
        $row.append($box);

        $('.menu-categories .container > h2')
            .first()
            .after($row);

        $input.on('input', function () {
            const query = String($(this).val())
                .trim()
                .toLowerCase();

            let found = 0;

            $('.dish-column').each(function () {
                const $column = $(this);
                const name = $column.find('.add-to-cart')
                    .attr('data-name') || '';

                const matches = name.toLowerCase().includes(query);

                $column.toggle(matches);

                if (matches) found++;
            });

            $('.menu-section').each(function () {
                const visible = $(this)
                    .find('.dish-column')
                    .filter(function () {
                        return $(this).css('display') !== 'none';
                    }).length > 0;

                $(this).toggle(visible);
            });

            if (!query) {
                $result.stop(true, true).slideUp(200);
            } else {
                $result
                    .stop(true, true)
                    .hide()
                    .text(
                        found
                            ? 'Found ' + found + ' dishes'
                            : 'No dishes found'
                    )
                    .slideDown(200);
            }
        });
    }

    function buildCart() {
        const $open = $('<button>', {
            type: 'button',
            class: 'btn btn-forest position-fixed bottom-0 end-0 m-3 rounded-pill shadow-lg z-3 d-flex align-items-center gap-2',
            'data-bs-toggle': 'offcanvas',
            'data-bs-target': '#forest-cart',
            'aria-controls': 'forest-cart',
            'aria-label': 'Open shopping cart'
        }).text('🛒 Cart');

        $('<span>', {
            id: 'cart-count',
            class: 'badge rounded-pill bg-light text-dark'
        })
        .text('0')
        .appendTo($open);

        const $panel = $('<div>', {
            id: 'forest-cart',
            class: 'offcanvas offcanvas-end',
            tabindex: '-1',
            'aria-labelledby': 'forest-cart-title'
        });

        const $header = $('<div>', {
            class: 'offcanvas-header'
        });

        $('<h2>', {
            id: 'forest-cart-title',
            class: 'offcanvas-title h4'
        })
        .text('Your Order')
        .appendTo($header);

        $('<button>', {
            type: 'button',
            class: 'btn-close',
            'data-bs-dismiss': 'offcanvas',
            'aria-label': 'Close cart'
        }).appendTo($header);

        const $body = $('<div>', {
            class: 'offcanvas-body d-flex flex-column'
        });

        $('<div>', {
            id: 'cart-items',
            class: 'flex-grow-1'
        }).appendTo($body);

        const $footer = $('<div>', {
            class: 'border-top pt-3 mt-3'
        });

        function addTotalRow(label, id, strong) {
            const $row = $('<div>', {
                class: 'd-flex justify-content-between mb-2'
            });

            $('<span>')
                .text(label)
                .appendTo($row);

            const $value = $(strong ? '<strong>' : '<span>');

            $value
                .attr('id', id)
                .text('0 ₸')
                .appendTo($row);

            $footer.append($row);
        }

        addTotalRow('Subtotal', 'cart-subtotal', false);
        addTotalRow('Service (10%)', 'cart-service', false);
        addTotalRow('Total', 'cart-total', true);

        $('<a>', {
            id: 'continue-to-reservation',
            class: 'btn btn-forest w-100 mt-3',
            href: 'contact.html#reservation'
        })
        .text('Continue to Reservation')
        .appendTo($footer);

        $('<p>', {
            id: 'cart-message',
            class: 'small text-success mt-2',
            role: 'status'
        })
        .hide()
        .appendTo($footer);

        $body.append($footer);
        $panel.append($header, $body);

        $('body').append($open, $panel);
    }

    function loadCart() {
        try {
            const saved = JSON.parse(
                sessionStorage.getItem(STORAGE_KEY)
            );

            if (!Array.isArray(saved)) return;

            cart = saved.map(function (item) {
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
            cart = [];
        }
    }

    function saveCart() {
        sessionStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cart)
        );
    }

    function changeQuantity(index, delta) {
        if (!Number.isInteger(index) || !cart[index]) return;

        cart[index].quantity += delta;

        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }

        saveCart();
        renderCart();
    }

    function renderCart() {
        const $items = $('#cart-items').empty();

        let subtotal = 0;
        let quantity = 0;

        if (!cart.length) {
            $('<p>', {
                class: 'text-muted'
            })
            .text('Your cart is empty.')
            .appendTo($items);
        }

        cart.forEach(function (item, index) {
            subtotal += item.price * item.quantity;
            quantity += item.quantity;

            const $row = $('<div>', {
                class: 'border-bottom pb-3 mb-3'
            });

            $('<strong>', {
                class: 'd-block'
            })
            .text(item.name)
            .appendTo($row);

            $('<p>', {
                class: 'small text-muted mb-2'
            })
            .text(formatPrice(item.price * item.quantity))
            .appendTo($row);

            const $actions = $('<div>', {
                class: 'd-flex align-items-center gap-2 flex-wrap'
            });

            function cartButton(text, action, cssClass) {
                $('<button>', {
                    type: 'button',
                    class: 'btn btn-sm ' + cssClass,
                    'data-action': action,
                    'data-index': index
                })
                .text(text)
                .appendTo($actions);
            }

            cartButton('−', 'minus', 'btn-outline-secondary');

            $('<span>', {
                class: 'fw-semibold'
            })
            .text(item.quantity)
            .appendTo($actions);

            cartButton('+', 'plus', 'btn-outline-secondary');
            cartButton('Remove', 'remove', 'btn-outline-danger');

            $row.append($actions).appendTo($items);
        });

        if (cart.length) {
            $('<button>', {
                type: 'button',
                class: 'btn btn-outline-danger btn-sm',
                id: 'clear-cart'
            })
            .text('Clear Cart')
            .appendTo($items);
        }

        const service = Math.round(subtotal * 0.1);

        $('#cart-subtotal').text(formatPrice(subtotal));
        $('#cart-service').text(formatPrice(service));
        $('#cart-total').text(formatPrice(subtotal + service));
        $('#cart-count').text(quantity);

        $('#continue-to-reservation')
            .toggleClass('disabled', !cart.length)
            .attr('aria-disabled', String(!cart.length));
    }

    function buildPriceSort() {
        const $select = $(`
            <select class="form-select">
                <option value="default">Default order</option>
                <option value="asc">Price: Low to High</option>
                <option value="desc">Price: High to Low</option>
            </select>
        `);

        const $box = $('<div>', {
            class: 'col-12 col-md-6 mb-4'
        }).append($select);

        const $row = $('<div>', {
            class: 'row justify-content-center'
        }).append($box);

        $('#menu-search').closest('.row').after($row);

        $('.dish-grid').each(function () {
            $(this).children('.dish-column').each(function (index) {
                $(this).data('originalIndex', index);
            });
        });

        $select.on('change', function () {
            const order = $(this).val();

            $('.dish-grid').each(function () {
                const $grid = $(this);
                const cards = $grid.children('.dish-column').get();

                cards.sort(function (a, b) {
                    if (order === 'default') {
                        return $(a).data('originalIndex') -
                               $(b).data('originalIndex');
                    }

                    const priceA = Number(
                        $(a).find('.add-to-cart').attr('data-price')
                    );

                    const priceB = Number(
                        $(b).find('.add-to-cart').attr('data-price')
                    );

                    return order === 'asc'
                        ? priceA - priceB
                        : priceB - priceA;
                });

                cards.forEach(function (card) {
                    $grid.append(card);
                });
            });
        });
    }

    buildMenu();
    buildSearch();
    buildPriceSort();
    buildCart();
    loadCart();
    renderCart();

    $('.menu-section').on('click', '.quantity-change', function () {
        const $card = $(this).closest('.card');
        const $value = $card.find('.quantity-value');

        const change = Number(
            $(this).attr('data-change')
        );

        const number = Math.max(
            1,
            Number($value.text()) + change
        );

        $value.text(number);

        $card.find('[data-change="-1"]')
            .prop('disabled', number === 1);
    });

    $('.menu-section').on('click', '.add-to-cart', function () {
        const $button = $(this);
        const $card = $button.closest('.card');

        const name = String(
            $button.attr('data-name')
        );

        const price = Number(
            $button.attr('data-price')
        );

        const quantity = Number(
            $card.find('.quantity-value').text()
        ) || 1;

        const existing = cart.find(function (item) {
            return item.name === name;
        });

        if (existing) {
            existing.quantity += quantity;
        } else {
            cart.push({
                name: name,
                price: price,
                quantity: quantity
            });
        }

        saveCart();
        renderCart();

        $card.find('.quantity-value').text('1');

        $card.find('[data-change="-1"]')
            .prop('disabled', true);

        $card.find('.add-message')
            .stop(true, true)
            .hide()
            .text('Added to your cart: ' + quantity)
            .slideDown(200);
    });

    $('#cart-items').on('click', '[data-action]', function () {
        const index = Number(
            $(this).attr('data-index')
        );

        const action = $(this).attr('data-action');

        if (action === 'plus') {
            changeQuantity(index, 1);
        }

        if (action === 'minus') {
            changeQuantity(index, -1);
        }

        if (action === 'remove' && cart[index]) {
            cart.splice(index, 1);
            saveCart();
            renderCart();
        }
    });

    $('#cart-items').on('click', '#clear-cart', function () {
        cart = [];
        saveCart();
        renderCart();

        $('#cart-message')
            .stop(true, true)
            .hide()
            .text('Your cart has been cleared.')
            .fadeIn(250);
    });

    $('#continue-to-reservation').on('click', function (event) {
        if (!cart.length) {
            event.preventDefault();
        }
    });
});
