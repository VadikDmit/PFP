/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            backgroundImage: {
                lineHr: 'linear-gradient(226.03deg, #B074B3 16.24%, #DA278B 97.17%)',
            },
            boxShadow: {
                bgTable: '0px 2px 13px 0px #0000001A',
            },
        },
    },
    plugins: [],
};
