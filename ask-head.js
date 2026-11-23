// «اسأل فلان!» page: mark the page, and the embedded mode when shown inside the home page.
document.documentElement.classList.add('ask-page');
try { if (window.self !== window.top) document.documentElement.classList.add('ask-embed'); } catch (e) { document.documentElement.classList.add('ask-embed'); }
