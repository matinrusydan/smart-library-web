export const themeInitScript = `(() => {
  try {
    const saved = localStorage.getItem('smart-library-theme');
    if (saved === 'dark' || saved === 'light') document.documentElement.dataset.theme = saved;
  } catch {}
})();`;
