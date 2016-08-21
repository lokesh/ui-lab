// # To-Dos
// - [X] Attach mouse events to document
// - [ ] Add IG feed in background
// - [ ] Support clicking on image to go to prev or next
// - [ ] Support tapping
// - [ ] Start videos after they have been positioned
// - [ ] if right side of video is clicked, go to next
// - [ ] Only call update when something is being dragger or animated
// - [ ] Shrink videos before sharing? Crop videos?

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
	}
];

// Templates
const storyTemplate = _.template($('#story-template').html());

// ---

class Stories {
	constructor(el, data) {
		// // Currently a
		// this.darkenStoriesAtAngle = false;

		// The amount, as a percentage width of the story card, the user must drag it to have it
		// slide to the next on release.
		this.minDragPercentToTransition = 0.5;

		// Bigger num creates a slower transition
		this.transitionSpeed = 10;

		// Convenience properties
		this.el = el;
		this.$el = $(el);
		this.stories = data;
	}

	render() {
		let fragment = document.createDocumentFragment();

		_.each(this.stories, (story, index) => {
			$(storyTemplate(story))
				.attr('id', 'story-' + index)
				.appendTo(fragment);
		})

		this.$el.append(fragment);

		// Document level event handling
		this._addDocumentEventHandlers();
	}

	/*
		Make story and its neighbors visible, hide the rest.
	 */
	show(index) {
		// Update index which tracks currently shown story
		this.index = index;

		// Reset Stories transforms (container)
		this.$el.css('transform', 'translateZ(-50vw)');


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
							// 'will-change': 'opacity',
							'opacity': coverOpacity
						})
						.end()
					.css({
						'will-change': 'transform',
						'transform': `rotateY(${i * 90}deg) translateZ(50vw)`,
					})
					.show();
		}

		this._addStoryEventHandlers()
	}

	_addDocumentEventHandlers() {
		$(document)
			.on('touchstart.stories mousedown.stories', this._onDragStart.bind(this))
			.on('touchmove.stories mousemove.stories', this._onDragMove.bind(this))
			.on('touchend.stories mouseup.stories', this._onDragEnd.bind(this));
	}

	_removeDocumentEventHandlers() {
		$(document).off('.stories');
	}

	_addStoryEventHandlers() {
		this.$el.find('#story-' + this.index)
			.on('utap.stories', this._onClick.bind(this));
	}

	_removeStoryEventHandlers() {
		console.log('remove click event');
		this.$el.find('.stories').off('.stories');
	}

	_onClick (e) {
		this.isAnimating = true;
		this._removeStoryEventHandlers()

		// Clicking the left 33% of the image takes you back, the rest forwards.
		if (e.px_start_x < window.innerWidth / 3) {
			this.targetRotateY = 90;
			this.targetDirection = 'back';
		} else {
			this.targetRotateY = -90;
			this.targetDirection = 'forward';
		}
	}

	_onDragStart(e) {
		this.isDragging = true;
		this.el.style.willChange = 'transform';

		this.dragStartX = e.pageX || e.originalEvent.touches[0].pageX;
		this.dragCurrentX = this.dragStartX;
		// should this.update() be called here instead of repeatedly on move?
	}

	_onDragMove(e) {
		this.dragCurrentX = e.pageX || e.originalEvent.touches[0].pageX;
		// this.update();
	}

	_onDragEnd(e) {
		this.isDragging = false;
		this.isAnimating = true;
		this._removeStoryEventHandlers();

		// Has the card been dragged far enough to the left or right to enable an animation to the
		// previous of next card. If not, we ease it back into the start position.
		//
		// We use an adjusted viewport width to calculate the threshold. As the viewport gets larger
		// than 320px, we shrink the viewport value used in the calcuation. This prevents the
		// scenarios where the minDragPercent is 0.5 and actual viewport width is 2048px, requiring
		// the user to drag over 2024px to trigger the card change animation.
		let dragDistanceX = this.dragCurrentX - this.dragStartX;
		let adjustedViewportWidth = ((window.innerWidth - 320) / 4) + 320;
		let threshold = adjustedViewportWidth * this.minDragPercentToTransition;

		if (dragDistanceX > threshold) {
			this.targetRotateY = 90;
			this.targetDirection = 'back';
		} else if (Math.abs(dragDistanceX) > threshold) {
			this.targetRotateY = -90;
			this.targetDirection = 'forward';
		} else {
			this.targetRotateY = 0;
		}
	}

	update() {
		let setCSSAfterUpdating = (this.isDragging || this.isAnimating);

		if (this.isDragging) {
			let dragDistanceX = this.dragCurrentX - this.dragStartX;
			this.rotateY = (dragDistanceX / window.innerWidth)  * 90;
		}

		if (this.isAnimating) {
			// Simple easing
			this.rotateY += (this.targetRotateY - this.rotateY) / this.transitionSpeed;

			// If story has nearly reached its target, bump it to final spot and stop animating.
			if (Math.abs(this.rotateY - this.targetRotateY) < 0.5) {
				this.rotateY = this.targetRotateY;
				this.el.style.willChange = 'initial';

				this.isAnimating = false;

				// If card has finished animating out of screen
				if (this.targetRotateY !== 0 ) {
					this.hasArrivedAtFinalDest = true;
				}
			}
		}

		if (setCSSAfterUpdating) {
			this.$el.css('transform', `translateZ(-50vw) rotateY(${this.rotateY}deg)`)

			// Freater rotateY, more opacity for prev.
			// Smaller rotate, more opacity for next.
			let prevStoryOpacity = ((90 - this.rotateY) / 90);
			let nextStoryOpacity = ((90 - Math.abs(this.rotateY)) / 90)

			let prevIndex = this.index - 1;
			let nextIndex = this.index + 1;

			this.$el
				.find('#story-' + prevIndex)
					.find('.story__cover')
						.css('opacity', prevStoryOpacity);

			this.$el
				.find('#story-' + nextIndex)
					.find('.story__cover')
						.css('opacity', nextStoryOpacity);
		}

		if (this.hasArrivedAtFinalDest) {
			let newIndex = (this.targetDirection === 'forward') ? this.index + 1: this.index -1;
			this.show(newIndex);
			this.hasArrivedAtFinalDest = false;
		}
	}

	destroy() {
		this._removeStoryEventHandlers();
		this._removeDocumentEventHandlers();
		this.el.remove()
		delete this;
	}

}


// Init

let stories = new Stories(document.querySelector('.stories'), storiesData);
stories.render();
stories.show(0);

function updateStories() {
	stories.update();
	requestAnimationFrame(updateStories);
}

updateStories();

// Prevent bouncy iOS scrolling in mobile safari
document.body.addEventListener('touchmove', (event) => {
	event.preventDefault();
}, false);
