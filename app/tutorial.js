var ignoreThisEvent = false;
var startLeg = (leg, bus) => {
  if( leg.rawData.scrollElement) {
    $(leg.rawData.scrollElement).scrollTop(leg.rawData.scrollValue);
  }
  if( leg.rawData.waitFor) {
    $(leg.rawData.waitFor).on(leg.rawData.waitForEvent, ()=>{
      if(!ignoreThisEvent){
        setTimeout(()=>{
          tourbusTour.data('tourbus').next();
        },400);
      }
    });
    if( leg.rawData.waitForIgnore) {
      $(leg.rawData.waitForIgnore).on(leg.rawData.waitForEvent, (e)=>{
        ignoreThisEvent = true;
        setTimeout(()=>{
          ignoreThisEvent = false;
        },100);
      });
    }
  }
  if( leg.rawData.highlight ) {
    const targetLeft = leg.$target.offset().left;
    const targetRight = targetLeft + leg.$target.outerWidth();
    const targetTop = leg.$target.offset().top;
    const targetBottom = targetTop + leg.$target.outerHeight();
    const padding = 2;
    $('.tour-overlay-left').css('width', targetLeft - padding);
    $('.tour-overlay-right').css('left', targetRight + padding);

    $('.tour-overlay-top').css('height', targetTop - padding);
    $('.tour-overlay-top').css('left', targetLeft - padding);
    $('.tour-overlay-top').css('width', targetRight - targetLeft + 2*padding);

    $('.tour-overlay-bottom').css('top', targetBottom + padding);
    $('.tour-overlay-bottom').css('left', targetLeft - padding);
    $('.tour-overlay-bottom').css('width', targetRight - targetLeft + 2*padding);
    $('.tour-overlay').show();
  }
  if( leg.rawData.mask) {
    $('.tour-overlay-right').css('left', 0).show();
  }
  if( !leg.rawData.enableElements) {
    $('.tour-overlay-all').show();
  }
  leg.reposition();
}

var tourbusTour = $('#tourbus-demo-1').tourbus({
  leg: {
    margin: 25,
  },
  // called when the tour starts
  onDepart: function( tourbus ) {
    $(document).off('keyup').on('keyup', (e) => {
      switch(e.keyCode) {
        // enter
        // case 13:
        // right arrow
        case 39:
          tourbusTour.data('tourbus').next();
          break;
        // left arrow
        case 37:
        // backspace
        // case 8:
          tourbusTour.data('tourbus').prev();
          break;
        // escape
        case 27:
          tourbusTour.data('tourbus').stop();
          break;
          // space for testing
        case 32:
          tourbusTour.data('tourbus').hideLeg();
          tourbusTour.data('tourbus').currentLegIndex=11;
          tourbusTour.data('tourbus').showLeg();
          //tourbusTour.data('tourbus').currentLegIndex+=1;
          break;
      }
    });  
  },
  // called when the tour is stopped for any reason
  onStop: function( tourbus ) {
    $(document).off('keyup');
  },
  // called before switching to a leg
  onLegStart: function( leg, bus ) {
    console.log(leg.$target.length);
    startLeg(leg, bus);
  },
  // called before switching _from_ a leg
  onLegEnd: function( leg, bus ) {
    if( leg.rawData.highlight ) {
      $('.tour-overlay').hide();
    }
    if( leg.rawData.mask) {
      $('.tour-overlay').hide();
    }
    if( leg.rawData.waitFor) {
      $(leg.rawData.waitFor).off(leg.rawData.waitForEvent);
    }
    if( !leg.rawData.enableElements) {
      $('.tour-overlay-all').hide();
    }
  }
} );

exports.initialize = () => {
  $('#tutorial').off('click').on('click', (e) => {
    e.preventDefault();
    tourbusTour.trigger('depart.tourbus');
  });
};