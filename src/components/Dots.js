import { Component, h } from 'preact'

export default class Dots extends Component {
	shouldComponentUpdate(nextProperties, nextState) {
		return nextProperties.index !== this.props.index
	}

	renderDot(i) {
		return <span class="ige_dots--dot" data-active={i === this.props.index ? '' : undefined} key={`${i}`} />
	}

	render() {
		const { len } = this.props,
			dots = [] // faster read

		dots.length = len
		dots[0] = this.renderDot(0)
		for (let i = 1; i < len; ++i) {
			dots[i] = this.renderDot(i)
		}

		return <div class="ige_dots d-flex">{dots}</div>
	}
}
