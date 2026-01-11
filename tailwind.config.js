/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './*.html',
        './src/**/*.js', // YENİ: Entry point
        './views/**/*.js', // YENİ: View modules
        './modules/**/*.js',
        './data/*.js',
    ],
    darkMode: 'class', // Enable class-based dark mode
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
    safelist: [
        {
            pattern: /(bg|text)-(gray|green|blue|purple|orange|yellow)-(100|700)/,
        },
    ],
};
