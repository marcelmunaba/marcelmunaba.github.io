// Build mailto links at runtime so addresses never appear in the markup
function setupEmailLinks(root) {
    root.querySelectorAll('a[data-email-user]').forEach(link => {
        link.href = 'mailto:' + link.dataset.emailUser + '@' + link.dataset.emailDomain;
    });
}

// Live Munich time in the hero bar
function startClock(el) {
    if (!el) return;
    const format = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Berlin',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const tick = () => {
        const now = new Date();
        el.textContent = format.format(now);
        el.dateTime = now.toISOString();
    };
    tick();
    setInterval(tick, 1000);
}

// Fade elements in as they scroll into view
function setupReveal() {
    const items = document.querySelectorAll('[data-reveal]');
    if (!('IntersectionObserver' in window)) {
        items.forEach(item => item.classList.add('is-visible'));
        return;
    }
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(item => observer.observe(item));
}

// Border under the top bar once the page scrolls, and highlight the current section
function setupTopbar() {
    const bar = document.getElementById('topbar');
    if (!bar) return;
    const onScroll = () => bar.classList.toggle('is-scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!('IntersectionObserver' in window)) return;
    const links = new Map();
    bar.querySelectorAll('.topbar__nav a[href^="#"]').forEach(link => {
        const section = document.querySelector(link.getAttribute('href'));
        if (section) links.set(section, link);
    });
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const link = links.get(entry.target);
            if (entry.isIntersecting) {
                links.forEach(l => l.removeAttribute('aria-current'));
                link.setAttribute('aria-current', 'true');
            } else if (link.hasAttribute('aria-current')) {
                link.removeAttribute('aria-current');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, section) => observer.observe(section));
}

// Project screenshot carousels: arrow buttons (wrapping around) and a slide counter.
// Swiping and trackpad scrolling work natively through CSS scroll snapping.
function setupCarousels() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const pad = n => String(n).padStart(2, '0');

    document.querySelectorAll('.carousel').forEach(carousel => {
        const track = carousel.querySelector('.carousel__track');
        const count = carousel.querySelector('.carousel__count');
        const total = track.children.length;
        const current = () => Math.round(track.scrollLeft / track.clientWidth);

        const goTo = index => {
            const target = (index + total) % total;
            track.scrollTo({ left: target * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
        };

        carousel.querySelectorAll('.carousel__btn').forEach(button => {
            button.addEventListener('click', () => goTo(current() + Number(button.dataset.dir)));
        });

        let frame;
        track.addEventListener('scroll', () => {
            cancelAnimationFrame(frame);
            frame = requestAnimationFrame(() => {
                count.textContent = pad(current() + 1) + ' / ' + pad(total);
            });
        }, { passive: true });
    });
}

// Education dropdowns: animate the height when a row opens or closes.
// Without JS (or with reduced motion) the native <details> toggle still works.
function setupAccordions() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timing = { duration: 380, easing: 'cubic-bezier(0.2, 0.7, 0.2, 1)' };

    document.querySelectorAll('details.acc').forEach(details => {
        const summary = details.querySelector('summary');
        const body = details.querySelector('.acc__body');
        const pad = getComputedStyle(body).paddingBottom;
        let animation = null;

        summary.addEventListener('click', event => {
            event.preventDefault();
            const from = details.open ? body.getBoundingClientRect().height : 0;
            const closing = details.open && !details.classList.contains('is-closing');
            if (animation) animation.cancel();

            if (closing) {
                details.classList.add('is-closing');
                animation = body.animate({ height: [from + 'px', '0px'], paddingBottom: [pad, '0px'], opacity: [1, 0] }, timing);
                animation.onfinish = () => {
                    details.open = false;
                    details.classList.remove('is-closing');
                    animation = null;
                };
            } else {
                details.classList.remove('is-closing');
                details.open = true;
                const to = body.getBoundingClientRect().height;
                animation = body.animate({
                    height: [from + 'px', to + 'px'],
                    paddingBottom: [from ? pad : '0px', pad],
                    opacity: [from ? 1 : 0, 1]
                }, timing);
                animation.onfinish = () => { animation = null; };
            }
        });
    });
}

