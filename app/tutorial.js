const $ = require('jquery');

let ignoreThisEvent = false;
let isNextEnabled = true;

const arrangeMask = (maskType, target, padding) => {
  const targetLeft = target.offset().left;
  const targetRight = targetLeft + target.outerWidth();
  const targetTop = target.offset().top;
  const targetBottom = targetTop + target.outerHeight();
  $(`.tutorial-${maskType}-mask.tutorial-mask-left`).css('width', targetLeft - padding);
  $(`.tutorial-${maskType}-mask.tutorial-mask-right`).css('left', targetRight + padding);

  $(`.tutorial-${maskType}-mask.tutorial-mask-top`).css('height', targetTop - padding);
  $(`.tutorial-${maskType}-mask.tutorial-mask-top`).css('left', targetLeft - padding);
  $(`.tutorial-${maskType}-mask.tutorial-mask-top`).css('width', (targetRight - targetLeft) + (2 * padding));

  $(`.tutorial-${maskType}-mask.tutorial-mask-bottom`).css('top', targetBottom + padding);
  $(`.tutorial-${maskType}-mask.tutorial-mask-bottom`).css('left', targetLeft - padding);
  $(`.tutorial-${maskType}-mask.tutorial-mask-bottom`).css('width', (targetRight - targetLeft) + (2 * padding));
  $(`.tutorial-${maskType}-mask`).show();
};

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
              if (isNextEnabled) bus.next();
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
          isNextEnabled = false;
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
          arrangeMask('highlight', leg.$target, 2);
        }
        if (leg.rawData.mask) {
          $('.tutorial-highlight-mask.tutorial-mask-right').css('left', 0).show();
        }
        if (leg.rawData.enableEl) {
          arrangeMask('disabling', $(leg.rawData.enableEl), 0);
        } else {
          $('.tutorial-disabling-mask.tutorial-mask-right').css('left', 0).show();
        }
        leg.reposition();
      },
      // called before switching _from_ a leg
      onLegEnd(leg) {
        if (leg.rawData.waitFor) {
          isNextEnabled = true;
          $(leg.rawData.waitFor).off(leg.rawData.waitForEvent);
        }
        $('.tutorial-highlight-mask').hide();
        $('.tutorial-disabling-mask').hide();
      },
    });
    tour.depart();
  });
};
