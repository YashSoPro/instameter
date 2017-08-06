import App from './components/App'
import Preact, { h, options, render } from 'preact'

options.syncComponentUpdates = false

let root = document.body.firstChild

const init = app => (root = render(h(app), document.body, root))

if (module.hot) {
	require('preact/devtools')
	const { whyDidYouUpdate } = require('why-did-you-update')
	whyDidYouUpdate(Preact)

	module.hot.accept('./components/App', () =>
		requestAnimationFrame(() => {
			init(App)
		})
	)
}

init(App)
