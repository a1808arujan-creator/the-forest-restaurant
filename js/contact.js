
'use strict';

$(function () {
    if (window.forestContactInitialized) return;
    window.forestContactInitialized = true;

    const STORAGE_KEY = 'forestPreorder';
    const SERVICE_RATE = 0.10;

    const $form = $('#reservation-form');
    const $submitButton = $('#reservation-submit');
    const $result = $('#reservation-result');
    const $preorderItems = $('#preorder-items');
    const $preorderTotal = $('#preorder-total');

    
    if ($('#email').length === 0) {
        const $emailGroup = $('<div>', {
            class: 'mb-3'
        });

        $('<label>', {
            class: 'form-label',
            for: 'email'
        })
            .text('Email')
            .appendTo($emailGroup);

        $('<input>', {
            type: 'email',
            id: 'email',
            name: 'email',
            class: 'form-control',
            placeholder: 'Your email'
        })
            .prop('required', true)
            .appendTo($emailGroup);

        $('#phone')
            .closest('.mb-3')
            .after($emailGroup);
    }

   
    function loadCart() {
        try {
            const saved = JSON.parse(
                sessionStorage.getItem(STORAGE_KEY)
            );

            if (Array.isArray(saved)) {
                return saved.filter(function (item) {
                    return item &&
                        typeof item.name === 'string' &&
                        Number.isFinite(item.price) &&
                        item.price >= 0 &&
                        Number.isInteger(item.quantity) &&
                        item.quantity > 0;
                });
            }
        } catch (error) {
            
        }

        return [];
    }

    const cart = loadCart();

    function formatPrice(price) {
        return price.toLocaleString('en-US') + ' ₸';
    }

   
    function calculateSubtotal(items) {
        let total = 0;

        $.each(items, function (index, item) {
            total += item.price * item.quantity;
        });

        return total;
    }

    
    function calculateServiceCharge(items) {
        return Math.round(
            calculateSubtotal(items) * SERVICE_RATE
        );
    }


    function calculateFinalTotal(items) {
        return calculateSubtotal(items) +
            calculateServiceCharge(items);
    }

    
    function createPriceBreakdown() {
        if ($('#preorder-subtotal').length > 0) {
            return;
        }

        const $subtotalRow = $('<p>', {
            class: 'mb-2'
        });

        $('<span>')
            .text('Subtotal: ')
            .appendTo($subtotalRow);

        $('<strong>', {
            id: 'preorder-subtotal'
        })
            .text('0 ₸')
            .appendTo($subtotalRow);

        const $serviceRow = $('<p>', {
            class: 'mb-2'
        });

        $('<span>')
            .text('Service Charge (10%): ')
            .appendTo($serviceRow);

        $('<strong>', {
            id: 'preorder-service'
        })
            .text('0 ₸')
            .appendTo($serviceRow);


        $preorderTotal
            .closest('p')
            .before($subtotalRow, $serviceRow);
    }

    function displayPreorder() {
        $preorderItems.empty();

        if (cart.length === 0) {
            $('<p>', {
                class: 'text-muted'
            })
                .text(
                    'No dishes selected. You can still reserve a table.'
                )
                .appendTo($preorderItems);
        } else {
            $.each(cart, function (index, item) {
                const $row = $('<div>', {
                    class: 'd-flex justify-content-between gap-3 mb-2'
                });

                $('<span>')
                    .text(item.name + ' × ' + item.quantity)
                    .appendTo($row);

                $('<strong>')
                    .text(
                        formatPrice(
                            item.price * item.quantity
                        )
                    )
                    .appendTo($row);

                $preorderItems.append($row);
            });
        }

       
        $('#preorder-subtotal').text(
            formatPrice(calculateSubtotal(cart))
        );

        $('#preorder-service').text(
            formatPrice(calculateServiceCharge(cart))
        );

        $preorderTotal.text(
            formatPrice(calculateFinalTotal(cart))
        );
    }

    
    function showError($input, message) {
        $input
            .addClass('is-invalid')
            .attr('aria-invalid', 'true');

        const $parent = $input.parent();

        let $feedback = $parent.find(
            '.invalid-feedback:first'
        );

        if (!$feedback.length) {
            $feedback = $('<div>', {
                class: 'invalid-feedback'
            });

            $parent.append($feedback);
        }

        $feedback
            .stop(true, true)
            .hide()
            .text(message)
            .slideDown(180);
    }

    
    function clearError($input) {
        $input
            .removeClass('is-invalid')
            .attr('aria-invalid', 'false');

        $input
            .parent()
            .find('.invalid-feedback')
            .stop(true, true)
            .slideUp(150);
    }


    function getToday() {
        const now = new Date();

        return now.getFullYear() + '-' +
            String(now.getMonth() + 1).padStart(2, '0') +
            '-' +
            String(now.getDate()).padStart(2, '0');
    }

    
    function validationMessage(id) {
        const value = String(
            $('#' + id).val() || ''
        ).trim();

        
        if (id === 'name') {
            return (
                value.length >= 2 &&
                value.length <= 80
            ) ? '' :
                'Please enter a name (2–80 characters).';
        }

        
        if (id === 'phone') {
            const digits = value.replace(/\D/g, '');

            const validFormat =
                /^\+?[\d\s()-]+$/.test(value);

            return (
                validFormat &&
                digits.length >= 10 &&
                digits.length <= 15
            ) ? '' :
                'Please enter a valid phone number.';
        }

     
        if (id === 'email') {
            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            return emailPattern.test(value) ? '' :
                'Please enter a valid email address.';
        }

      
        if (id === 'date') {
            if (!value) {
                return 'Please select a date.';
            }

            if (value < getToday()) {
                return 'Please choose today or a future date.';
            }

            return '';
        }

        if (id === 'time') {
            if (!value) {
                return 'Please select a time.';
            }

            if (
                !/^\d{2}:\d{2}$/.test(value) ||
                value < '11:00' ||
                value > '23:00'
            ) {
                return 'Please choose a time between 11:00 and 23:00.';
            }

            if (
                String($('#date').val()) === getToday()
            ) {
                const now = new Date();

                const currentTime =
                    String(now.getHours()).padStart(2, '0') +
                    ':' +
                    String(now.getMinutes()).padStart(2, '0');

                if (value <= currentTime) {
                    return 'Please choose a future time.';
                }
            }

            return '';
        }

        
        if (id === 'guests') {
            const guests = Number(value);

            return (
                value !== '' &&
                Number.isInteger(guests) &&
                guests >= 1 &&
                guests <= 20
            ) ? '' :
                'Please enter between 1 and 20 guests.';
        }

        
        if (id === 'occasion') {
            const allowed = [
                'normal',
                'birthday',
                'corporate',
                'private'
            ];

            return allowed.includes(value) ? '' :
                'Please select an occasion.';
        }

    
        if (id === 'message') {
            return value.length <= 500 ? '' :
                'Please use at most 500 characters.';
        }

        return '';
    }

    
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

        $.each(fields, function (index, id) {
            const $input = $('#' + id);
            const error = validationMessage(id);

            if (error) {
                showError($input, error);

                if ($firstInvalid === null) {
                    $firstInvalid = $input;
                }
            } else {
                clearError($input);
            }
        });

        if ($firstInvalid !== null) {
            $firstInvalid.trigger('focus');
            return false;
        }

        return true;
    }

    
    function generateReference() {
        return 'FOREST-' + Math.floor(
            100000 + Math.random() * 900000
        );
    }

    
    function submitReservation() {
        $result
            .stop(true, true)
            .empty();

        if (!validateForm()) {
            $result
                .removeClass('alert-success')
                .addClass('alert alert-danger')
                .hide()
                .text(
                    'Please correct the highlighted fields.'
                )
                .fadeIn(250);

            return;
        }

        const name = String(
            $('#name').val()
        ).trim();

        const date = String(
            $('#date').val()
        );

        const time = String(
            $('#time').val()
        );

        const guests = String(
            $('#guests').val()
        );

        const message = String(
            $('#message').val() || ''
        ).trim();

        const occasionText = $('#occasion')
            .find('option:selected')
            .text();

        const $confirmation = $('<div>');

        $('<h3>', {
            class: 'fs-5 mb-3'
        })
            .text('Reservation Request Prepared!')
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Thank you, ' + name +
                '! Your demonstration request is ready.'
            )
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Reference: ' + generateReference()
            )
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Date: ' + date +
                ' | Time: ' + time +
                ' | Guests: ' + guests
            )
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Occasion: ' + occasionText
            )
            .appendTo($confirmation);

     
        $('<p>')
            .text(
                'Subtotal: ' +
                formatPrice(calculateSubtotal(cart))
            )
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Service Charge (10%): ' +
                formatPrice(calculateServiceCharge(cart))
            )
            .appendTo($confirmation);

        $('<p>')
            .text(
                'Pre-order total: ' +
                formatPrice(calculateFinalTotal(cart))
            )
            .appendTo($confirmation);

        if (message) {
            $('<p>')
                .text(
                    'Special requests: ' + message
                )
                .appendTo($confirmation);
        }

        $('<p>', {
            class: 'small mb-0'
        })
            .text(
                'This is a website demonstration. ' +
                'No real reservation or food order has been sent.'
            )
            .appendTo($confirmation);

        
        $result
            .removeClass('alert-danger')
            .addClass('alert alert-success')
            .hide()
            .append($confirmation)
            .fadeIn(300, function () {
                $(this).attr('role', 'status');
            });

        
        $form.trigger('reset');

        $form
            .find('.is-invalid')
            .removeClass('is-invalid');

        $form
            .find('.invalid-feedback')
            .stop(true, true)
            .hide()
            .text('');
    }

    
    $form.on(
        'input change',
        'input, select, textarea',
        function () {
            const $input = $(this);

            if (
                $input.hasClass('is-invalid') &&
                !validationMessage(
                    String($input.attr('id'))
                )
            ) {
                clearError($input);
            }
        }
    );

    
    $form.on('submit', function (event) {
        event.preventDefault();
        submitReservation();
    });

    
    $submitButton.on('click', function (event) {
        event.preventDefault();
        submitReservation();
    });

    
    $('#date').attr('min', getToday());

    
    createPriceBreakdown();
    displayPreorder();
});
