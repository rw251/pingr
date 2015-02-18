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
	
	/********************************
	Toggle Aside Menu
	********************************/
	
	$('#aside-toggle').on('click', function(){
		if($('aside.left-panel').hasClass('collapsed')){
			$('#topnavbar').removeClass('part');
			$('#topnavbar').addClass('full');
		} else {
			$('#topnavbar').addClass('part');
			$('#topnavbar').removeClass('full');
		}
		$('aside.left-panel').toggleClass('collapsed');
		$('#main').toggleClass('shorty');
	});
	
	/********************************
	Aside Navigation Menu
	********************************/

	$("aside.left-panel nav.navigation > ul > li:has(ul) > a").click(function(){
		
		if( $("aside.left-panel").hasClass('collapsed') === false || $(window).width() < 768 ){

		
		
		$("aside.left-panel nav.navigation > ul > li > ul").slideUp(300);
		$("aside.left-panel nav.navigation > ul > li").removeClass('active');
		
		if(!$(this).next().is(":visible"))
		{
			
			$(this).next().slideToggle(300,function(){ $("aside.left-panel:not(.collapsed)").getNiceScroll().resize(); });
			$(this).closest('li').addClass('active');
		}
		
		return false;
		
		}
		
	});
	
	$("aside.left-panel nav.navigation > ul > li > ul > li > a").on('click', function(e){
		var menu = $(this).parent().parent().parent().find('span').html();
		var submenu = $(this).html();
		
		drawMainCharts(menu, submenu);
		hidePanels();
	});
	

});



