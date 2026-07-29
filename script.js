const colours = ['Белый', 'Синий'];
const sizes   = ['XS', 'S', 'M', 'L', 'XL'];

const products = {
    1: { name: 'Добыча',    genders: ['Мужская', 'Женская'] },
    2: { name: 'Инженер',   genders: ['Мужская', 'Женская'] },
    3: { name: 'Вернадский', genders: ['Мужская', 'Женская'] },
    4: { name: 'Порода',    genders: ['Женская'] },
    5: { name: 'Нефть',     genders: ['Мужская', 'Женская'] },
};

function getGenderCode(gender) {
    return gender === 'Мужская' ? 'муж' : 'жен';
}

function getColourCode(colour) {
    return colour === 'Белый' ? 'белый' : 'син';
}

function getProductImage(productId, gender, colour) {
    const p = products[productId];
    const g = gender || p.genders[0];
    const c = colour || 'Белый';
    return 'assets/t-shirt/' + getGenderCode(g) + '_' + getColourCode(c) + '_' + p.name + '.jpg';
}

function getAvailableGenders(productId) {
    return products[productId].genders;
}

function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function buildSwiperSlides() {
    const wrapper = document.querySelector('.product_list .swiper-wrapper');
    const trackTop = document.getElementById('scroll_track_top');
    const trackBottom = document.getElementById('scroll_track_bottom');
    wrapper.innerHTML = '';
    if (trackTop) trackTop.innerHTML = '';
    if (trackBottom) trackBottom.innerHTML = '';

    const cards = [];

    Object.keys(products).forEach(id => {
        const p = products[id];
        const gender = pickRandom(p.genders);
        const colour = pickRandom(colours);
        const imgSrc = getProductImage(id, gender, colour);

        const slide = document.createElement('div');
        slide.className = 'swiper-slide product_card';
        slide.dataset.id = id;
        slide.style.setProperty('--highlight', colour === 'Белый' ? '#0044cc' : '#fff');
        slide.innerHTML = '<img src="' + imgSrc + '" alt="' + p.name + '" width="200" height="200"><span class="product_name">' + p.name + ' ' + (gender === 'Мужская' ? 'М' : 'Ж') + ' ' + colour.toLowerCase() + '</span>';
        wrapper.appendChild(slide);

        const card = document.createElement('div');
        card.className = 'product_card';
        card.dataset.id = id;
        card.style.setProperty('--highlight', colour === 'Белый' ? '#0044cc' : '#fff');
        card.innerHTML = '<img src="' + imgSrc + '" alt="' + p.name + '" width="200" height="200">';
        cards.push(card);
    });

    if (trackTop && trackBottom) {
        const doubleCards = [...cards, ...cards, ...cards];
        doubleCards.forEach(c => trackTop.appendChild(c.cloneNode(true)));
        doubleCards.forEach(c => trackBottom.appendChild(c.cloneNode(true)));
    }
}

buildSwiperSlides();

const swiper = new Swiper('.product_list', {
    loop: true,
    slidesPerView: 3,
    spaceBetween: 20,
    centeredSlides: false,
    loop: false,
    slidesPerView: 5,

    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },

    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },

    breakpoints: {
        320:  { slidesPerView: 1, centeredSlides: true, loop: true },
        480:  { slidesPerView: 2, centeredSlides: true, loop: true },
        768:  { slidesPerView: 3, centeredSlides: true, loop: true },
    },
});

emailjs.init('-0gW1CNbKMXPdX22p');

const introScreen  = document.getElementById('intro_screen');
const fadeOverlay  = document.getElementById('fade_overlay');
const mainSite     = document.getElementById('main_site');

function skipIntro() {
    clearTimeout(introScreen._t1);
    clearTimeout(introScreen._t2);
    clearTimeout(introScreen._t3);
    introScreen.style.display = 'none';
    fadeOverlay.classList.remove('active');
    fadeOverlay.style.display = 'none';
    mainSite.classList.remove('hidden', 'fading_in');
    mainSite.classList.add('visible');
    introScreen._skipped = true;
    setTimeout(() => swiper.update(), 100);
}

