const target = document.documentElement.dataset.redirect || 'pages/home/index.html';
location.replace(target + location.search + location.hash);
