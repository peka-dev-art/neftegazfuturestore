const swiper = new Swiper('.product_list', {
    loop: true,
    slidesPerView: 3,
    spaceBetween: 20,
    centeredSlides: true,

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    breakpoints: {
        320:  { slidesPerView: 1 },
        480:  { slidesPerView: 2 },
        768:  { slidesPerView: 3 },
    },
});

const cartList        = document.querySelector('.cart_list');
const cartEmpty       = document.querySelector('.cart_empty');
const cartForm        = document.querySelector('.cart_form');
const checkoutBtn     = document.querySelector('.cart_checkout');
const successPopup    = document.querySelector('.success_popup');
const handleRefresh   = document.querySelector('.handle_refresh');
const toast           = document.querySelector('.toast');
const cartToggle      = document.querySelector('.cart_toggle');
const cartToggleIcon  = document.querySelector('.cart_toggle_icon');
const addressLabel    = document.getElementById('address_label');
const addressField    = document.getElementById('address_field');
const deliverySelect  = document.getElementById('delivery_select');
const phoneInput      = document.getElementById('phone_input');
const countryInput    = document.getElementById('country_input');
const emailInput      = cartForm.querySelector('[name="email"]');
const checkoutLoader  = document.querySelector('.checkout_loader');
const checkoutCircle  = document.querySelector('.checkout_circle');
const checkoutIcon    = document.querySelector('.checkout_icon');
const cart            = [];

let wasEverFilled = false;
let hovering = false;

const colours = ['Белый', 'Черный'];
const sizes   = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

const mandatoryFields = cartForm.querySelectorAll('[required]');

phoneInput.addEventListener('input', () => {
    let val = phoneInput.value;

    if (!val.startsWith('+')) {
        val = '+' + val;
    }

    const afterPlus = val.slice(1).replace(/\D/g, '');
    val = '+' + afterPlus;

    phoneInput.value = val;
    updateCheckoutState();
});

function getCounterIcon(count) {
    if (count > 9) count = 9;
    return 'counter_' + count;
}

function updateCartIcon() {
    if (cart.length === 0) {
        cartToggleIcon.textContent = wasEverFilled ? 'counter_0' : 'shopping_cart';
        return;
    }

    if (cart.length >= 9) {
        cartToggleIcon.textContent = 'trolley';
        return;
    }

    if (hovering) {
        cartToggleIcon.textContent = 'shopping_cart';
    } else {
        cartToggleIcon.textContent = getCounterIcon(cart.length);
    }
}

cartToggle.addEventListener('mouseenter', () => {
    hovering = true;
    updateCartIcon();
});

cartToggle.addEventListener('mouseleave', () => {
    hovering = false;
    updateCartIcon();
});

function showToast() {
    toast.classList.remove('hidden');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

function slideIconTo(newIcon, cb) {
    checkoutIcon.classList.add('slide-out');

    setTimeout(() => {
        checkoutIcon.textContent = newIcon;
        checkoutIcon.classList.remove('slide-out');
        checkoutIcon.style.transform = 'translateX(150%)';
        checkoutIcon.style.transition = 'none';

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                checkoutIcon.style.transition = 'transform 0.25s ease';
                checkoutIcon.style.transform = 'translateX(0)';
                if (cb) setTimeout(cb, 250);
            });
        });
    }, 250);
}

function runCheckoutAnimation() {
    checkoutLoader.classList.remove('hidden');

    checkoutCircle.classList.add('intro');

    setTimeout(() => {
        checkoutCircle.classList.remove('intro');
        checkoutCircle.style.width = '100px';
        checkoutCircle.style.height = '100px';
        checkoutCircle.style.borderRadius = '50%';

        setTimeout(() => {
            slideIconTo('shopping_bag_speed');

            setTimeout(() => {
                slideIconTo('mail');

                setTimeout(() => {
                    slideIconTo('markunread_mailbox');

                    setTimeout(() => {
                        slideIconTo('done_outline', () => {
                            checkoutIcon.style.transform = 'translateX(150%)';
                            checkoutIcon.style.transition = 'none';

                            checkoutCircle.classList.add('outro');

                            setTimeout(() => {
                                checkoutLoader.classList.add('hidden');
                                checkoutCircle.classList.remove('outro');
                                checkoutCircle.style.width = '';
                                checkoutCircle.style.height = '';
                                checkoutCircle.style.borderRadius = '';
                                checkoutCircle.style.opacity = '';
                                checkoutIcon.textContent = '';
                                checkoutIcon.style.transform = '';
                                checkoutIcon.style.transition = '';
                                successPopup.classList.remove('hidden');
                            }, 150);
                        });
                    }, 1000);
                }, 1000);
            }, 1000);
        }, 250);
    }, 150);
}

function isPhoneValid() {
    const val = phoneInput.value.trim();
    return val.startsWith('+') && val.length > 1;
}

function isEmailValid() {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
}

function allCartItemsComplete() {
    return cart.every(item => item.colour && item.size);
}

