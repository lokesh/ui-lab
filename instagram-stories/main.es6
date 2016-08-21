// Instagram Stories Web Prototype
// by Lokesh Dhakar - twitter.com/lokesh
// -----------------------------------

// # To-Dos
// - [X] Attach mouse events to document
// - [X] If first or last vid, add tension. Drag 25% the normal distance.
// - [X] Check drag velocity to determine intent of direction.
// - [X] Add feed page in background
// - [X] Fade and scale out to IG page.
// - [X] Support clicking on image to go to prev or next
// - [X] Support tapping
// - [X] Don't show IG page in bg till user is about to go back
// - [X] Bug: You can't quickly swipe between items. Fixed, good enough.
// - [ ] Ability to reopen after closing.
// - [X] Show images on mobile? Probabl better to use the video poster.
// - [ ] Start videos after they have been positioned?
// - [ ] Shrink videos before sharing? Crop videos?

// # Nice-to-haves
// - [X] If tapping left of first or right of last, don't do rotation, just animate down.
// - [X] Only call update when something is being dragger or animated
// - [ ] Play videos in canvas on mobile or use animated gifs. Canvas technique unlikely to be
//       performant on mobile devices.

// # Skipping
// - Implement slide up and down gestures and their respective actions
// - Have avatar image in story keep scale and animate towards avatar on feed page when closing.
// - Add loaders.


// Data
let storiesData = [
	{
		user: 'lokesh',
		time: '5min',
		video: 'citylife'
	},{
		user: 'vegangumshoe',
		time: '12m',
		video: 'girlbythesea'
	}, {
		user: 'thedogindie',
		time: '3hr',
		video: 'diving'
	}, {
		user: 'juanarreguin',
		time: '5hr',
		video: 'photoshop'
	}, {
		user: 'nspady',
		time: '12hr',
		video: 'statefair'
	}
];

const isIOS = /iPad|iPhone|iPod/.test(navigator.platform);

// Templates
const storyBarAvatarTemplate = _.template($('#story-bar-avatar-template').html());
const storyTemplate          = _.template($('#story-template').html());

// Elements
let $feedCover = $('.feed__cover');
let $storyBar = $('.story-bar');
let $storyBarUsers = $('.story-bar__user');


// Classes
class StoryBar {
	constructor(el, data) {
		this.el = el;
		this.$el = $(el);
		this.data = data;
	}

	render() {
		let fragment = document.createDocumentFragment();

		_.each(this.data, (story, index) => {
			story = Object.assign(story, {'index': index});
			$(storyBarAvatarTemplate(story))
				.appendTo(fragment);
		})
		this.$el.append(fragment);
	}
}

class Stories {
	constructor(el, data) {
		// The amount, as a percentage width of the story card, the user must drag it to have it
		// slide to the next on release.
		this.minDragPercentToTransition = 0.5;

		// The number of pixels a MS horizontally the user is required to drag to set off this trigger.
		this.minVelocityToTransition = 0.65;

		// Bigger num creates a slower transition
		this.transitionSpeed = 6;

		// Init
		this.rotateY = 0;

		// Convenience properties
		this.el = el;
		this.$el = $(el);
		this.stories = data;
		this.count = this.stories.length;
	}

	render() {
		let fragment = document.createDocumentFragment();

		_.each(this.stories, (story, index) => {
			story = Object.assign(story, {
				'index': index,
				'isIOS': isIOS
			});
			$(storyTemplate(story)).appendTo(fragment);
		})

		this.$el.append(fragment);

		// Document level event handling
		this._addEventHandlers();
	}

	/*
		Make story and its neighbors visible, hide the rest.
	 */
	show(index) {
		// Update index which tracks currently shown story
		this.index = index;

		// Reset Stories transforms (container)
		this.$el.css('transform', 'translateZ(-50vw)');
		this.rotateY = 0;

		// Hide all stories
		this.$el.find('.story').hide();

		// Show and position the chosen story as well as its neighbors
		for (let i = -1; i < 2; i++) {
			let loopIndex = i + index;
			let coverOpacity = Math.abs(i);

			this.$el
				.find('#story-' + loopIndex)
					.find('.story__cover')
						.css({
							'will-change': 'opacity',
							'opacity': coverOpacity
						})
						.end()
					.css({
						'will-change': 'transform',
						'transform': `rotateY(${i * 90}deg) translateZ(50vw)`,
					})
					.show();
		}
	}

	open() {
		console.log('open');
	}

	close() {
		let $story = this.$el.find('#story-' + this.index);

		this._removeEventHandlers();
		this.pauseVideos();

		// Hide all stories but the current
		this.$el.find('.story').hide();
		$story.show()

		//
		let $storyBarUser = $storyBar.find(`[data-story-id=${this.index}]`);
		let storyBarUserRect = $storyBarUser[0].getBoundingClientRect();

		// Reset 3d transforms and scale down.
		$story.attr('style', '');
		this.$el.attr('style', `transform-origin: ${storyBarUserRect.left + 12}px ${storyBarUserRect.top + 24}px; transform: translateZ(0) scale(0.1)`);
		this.$el.addClass('is-closed');
		$storyBarUser.addClass('bounce');

		// Fade in feed page
		$feedCover
			.attr('style', '')
			.addClass('is-hidden');

	}

	pauseVideos() {
		this.$el.find('.story__video').each(function() {
			this.pause();
		});
	}

	_addEventHandlers() {
		$(document)
			.on('utap.stories', this._onTap.bind(this))
			.on('udragstart.stories', this._onDragStart.bind(this))
			.on('udragmove.stories', this._onDragMove.bind(this))
			.on('udragend.stories', this._onDragEnd.bind(this));
	}

	_removeEventHandlers() {
		$(document).off('.stories');
	}