if (sessionStorage.getItem('skipIntro')) {
    sessionStorage.removeItem('skipIntro');
    skipIntro();
} else {
    introScreen.addEventListener('click', skipIntro, { once: true });
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            skipIntro();
        }
    }, { once: true });

    const skipBtn = document.getElementById('intro_skip');
    if (skipBtn) skipBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        skipIntro();
    });

    introScreen._t1 = setTimeout(() => {
        if (introScreen._skipped) return;
        fadeOverlay.classList.add('active');
    }, 10000);

    introScreen._t2 = setTimeout(() => {
        if (introScreen._skipped) return;
        introScreen.style.display = 'none';
        mainSite.classList.remove('hidden');
        mainSite.classList.add('fading_in');

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                mainSite.classList.add('visible');
                fadeOverlay.classList.remove('active');
            });
        });
    }, 11000);

    introScreen._t3 = setTimeout(() => {
        if (introScreen._skipped) return;
        fadeOverlay.style.display = 'none';
        mainSite.classList.remove('fading_in');
    }, 12000);
}

function shuffleIcons() {
    document.querySelectorAll('.bg-icon').forEach(icon => {
        icon.style.animation = 'none';
        icon.offsetHeight;
        icon.style.top = (Math.random() * 90) + '%';
        icon.style.left = (Math.random() * 90) + '%';
        icon.style.fontSize = (30 + Math.random() * 50) + 'px';
        icon.style.animation = 'iconGlow 4s ease-in-out infinite';
    });
}

shuffleIcons();
setInterval(shuffleIcons, 4000);

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
const sizeChartPopup  = document.getElementById('size_chart_popup');
const cart            = [];

