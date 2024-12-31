/**
 * This is a minimal config.
 *
 * If you need the full config, get it from here:
 * https://unpkg.com/browse/tailwindcss@latest/stubs/defaultConfig.stub.js
 */

module.exports = {
    content: [
        /**
         * HTML. Paths to Django template files that will contain Tailwind CSS classes.
         */

        /*  Templates within theme app (<tailwind_app_name>/templates), e.g. base.html. */
        '../templates/**/*.html',

        /*
         * Main templates directory of the project (BASE_DIR/templates).
         * Adjust the following line to match your project structure.
         */
        '../../templates/**/*.html',

        /*
         * Templates in other django apps (BASE_DIR/<any_app_name>/templates).
         * Adjust the following line to match your project structure.
         */
        '../../**/templates/**/*.html',

        /**
         * JS: If you use Tailwind CSS in JavaScript, uncomment the following lines and make sure
         * patterns match your project structure.
         */
        /* JS 1: Ignore any JavaScript in node_modules folder. */
        // '!../../**/node_modules',
        /* JS 2: Process all JavaScript files in the project. */
        // '../../**/*.js',

        /**
         * Python: If you use Tailwind CSS classes in Python, uncomment the following line
         * and make sure the pattern below matches your project structure.
         */
        // '../../**/*.py'
    ],
    theme: {
        extend: {},
        fontFamily: {
            silkscreen: ['Silkscreen', 'sans-serif'], // Custom font
            spaceMono: ['Space Mono', 'monospace'], // Custom font
            mono: ['Fira Code', 'monospace'], // Add your desired mono font here
        },
        keyframes: {
            moveToTop: {
              '0%': { top: '94%', opacity: '0' },
              '50%': { top: '30%', opacity: '0.5' },
              '100%': { top: '40%', opacity: '1' },
            },
            appear: {
                '0%': {opacity: '0'},
                '100%': {opacity: '1'}
            },
            disappear: {
                '0%': {  opacity: '1' },
                '100%': { opacity: '0' },
            },
        },
        animation: {
            moveToTop: 'moveToTop 2s ease-in-out forwards',
            appear: 'appear 1s ease-in-out forwards',
            disappear: 'disappear 2s ease-in-out forwards',
        },
    },
    plugins: [
        /**
         * '@tailwindcss/forms' is the forms plugin that provides a minimal styling
         * for forms. If you don't like it or have own styling for forms,
         * comment the line below to disable '@tailwindcss/forms'.
         */
        require('@tailwindcss/forms'),
        require('@tailwindcss/typography'),
        require('@tailwindcss/aspect-ratio'),
        require('daisyui'),
    ],
}
