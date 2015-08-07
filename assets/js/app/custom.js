jQuery(function($) {

  /********************************
  Trigger event when tab is made active
  ********************************/
  var _oldAddClass = $.fn.addClass;

  $.fn.addClass = function() {
    // Execute the original method.
      var result = _oldAddClass.apply( this, arguments );

      // you can trigger a before show if you want

	  if(arguments && arguments[0]==='active')
		$(this).trigger('afterAddClass');

      // now use the old function to show the element passing the new callback
      return result;
    };
 });

$(function(){	


});
