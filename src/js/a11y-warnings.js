document.addEventListener('DOMContentLoaded', () => {
    // Images without alt attribute
    document.querySelectorAll('#main-content img:not([alt])').forEach(img => {
        img.setAttribute('data-bs-toggle', 'tooltip');
        img.setAttribute('data-bs-placement', 'top');
        img.setAttribute('data-bs-html', 'true');
        img.setAttribute('data-bs-title', '⚠️ <strong>Accessibility Warning</strong><br>Missing ALT text. This image needs alternative text.');
        img.setAttribute('data-bs-trigger', 'hover focus');
        img.classList.add('a11y-warning');
    });

    // Images with empty alt attribute
    document.querySelectorAll('#main-content img[alt=""]').forEach(img => {
        if (img.classList.contains('a11y-decorative')) {
            return;
        }
        img.setAttribute('data-bs-toggle', 'tooltip');
        img.setAttribute('data-bs-placement', 'top');
        img.setAttribute('data-bs-html', 'true');
        img.setAttribute('data-bs-title', 'ℹ️ <strong>Accessibility Notice</strong><br>Empty ALT text. Only use if image is purely decorative.');
        img.setAttribute('data-bs-trigger', 'hover focus');
        img.classList.add('a11y-notice');
    });

    // Images with empty alt inside links
    document.querySelectorAll('#main-content a > img[alt=""]').forEach(img => {
        img.setAttribute('data-bs-toggle', 'tooltip');
        img.setAttribute('data-bs-placement', 'top');
        img.setAttribute('data-bs-html', 'true');
        img.setAttribute('data-bs-title', '⚠️ <strong>Accessibility Warning</strong><br>Linked image needs descriptive ALT text.');
        img.setAttribute('data-bs-trigger', 'hover focus');
        img.classList.add('a11y-warning');
    });

    // Initialize tooltips with error handling
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(element => {
        try {
            new window.bootstrap.Tooltip(element, {
                html: true,
                boundary: document.body
            });
        } catch (e) {
            console.warn('Error initializing tooltip:', e);
        }
    });
});