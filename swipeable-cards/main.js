'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

// TODO: On mobile, let user scroll vertically even if their starting press is on a card.
// TODO: requestAnimationFrame, only when animation needed
// TODO: Don't have Card class mess with out card els when swiped away. Trigger event and have Cards
//       class handle.

var Card = function () {
	function Card(el) {
		_classCallCheck(this, Card);

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

	_createClass(Card, [{
		key: 'addEventHandlers',
		value: function addEventHandlers() {
			this.$el.on('touchstart.swipe mousedown.swipe', this.onDragStart.bind(this)).on('touchmove.swipe mousemove.swipe', this.onDragMove.bind(this)).on('touchend.swipe mouseup.swipe', this.onDragEnd.bind(this));
		}
	}, {
		key: 'removeEventHandlers',
		value: function removeEventHandlers() {
			this.$el.off('.swipe');
		}
	}, {
		key: 'onDragStart',
		value: function onDragStart(e) {
			this.isDragging = true;
			this.el.style.willChange = 'transform';

			this.dragStartX = e.pageX || e.originalEvent.touches[0].pageX;
			this.dragCurrentX = this.dragStartX;

			e.preventDefault();
		}
	}, {
		key: 'onDragMove',
		value: function onDragMove(e) {
			this.dragCurrentX = e.pageX || e.originalEvent.touches[0].pageX;
		}
	}, {
		key: 'onDragEnd',
		value: function onDragEnd(e) {
			this.isDragging = false;
			this.isAnimating = true;

			// Has the card been dragged far enough to the left or right to enable to the slide out
			// animation. Otherwise, we'll be easing it back into the start position.
			var dragDistanceX = this.dragCurrentX - this.dragStartX;
			var threshold = this.width * this.minDragPercentToDiscard;

			if (Math.abs(dragDistanceX) > threshold) {
				this.targetX = dragDistanceX > 0 ? this.width * 1.25 : -this.width * 1.25;
			} else {
				this.targetX = 0;
			}
		}
	}, {
		key: 'update',
		value: function update() {
			var _this = this;

			var updateCSSAfterUpdating = this.isDragging || this.isAnimating;

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
					'transform': 'translateX(' + this.translateX + 'px)',
					'opacity': (this.width - Math.abs(this.translateX)) / this.width
				});
			}

			if (this.hasArrivedAtSwipeAwayTarget) {
				(function () {
					var $cards = $('.card');
					var cardIndex = $cards.index(_this.$el);
					var $cardsAfterSwiped = $cards.slice(cardIndex);

					var self = _this;

					$cardsAfterSwiped.each(function (i) {
						this.style.willChange = 'transform';
						$(this).css('transform', 'translateY(' + self.outerHeightWithMargin + 'px)');
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

					_this.hasArrivedAtSwipeAwayTarget = false;
					_this.destroy();
				})();
			}
		}
	}, {
		key: 'onTransitionComplete',
		value: function onTransitionComplete() {
			$(this).css('transition', '');
		}
	}, {
		key: 'destroy',
		value: function destroy() {
			this.el.remove();
			delete this;
		}
	}]);

	return Card;
}();

var cards = [];

function updateCards() {
	var _iteratorNormalCompletion = true;
	var _didIteratorError = false;
	var _iteratorError = undefined;

	try {
		for (var _iterator = cards[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
			var card = _step.value;

			card.update();
		}
	} catch (err) {
		_didIteratorError = true;
		_iteratorError = err;
	} finally {
		try {
			if (!_iteratorNormalCompletion && _iterator.return) {
				_iterator.return();
			}
		} finally {
			if (_didIteratorError) {
				throw _iteratorError;
			}
		}
	}

	requestAnimationFrame(updateCards);
}

$(function () {
	$('.card').each(function () {
		cards.push(new Card(this));
	});

	requestAnimationFrame(updateCards);
});
