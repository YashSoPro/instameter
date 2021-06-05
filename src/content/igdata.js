;(function (window, document) {
	const get = (path, object) => path.reduce((xs, x) => (xs && xs[x] ? xs[x] : null), object)

	// sync with FetchComponent
	function getFromIGData(key) {
		const path = [key]
		let get1 = get(path, window._cached_shared_Data)
		if (get1 !== null) return get1

		get1 = get(path, window._sharedData)
		if (get1 !== null) return get1

		get1 = get(['data', key], window.__initialData)
		if (get1 !== null) return get1

		return '<unknown>'
	}

	function getASBD() {
		const el = document.querySelector('script[src*="ConsumerLibCommons"]')
		if (el === null) return '<unknown>'

		const src = el.src

		return new Promise((resolve, reject) => {
			window
				.fetch(src)
				.then(response => {
					if (response.ok) return response
					resolve('<unknown>')
				})
				.then(response => response.text())
				.then(response => {
					const match = response.match(/ASBD_ID='(\d+)'/)
					if (match.length < 2) {
						console.error('couldnt find asbd id')
						return resolve('<unknown>')
					}

					sessionStorage['ige_ASBD'] = match[1]
					resolve(match[1])
				})
		})
	}

	function onReady() {
		getASBD().then(asbd => {
			const igClaim = sessionStorage['www-claim-v2'] || localStorage['www-claim-v2']
			if (!igClaim) console.error('couldnt find ig claim')

			window.dispatchEvent(
				new CustomEvent('__@@ptb_ige', {
					detail: {
						'ig-claim': sessionStorage['www-claim-v2'] || localStorage['www-claim-v2'],
						'rollout-hash': getFromIGData('rollout_hash'),
						'asbd-id': asbd,
					},
				})
			)
		})
	}

	if (document.readyState === 'interactive' || document.readyState === 'complete') onReady()
	else document.addEventListener('DOMContentLoaded', onReady)
})(window, document)