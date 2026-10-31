
'use strict';

/*
 * THE FOREST — OLD VANILLA JAVASCRIPT VERSION
 *
 * These are the original implementations before jQuery.
 *
 * Rewritten features:
 * 1. Menu search
 * 2. Cart rendering
 * 3. Reservation form validation
 *
 * This file is kept for comparison only.
 * DO NOT connect this file to any HTML page.
 */

// ============================================
// 1. OLD MENU SEARCH — VANILLA JAVASCRIPT
// ============================================

function oldMenuSearch() {
    const dishes = document.querySelectorAll('.forest-dish');
    const categories = document.querySelectorAll('.menu-section');

    const searchInput = document.getElementById('menu-search');
    const searchResult = document.getElementById('search-result');

    if (searchInput) {
        searchInput.addEventListener('input', function () {
            const searchText = searchInput.value.trim().toLowerCase();

            let found = 0;

            dishes.forEach(function (dish) {
                const addButton = dish.querySelector('.add-to-cart');
                const name = addButton.dataset.name.toLowerCase();

                if (name.includes(searchText)) {
                    dish.style.display = '';
                    found++;
                } else {
                    dish.style.display = 'none';
                }
            });

            categories.forEach(function (category) {
                const categoryDishes =
                    category.querySelectorAll('.forest-dish');

                let hasMatches = false;

                categoryDishes.forEach(function (dish) {
                    if (dish.style.display !== 'none') {
                        hasMatches = true;
                    }
                });

                if (hasMatches) {
                    category.style.display = '';
                } else {
                    category.style.display = 'none';
                }
            });

            if (searchResult) {
                if (searchText === '') {
                    searchResult.textContent = '';
                } else if (found === 0) {
                    searchResult.textContent = 'No dishes found';
                } else {
                    searchResult.textContent =
                        'Found ' + found + ' dishes';
                }
            }
        });
    }
}

/*
 * COMPARISON:
 *
 * Vanilla JS:
 * - document.querySelectorAll()
 * - addEventListener()
 * - forEach()
 * - style.display
 * - textContent
 *
 * jQuery:
 * - $('.forest-dish')
 * - .on()
 * - .each()
 * - .toggle()
 * - .text()
 *
 * jQuery makes element selection and visibility
 * manipulation shorter and easier to chain.
 */


// ============================================
// 2. OLD CART RENDERING — VANILLA JAVASCRIPT
// ============================================

// Original function depends on the cart array,
// formatPrice(), calculateTotal(),
// calculateServiceCharge(),
// calculateFinalTotal(), calculateQuantity(),
// changeCartQuantity(), removeFromCart()
// and clearCart() from the old menu.js.

function renderCart() {
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartService = document.getElementById('cart-service');
    const cartTotal = document.getElementById('cart-total');
    const cartNavLink = document.getElementById('cart-nav-link');
    const continueButton =
        document.getElementById('continue-to-reservation');

    cartItems.replaceChildren();

    if (cart.length === 0) {
        const message = document.createElement('p');

        message.textContent =
            'Your pre-order is currently empty.';

        cartItems.appendChild(message);
    } else {
        cart.forEach(function (item, index) {
            const row = document.createElement('div');

            row.className =
                'd-flex flex-wrap justify-content-between align-items-center gap-3 mb-3';

            const information = document.createElement('div');

            const name = document.createElement('strong');
            name.textContent = item.name;

            const price = document.createElement('p');
            price.className = 'mb-0';
            price.textContent =
                formatPrice(item.price * item.quantity);

            information.appendChild(name);
            information.appendChild(price);

            const actions = document.createElement('div');
            actions.className =
                'd-flex align-items-center gap-2';

            const minusButton =
                document.createElement('button');

            minusButton.type = 'button';
            minusButton.className =
                'btn btn-outline-dark btn-sm';
            minusButton.textContent = '−';

            minusButton.setAttribute(
                'aria-label',
                'Decrease ' + item.name
            );

            const quantity = document.createElement('span');
            quantity.textContent = item.quantity;

            const plusButton =
                document.createElement('button');

            plusButton.type = 'button';
            plusButton.className =
                'btn btn-outline-dark btn-sm';
            plusButton.textContent = '+';

            plusButton.setAttribute(
                'aria-label',
                'Increase ' + item.name
            );

            const removeButton =
                document.createElement('button');

            removeButton.type = 'button';
            removeButton.className =
                'btn btn-outline-danger btn-sm';
            removeButton.textContent = 'Remove';

            minusButton.addEventListener(
                'click',
                function () {
                    changeCartQuantity(index, -1);
                }
            );

            plusButton.addEventListener(
                'click',
                function () {
                    changeCartQuantity(index, 1);
                }
            );

            removeButton.addEventListener(
                'click',
                function () {
                    removeFromCart(index);
                }
            );

            actions.appendChild(minusButton);
            actions.appendChild(quantity);
            actions.appendChild(plusButton);
            actions.appendChild(removeButton);

            row.appendChild(information);
            row.appendChild(actions);

            cartItems.appendChild(row);
        });

        const clearButton = document.createElement('button');

        clearButton.type = 'button';
        clearButton.className =
            'btn btn-outline-danger btn-sm mt-2';
        clearButton.textContent = 'Clear Cart';

        clearButton.addEventListener('click', clearCart);

        cartItems.appendChild(clearButton);
    }

    if (cartSubtotal) {
        cartSubtotal.textContent =
            formatPrice(calculateTotal());
    }

    if (cartService) {
        cartService.textContent =
            formatPrice(calculateServiceCharge());
    }

    if (cartTotal) {
        cartTotal.textContent =
            formatPrice(calculateFinalTotal());
    }

    if (cartNavLink) {
        cartNavLink.textContent =
            'Cart (' + calculateQuantity() + ')';
    }

    if (continueButton) {
        continueButton.classList.toggle(
            'disabled',
            cart.length === 0
        );

        continueButton.setAttribute(
            'aria-disabled',
            String(cart.length === 0)
        );
    }
}

