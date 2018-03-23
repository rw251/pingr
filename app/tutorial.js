const base = require('./base');
const template = require('./template');

let ignoreThisEvent = false;
let isNextEnabled = true;
let isAnimating = false;
let wasNextClicked = true;
let lastLeg = 0;
let clickThisIfGoingForwards;
let clickThisIfGoingBackwards;
let visitedUrls = [];

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

const showTotalMask = () => {
  $('.tutorial-highlight-mask.tutorial-mask-right').css('left', 0).show();
};
const hideTotalMask = () => {
  $('.tutorial-highlight-mask').hide();
  $('.tutorial-disabling-mask').hide();
};
const showMenuMask = () => {
  $('.tutorial-menu-mask').show();
};
const hideMenuMask = () => {
  $('.tutorial-menu-mask').hide();
};

const disableScroll = () => {
  // TODO this is a possibility...
  // $(window).on('scroll', (e) => {
  //   e.preventDefault();
  //   e.stopPropagation();
  //   $(window).scrollTop(0);
  // });
};

const reposition = (leg) => {
  // Do leg itselft
  leg.reposition();

  // Do highlight mask if needed
  if (leg.rawData.highlight) {
    arrangeMask('highlight', leg.$target, 2);
  }

  // Do disabling mask if needed
  if (leg.rawData.enableEl) {
    arrangeMask('disabling', $(leg.rawData.enableEl), 0);
  }
};

const getResizeListener = tour => [
  () => {
    reposition(tour.currentLeg());
  },
];

const tabMapping = {
  overviewTab: ['overview'],
  indicatorTab: ['overview', 'indicator'],
  patientTab: ['overview', 'patient'],
  patientsTab: ['overview', 'patients'],
  actionPlanTab: ['overview', 'action'],
};

