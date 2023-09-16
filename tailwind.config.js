/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./pages/**/*.vue'],
	theme: {
		extend: {},
	},
	plugins: [],
	corePlugins: {
		preflight: false
	},
	experimental: {
		optimizeUniversalDefaults: true
	}
}