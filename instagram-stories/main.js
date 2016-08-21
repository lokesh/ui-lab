'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// # To-Dos
// - [X] Attach mouse events to document
// - [X] If first or last vid, add tension. Drag 25% the normal distance.
// - [X] Check drag velocity to determine intent of direction.
// - [ ] Add IG feed in background
// - [X] Support clicking on image to go to prev or next
// - [X] Support tapping
// - [ ] Start videos after they have been positioned
// - [ ] Shrink videos before sharing? Crop videos?
// - [ ] Bug: You can't quickly swipe between items.

// Nice-to-haves
// - [ ] If tapping left of first or right of last, don't do rotation, just animate down.
// - [X] Only call update when something is being dragger or animated
// - [ ] Play videos in canvas on mobile or use animated gifs.

// Data
var storiesData = [{
	user: 'lokesh',
	time: '5min',
	video: 'citylife'
}, {
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
}];

// Templates
var storyTemplate = _.template($('#story-template').html());

// Classes

var Stories = function () {
	function Stories(el, data) {
		_classCallCheck(this, Stories);

		// The amount, as a percentage width of the story card, the user must drag it to have it
		// slide to the next on release.
		this.minDragPercentToTransition = 0.5;

		// The number of pixels a MS horizontally the user is required to drag to set off this trigger.
		this.minVelocityToTransition = 0.65;

		// Bigger num creates a slower transition
		this.transitionSpeed = 10;

		// Init
		this.rotateY = 0;

		// Convenience properties
		this.el = el;
		this.$el = $(el);
		this.stories = data;
		this.count = this.stories.length;
	}

	_createClass(Stories, [{
		key: 'render',
		value: function render() {
			var fragment = document.createDocumentFragment();

			_.each(this.stories, function (story, index) {
				$(storyTemplate(story)).attr('id', 'story-' + index).appendTo(fragment);
			});

			this.$el.append(fragment);

			// Document level event handling
			this._addEventHandlers();
		}

		/*
  	Make story and its neighbors visible, hide the rest.
   */

	}, {
		key: 'show',
		value: function show(index) {
			// Update index which tracks currently shown story
			this.index = index;

			// Reset Stories transforms (container)
			this.$el.css('transform', 'translateZ(-50vw)');
			this.rotateY = 0;

			// Hide all stories
			this.$el.find('.story').hide();

			// Show and position the chosen story as well as its neighbors
			for (var i = -1; i < 2; i++) {
				var loopIndex = i + index;
				var coverOpacity = Math.abs(i);

				this.$el.find('#story-' + loopIndex).find('.story__cover').css({
					// 'will-change': 'opacity',
					'opacity': coverOpacity
				}).end().css({
					'will-change': 'transform',
					'transform': 'rotateY(' + i * 90 + 'deg) translateZ(50vw)'
				}).show();
			}
		}
	}, {
		key: 'hide',
		value: function (_hide) {
			function hide() {
				return _hide.apply(this, arguments);
			}

			hide.toString = function () {
				return _hide.toString();
			};

			return hide;
		}(function () {
			console.log(hide);
		})
	}, {
		key: '_addEventHandlers',
		value: function _addEventHandlers() {
			$(document).on('utap.stories', this._onTap.bind(this)).on('udragstart.stories', this._onDragStart.bind(this)).on('udragmove.stories', this._onDragMove.bind(this)).on('udragend.stories', this._onDragEnd.bind(this));
		}
	}, {
		key: '_removeEventHandlers',
		value: function _removeEventHandlers() {
			$(document).off('.stories');
		}
	}, {
		key: '_onTap',
		value: function _onTap(e) {
			if (this.isAnimating) {
				return;
			}

			this.isAnimating = true;

			// // Clicking the left 33% of the image takes you back, the rest forwards.
			if (e.px_start_x < window.innerWidth / 3) {
				this.targetRotateY = 90;
				this.targetDirection = 'back';
			} else {
				this.targetRotateY = -90;
				this.targetDirection = 'forward';
			}

			this.update();
		}
	}, {
		key: '_onDragStart',
		value: function _onDragStart(e) {
			this.targetDirection = null;
			this.isDragging = true;
			this.el.style.willChange = 'transform';

			this.dragStartX = e.px_start_x;
			this.dragCurrentX = this.dragStartX;

			this.update();
		}
	}, {
		key: '_onDragMove',
		value: function _onDragMove(e) {
			this.dragCurrentX = e.px_current_x;
			// this.update();
		}
	}, {
		key: '_onDragEnd',
		value: function _onDragEnd(e) {
			this.isDragging = false;
			this.isAnimating = true;

			// Did the user show intent to go to a different card? We check in two ways:
			// 1. Has the card been dragged far to one side?
			// 2. Did the drag velocity imply movement to one side?

			// Note: We use an adjusted viewport width to calculate the drag to side threshold. As the
			// viewport gets larger than 320px, we shrink the viewport value used in the calcuation.
			// This prevents scenarios such as when the minDragPercent is 0.5 and actual viewport width
			// is 2048px, requiring the user to drag over 1024px to trigger the card change.

			// 1.
			var dragDeltaX = -e.px_tdelta_x;
			var adjustedViewportWidth = (window.innerWidth - 320) / 4 + 320;
			var threshold = adjustedViewportWidth * this.minDragPercentToTransition;

			// 2.
			var velocity = e.px_tdelta_x / e.ms_elapsed;

			if (dragDeltaX > threshold || velocity < -1 * this.minVelocityToTransition) {
				this.targetRotateY = 90;
				this.targetDirection = 'back';
			} else if (Math.abs(dragDeltaX) > threshold || velocity > this.minVelocityToTransition) {
				this.targetRotateY = -90;
				this.targetDirection = 'forward';
			} else {
				this.targetRotateY = 0;
			}
		}
	}, {
		key: 'update',
		value: function update() {
			// Update calls itself at the end and loop. We break the loop once dragging and animations
			// are both complete.
			if (!this.isDragging && !this.isAnimating) {
				return;
			}

			var setCSSAfterUpdating = this.isDragging || this.isAnimating;

			if (this.isDragging) {
				var dragDeltaX = this.dragCurrentX - this.dragStartX;

				// If on first card and dragging back OR
				// If on last card and draggin forward, add resistance.
				if (this.index === 0 && dragDeltaX > 0 || this.index + 1 === this.count && dragDeltaX < 0) {
					this.rotateY = dragDeltaX / window.innerWidth * 20;
				} else {
					this.rotateY = dragDeltaX / window.innerWidth * 90;
				}
			}

			if (this.isAnimating) {
				// Simple easing
				this.rotateY += (this.targetRotateY - this.rotateY) / this.transitionSpeed;

				// If story has nearly reached its target, bump it to final spot and stop animating.
				if (Math.abs(this.rotateY - this.targetRotateY) < 0.5) {
					this.rotateY = this.targetRotateY;
					this.el.style.willChange = 'initial';
					this.isAnimating = false;

					if (this.targetDirection) {
						this.isSwitchingStories = true;
					}
				}
			}

			if (setCSSAfterUpdating) {
				this.$el.css('transform', 'translateZ(-50vw) rotateY(' + this.rotateY + 'deg)');

				// Freater rotateY, more opacity for prev.
				// Smaller rotate, more opacity for next.
				var prevStoryOpacity = (90 - this.rotateY) / 90;
				var nextStoryOpacity = (90 - Math.abs(this.rotateY)) / 90;

				var prevIndex = this.index - 1;
				var nextIndex = this.index + 1;

				this.$el.find('#story-' + prevIndex).find('.story__cover').css('opacity', prevStoryOpacity);

				this.$el.find('#story-' + nextIndex).find('.story__cover').css('opacity', nextStoryOpacity);
			}

			if (this.isSwitchingStories) {
				var newIndex = this.targetDirection === 'forward' ? this.index + 1 : this.index - 1;
				this.show(newIndex);
				this.isSwitchingStories = false;
			}
			requestAnimationFrame(this.update.bind(this));
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this._removeEventHandlers();
			this.el.remove();
			delete this;
		}
	}]);

	return Stories;
}();

// Init

var stories = new Stories(document.querySelector('.stories'), storiesData);
stories.render();
stories.show(0);

// Prevent bouncy iOS scrolling in mobile safari
document.body.addEventListener('touchmove', function (event) {
	event.preventDefault();
}, false);