function allMandatoryFilled() {
    return Array.from(mandatoryFields).every(input => {
        if (input.closest('#address_field') && deliverySelect.value === 'manager') {
            return true;
        }
        if (input.value.trim() === '') return false;
        return true;
    }) && isPhoneValid() && isEmailValid() && allCartItemsComplete();
}

function updateCheckoutState() {
    if (cart.length === 0) {
        checkoutBtn.disabled = true;
        cartForm.classList.add('hidden');
    } else {
        cartForm.classList.remove('hidden');
        checkoutBtn.disabled = !allMandatoryFilled();
    }
}

function renderCart() {
    cartList.innerHTML = '';

    if (cart.length === 0) {
        cartEmpty.classList.remove('hidden');
        updateCheckoutState();
        updateCartIcon();
        return;
    }

    cartEmpty.classList.add('hidden');

    cart.forEach((item, index) => {
        const li = document.createElement('li');

        const colourBtns = colours.map(c =>
            `<button class="cart_opt_btn${item.colour === c ? ' selected' : ''}" type="button">${c}</button>`
        ).join('');

        const sizeBtns = sizes.map(s =>
            `<button class="cart_opt_btn${item.size === s ? ' selected' : ''}" type="button">${s}</button>`
        ).join('');

        li.innerHTML = `
            <img src="https://placehold.co/100x100/ffffff/cccccc?text=${item.id}" alt="${item.name}" width="100" height="100">
            <strong>${item.name}</strong>
            <div class="cart_item_info">
                <div class="cart_opt_row">${colourBtns}</div>
                <div class="cart_opt_row">${sizeBtns}</div>
            </div>
            <button class="cart_item_remove" data-index="${index}" type="button"><span class="material-symbols-outlined">disabled_by_default</span></button>
        `;

        cartList.appendChild(li);
    });

    document.querySelectorAll('.cart_product, .cart_list li').forEach((li, idx) => {
        const item = cart[idx];

        li.querySelectorAll('.cart_opt_btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.textContent.trim();
                if (colours.includes(val)) {
                    item.colour = val;
                } else if (sizes.includes(val)) {
                    item.size = val;
                }
                renderCart();
            });
        });
    });

    document.querySelectorAll('.cart_item_remove').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = Number(e.currentTarget.dataset.index);
            cart.splice(idx, 1);
            renderCart();
        });
    });

    updateCheckoutState();
    updateCartIcon();
}

document.querySelectorAll('.product_card').forEach(card => {
    card.addEventListener('click', () => {
        const id   = card.dataset.id;
        const name = card.querySelector('.product_name').textContent;

        cart.push({
            id,
            name,
            colour: null,
            size: null,
        });

        wasEverFilled = true;
        renderCart();
        showToast();
    });
});

renderCart();

mandatoryFields.forEach(input => {
    if (input !== phoneInput) {
        input.addEventListener('input', updateCheckoutState);
    }
});

deliverySelect.addEventListener('change', () => {
    const pickupMethods = ['sdek', 'ozon', 'wildberries'];
    if (pickupMethods.includes(deliverySelect.value)) {
        addressLabel.textContent = 'Адрес и номер пункта выдачи заказов';
        addressField.classList.remove('hidden');
        addressField.querySelector('input').required = true;
    } else if (deliverySelect.value === 'manager') {
        addressLabel.textContent = 'Адрес';
        addressField.classList.add('hidden');
        addressField.querySelector('input').required = false;
    } else {
        addressLabel.textContent = 'Адрес';
        addressField.classList.remove('hidden');
        addressField.querySelector('input').required = true;
    }
    updateCheckoutState();
});

const cartOverlay  = document.querySelector('.cart_overlay');
const cartBackdrop = document.querySelector('.cart_backdrop');

function openCart() {
    cartOverlay.classList.remove('hidden');
}

function closeCart() {
    cartOverlay.classList.add('hidden');
}

function toggleCart() {
    cartOverlay.classList.toggle('hidden');
}

cartToggle.addEventListener('click', toggleCart);
cartBackdrop.addEventListener('click', closeCart);

const animatedElements = document.querySelectorAll('.anim-fade-up');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

animatedElements.forEach(el => observer.observe(el));

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0 || !allMandatoryFilled()) {
        return;
    }

    runCheckoutAnimation();
});

handleRefresh.addEventListener('click', () => {
    successPopup.classList.add('hidden');
    closeCart();
    cart.length = 0;
    wasEverFilled = false;
    cartForm.reset();
    cartForm.querySelectorAll('input').forEach(input => {
        input.value = '';
    });
    countryInput.value = 'Россия';
    phoneInput.value = '+7';
    addressLabel.textContent = 'Адрес';
    addressField.classList.remove('hidden');
    addressField.querySelector('input').required = true;
    deliverySelect.value = '';
    sessionStorage.clear();
    renderCart();
});

const cookieNotice  = document.querySelector('.cookie_notice');
const cookieDismiss = document.querySelector('.cookie_dismiss');

function dismissCookie() {
    cookieNotice.classList.add('dismissed');
}

cookieDismiss.addEventListener('click', dismissCookie);

setTimeout(dismissCookie, 7000);
