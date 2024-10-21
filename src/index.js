import App from './components/App';
import { h, options, render } from 'preact';
import { documentReady, logAndReturn } from './components/Utils';
import './components/main.css';
import 'bootstrap/dist/css/bootstrap.min.css';

// Check if module hot-reloading is enabled
if (module.hot) {
	import('preact/debug'); // Enable Preact debug in development

	const { registerObserver } = require('react-perf-devtool');

	// Register performance observer for development
	registerObserver();

	module.hot.accept('./components/App', () => {
		// Re-initialize the app with hot reload
		requestAnimationFrame(() => {
			init(render, App, document.body.children[2]);
		});
	});

	// Perfume.js for performance monitoring
	const Perfume = require('perfume.js').default;
	new Perfume({
		logging: true,
		logPrefix: '⚡️', // Custom log prefix for performance logs
		resourceTiming: false, // Disable resource timing (can be enabled if needed)
	});

	// Performance observer for capturing specific performance metrics
	new PerformanceObserver((list) => {
		for (const entry of list.getEntries()) {
			const time = Math.round(entry.startTime + entry.duration);
			console.info('⚡', entry.name !== '' ? entry.name : entry.entryType, time, entry);
		}
	}).observe({
		entryTypes: [
			'element',
			'first-input',
			'largest-contentful-paint',
			'layout-shift',
			'longtask',
			'mark',
			'measure',
			'navigation',
			'paint',
		], // Entry types we want to observe for performance
	});
}

// Use `requestIdleCallback` to schedule low-priority rendering tasks
options.debounceRendering = requestIdleCallback;

// Initialization function to render the Preact app
const init = (fn, app, container) => fn(h(app), container);

// Ensure the DOM is ready before initializing the app
const ready = () => init(render, App, document.body.children[0]);

// Handle document ready and initialization
documentReady()
	.then(ready)
	.catch(logAndReturn);