let wasEverFilled = false;
let hovering = false;

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
    return cart.every(item => item.colour && item.size && item.gender);
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
        const imgSrc = getProductImage(item.productId, item.gender, item.colour);
        const availableGenders = getAvailableGenders(item.productId);

        const colourBtns = colours.map(c =>
            '<button class="cart_opt_btn' + (item.colour === c ? ' selected' : '') + '" type="button">' + c + '</button>'
        ).join('');

        const sizeBtns = sizes.map(s =>
            '<button class="cart_opt_btn' + (item.size === s ? ' selected' : '') + '" type="button">' + s + '</button>'
        ).join('');

        const genderBtns = availableGenders.map(g =>
            '<button class="cart_opt_btn' + (item.gender === g ? ' selected' : '') + '" type="button">' + g + '</button>'
        ).join('');

        li.innerHTML =
            '<img src="' + imgSrc + '" alt="' + item.name + '" width="100" height="100">' +
            '<div class="cart_item_main">' +
                '<strong>' + item.name + '</strong>' +
                '<div class="cart_item_info">' +
                    '<div class="cart_opt_row">' + colourBtns + '</div>' +
                    '<div class="cart_opt_row">' + sizeBtns + '</div>' +
                    '<div class="cart_opt_row">' + genderBtns + '</div>' +
                '</div>' +
            '</div>' +
            '<button class="cart_item_remove" data-index="' + index + '" type="button"><span class="material-symbols-outlined">disabled_by_default</span></button>';

        cartList.appendChild(li);
    });

    document.querySelectorAll('.cart_list li').forEach((li, idx) => {
        const item = cart[idx];
        const availableGenders = getAvailableGenders(item.productId);

        li.querySelectorAll('.cart_opt_btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const val = btn.textContent.trim();
                if (colours.includes(val)) {
                    item.colour = val;
                } else if (sizes.includes(val)) {
                    item.size = val;
                } else if (availableGenders.includes(val)) {
                    item.gender = val;
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
    card.addEventListener('mouseenter', (e) => {
        if (swiper.autoplay) swiper.autoplay.stop();
    });
    card.addEventListener('mouseleave', () => {
        if (swiper.autoplay) swiper.autoplay.start();
    });
    card.addEventListener('mousemove', (e) => {
        const section = card.closest('.swiper_section');
        if (!section) return;
        const rect = section.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        section.style.setProperty('--glare-x', x + '%');
        section.style.setProperty('--glare-y', y + '%');
    });
    card.addEventListener('click', () => {
        const id = card.dataset.id;
        const p = products[id];

        if (window.innerWidth > 1180) {
            card.classList.add('dissolving');

            card.addEventListener('animationend', () => {
                card.classList.remove('dissolving');
                card.classList.add('removed');
                setTimeout(() => card.remove(), 500);
            }, { once: true });
        }

        cart.push({
            productId: id,
            name: p.name,
            colour: null,
            size: null,
            gender: id === '4' ? 'Женская' : null,
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

function updateDeliveryOptions() {
    const isRussia = countryInput.value.trim() === 'Россия';

    if (isRussia) {
        deliverySelect.innerHTML =
            '<option value="">Выберите способ</option>' +
            '<option value="pochta">Почта России</option>' +
            '<option value="sdek">СДЕК</option>' +
            '<option value="ozon">Озон Доставка</option>' +
            '<option value="wildberries">Wildberries</option>' +
            '<option value="manager">Уточнить у менеджера</option>';
    } else {
        deliverySelect.innerHTML =
            '<option value="">Выберите способ</option>' +
            '<option value="pochta">Почта России / EMS</option>' +
            '<option value="manager">Уточнить у менеджера</option>';
    }

    addressLabel.textContent = 'Адрес';
    addressField.classList.remove('hidden');
    addressField.querySelector('input').required = true;
    updateCheckoutState();
}

countryInput.addEventListener('input', updateDeliveryOptions);

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
    cartToggle.classList.add('cart_open');
    if (window.innerWidth <= 1180) cartToggleIcon.textContent = 'arrow_back';
}

function closeCart() {
    cartOverlay.classList.add('hidden');
    cartToggle.classList.remove('cart_open');
    if (window.innerWidth <= 1180) updateCartIcon();
}

function toggleCart() {
    cartOverlay.classList.toggle('hidden');
    const isOpen = !cartOverlay.classList.contains('hidden');
    cartToggle.classList.toggle('cart_open', isOpen);
    if (window.innerWidth <= 1180) {
        cartToggleIcon.textContent = isOpen ? 'arrow_back' : 'shopping_cart';
        if (!isOpen) updateCartIcon();
    }
}

cartToggle.addEventListener('click', toggleCart);
cartBackdrop.addEventListener('click', closeCart);

const animatedElements = document.querySelectorAll('.anim-fade-up');

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const delay = parseInt(entry.target.dataset.delay) || 0;
            setTimeout(() => {
                entry.target.classList.add('is-visible');
            }, delay);
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

animatedElements.forEach(el => observer.observe(el));

checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0 || !allMandatoryFilled()) {
        return;
    }

    const orders = cart.map(item => ({
        name: item.name,
        colour: item.colour || '—',
        size: item.size || '—',
        gender: item.gender || '—',
        image_url: window.location.origin + '/' + getProductImage(item.productId, item.gender, item.colour),
    }));

    const params = {
        orders: orders,
        name: cartForm.querySelector('[name="name"]').value,
        email: cartForm.querySelector('[name="email"]').value,
        phone: phoneInput.value,
        country: countryInput.value,
        city: cartForm.querySelector('[name="city"]').value,
        delivery: deliverySelect.options[deliverySelect.selectedIndex].text,
        address: cartForm.querySelector('[name="address"]').value || '—',
    };

    emailjs.send('service_yj5p2tg', 'template_ajjn1a4', params)
        .then(() => {
            runCheckoutAnimation();
        })
        .catch((err) => {
            console.error('EmailJS error:', err);
            runCheckoutAnimation();
        });
});

handleRefresh.addEventListener('click', () => {
    sessionStorage.setItem('skipIntro', 'true');
    location.reload();
});

const cookieNotice  = document.querySelector('.cookie_notice');
const cookieDismiss = document.querySelector('.cookie_dismiss');

function dismissCookie() {
    cookieNotice.classList.add('dismissed');
}

cookieDismiss.addEventListener('click', dismissCookie);

setTimeout(dismissCookie, 7000);

const runningTitle = document.getElementById('running_title');
const heroBanner   = document.getElementById('hero_banner');

document.querySelector('.size_chart_link').addEventListener('click', (e) => {
    e.preventDefault();
    sizeChartPopup.classList.remove('hidden');
});

document.querySelector('.size_chart_backdrop').addEventListener('click', () => {
    sizeChartPopup.classList.add('hidden');
});

document.querySelector('.size_chart_close').addEventListener('click', () => {
    sizeChartPopup.classList.add('hidden');
});
