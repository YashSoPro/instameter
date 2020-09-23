import { Fragment, h } from 'preact'
import { Modal } from 'react-responsive-modal'
import { memo, useState } from 'preact/compat'

const Story = ({ data, additionalClass }) => {
	const [isOpen, setOpen] = useState(false)
	const [wasOpen, setOpened] = useState(false)

	const {
		owner: { username = '', profile_pic_url = '' },
		seen,
		items,
		has_besties_media,
	} = data

	let imgSrc = ''
	// find unseen media
	for (let i = 0; i < items.length; ++i) {
		const element = items[i]
		if (element.taken_at_timestamp <= seen) continue

		imgSrc = element.display_url
		break
	}

	if (imgSrc === '') return null

	return (
		<>
			<div class={`ige_story ${additionalClass} ${wasOpen ? 'black-white' : ''} ${has_besties_media ? 'bestie-story' : ''}`}>
				<button class="ige_story_container" role="menuitem" tabIndex="0" type="button" onClick={() => setOpen(true) && setOpened(true)}>
					<div class="ige_story-img">
						<img decoding="async" src={imgSrc} class="full-img br-6" />
					</div>
					<div class="ige_story-avatar_container br-6">
						<div role="button" tabIndex="0" class="d-flex a-center">
							<span class="ige_story-avatar" role="link" tabIndex="0">
								<img alt={username + 's Profilbild'} class="full-img br-50" src={profile_pic_url} decoding="async" />
							</span>
						</div>
						<div class="ige_story-username">{username}</div>
					</div>
				</button>
			</div>
			{isOpen ? (
				<Modal open onClose={() => setOpen(false)} center classNames={{ modal: 'modal-story' }}>
					<div>
						<iframe src={'/stories/' + username + '/#story'} class="ige_iframe" />
					</div>
				</Modal>
			) : null}
		</>
	)
}

export default memo(Story)
