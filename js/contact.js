
'use strict';

// THE FOREST — CONTACT / RESERVATION
$(function () {

    if (!$('body').hasClass('contact-page')) return;
    if (window.forestContactInitialized) return;

    const $form = $('#reservation-form');
    if (!$form.length) return;

    window.forestContactInitialized = true;

    const STORAGE_KEY = 'forestPreorder';
    const SERVICE_RATE = 0.10;
    const MAX_MESSAGE_LENGTH = 300;

    const $result = $('#reservation-result');
    const $message = $('#message');

    $form.attr('novalidate', 'novalidate');

    // ====================================
    // 1. HELPERS
    // ====================================

    function formatPrice(amount) {
        return Number(amount).toLocaleString('en-US') + ' ₸';
    }

    function getToday() {
        const now = new Date();

        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');

        return `${year}-${month}-${day}`;
    }

    // ====================================
    // 2. SPECIAL REQUESTS COUNTER
    // ====================================

    function updateMessageCount() {
        let value = String($message.val() || '');

        if (value.length > MAX_MESSAGE_LENGTH) {
            value = value.slice(0, MAX_MESSAGE_LENGTH);
            $message.val(value);
        }

        $('#message-count').text(value.length);
    }

    if ($message.length) {

        $message.attr('maxlength', MAX_MESSAGE_LENGTH);

        if (!$('#message-count').length) {

            $message.after(
                $('<div>', {
                    class: 'message-counter'
                })
                    .append(
                        $('<span>', {
                            id: 'message-count'
                        }).text('0')
                    )
                    .append('/300')
            );
        }

        $message.on('input change', updateMessageCount);

        updateMessageCount();
    }

    // ====================================
    // 3. LOAD CART
    // ====================================

    function loadCart() {
        try {
            const saved = JSON.parse(
                sessionStorage.getItem(STORAGE_KEY)
            );

            if (!Array.isArray(saved)) return [];

            return saved.map(function (item) {

                return {
                    name: String(item.name || '').trim(),
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

    // ====================================
    // 4. CALCULATE TOTALS
    // ====================================

    function calculateTotals(cart) {

        const subtotal = cart.reduce(function (sum, item) {
            return sum + item.price * item.quantity;
        }, 0);

        const service = Math.round(
            subtotal * SERVICE_RATE
        );

        return {
            subtotal: subtotal,
            service: service,
            total: subtotal + service
        };
    }

    // ====================================
    // 5. FOOD IMAGE PATHS
    // ====================================

    function imagePaths(name) {

        const slug = String(name)
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-|-$/g, '');

        const alternatives = {

            'baursaki-with-chicken-pate-foie-gras-and-berry-sauce': [
                'baursaki-with-chicken-p-t-foie-gras-and-berry-sauce'
            ],

            'trout-with-spinach-red-caviar-and-cauliflower-puree': [
                'trout-with-spinach-red-caviar-and-cauliflower-pur-e',
                'trout-with-spinach-red-caviar-and-cauliflower-pure-e'
            ]
        };

        const names = [
            ...new Set([
                slug,
                ...(alternatives[slug] || [])
            ])
        ];

        const paths = [];

        names.forEach(function (filename) {

            ['jpg', 'jpeg', 'png', 'webp'].forEach(function (extension) {

                paths.push(
                    'images/food/' + filename + '.' + extension
                );
            });
        });

        return paths;
    }

    // ====================================
    // 6. CREATE FOOD THUMBNAIL
    // ====================================

    function createThumbnail(name) {

        const $img = $('<img>', {
            class: 'preorder-thumbnail',
            alt: '',
            loading: 'lazy'
        });

        const paths = imagePaths(name);
        let nextPath = 0;

        $img.on('error', function () {

            nextPath++;

            if (nextPath < paths.length) {

                $img.attr('src', paths[nextPath]);

            } else {

                $img.replaceWith(
                    $('<span>', {
                        class: 'preorder-thumbnail preorder-thumbnail-fallback',
                        'aria-hidden': 'true'
                    }).text('✦')
                );
            }
        });

        if (paths.length) {
            $img.attr('src', paths[0]);
        }

        return $img;
    }

    // ====================================
    // 7. DISPLAY PRE-ORDER
    // ====================================

    function displayPreorder() {

        const cart = loadCart();
        const $items = $('#preorder-items').empty();

        if (!cart.length) {

            $('<div>', {
                class: 'preorder-empty'
            })
                .append(
                    $('<p>').text('No dishes selected yet.')
                )
                .append(
                    $('<a>', {
                        href: 'menu.html'
                    }).text('Explore our menu')
                )
                .appendTo($items);

        } else {

            cart.forEach(function (item) {

                const $details = $('<div>', {
                    class: 'preorder-item-details'
                });

                $('<p>', {
                    class: 'preorder-item-name'
                })
                    .text(item.name)
                    .appendTo($details);

                $('<p>', {
                    class: 'preorder-item-quantity'
                })
                    .text(
                        formatPrice(item.price) +
                        ' × ' + item.quantity
                    )
                    .appendTo($details);

                $('<div>', {
                    class: 'preorder-item'
                })
                    .append(createThumbnail(item.name))
                    .append($details)
                    .append(
                        $('<strong>', {
                            class: 'preorder-item-price'
                        }).text(
                            formatPrice(
                                item.price * item.quantity
                            )
                        )
                    )
                    .appendTo($items);
            });
        }

        const totals = calculateTotals(cart);

        $('#preorder-subtotal').text(
            formatPrice(totals.subtotal)
        );

        $('#preorder-service').text(
            formatPrice(totals.service)
        );

        $('#preorder-total').text(
            formatPrice(totals.total)
        );
    }

    // ====================================
    // 8. FORM VALIDATION RULES
    // ====================================

    function getError(id) {

        const value = String(
            $('#' + id).val() || ''
        ).trim();

        // NAME
        if (id === 'name') {

            if (value.length < 2 || value.length > 80) {
                return 'Enter a name between 2 and 80 characters.';
            }
        }

        // PHONE
        if (id === 'phone') {

            const normalized = value.replace(/[\s()-]/g, '');

            if (!/^\+7\d{10}$/.test(normalized)) {
                return 'Enter a Kazakhstan number starting with +7 and 10 digits.';
            }
        }

        // EMAIL
        if (id === 'email') {

            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                return 'Enter a valid email address.';
            }
        }

        // DATE
        if (id === 'date') {

            if (!value) {
                return 'Please choose a date.';
            }

            if (value < getToday()) {
                return 'Choose today or a future date.';
            }
        }

        // TIME
        if (id === 'time') {

            if (
                !/^\d{2}:\d{2}$/.test(value) ||
                value < '11:00' ||
                value > '23:00'
            ) {
                return 'Choose a time between 11:00 and 23:00.';
            }

            if ($('#date').val() === getToday()) {

                const now = new Date();

                const currentTime =
                    String(now.getHours()).padStart(2, '0') +
                    ':' +
                    String(now.getMinutes()).padStart(2, '0');

                if (value <= currentTime) {
                    return 'Please choose a future time.';
                }
            }
        }

        // GUESTS
        if (id === 'guests') {

            const count = Number(value);

            if (
                !value ||
                !Number.isInteger(count) ||
                count < 1 ||
                count > 20
            ) {
                return 'Choose between 1 and 20 guests.';
            }
        }

        // OCCASION
        if (id === 'occasion') {

            const allowed = [
                'normal',
                'birthday',
                'corporate',
                'private'
            ];

            if (!allowed.includes(value)) {
                return 'Please choose a valid occasion.';
            }
        }

        // SPECIAL REQUESTS
        if (id === 'message') {

            if (
                String($message.val() || '').length >
                MAX_MESSAGE_LENGTH
            ) {
                return 'Maximum 300 characters.';
            }
        }

        return '';
    }

    // ====================================
    // 9. SHOW VALIDATION ERROR
    // ====================================

    function showError($field, message) {

        $field
            .addClass('is-invalid')
            .attr('aria-invalid', 'true');

        let $feedback = $field.next('.invalid-feedback');

        if (!$feedback.length) {

            $feedback = $('<div>', {
                class: 'invalid-feedback'
            }).insertAfter($field);
        }

        $feedback.text(message).show();
    }

    // ====================================
    // 10. CLEAR VALIDATION ERROR
    // ====================================

    function clearError($field) {

        $field
            .removeClass('is-invalid')
            .removeAttr('aria-invalid');

        $field.next('.invalid-feedback')
            .text('')
            .hide();
    }

    // ====================================
    // 11. VALIDATE ALL FIELDS
    // ====================================

    function validateForm() {

        let $firstInvalid = null;

        const fields = [
            'name',
            'phone',
            'email',
            'date',
            'time',
            'guests',
            'occasion',
            'message'
        ];

        fields.forEach(function (id) {

            const $field = $('#' + id);
            const error = getError(id);

            if (error) {

                showError($field, error);

                if (!$firstInvalid) {
                    $firstInvalid = $field;
                }

            } else {

                clearError($field);
            }
        });

        if ($firstInvalid) {

            $firstInvalid.trigger('focus');
            return false;
        }

        return true;
    }

    // ====================================
    // 12. LIVE VALIDATION
    // ====================================

    $form.on(
        'input change',
        'input, select, textarea',
        function () {

            const $field = $(this);
            const id = $field.attr('id');

            if ($field.hasClass('is-invalid')) {

                const error = getError(id);

                if (error) {
                    showError($field, error);
                } else {
                    clearError($field);
                }
            }

            if (
                id === 'date' &&
                $('#time').hasClass('is-invalid')
            ) {

                const error = getError('time');

                if (error) {
                    showError($('#time'), error);
                } else {
                    clearError($('#time'));
                }
            }
        }
    );

    // ====================================
    // 13. SUBMIT RESERVATION
    // ====================================

    $form.on('submit', function (event) {

        event.preventDefault();

        $result
            .empty()
            .removeClass('alert alert-danger alert-success');

        if (!validateForm()) {

            $result
                .addClass('alert alert-danger')
                .text('Please correct the highlighted fields.');

            return;
        }

        const cart = loadCart();
        const totals = calculateTotals(cart);

        const name = String($('#name').val()).trim();
        const date = $('#date').val();
        const time = $('#time').val();
        const guests = $('#guests').val();

        const occasion = $('#occasion option:selected')
            .text()
            .trim();

        const message = String(
            $message.val() || ''
        ).trim();

        const $confirmation = $('<div>');

        $('<h3>', {
            class: 'fs-5 mb-2'
        })
            .text('Reservation Preview Ready!')
            .appendTo($confirmation);

        $('<p>')
            .text('Thank you, ' + name + '!')
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Date: ' + date +
                ' | Time: ' + time +
                ' | Guests: ' + guests
            )
            .appendTo($confirmation);

        $('<p>')
            .text('Occasion: ' + occasion)
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Subtotal: ' +
                formatPrice(totals.subtotal)
            )
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Service (10%): ' +
                formatPrice(totals.service)
            )
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Pre-order total: ' +
                formatPrice(totals.total)
            )
            .appendTo($confirmation);

        if (message) {

            $('<p>')
                .text('Special requests: ' + message)
                .appendTo($confirmation);
        }

        $('<p>', {
            class: 'small mb-0'
        })
            .text(
                'Demo only: no real reservation or order has been sent.'
            )
            .appendTo($confirmation);

        $result
            .addClass('alert alert-success')
            .append($confirmation);
    });

    // Compatibility with older button-based HTML
    $('#reservation-submit[type="button"]').on(
        'click',
        function () {
            $form.trigger('submit');
        }
    );

    // ====================================
    // 14. KEEP PRE-ORDER UPDATED
    // ====================================

    $(document).on(
        'forest:cart-changed',
        displayPreorder
    );

    $('#forest-cart').on(
        'hidden.bs.offcanvas',
        displayPreorder
    );

    $(window).on('pageshow', displayPreorder);

    $(window).on('storage', function (event) {

        const original = event.originalEvent;

        if (original && original.key === STORAGE_KEY) {
            displayPreorder();
        }
    });

    // ====================================
    // 15. INITIALIZATION
    // ====================================

    $('#date').attr('min', getToday());

    displayPreorder();

});
