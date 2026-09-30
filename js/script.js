(() => {
    const initLoader = () => {
        const loader = document.getElementById('pageLoader');
        if (!loader) return;

        const finishLoading = () => {
            document.body.classList.remove('is-loading');
            document.body.classList.add('is-loaded');
            if (loader.isConnected) loader.remove();
        };

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            window.setTimeout(finishLoading, 150);
        } else {
            document.addEventListener('DOMContentLoaded', () => {
                window.setTimeout(finishLoading, 150);
            }, { once: true });
        }

        window.addEventListener('load', finishLoading, { once: true });
        window.addEventListener('pageshow', finishLoading);
        window.setTimeout(finishLoading, 1200);
    };

    const initLucide = () => {
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    };

    const initMenu = () => {
        const mobileMenuButton = document.getElementById('mobileMenuButton');
        const mobileMenu = document.getElementById('mobileMenu');
        if (!mobileMenuButton || !mobileMenu) return;

        const syncMenuState = () => {
            const isOpen = !mobileMenu.classList.contains('hidden');
            mobileMenuButton.setAttribute('aria-expanded', String(isOpen));
            mobileMenuButton.setAttribute('aria-controls', 'mobileMenu');
            mobileMenuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
            const icon = mobileMenuButton.querySelector('i');
            if (icon) {
                icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                initLucide();
            }
        };

        const closeMenu = () => {
            if (mobileMenu.classList.contains('hidden')) return;
            mobileMenu.classList.add('hidden');
            syncMenuState();
        };

        mobileMenuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            syncMenuState();
        });

        mobileMenu.querySelectorAll('a').forEach((link) => {
            link.addEventListener('click', () => {
                closeMenu();
            });
        });

        document.addEventListener('click', (event) => {
            if (mobileMenu.classList.contains('hidden')) return;
            if (mobileMenu.contains(event.target) || mobileMenuButton.contains(event.target)) return;
            closeMenu();
        });

        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') closeMenu();
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) closeMenu();
        });

        syncMenuState();
    };

    const initNavShadow = () => {
        const nav = document.getElementById('siteNav');
        if (!nav) return;

        const onScroll = () => {
            if (window.scrollY > 20) {
                nav.classList.add('nav-scrolled');
                nav.classList.add('shadow-sm');
                nav.classList.remove('border-slate-100');
                nav.classList.add('border-slate-200');
            } else {
                nav.classList.remove('nav-scrolled');
                nav.classList.remove('shadow-sm');
                nav.classList.add('border-slate-100');
                nav.classList.remove('border-slate-200');
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    };

    const initBackToTop = () => {
        const button = document.getElementById('backToTopButton');
        if (!button) return;

        const syncState = () => {
            const shouldShow = window.scrollY > 280;
            button.classList.toggle('is-visible', shouldShow);
            button.setAttribute('aria-hidden', shouldShow ? 'false' : 'true');
            button.tabIndex = shouldShow ? 0 : -1;
        };

        button.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });

        window.addEventListener('scroll', syncState, { passive: true });
        syncState();
    };

    const initReveal = () => {
        const items = Array.from(document.querySelectorAll('.reveal-up, .reveal-right'));
        if (!items.length) return;

        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            items.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        if (!('IntersectionObserver' in window)) {
            items.forEach((item) => item.classList.add('is-visible'));
            return;
        }

        items.forEach((item, index) => {
            item.style.transitionDelay = `${Math.min(index % 4, 3) * 90}ms`;
        });

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            });
        }, {
            threshold: 0.16,
            rootMargin: '0px 0px -10% 0px'
        });

        items.forEach((item) => observer.observe(item));
    };

    const initQuoteForm = () => {
        const form = document.getElementById('quoteForm');
        const statusEl = document.getElementById('quoteFormStatus');
        const summaryEl = document.getElementById('quoteSummary');
        if (!form || !statusEl || !summaryEl) return;

        const TO_EMAIL = 'info@lyzon.co.mz';
        const CC_EMAIL = 'vendas@lyzon.co.mz';
        const ENDPOINT = `https://formsubmit.co/ajax/${encodeURIComponent(TO_EMAIL)}`;

        const setStatus = (message, isError) => {
            statusEl.textContent = message;
            statusEl.classList.remove('hidden', 'text-red-600', 'text-emerald-700');
            statusEl.classList.add(isError ? 'text-red-600' : 'text-emerald-700');
        };

        const buildMailtoLink = ({ name, email, phone, service, details }) => {
            const subject = encodeURIComponent('New Service Request from LYZON Website');
            const body = encodeURIComponent(
                [
                    'Customer Information:',
                    `Full Name: ${name}`,
                    `Email: ${email || 'Not provided'}`,
                    `Phone: ${phone || 'Not provided'}`,
                    `Service Needed: ${service || 'Not provided'}`,
                    '',
                    'Project Details:',
                    details
                ].join('\n')
            );
            return `mailto:${encodeURIComponent(TO_EMAIL)}?cc=${encodeURIComponent(CC_EMAIL)}&subject=${subject}&body=${body}`;
        };

        form.addEventListener('submit', async (event) => {
            event.preventDefault();

            const formData = new FormData(form);
            const name = String(formData.get('name') || '').trim();
            const email = String(formData.get('email') || '').trim();
            const phone = String(formData.get('phone') || '').trim();
            const service = String(formData.get('service') || '').trim();
            const details = String(formData.get('details') || '').trim();

            if (!name || !email || !phone || !service || !details) {
                summaryEl.classList.add('hidden');
                setStatus('Please fill in all fields: Full Name, Email, Phone, Service Needed, and Project Details.', true);
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                summaryEl.classList.add('hidden');
                setStatus('Please enter a valid email address.', true);
                return;
            }

            const summary = [
                'Quote Request',
                `Name: ${name}`,
                `Email: ${email}`,
                `Phone: ${phone}`,
                `Service: ${service}`,
                '',
                'Project Details:',
                details
            ].join('\n');

            summaryEl.value = summary;
            summaryEl.classList.remove('hidden');

            const payload = {
                name,
                email,
                phone,
                'Service Needed': service,
                'Project Details': details,
                _subject: 'New Service Request from LYZON Website',
                _cc: CC_EMAIL,
                _template: 'table'
            };

            const submitBtn = form.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.textContent : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Submitting...';
            }

            try {
                const response = await fetch(ENDPOINT, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const result = await response.json().catch(() => ({}));

                if (result && result.success === 'false') throw new Error(result.message || 'Submission failed');

                form.reset();
                summaryEl.classList.add('hidden');
                setStatus('Thank you. Your request has been submitted successfully. Our team will contact you shortly.', false);
            } catch (err) {
                const mailto = buildMailtoLink({ name, email, phone, service, details });
                setStatus('Automatic submission could not be completed. Opening your email app instead...', true);
                window.location.href = mailto;
            } finally {
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalBtnText;
                }
            }
        });
    };

    initLoader();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initLucide();
            initMenu();
            initNavShadow();
            initBackToTop();
            initReveal();
            initQuoteForm();
        }, { once: true });
    } else {
        initLucide();
        initMenu();
        initNavShadow();
        initBackToTop();
        initReveal();
        initQuoteForm();
    }
})();