	_onTap (e) {
		if (this.isRotating) { return; }
		this.isRotating = true;

		// // Clicking the left 33% of the image takes you back, the rest forwards.
		if (e.px_start_x < window.innerWidth / 3) {
			// If going back from first card, close
			if (this.index === 0) {
				this.isOpeningOrClosing = true;
				this.close();
			} else {
				this.targetRotateY = 90;
				this.targetDirection = 'back';
			}
		} else {
			if ((this.index + 1) === this.count) {
				this.isOpeningOrClosing = true;
				this.close();
			} else {
				this.targetRotateY = -90;
				this.targetDirection = 'forward';
			}
		}

		this.update();
	}

	_onDragStart(e) {
		this.targetDirection = null;
		this.isDragging = true;
		this.el.style.willChange = 'transform';

		this.dragStartX = e.px_start_x;
		this.dragCurrentX = this.dragStartX;

		this.update();
	}

	_onDragMove(e) {
		this.dragCurrentX = e.px_current_x;
	}

	_onDragEnd(e) {
		this.isDragging = false;

		// Did the user show intent to go to a different card? We check in two ways:
		// 1. Has the card been dragged far to one side?
		// 2. Did the drag velocity imply movement to one side?

		// Note: We use an adjusted viewport width to calculate the drag to side threshold. As the
		// viewport gets larger than 320px, we shrink the viewport value used in the calcuation.
		// This prevents scenarios such as when the minDragPercent is 0.5 and actual viewport width
		// is 2048px, requiring the user to drag over 1024px to trigger the card change.

		// 1.
		let dragDeltaX = -e.px_tdelta_x;
		let adjustedViewportWidth = ((window.innerWidth - 320) / 4) + 320;
		let threshold = adjustedViewportWidth * this.minDragPercentToTransition;

		// 2.
		let velocity = e.px_tdelta_x / e.ms_elapsed;

		if (dragDeltaX > threshold || velocity < (-1 * this.minVelocityToTransition)) {
			// If going back from first card, close
			if (this.index === 0) {
				this.isOpeningOrClosing = true;
				this.close();
			} else {
				this.targetRotateY = 90;
				this.targetDirection = 'back';
				this.isRotating = true;
			}
		} else if (Math.abs(dragDeltaX) > threshold || velocity > this.minVelocityToTransition) {
			if ((this.index + 1) === this.count) {
				this.isOpeningOrClosing = true;
				this.close();
			} else {
				this.targetRotateY = -90;
				this.targetDirection = 'forward';
				this.isRotating = true;
			}
		} else {
			this.targetRotateY = 0;
			this.isRotating = true;
		}
	}

	update() {
		// Update calls itself at the end and loop. We break the loop once dragging and animations
		// are both complete or we are opening/closing.
		if (this.isOpeningOrClosing || (!this.isDragging && !this.isRotating)) { return; }

		let setCSSAfterUpdating = (this.isDragging || this.isRotating);

		if (this.isDragging) {
			let dragDeltaX = this.dragCurrentX - this.dragStartX;

			// If on first card and dragging back OR
			// If on last card and draggin forward, add resistance.
			if (((this.index === 0) && (dragDeltaX > 0)) ||
				((this.index + 1 === this.count) && (dragDeltaX < 0))) {
				this.rotateY = (dragDeltaX / window.innerWidth)  * 30;
				let opacity = ((90 - Math.abs(this.rotateY)) / 90);
				$feedCover.css('opacity', opacity);
			} else {
				this.rotateY = (dragDeltaX / window.innerWidth)  * 90;
			}
		}

		if (this.isRotating) {
			// Simple easing
			this.rotateY += (this.targetRotateY - this.rotateY) / this.transitionSpeed;

			// If story has nearly reached its target, bump it to final spot and stop animating.
			if (Math.abs(this.rotateY - this.targetRotateY) < 0.5) {
				this.rotateY = this.targetRotateY;
				this.el.style.willChange = 'initial';
				this.isRotating = false;

				if (this.targetDirection) {
					this.isSwitchingStories = true;
				}
			}
		}

		if (setCSSAfterUpdating) {
			this.$el.css('transform', `translateZ(-50vw) rotateY(${this.rotateY}deg)`)

			// Freater rotateY, more opacity for prev.
			// Smaller rotate, more opacity for next.
			let opacity = ((90 - Math.abs(this.rotateY)) / 90)
			let prevIndex = this.index - 1;
			let nextIndex = this.index + 1;

			this.$el
				.find('#story-' + prevIndex + ' .story__cover')
				.add('#story-' + nextIndex + ' .story__cover')
				.css('opacity', opacity);
		}

		if (this.isSwitchingStories) {
			let newIndex = (this.targetDirection === 'forward') ? this.index + 1: this.index -1;
			this.show(newIndex);
			this.isSwitchingStories = false;
		}
		requestAnimationFrame(this.update.bind(this));
	}

	destroy() {
		this._removeEventHandlers();
		this.el.remove()
		delete this;
	}

}


// ------------
// Init
// ------------

// Prevent bouncy iOS scrolling in mobile safari
// document.body.addEventListener('touchmove', (event) => {
// 	event.preventDefault();
// }, false);

let thumbsUpShown = false;
if (window.innerWidth >= 1000) {
	$(window).on('resize.stories', function() {
		if (window.innerWidth <= 420) {
			$('.success-message').addClass('is-in');
			$(window).off('resize.stories');
		}
	})
}

let storyBar = new StoryBar(document.querySelector('.story-bar'), storiesData)
storyBar.render();

let stories = new Stories(document.querySelector('.stories'), storiesData);
stories.render();
stories.show(0);

if (isIOS) {
	$('body').addClass('ios');
}