const beforeLegStart = (leg, bus) => {
  isAnimating = true;
  if (!leg.$target.is(':visible')) {
    if ($(leg.rawData.el).is(':visible')) {
      leg.$target = $(leg.rawData.el);
    } else {
      setTimeout(() => {
        beforeLegStart(leg, bus);
      }, 100);
      return false;
    }
  }
  hideTotalMask();
  if (leg.rawData.moveableElement) {
    leg.$target = $(leg.rawData.el);
  }
  if (leg.rawData.scrollElement) {
    $(leg.rawData.scrollElement).scrollTop(leg.rawData.scrollValue);
  }
  if (leg.rawData.waitFor) {
    isNextEnabled = false;
    $(leg.rawData.waitFor).on(leg.rawData.waitForEvent, () => {
      if (!ignoreThisEvent) {
        setTimeout(() => {
          wasNextClicked = false;
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
    showTotalMask();
  }
  if (leg.rawData.enableEl) {
    arrangeMask('disabling', $(leg.rawData.enableEl), 0);
  } else {
    $('.tutorial-disabling-mask.tutorial-mask-right').css('left', 0).show();
  }
  leg.reposition();
  if (leg.rawData.left) {
    // for data-left it seems to add it to rather than overwrite
    leg.$el.css({ left: leg.rawData.left });
  }
  leg.$el
    .css({ visibility: 'visible', opacity: 0, zIndex: 9999 })
    .animate({ opacity: 1.0 }, 600, () => {
      leg.show();
      isAnimating = false;
    });
  return false;
};

const tourbusParams = {
  leg: { margin: 25 },
  // called when the tour starts
  onDepart(bus) {
    lastLeg = 0;
    visitedUrls = [];
    // close if click off pop up
    $('.tutorial-highlight-mask').on('click', () => {
      bus.stop();
    });
    //
    $(document).off('keyup').on('keyup', (e) => {
      switch (e.keyCode) {
        // enter
        // case 13:
        // right arrow
        case 39:
          if (isNextEnabled && !isAnimating) bus.next();
          break;
        // left arrow
        case 37:
        // backspace
        // case 8:
          if (!isAnimating) bus.prev();
          break;
        // escape
        case 27:
          bus.stop();
          break;
        default:
      }
    });
  },
  // called when the tour is stopped for any reason
  onStop() {
    hideTotalMask();
    $(document).off('keyup');
  },
  // called before switching to a leg
  onLegStart(leg, bus) {
    if (lastLeg < leg.index && clickThisIfGoingForwards) {
      // going forwards
      if (clickThisIfGoingForwards === "a[href='#agreedactions']") {
        template.loadContent('#agreedactions');
      } else if (clickThisIfGoingForwards === '#search-box label a') {
        template.loadContent('#patients');
      } else {
        $(clickThisIfGoingForwards).first().click();
      }
    } else if (lastLeg > leg.index) {
      // going backwards
      visitedUrls.pop();
      let i = visitedUrls.length;
      while (i > 0 && visitedUrls[i - 1] === window.location.hash) i -= 1;
      if (clickThisIfGoingBackwards) {
        if (clickThisIfGoingBackwards === "a[href='#overview']") {
          template.loadContent('#overview');
        } else if (clickThisIfGoingBackwards === "a[href='#patients']") {
          template.loadContent('#patients');
        } else if (clickThisIfGoingBackwards === 'URL') {
          template.loadContent(visitedUrls[i - 1]);
        } else {
          $(clickThisIfGoingBackwards).first().click();
        }
      }
    }
    lastLeg = leg.index;
    return beforeLegStart(leg, bus);
  },
  // called before switching _from_ a leg
  onLegEnd(leg) {
    if (visitedUrls.length === 0 || visitedUrls[visitedUrls.length - 1] !== window.location.hash) {
      visitedUrls.push(window.location.hash);
    }
    clickThisIfGoingForwards = null;
    clickThisIfGoingBackwards = null;
    if (leg.rawData.waitFor) {
      isNextEnabled = true;
      $(leg.rawData.waitFor).off(leg.rawData.waitForEvent);
      if (wasNextClicked) {
        clickThisIfGoingForwards = leg.rawData.waitFor;
      }
      wasNextClicked = true;
    }
    if (leg.rawData.clickOnBack) {
      clickThisIfGoingBackwards = leg.rawData.clickOnBack;
    }
  },
};

const startTour = (tourId) => {
  const tour = $.tourbus(tourId, tourbusParams);
  base.resizeListeners = getResizeListener(tour);
  disableScroll();
  $.ajax({ url: '/api/tutorial/viewed', method: 'POST', dataType: 'json' });
  tour.depart();
  return tour;
};

const hideMenu = () => {
  hideMenuMask();
  $('.tutorial-menu').hide();
};

let alreadyPressed = false;
const showMenu = () => {
  alreadyPressed = false;
  $('.tutorial-menu').show();

  $('.tutorial-menu li').off('click').on('click', (e) => {
    if (alreadyPressed) return;
    alreadyPressed = true;
    const selectedTutorial = $(e.currentTarget).data('id');

    if (selectedTutorial === 'overview') {
      // navigate to overview tab first
      template.loadContent('#overview');
    }

    hideMenu();

    startTour(`#tutorial-${selectedTutorial}`);
  });
};

const getAvailableTutorials = () => {
  const currentTab = base.getTab();
  const availableTutorials = tabMapping[currentTab];
  return availableTutorials;
};

const showTutorials = (tutorials = []) => {
  if (tutorials.length === 1) {
    // start tutorial
    startTour(`#tutorial-${tutorials[0]}`);
  } else if (tutorials.length > 1) {
    // show main mask
    showMenuMask();
    // hide all tutorials from menu
    $('.tutorial-menu li').hide();

    // show available tutorials
    tutorials.forEach((t) => {
      $(`.tutorial-menu li[data-id=${t}]`).show();
    });
    showMenu();
    $('.tutorial-close').on('click', () => {
      hideMenu();
    });
    $(document).off('keyup').on('keyup', (e) => {
      switch (e.keyCode) {
        // escape
        case 27:
          hideMenu();
          break;
        default:
      }
    });
  } else {
    // starting not on a tab so let's just go to the overview
    template.loadContent('#overview');

    startTour('#tutorial-overview');
  }
};

let introTour;

const wireUpTutorialLink = () => {
  $('#tutorial').off('click').on('click', (clickEvent) => {
    clickEvent.preventDefault();

    // close existing intro tour if open
    if (introTour) {
      introTour.stop();
      introTour = null;
    }

    const availableTutorials = getAvailableTutorials();
    showTutorials(availableTutorials);
  });
};

const waitUntilReady = () => {
  if (!$('#tutorial').is(':visible')) {
    setTimeout(() => {
      waitUntilReady();
    }, 2000);
  } else {
    introTour = startTour('#tutorial-intro');
  }
};

let hasAlreadyBeenCalled = false;
const showIntroduction = () => {
  if (!hasAlreadyBeenCalled) {
    hasAlreadyBeenCalled = true;
    waitUntilReady();
  }
};

exports.initialize = wireUpTutorialLink;

exports.intro = showIntroduction;
