// TODO: On mobile, let user scroll vertically even if their starting press is on a card.
// TODO: requestAnimationFrame, only when animation needed
// TODO: Don't have Card class mess with out card els when swiped away. Trigger event and have Cards
//       class handle.

class Card {
	constructor(el) {
		// The amount, as a percentage width of the card, the user must drag it to have it slide out
		// one release.
		this.minDragPercentToDiscard = 0.5;

		this.el = el;
		this.$el = $(el);

		this.isDragging = false;
		this.isAnimating = false;
		this.hasArrivedAtSwipeAwayTarget = false;

		this.clientRect = this.el.getBoundingClientRect();
		this.width = this.clientRect.width;
		this.outerHeightWithMargin = this.$el.outerHeight(true);

		this.translateX = 0; // Tracks current translateX tranform value
		this.targetX = 0;

		this.dragStartX = 0;
		this.dragCurrentX = 0;

		this.addEventHandlers();
	}

	addEventHandlers() {
		this.$el.on('touchstart.swipe mousedown.swipe', this.onDragStart.bind(this)).on('touchmove.swipe mousemove.swipe', this.onDragMove.bind(this)).on('touchend.swipe mouseup.swipe', this.onDragEnd.bind(this));
	}

	removeEventHandlers() {
		this.$el.off('.swipe');
	}

	onDragStart(e) {
		this.isDragging = true;
		this.el.style.willChange = 'transform';

		this.dragStartX = e.pageX || e.originalEvent.touches[0].pageX;
		this.dragCurrentX = this.dragStartX;

		e.preventDefault();
	}

	onDragMove(e) {
		this.dragCurrentX = e.pageX || e.originalEvent.touches[0].pageX;
	}

	onDragEnd(e) {
		this.isDragging = false;
		this.isAnimating = true;

		// Has the card been dragged far enough to the left or right to enable to the slide out
		// animation. Otherwise, we'll be easing it back into the start position.
		let dragDistanceX = this.dragCurrentX - this.dragStartX;
		let threshold = this.width * this.minDragPercentToDiscard;

		if (Math.abs(dragDistanceX) > threshold) {
			this.targetX = dragDistanceX > 0 ? this.width * 1.25 : -this.width * 1.25;
		} else {
			this.targetX = 0;
		}
	}

	update() {
		let updateCSSAfterUpdating = this.isDragging || this.isAnimating;

		if (this.isDragging) {
			this.translateX = this.dragCurrentX - this.dragStartX;
		}

		if (this.isAnimating) {
			this.translateX += (this.targetX - this.translateX) / 4;

			// If card has nearly reached its target, bump it to final spot and stop animating.
			if (Math.abs(this.translateX - this.targetX) < 1) {
				this.translateX = this.targetX;
				this.el.style.willChange = 'initial';

				this.isAnimating = false;

				// If card has finished animating out of screen
				if (this.targetX !== 0) {
					this.hasArrivedAtSwipeAwayTarget = true;
				}
			}
		}

		if (updateCSSAfterUpdating) {
			this.$el.css({
				'transform': `translateX(${ this.translateX }px)`,
				'opacity': (this.width - Math.abs(this.translateX)) / this.width
			});
		}

		if (this.hasArrivedAtSwipeAwayTarget) {
			let $cards = $('.card');
			let cardIndex = $cards.index(this.$el);
			let $cardsAfterSwiped = $cards.slice(cardIndex);

			let self = this;

			$cardsAfterSwiped.each(function (i) {
				this.style.willChange = 'transform';
				$(this).css('transform', `translateY(${ self.outerHeightWithMargin }px)`);
				this.addEventListener('transitionend', self.onTransitionComplete.bind(this));
			});

			requestAnimationFrame(function () {
				$cardsAfterSwiped.each(function (i) {
					$(this).css({
						'transform': '',
						'transition': 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)'
					});
				});
			});

			this.hasArrivedAtSwipeAwayTarget = false;
			this.destroy();
		}
	}

	onTransitionComplete() {
		$(this).css('transition', '');
	}

	destroy() {
		this.el.remove();
		delete this;
	}
}

let cards = [];

function updateCards() {
	// for (let card of cards) {
	// 	card.update();
	// }
	// requestAnimationFrame(updateCards);
}

$(function () {
	$('.stories').on('click', function (e) {
		$(this).toggleClass('rotate');
	});

	// $('.story__video').on('click', function(e) {
	// 	if (this.paused) {
	// 		this.play();
	// 	} else {
	// 		this.pause();
	// 	}
	// })

	// $('.card').each(function() {
	// 	cards.push(new Card(this));
	// })

	// requestAnimationFrame(updateCards);
});
