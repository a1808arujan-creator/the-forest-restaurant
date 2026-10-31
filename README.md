
# The Forest — Restaurant Website

## Project Overview

The Forest is a responsive restaurant website developed for the Introduction to Web Technologies course.

The project allows visitors to explore the restaurant menu, search for dishes, manage a pre-order cart, and prepare a demonstration table reservation request.

The website is a frontend project. No real reservations or payments are processed.

## Technologies Used

- HTML5 — page structure and semantic elements
- CSS3 — custom website styling
- Bootstrap 5.3.8 — responsive layout and components
- JavaScript — application logic and calculations
- jQuery 3.7.1 — DOM manipulation, events, effects, and validation
- sessionStorage — temporary storage of pre-order items

## Website Pages

- `index.html` — Home page
- `menu.html` — Menu, dish search, and shopping cart
- `gallery.html` — Restaurant gallery
- `contact.html` — Contact information and reservation form

## Assignment 4 — jQuery Implementation

This assignment continues the existing restaurant project without creating a new repository or changing the project theme.

The main objective is to replace selected Vanilla JavaScript functionality with jQuery and demonstrate selectors, traversal, chaining, DOM manipulation, event handling, delegation, effects, and form validation.

### 1. Rewritten JavaScript Features

The following features were rewritten using jQuery:

**Feature 1: Menu Search**

- Search dishes by name.
- Hide dishes that do not match the search.
- Hide categories without matching dishes.
- Display the number of search results.
- Create the search input dynamically using jQuery.

Main methods: `.on()`, `.val()`, `.each()`, `.find()`, `.toggle()`, `.text()`, `.slideDown()`, `.slideUp()`.

**Feature 2: Shopping Cart**

- Add dishes to the cart.
- Increase or decrease quantities.
- Remove individual dishes.
- Clear the entire cart.
- Calculate subtotal, service charge, and final total.
- Save pre-order items in `sessionStorage`.
- Generate cart elements dynamically.

Main methods: `.on()`, `.append()`, `.appendTo()`, `.empty()`, `.html()`, `.text()`, `.attr()`, `.prop()`.

**Feature 3: Pre-order Display**

- Load selected dishes from `sessionStorage`.
- Display item names, quantities, and prices.
- Show subtotal, 10% service charge, and final total.

Main methods: `.empty()`, `.appendTo()`, `.text()`.

**Feature 4: Reservation Form Validation**

- Validate name length.
- Validate phone number format.
- Validate email address format.
- Reject past reservation dates.
- Validate reservation time.
- Validate the number of guests (1–20).
- Validate occasion and special request fields.
- Display field-specific error messages.
- Clear errors when invalid fields are corrected.
- Show a demonstration confirmation after successful validation.
- Reset the form after successful validation.

Main methods: `.val()`, `.on()`, `.addClass()`, `.removeClass()`, `.find()`, `.parent()`, `.fadeIn()`.

The new email input is created dynamically through jQuery.

### 2. Selectors and Traversal

The project demonstrates:

- ID selectors: `$('#name')`
- Class selectors: `$('.forest-dish')`
- Element selectors: `$('input')`
- Attribute selectors: `$('button[data-name]')`
- Filtering selectors: `:first`, `:selected`
- Traversal: `.find()`, `.closest()`, `.parent()`, `.siblings()`, `.each()`

### 3. DOM Manipulation

The implementation uses:

- `.text()` — update text safely
- `.html()` — insert fixed HTML content
- `.val()` — read form values
- `.attr()` — access HTML attributes
- `.prop()` — update element properties
- `.append()` / `.appendTo()` — create and insert elements
- `.empty()` — clear existing content
- `.addClass()` / `.removeClass()` / `.toggleClass()` / `.hasClass()` — manage CSS classes

Cart rows, buttons, search elements, and the email field are created dynamically using jQuery.

### 4. Events and Event Delegation

Events are registered using `.on()`.

Event types include:

- `click` — cart buttons and form submission button
- `input` — menu search and form fields
- `change` — form field changes
- `submit` — reservation form submission

Event delegation is used for dynamically generated cart buttons.

For example, a click handler is attached to the existing `#cart-items` container, allowing newly generated buttons to work without separate event listeners.

`event.preventDefault()` is used to prevent unwanted browser navigation or native form submission.

### 5. jQuery Effects

The project uses the following effects:

- `.fadeIn()` — display cart messages and reservation confirmation
- `.slideDown()` — reveal search results and validation errors
- `.slideUp()` — hide messages or errors

Custom animation durations and completion callbacks are also demonstrated.

### 6. Method Chaining

Multiple jQuery methods are called in a single chain.

Example:

```javascript
$cartResult
    .stop(true, true)
    .hide()
    .text(message)
    .fadeIn(250);
```

This chain stops previous animations, hides the element, updates its text, and displays it with an animation.

### 7. Client-Side Form Validation

The reservation form is validated before displaying confirmation.

Validation errors are shown next to their corresponding fields, and users can correct them without reloading the page.

HTML form attributes such as `required`, `min`, and `max` provide additional information.

Client-side validation is not a replacement for server-side validation. A production reservation system would require backend validation.

### 8. Vanilla JavaScript Comparison

Original versions of the rewritten functionality are preserved in:

`js/old-js-version.js`

This file is kept for comparison and is not connected to the website.

Compared with Vanilla JavaScript, jQuery provides shorter syntax for DOM selection, element creation, event handling, and effects.

### 9. HTML/CSS Freeze

The existing project structure and styling are preserved.

New interactive elements required for this assignment are created dynamically through JavaScript and jQuery instead of being added manually to HTML.

No new custom CSS rules are required for the jQuery features.

## Project Files

```text
The-Forest/
├── index.html
├── menu.html
├── gallery.html
├── contact.html
├── style.css
├── preorder.css
├── menu-cards-compact.css
├── floating-cart.css
├── images/
├── js/
│   ├── main.js
│   ├── menu.js
│   ├── contact.js
│   └── old-js-version.js
└── README.md
```

## How to Run

1. Clone or download the repository.
2. Open the project folder in Visual Studio Code.
3. Start Live Server.
4. Open `index.html` or `menu.html`.
5. Explore the menu and add dishes to the cart.
6. Continue to `contact.html` to review the pre-order and test the reservation form.

An internet connection is needed to load jQuery and Bootstrap from their CDNs.

Use the same Live Server origin for both pages so `sessionStorage` can preserve the cart during navigation.

## Testing

The project should be tested for:

- Menu search and category filtering
- Adding and removing cart items
- Quantity changes
- Subtotal and 10% service charge calculations
- Pre-order persistence between Menu and Contact
- Required and invalid form fields
- Successful demonstration reservation requests
- Browser console errors

## AI Usage

AI assistance was used for code explanation, jQuery migration, debugging, and reviewing assignment requirements, as permitted by the current instructor.

The project includes a separate AI usage log documenting assistance.

## Notes

This website is an educational demonstration. No backend service, actual restaurant reservation, or online payment is connected.
