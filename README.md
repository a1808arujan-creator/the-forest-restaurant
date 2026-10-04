# The Forest Restaurant Website

## About the Project

The Forest is a responsive multi-page restaurant website created for the
Introduction to Web Technologies course.

The project is based on The Forest restaurant in Ust-Kamenogorsk, Kazakhstan.
The website allows visitors to explore the restaurant, view the menu,
see the restaurant's atmosphere and spaces, find contact information,
and prepare a table reservation request.

The website uses Bootstrap for responsive layout and reusable interface
components, while custom CSS is used for the restaurant's visual style.

---

## Pages

The website contains four main pages:

### 1. Home — `index.html`

The Home page introduces The Forest restaurant and its atmosphere.

It includes:
- Hero section
- Information about the restaurant
- Reasons to visit The Forest
- Gallery preview
- Contact information
- Links to the menu, gallery and reservation section

### 2. Menu — `menu.html`

The Menu page presents restaurant dishes and prices.

Menu categories include:
- Cold Starters
- Salads
- Fish
- Soups
- Side Dishes
- Baursaki
- Traditional Bakery
- Dough Dishes

Visitors can use category navigation to move directly to different
sections of the menu.

### 3. Gallery — `gallery.html`

The Gallery page presents the atmosphere and different spaces of
The Forest restaurant.

It includes:
- Interior
- VIP rooms
- Exterior

The page also provides a link to the reservation section for visitors
who want to book a table.

### 4. Contact — `contact.html`

The Contact page provides practical restaurant information.

It includes:
- Phone number
- Address
- Opening hours
- Instagram
- Restaurant image
- Table reservation form

The reservation form collects the visitor's name, phone number,
preferred date and time, number of guests, occasion and special requests.

---

## Technologies

The project uses:

- HTML5 for page structure and semantic markup
- CSS3 for custom styling
- Bootstrap 5.3 for responsive layout, grid, spacing, forms,
  buttons, tables and utility classes

JavaScript functionality is not implemented in the midterm version.
The HTML structure is prepared for JavaScript functionality that will
be added in later assignments.

---

## Responsive Design

The website follows a responsive design approach.

Bootstrap's grid system is used to adapt the layout to different
screen sizes, including:

- Mobile phones
- Tablets
- Desktop computers

Classes such as `container`, `row`, `col-12`, `col-md-6`,
`col-lg-3`, responsive spacing utilities and flex utilities are
used throughout the project.

---

## JavaScript Readiness

Although JavaScript is not implemented in the midterm version,
the website structure is prepared for future interaction.

Interactive elements have consistent IDs and classes so that
JavaScript can find and modify them later.

The reservation form includes a dedicated result area for future
confirmation or error messages.

CSS state classes are also prepared for future states such as:

- hidden
- active
- selected
- error
- success

---

# User Journeys

## Journey 1 — Explore the Menu

**Start:** Home page

1. The visitor opens the Home page.
2. The visitor selects "View Menu".
3. The Menu page opens.
4. The visitor chooses a menu category.
5. The visitor views dishes and prices.

**End:** The visitor finds the restaurant's food options and prices.

---

## Journey 2 — Explore the Restaurant

**Start:** Home page

1. The visitor opens the Home page.
2. The visitor selects "Gallery".
3. The Gallery page opens.
4. The visitor explores the restaurant interior.
5. The visitor views the VIP rooms and exterior.

**End:** The visitor understands the atmosphere and available spaces
at The Forest.

---

## Journey 3 — Prepare a Table Reservation

**Start:** Home page

1. The visitor selects "Book a Table".
2. The browser opens the reservation section on the Contact page.
3. The visitor enters their name and phone number.
4. The visitor chooses a date and preferred time.
5. The visitor selects the number of guests and occasion.
6. The visitor can enter special requests.
7. The visitor selects "Send Request".
8. The page contains a dedicated area for a future reservation
   confirmation message.

**End:** The visitor completes the reservation request flow.

In the midterm version, no backend or JavaScript processing is
implemented. Visitors are informed that actual reservations should
be confirmed by phone.

---

## Navigation

All pages use the same navigation structure:

- Home
- Menu
- Gallery
- Contact

Every main page can be reached from every other page through the
navigation menu.

---

## Real Content

The website uses restaurant-specific content, including:

- Restaurant menu and prices
- Opening hours
- Phone number
- Address
- Restaurant photographs

Placeholder content is not used in the final midterm version.

---

## Quality Pass

Before submission, the website is tested on desktop and mobile screen sizes.

The quality check includes:

- Navigation links
- Internal section links
- Images
- Reservation form structure
- Mobile responsiveness
- Horizontal overflow
- Browser console
- HTML validation
- Consistent navigation and footer

Any problems found during testing are documented and fixed before
the final midterm submission.

---

## Author

Baktiyarova Aruzhan  
Group: SE-2533

Introduction to Web Technologies 1