/*
 * COMPARISON:
 *
 * Vanilla JS:
 * - document.createElement()
 * - appendChild()
 * - replaceChildren()
 * - addEventListener()
 * - classList.toggle()
 *
 * jQuery:
 * - $('<div>')
 * - .append()
 * - .empty()
 * - .on() with event delegation
 * - .toggleClass()
 *
 * jQuery reduces repetitive DOM manipulation.
 * Event delegation also handles newly created
 * buttons without attaching separate listeners.
 */


// ============================================
// 3. OLD FORM VALIDATION — VANILLA JAVASCRIPT
// ============================================

function oldShowError(input, message) {
    input.classList.add('is-invalid');

    let feedback = input.parentElement.querySelector(
        '.invalid-feedback'
    );

    if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback';

        input.parentElement.appendChild(feedback);
    }

    feedback.textContent = message;
}

function oldClearError(input) {
    input.classList.remove('is-invalid');

    const feedback = input.parentElement.querySelector(
        '.invalid-feedback'
    );

    if (feedback) {
        feedback.textContent = '';
    }
}

function oldGetToday() {
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');

    return year + '-' + month + '-' + day;
}

function validateForm() {
    const nameInput = document.getElementById('name');
    const phoneInput = document.getElementById('phone');
    const dateInput = document.getElementById('date');
    const timeInput = document.getElementById('time');
    const guestsInput = document.getElementById('guests');

    const inputs = [
        nameInput,
        phoneInput,
        dateInput,
        timeInput,
        guestsInput
    ];

    inputs.forEach(oldClearError);

    let firstInvalid = null;

    function invalidate(input, message) {
        oldShowError(input, message);

        if (!firstInvalid) {
            firstInvalid = input;
        }
    }

    const name = nameInput.value.trim();
    const phone = phoneInput.value.trim();
    const date = dateInput.value;
    const time = timeInput.value;
    const guests = Number(guestsInput.value);

    if (name.length < 2) {
        invalidate(
            nameInput,
            'Please enter your name (at least 2 characters).'
        );
    }

    const phoneDigits = phone.replace(/\D/g, '');

    if (
        phoneDigits.length < 10 ||
        phoneDigits.length > 15
    ) {
        invalidate(
            phoneInput,
            'Please enter a valid phone number.'
        );
    }

    if (!date) {
        invalidate(
            dateInput,
            'Please select a date.'
        );
    } else if (date < oldGetToday()) {
        invalidate(
            dateInput,
            'Please choose today or a future date.'
        );
    }

    if (!time) {
        invalidate(
            timeInput,
            'Please select a time.'
        );
    } else if (
        time < '11:00' ||
        time > '23:00'
    ) {
        invalidate(
            timeInput,
            'Please select a time between 11:00 and 23:00.'
        );
    } else if (date === oldGetToday()) {
        const now = new Date();

        const currentTime =
            String(now.getHours()).padStart(2, '0') +
            ':' +
            String(now.getMinutes()).padStart(2, '0');

        if (time <= currentTime) {
            invalidate(
                timeInput,
                'Please choose a future time.'
            );
        }
    }

    if (
        guestsInput.value.trim() === '' ||
        !Number.isInteger(guests) ||
        guests < 1 ||
        guests > 20
    ) {
        invalidate(
            guestsInput,
            'Please enter between 1 and 20 guests.'
        );
    }

    if (firstInvalid) {
        firstInvalid.focus();
        return false;
    }

    return true;
}

/*
 * COMPARISON:
 *
 * Vanilla JS:
 * - document.getElementById()
 * - input.value
 * - classList.add()
 * - classList.remove()
 * - parentElement.querySelector()
 * - input.focus()
 *
 * jQuery:
 * - $('#name')
 * - .val()
 * - .addClass()
 * - .removeClass()
 * - .parent().find()
 * - .trigger('focus')
 *
 * jQuery makes DOM selection and error display
 * more concise and supports visual effects.
 *
 * The new jQuery version also validates email.
 *
 * Client-side validation improves usability,
 * but server-side validation is still necessary
 * in a real application.
 */
