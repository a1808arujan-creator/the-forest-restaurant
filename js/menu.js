
'use strict';

const STORAGE_KEY = 'forestPreorder';

const dishes = document.querySelectorAll('.forest-dish');
const categories = document.querySelectorAll('.menu-section');

const cartItems = document.getElementById('cart-items');
const cartTotal = document.getElementById('cart-total');
const cartSubtotal = document.getElementById('cart-subtotal');
const cartService = document.getElementById('cart-service');
const cartNavLink = document.getElementById('cart-nav-link');
const cartResult = document.getElementById('cart-result');
const continueButton = document.getElementById('continue-to-reservation');

const searchInput = document.getElementById('menu-search');
const searchResult = document.getElementById('search-result');

let cart = [];

try {
    const savedCart = JSON.parse(sessionStorage.getItem(STORAGE_KEY));

    if (Array.isArray(savedCart)) {
        cart = savedCart;
    }
} catch (error) {
    cart = [];
}


function saveCart() {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

function formatPrice(price) {
    return price.toLocaleString('en-US') + ' ₸';
}


function calculateTotal() {
    let total = 0;

    cart.forEach(function (item) {
        total += item.price * item.quantity;
    });

    return total;
}


function calculateServiceCharge() {
    return Math.round(calculateTotal() * 0.10);
}


function calculateFinalTotal() {
    return calculateTotal() + calculateServiceCharge();
}


function calculateQuantity() {
    let quantity = 0;

    cart.forEach(function (item) {
        quantity += item.quantity;
    });

    return quantity;
}


function addToCart(name, price, quantity) {
    const existingItem = cart.find(function (item) {
        return item.name === name;
    });

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            name: name,
            price: price,
            quantity: quantity
        });
    }

    saveCart();
    renderCart();
}

// Change quantity
function changeCartQuantity(index, change) {
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    saveCart();
    renderCart();
}

// Remove dish
function removeFromCart(index) {
    cart.splice(index, 1);

    saveCart();
    renderCart();
}

// Clear cart
function clearCart() {
    cart = [];

    saveCart();
    renderCart();

    if (cartResult) {
        cartResult.textContent = 'Your cart has been cleared.';
    }
}

// Display cart
function renderCart() {
    cartItems.replaceChildren();

    if (cart.length === 0) {
        const message = document.createElement('p');

        message.textContent = 'Your pre-order is currently empty.';
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
            price.textContent = formatPrice(item.price * item.quantity);

            information.appendChild(name);
            information.appendChild(price);

            const actions = document.createElement('div');
            actions.className = 'd-flex align-items-center gap-2';

            // Minus button
            const minusButton = document.createElement('button');
            minusButton.type = 'button';
            minusButton.className = 'btn btn-outline-dark btn-sm';
            minusButton.textContent = '−';
            minusButton.setAttribute(
                'aria-label',
                'Decrease ' + item.name
            );

            // Quantity
            const quantity = document.createElement('span');
            quantity.textContent = item.quantity;

            // Plus button
            const plusButton = document.createElement('button');
            plusButton.type = 'button';
            plusButton.className = 'btn btn-outline-dark btn-sm';
            plusButton.textContent = '+';
            plusButton.setAttribute(
                'aria-label',
                'Increase ' + item.name
            );

            // Remove button
            const removeButton = document.createElement('button');
            removeButton.type = 'button';
            removeButton.className = 'btn btn-outline-danger btn-sm';
            removeButton.textContent = 'Remove';

            minusButton.addEventListener('click', function () {
                changeCartQuantity(index, -1);
            });

            plusButton.addEventListener('click', function () {
                changeCartQuantity(index, 1);
            });

            removeButton.addEventListener('click', function () {
                removeFromCart(index);
            });

            actions.appendChild(minusButton);
            actions.appendChild(quantity);
            actions.appendChild(plusButton);
            actions.appendChild(removeButton);

            row.appendChild(information);
            row.appendChild(actions);

            cartItems.appendChild(row);
        });

        // Clear cart button
        const clearButton = document.createElement('button');
        clearButton.type = 'button';
        clearButton.className = 'btn btn-outline-danger btn-sm mt-2';
        clearButton.textContent = 'Clear Cart';

        clearButton.addEventListener('click', clearCart);

        cartItems.appendChild(clearButton);
    }

    // Update subtotal
    if (cartSubtotal) {
        cartSubtotal.textContent = formatPrice(calculateTotal());
    }

    // Update service charge
    if (cartService) {
        cartService.textContent = formatPrice(calculateServiceCharge());
    }

    // Update final total
    if (cartTotal) {
        cartTotal.textContent = formatPrice(calculateFinalTotal());
    }

    // Update cart navigation
    if (cartNavLink) {
        cartNavLink.textContent = 'Cart (' + calculateQuantity() + ')';
    }

    // Reservation button
    if (continueButton) {
        continueButton.classList.toggle('disabled', cart.length === 0);
        continueButton.setAttribute(
            'aria-disabled',
            String(cart.length === 0)
        );
    }
}

// Dish buttons
dishes.forEach(function (dish) {
    const minusButton = dish.querySelector('.quantity-minus');
    const plusButton = dish.querySelector('.quantity-plus');
    const quantityValue = dish.querySelector('.quantity-value');
    const addButton = dish.querySelector('.add-to-cart');

    let quantity = 1;

    plusButton.addEventListener('click', function () {
        quantity++;
        quantityValue.textContent = quantity;
    });

    minusButton.addEventListener('click', function () {
        if (quantity > 1) {
            quantity--;
            quantityValue.textContent = quantity;
        }
    });

    addButton.addEventListener('click', function () {
        const name = addButton.dataset.name.replace(/^🍽\s*/, '');
        const price = Number(addButton.dataset.price);

        addToCart(name, price, quantity);

        if (cartResult) {
            cartResult.textContent =
                name + ' × ' + quantity + ' added to your cart.';
        }

        quantity = 1;
        quantityValue.textContent = quantity;
    });
});

// Search dishes and hide empty categories
if (searchInput) {
    searchInput.addEventListener('input', function () {
        const searchText = searchInput.value.trim().toLowerCase();

        let found = 0;

        // Show or hide each dish
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

        // Hide categories without matching dishes
        categories.forEach(function (category) {
            const categoryDishes = category.querySelectorAll('.forest-dish');

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

        // Show search result message
        if (searchResult) {
            if (searchText === '') {
                searchResult.textContent = '';
            } else if (found === 0) {
                searchResult.textContent = 'No dishes found';
            } else {
                searchResult.textContent = 'Found ' + found + ' dishes';
            }
        }
    });
}

// Display cart when page loads
renderCart();

