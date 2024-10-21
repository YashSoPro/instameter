import FetchComponent from './FetchComponent'
import Loading from '../Loading'
import Post from './Post'
import Sentinel from './Sentinel'
import PostDummy from '../PostDummy'
import Stories from './Stories'
import bind from 'autobind-decorator'
import withIntersectionObserver from './withIntersectionObserver'
import { Fragment, h } from 'preact'
import { iObs, promiseReq, shallowDiffers } from '../Utils'

function stopScrollPropagation(e) {
	e.stopPropagation()
}

class Feed extends FetchComponent {
	TIME_STATE = {
		ERROR: 2000,
		LOADING: 900,
	}

	loading = <Loading />

	error = (
		<div>
			End of feed, try reloading the page.
			<button onClick={() => this.fetchNext()}>Retry</button>
		</div>
	)

	dummy = (
		<div class="position-relative">
			<div class="d-flex position-relative justify-content-center flex-wrap">
				<PostDummy />
				<PostDummy />
				<PostDummy />
				<PostDummy />
			</div>
		</div>
	)

	db = null

	fetchObj = {
		cached_feed_item_ids: [],
		fetch_comment_count: 4,
		fetch_like: 3,
		fetch_media_item_count: 12,
		fetch_media_item_cursor: '',
		has_stories: false,
		has_threaded_comments: true,
	}

	ref = null

	constructor(props) {
		super(props)

		this.queryID = 'a7124f10a3421523b50620bb071434ca'

		this.state.timeout = 0
		this.state.items = []
		this.state.cursor = ''

		this.SentinelWithObserver = withIntersectionObserver(Sentinel, {
			root: document.getElementById('ige_feed'),
			trackVisibility: false,
		})
	}

	@bind
	setRef(ref) {
		this.ref = ref
	}

	setTimeout(timeout) {
		this.setState({ timeout })
		if (timeout !== this.TIME_STATE.ERROR) {
			window.setTimeout(() => this.setTimeout(this.TIME_STATE.ERROR), this.TIME_STATE.ERROR)
		}
	}

	shouldComponentUpdate(nextProps, nextState) {
		return shallowDiffers(this.state, nextState) || shallowDiffers(this.props, nextProps)
	}

	async fetchNext(cb) {
		const obj = { ...this.fetchObj }
		obj.fetch_media_item_cursor = this.state.cursor

		const response = await FetchComponent.fetch(
			`/graphql/query/?query_hash=${this.queryID}&variables=${JSON.stringify(obj)}`, 
			{ headers: FetchComponent.getHeaders(false) }
		)

		if (response.status !== 'ok') {
			this.setState({ hasNextPage: false, isNextPageLoading: false })
			return
		}

		const nextCursor = response?.data?.user?.edge_web_feed_timeline?.page_info.end_cursor

		this.setState(prevState => {
			const nextItems = prevState.items.concat(response.data.user.edge_web_feed_timeline.edges)
			return {
				cursor: nextCursor,
				hasNextPage: !!nextCursor,
				isNextPageLoading: false,
				items: nextItems,
				nextCount: nextItems.length,
				prevCount: prevState.nextCount,
			}
		}, () => {
			this._isNextPageLoading = false
			cb && cb()
		})
	}

	componentDidUpdate() {
		/\s*/g.exec('') // Free regex memory
	}

	componentDidMount() {
		if (!this.db && this.state.items.length === 0) {
			this.db = promiseReq(window.indexedDB.open('redux', 1))
			this.loadDBItems()
		}
		window.setTimeout(() => this.setTimeout(this.TIME_STATE.LOADING), this.TIME_STATE.LOADING)
		this.componentDidUpdate()
	}

	componentWillUnmount() {
		// Clean up listeners if necessary
	}

	@bind
	async loadDBItems() {
		const db = await this.db
		const path = db.transaction('paths').objectStore('paths')
		const [itemsResult, postsResult, commentsResult, usersResult] = await Promise.all([
			promiseReq(path.get('feed.content.home.items')),
			promiseReq(path.get('posts.byId')),
			promiseReq(path.get('comments.byId')),
			promiseReq(path.get('users.users')),
		])

		const result = itemsResult.map(itemID => {
			const item = postsResult[itemID.postId]
			if (!item) return null

			// Adapt stored items to be compatible with feed response
			item.__typename = item.isSidecar ? 'GraphSidecar' : item.isVideo ? 'GraphVideo' : 'GraphImage'
			item.is_video = item.isVideo
			item.shortcode = item.code
			item.display_url = item.src

			// Additional data adjustments
			const owner = usersResult[item.owner.id]
			if (owner) {
				item.owner = owner
			}

			// Comments
			item.edge_media_preview_comment = {
				count: item.numComments,
				edges: item.previewCommentIds.map(id => ({
					node: { ...commentsResult[id], owner: usersResult[commentsResult[id]?.userId] }
				}))
			}

			return { node: item }
		}).filter(Boolean)

		this.setState({ items: result })
	}

	@bind
	renderItems() {
		const { items, prevCount } = this.state
		const arr = items.map((current, i) => {
			const type = current.node.__typename
			if (!['GraphImage', 'GraphSidecar', 'GraphVideo'].includes(type)) {
				console.info('New typename', type)
				return null
			}

			if ([8, 25].includes(arr.length)) {
				arr.push(
					<Stories additionalClass={i >= prevCount ? 'ige_fade' : ''} cursor={i < 10 ? 0 : 14} key={current.node.id} />
				)
			}

			return <Post additionalClass={i >= prevCount ? 'ige_fade' : ''} data={current.node} key={current.node.shortcode} />
		})

		return arr
	}

	render() {
		const { hasNextPage, isNextPageLoading, items, timeout } = this.state
		const Sentinel = this.SentinelWithObserver

		if (items.length !== 0) {
			return (
				<div class="ige_virtual" onScroll={stopScrollPropagation}>
					<div class="ige_virtual_container" ref={this.setRef}>
						{this.renderItems()}
						<Sentinel onVisible={this.fetchNext} />
						{!hasNextPage && !isNextPageLoading ? this.error : this.loading}
					</div>
				</div>
			)
		}

		if (timeout === this.TIME_STATE.LOADING) return this.loading
		if (timeout === this.TIME_STATE.ERROR) return this.error

		return this.dummy
	}
}

export default Feed