// Experience "+ N more": slide the hidden bullets open and fade them in one by one
function setupMoreToggles() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const easing = 'cubic-bezier(0.2, 0.7, 0.2, 1)';

    document.querySelectorAll('details.job__more').forEach(details => {
        const summary = details.querySelector('summary');
        const list = details.querySelector('.job__list');

        summary.addEventListener('click', event => {
            if (details.open) return;
            event.preventDefault();
            details.open = true;

            const height = list.getBoundingClientRect().height;
            list.style.overflow = 'hidden';
            list.animate({ height: ['0px', height + 'px'] }, { duration: 380, easing })
                .onfinish = () => { list.style.overflow = ''; };

            [...list.children].forEach((item, i) => {
                item.animate(
                    { opacity: [0, 1], transform: ['translateY(8px)', 'none'] },
                    { duration: 420, delay: 80 + i * 70, easing, fill: 'backwards' }
                );
            });
        });
    });
}

// Terminal panel: type out "whoami" once the panel comes into view, then print the answer.
// Without JS or with reduced motion the full text is shown as written in the markup.
function setupShell() {
    const shell = document.querySelector('[data-shell]');
    if (!shell || !('IntersectionObserver' in window)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cmd = shell.querySelector('[data-shell-cmd]');
    const text = cmd.textContent;
    const cursor = shell.querySelector('.cursor');
    const end = shell.querySelector('[data-shell-end]');

    shell.classList.add('is-typing');
    cmd.textContent = '';
    cmd.after(cursor);

    const type = () => {
        let i = 0;
        const step = () => {
            cmd.textContent = text.slice(0, ++i);
            if (i < text.length) {
                setTimeout(step, 70 + Math.random() * 60);
            } else {
                setTimeout(() => {
                    end.append(cursor);
                    shell.classList.remove('is-typing');
                }, 350);
            }
        };
        setTimeout(step, 600);
    };

    const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) {
            observer.disconnect();
            type();
        }
    }, { threshold: 0.6 });
    observer.observe(shell);
}

// Dialogs (thesis abstract): open from a button, close on the close button, Esc or a backdrop click
function setupDialogs() {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    document.querySelectorAll('[data-dialog-open]').forEach(button => {
        const dialog = document.getElementById(button.dataset.dialogOpen);
        if (!dialog || typeof dialog.showModal !== 'function') {
            button.hidden = true;
            return;
        }

        const close = () => {
            if (!dialog.open || dialog.classList.contains('is-closing')) return;
            if (reduceMotion) {
                dialog.close();
                return;
            }
            dialog.classList.add('is-closing');
            dialog.addEventListener('animationend', () => {
                dialog.classList.remove('is-closing');
                dialog.close();
            }, { once: true });
        };

        button.addEventListener('click', () => {
            dialog.showModal();
            document.body.classList.add('has-modal');
            dialog.querySelector('.modal__body').scrollTop = 0;
        });
        dialog.addEventListener('close', () => {
            document.body.classList.remove('has-modal');
            button.focus();
        });
        dialog.addEventListener('cancel', event => {
            event.preventDefault();
            close();
        });
        dialog.addEventListener('click', event => {
            if (event.target === dialog) close();
        });
        dialog.querySelectorAll('[data-dialog-close]').forEach(el => el.addEventListener('click', close));
    });
}

document.addEventListener('DOMContentLoaded', () => {
    setupEmailLinks(document);
    setupCarousels();
    setupAccordions();
    setupMoreToggles();
    setupShell();
    setupDialogs();
    startClock(document.getElementById('clock'));
    setupReveal();
    setupTopbar();
});
