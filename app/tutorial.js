const $ = require('jquery');

let ignoreThisEvent = false;

exports.initialize = () => {
  $('#tutorial').off('click').on('click', (clickEvent) => {
    clickEvent.preventDefault();
    const tour = $.tourbus('#tourbus-demo-1', {
      leg: { margin: 25 },
      // called when the tour starts
      onDepart(bus) {
        $(document).off('keyup').on('keyup', (e) => {
          switch (e.keyCode) {
            // enter
            // case 13:
            // right arrow
            case 39:
              bus.next();
              break;
            // left arrow
            case 37:
            // backspace
            // case 8:
              bus.prev();
              break;
            // escape
            case 27:
              bus.stop();
              break;
              // space for testing
            case 32:
              bus.hideLeg();
              bus.currentLegIndex = 11;
              bus.showLeg();
              break;
            default:
          }
        });
      },
      // called when the tour is stopped for any reason
      onStop() {
        $(document).off('keyup');
      },
      // called before switching to a leg
      onLegStart(leg, bus) {
        if (leg.rawData.scrollElement) {
          $(leg.rawData.scrollElement).scrollTop(leg.rawData.scrollValue);
        }
        if (leg.rawData.waitFor) {
          $(leg.rawData.waitFor).on(leg.rawData.waitForEvent, () => {
            if (!ignoreThisEvent) {
              setTimeout(() => {
                bus.next();
              }, 400);
            }
          });
          if (leg.rawData.waitForIgnore) {
            $(leg.rawData.waitForIgnore).on(leg.rawData.waitForEvent, () => {
              ignoreThisEvent = true;
              setTimeout(() => {
                ignoreThisEvent = false;
              }, 100);
            });
          }
        }
        if (leg.rawData.highlight) {
          const targetLeft = leg.$target.offset().left;
          const targetRight = targetLeft + leg.$target.outerWidth();
          const targetTop = leg.$target.offset().top;
          const targetBottom = targetTop + leg.$target.outerHeight();
          const padding = 2;
          $('.tour-overlay-left').css('width', targetLeft - padding);
          $('.tour-overlay-right').css('left', targetRight + padding);

          $('.tour-overlay-top').css('height', targetTop - padding);
          $('.tour-overlay-top').css('left', targetLeft - padding);
          $('.tour-overlay-top').css('width', (targetRight - targetLeft) + (2 * padding));

          $('.tour-overlay-bottom').css('top', targetBottom + padding);
          $('.tour-overlay-bottom').css('left', targetLeft - padding);
          $('.tour-overlay-bottom').css('width', (targetRight - targetLeft) + (2 * padding));
          $('.tour-overlay').show();
        }
        if (leg.rawData.mask) {
          $('.tour-overlay-right').css('left', 0).show();
        }
        if (!leg.rawData.enableElements) {
          $('.tour-overlay-all').show();
        }
        leg.reposition();
      },
      // called before switching _from_ a leg
      onLegEnd(leg) {
        if (leg.rawData.highlight) {
          $('.tour-overlay').hide();
        }
        if (leg.rawData.mask) {
          $('.tour-overlay').hide();
        }
        if (leg.rawData.waitFor) {
          $(leg.rawData.waitFor).off(leg.rawData.waitForEvent);
        }
        if (!leg.rawData.enableElements) {
          $('.tour-overlay-all').hide();
        }
      },
    });
    tour.depart();
  });
};
