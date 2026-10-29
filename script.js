'use strict';

// 1. Helper functions and current page
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));
const page = location.pathname.split('/').pop() || 'index.html';

// 2. Navigation and mobile menu
$$('[data-nav]').forEach((link) => {
    if (link.dataset.nav === page) {
        link.setAttribute('aria-current', 'page');
    }
});

$('.menu-toggle')?.addEventListener('click', () => {
    const button = $('.menu-toggle');
    const isOpen = button.getAttribute('aria-expanded') !== 'true';
    button.setAttribute('aria-expanded', String(isOpen));
    $('#main-nav').classList.toggle('open', isOpen);
});

// 3. Shopping cart: save products in the browser
const cartKey = 'bean-boutique-cart-kenya-v1';
const formatPrice = (amount) => 'KSh ' + Number(amount).toLocaleString('en-KE', {minimumFractionDigits: 2, maximumFractionDigits: 2});

function getCart() {
    try {
        const cart = JSON.parse(localStorage.getItem(cartKey) || '[]');
        return Array.isArray(cart) ? cart : [];
    } catch {
        return [];
    }
}

function saveCart(cart) {
    localStorage.setItem(cartKey, JSON.stringify(cart));
    updateCount();
}

function updateCount() {
    const count = getCart().reduce((total, item) => total + item.qty, 0);
    $('#basket-count').textContent = count;
}

updateCount();

$$('.add-cart').forEach((button) => {
    button.addEventListener('click', () => {
        const cart = getCart();
        const item = cart.find((product) => product.name === button.dataset.name);

        if (item) {
            item.qty++;
        } else {
            cart.push({
                name: button.dataset.name,
                price: Number(button.dataset.price),
                qty: 1
            });
        }

        saveCart(cart);
        const originalText = button.textContent;
        button.textContent = 'Added ✓';
        setTimeout(() => { button.textContent = originalText; }, 1300);
    });
});

// 4. Display the basket and quantity buttons
function renderCart() {
    const container = $('#cart-items');
    if (!container) return;

    const cart = getCart();
    container.replaceChildren();

    if (cart.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'Your basket is empty. Explore our coffee and equipment to get started.';
        container.append(message);
    }

    cart.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'cart-row';

        const title = document.createElement('strong');
        title.textContent = item.name;

        const price = document.createElement('span');
        price.textContent = formatPrice(item.price * item.qty);

        const minus = document.createElement('button');
        minus.textContent = '−';
        minus.setAttribute('aria-label', `Decrease ${item.name}`);
        minus.addEventListener('click', () => {
            item.qty--;
            if (item.qty === 0) cart.splice(index, 1);
            saveCart(cart);
            renderCart();
        });

        const quantity = document.createElement('span');
        quantity.textContent = ` Quantity: ${item.qty} `;

        const plus = document.createElement('button');
        plus.textContent = '+';
        plus.setAttribute('aria-label', `Increase ${item.name}`);
        plus.addEventListener('click', () => {
            item.qty++;
            saveCart(cart);
            renderCart();
        });

        const remove = document.createElement('button');
        remove.textContent = 'Remove';
        remove.addEventListener('click', () => {
            cart.splice(index, 1);
            saveCart(cart);
            renderCart();
        });

        row.append(title, price, minus, quantity, plus, remove);
        container.append(row);
    });

    const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    $('#cart-total').textContent = `Subtotal: ${formatPrice(total)}`;
}

renderCart();

// 5. Coffee catalogue search
const search = $('#coffee-search');

search?.addEventListener('input', () => {
    const term = search.value.trim().toLowerCase();
    let count = 0;

    $$('.product').forEach((card) => {
        const matches = card.textContent.toLowerCase().includes(term);
        card.hidden = !matches;
        if (matches) count++;
    });

    $('#search-status').textContent =
        `${count} coffee${count === 1 ? '' : 's'} found` +
        (term ? ` for “${search.value}”` : '');
});

// 6. Homepage featured slideshow
const slides = [
    ['House Harmony', 'Our comforting signature blend.'],
    ['Brewing Basics', 'Join a friendly hands-on workshop.'],
    ['Monthly Coffee Club', 'Fresh discoveries delivered regularly.']
];

let currentSlide = 0;

function renderSlide() {
    const content = $('#slide-content');
    if (!content) return;

    const heading = document.createElement('h3');
    const paragraph = document.createElement('p');
    heading.textContent = slides[currentSlide][0];
    paragraph.textContent = slides[currentSlide][1];

    content.replaceChildren(heading, paragraph);
    $('#slide-count').textContent = `${currentSlide + 1} / ${slides.length}`;
}

$('#prev-slide')?.addEventListener('click', () => {
    currentSlide = (currentSlide + slides.length - 1) % slides.length;
    renderSlide();
});

$('#next-slide')?.addEventListener('click', () => {
    currentSlide = (currentSlide + 1) % slides.length;
    renderSlide();
});

// 7. First-visit newsletter popup
const modal = $('#signup-modal');

function openModal() {
    if (modal && !modal.open) modal.showModal();
}

$('.close-modal')?.addEventListener('click', () => modal.close());
$('#show-signup')?.addEventListener('click', openModal);

if (page === 'index.html' && !sessionStorage.getItem('bean-welcome-seen')) {
    sessionStorage.setItem('bean-welcome-seen', '1');
    openModal();
}

$('#signup-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    $('#signup-result').textContent =
        'Thank you! Your demonstration welcome code is BEAN10. No email has been sent or saved.';
    event.target.reset();
});

// 8. Workshop registration by email draft
$$('.register').forEach((button) => {
    button.addEventListener('click', () => {
        $('#event-choice').value = button.dataset.event;
        $('#registration').scrollIntoView({ behavior: 'smooth' });
        $('#first-name').focus({ preventScroll: true });
    });
});

$('#event-form')?.addEventListener('submit', (event) => {
    event.preventDefault();

    const selectedEvent = $('#event-choice').value;
    const firstName = $('#first-name').value.trim();
    const lastName = $('#last-name').value.trim();
    const email = $('#event-email').value.trim();

    if (!selectedEvent || !firstName || !lastName || !email ||
        !event.target.reportValidity()) return;

    const subject = encodeURIComponent('Bean Boutique event interest: ' + selectedEvent);
    const body = encodeURIComponent(
        `Event: ${selectedEvent}\nName: ${firstName} ${lastName}\nEmail: ${email}\n\nPlease confirm availability.`
    );

    $('#event-message').textContent =
        'Your email app will open with a draft. Please send it yourself. ' +
        'The address is a placeholder and must be replaced by the client.';

    location.href = `mailto:hello@example.com?subject=${subject}&body=${body}`;
});

// 9. Subscription interest
$$('.plan-button').forEach((button) => {
    button.addEventListener('click', () => {
        location.href = 'mailto:hello@example.com?subject=' +
            encodeURIComponent('Subscription interest: ' + button.dataset.plan);
    });
});

// 10. Share widget (native sharing or clipboard fallback)
$('#share-page')?.addEventListener('click', async () => {
    try {
        if (navigator.share) {
            await navigator.share({ title: 'Bean Boutique coffee', url: location.href });
        } else if (navigator.clipboard) {
            await navigator.clipboard.writeText(location.href);
            $('#share-status').textContent = 'Page link copied.';
        } else {
            $('#share-status').textContent =
                'Copy this page address from your browser to share it.';
        }
    } catch {
        $('#share-status').textContent = 'Sharing was cancelled or unavailable.';
    }
});
