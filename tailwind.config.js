/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./*.html', './*.js', './modules/*.js', './data/*.js'],
    theme: {
        extend: {
            colors: {
                theme: 'var(--theme-color)',
                'theme-light': 'var(--theme-light)',
                'theme-dark': 'var(--theme-dark)',
            },
        },
    },
    plugins: [],
};
