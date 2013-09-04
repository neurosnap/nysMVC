//window resize events
$(window).resize(function() {
	//get the window size
	var wsize =  $(window).width();
	if (wsize > 980 ) {
		$('.shortcuts.hided').removeClass('hided').attr("style","");
		$('.sidenav.hided').removeClass('hided').attr("style","");
	}

	var size ="Window size is:" + $(window).width();
	//console.log(size);
});

// document ready function
$(document).ready(function() {
	//------------- Datepicker -------------//
	if($('#from_date').length) {
		$("#from_date").datepicker({
			'showOtherMonths':true
		});
		$("#to_date").datepicker({
			'showOtherMonths':true
		});
	}

	//prevent font flickering in some browsers
	(function(){
	  //if firefox 3.5+, hide content till load (or 3 seconds) to prevent FOUT
	  var d = document, e = d.documentElement, s = d.createElement('style');
	  if (e.style.MozTransform === ''){ // gecko 1.9.1 inference
	    s.textContent = 'body{visibility:hidden}';
	    e.firstChild.appendChild(s);
	    function f(){ s.parentNode && s.parentNode.removeChild(s); }
	    addEventListener('load',f,false);
	    setTimeout(f,3000);
	  }
	})();

  	//Disable certain links
    $('a[href^=#]').click(function (e) {
      e.preventDefault()
    })

    $('.search-btn').addClass('nostyle');//tell uniform to not style this element

	//------------- Navigation -------------//

	mainNav = $('.mainnav>ul>li');
	mainNav.find('ul').siblings().addClass('hasUl').append('<span class="hasDrop icon16 icomoon-icon-arrow-down-2"></span>');
	mainNavLink = mainNav.find('a').not('.sub a');
	mainNavLinkAll = mainNav.find('a');
	mainNavSubLink = mainNav.find('.sub a').not('.sub li .sub a');
	mainNavCurrent = mainNav.find('a.current');

	//remove current class if have
	mainNavCurrent.removeClass('current');

	var cur_href = 'index.php?api=' + api + '&action=' + action + ((typeof id !== 'undefined' && id != '') ? '&id=' + id : '');
	cur_href = cur_href.toLowerCase();

	mainNavLinkAll.each(function(index) {

		if ($(this).attr('href').toLowerCase() == cur_href || $(this).attr('href').toLowerCase() == cur_href + '/') {

			//set new current class
			$(this).addClass('current');

			ulElem = $(this).closest('ul');
			if (ulElem.hasClass('sub')) {
				//its a part of sub menu need to expand this menu
				aElem = ulElem.prev('a.hasUl').addClass('drop');
				aElem.find('span.iconSwitch img').attr('src', image_dir + '/arrow-transition-270.png');
				ulElem.addClass('expand');
			}

		}
	});

	//set the seleceted menu element
	/*if ($.cookie("newCurrentMenu")) {
		mainNavLinkAll.each(function(index) {
			if($(this).attr('href') == $.cookie("newCurrentMenu")) {
				//set new current class
				$(this).addClass('current');

				ulElem = $(this).closest('ul');
				if(ulElem.hasClass('sub')) {
					//its a part of sub menu need to expand this menu
					aElem = ulElem.prev('a.hasUl').addClass('drop');
					ulElem.addClass('expand');
				}
				//destroy cookie
				$.cookie("newCurrentMenu",null);
			}
		});
	}*/

	//hover magic add blue color to icons when hover - remove or change the class if not you like.
	/*mainNavLinkAll.hover(
	  function () {
	    $(this).find('span.icon16').addClass('blue');
	  },
	  function () {
	    $(this).find('span.icon16').removeClass('blue');
	  }
	);*/

	//click magic
	mainNavLink.click(function(event) {
		$this = $(this);

		if($this.hasClass('hasUl')) {
			event.preventDefault();
			if($this.hasClass('drop')) {
				$(this).siblings('ul.sub').slideUp(500).siblings().removeClass('drop');
				$(this).find('span.iconSwitch img').attr('src', image_dir + '/arrow-transition.png');
			} else {
				$(this).siblings('ul.sub').slideDown(250).siblings().addClass('drop');
				$(this).find('span.iconSwitch img').attr('src', image_dir + '/arrow-transition-270.png');
			}
		} else {
			//has no ul so store a cookie for change class.
			//$.cookie("newCurrentMenu",$this.attr('href') ,{expires: 1});
		}
	});
	mainNavSubLink.click(function(event) {
		$this = $(this);

		if($this.hasClass('hasUl')) {
			event.preventDefault();
			if($this.hasClass('drop')) {
				$(this).siblings('ul.sub').slideUp(500).siblings().removeClass('drop');
			} else {
				$(this).siblings('ul.sub').slideDown(250).siblings().addClass('drop');
			}
		} else {
			//has no ul so store a cookie for change class.
			//$.cookie("newCurrentMenu",$this.attr('href') ,{expires: 1});
		}
	});

	//responsive buttons
	$('.resBtn>a').click(function(event) {
		$this = $(this);
		if($this.hasClass('drop')) {
			$('#sidebar>.shortcuts').slideUp(500).addClass('hided');
			$('#sidebar>.sidenav').slideUp(500).addClass('hided');
			$('#sidebar-right>.shortcuts').slideUp(500).addClass('hided');
			$('#sidebar-right>.sidenav').slideUp(500).addClass('hided');
			$this.removeClass('drop');
		} else {
			if($('#sidebar').length) {
				$('#sidebar').css('display', 'block');
				if($('#sidebar-right').length) {
					$('#sidebar-right').css({'display' : 'block', 'margin-top' : '0'});
				}
			}
			if($('#sidebar-right').length) {
				$('#sidebar-right').css('display', 'block');
			}
			$('#sidebar>.shortcuts').slideDown(250);
			$('#sidebar>.sidenav').slideDown(250);
			$('#sidebar-right>.shortcuts').slideDown(250);
			$('#sidebar-right>.sidenav').slideDown(250);
			$this.addClass('drop');
		}
	});
	$('.resBtnSearch>a').click(function(event) {
		$this = $(this);
		if($this.hasClass('drop')) {
			$('.search').slideUp(500);
			$this.removeClass('drop');
		} else {
			$('.search').slideDown(250);
			$this.addClass('drop');
		}
	});

	//Hide and show sidebar btn
	$( '.collapseBtn' ).bind( 'click', function(){
		$this = $(this);

		//left sidbar clicked
		if ($this.hasClass('leftbar')) {

			if($(this).hasClass('hide')) {
				//show sidebar
				$('#sidebarbg').css('margin-left','0');
				$('#content').css('margin-left', '173'+'px');
				$('#content-two').css('margin-left', '173'+'px');
				$('#sidebar').css({'left' : '0', 'margin-left' : '0'});

				$this.removeClass('hide');
				$('.collapseBtn.leftbar').css('top', '120'+'px').css('left', '170'+'px').removeClass('shadow');
				$this.children('a').attr('title','Hide Left Sidebar');

			} else {
				//hide sidebar
				$('#sidebarbg').css('margin-left','-299'+'px');
				$('#sidebar').css('margin-left','-299'+'px');
				$('.collapseBtn.leftbar').animate({ //use .hide() if you experience heavy animation :)
				    left: '10',
				    top: '120'
				  }, 500, 'easeInExpo', function() {
				    // Animation complete.

				}).addClass('shadow');
				//expand content
				$this.addClass('hide');
				$this.children('a').attr('title','Show Left Sidebar');
				if($('#content').length) {
					$('#content').css('margin-left', '0');
				}
				if($('#content-two').length) {
					$('#content-two').css('margin-left', '0');
				}

			}

		}

		//right sidebar clicked
		if ($this.hasClass('rightbar')) {

			if($(this).hasClass('hide')) {
				//show sidebar
				$('#sidebarbg-right').css('margin-right','0');
				$('#sidebar-right').css({'right' : '0', 'margin-right' : '0'});
				if($('#content').length) {
					$('#content').css('margin-left', '173'+'px');
				}
				if($('#content-one').length) {
					$('#content-one').css('margin-right', '172'+'px');
				}
				if($('#content-two').length) {
					$('#content-two').css({'margin-right' : '172' + 'px'});
				}
				/*if($('#sidebar').length) {
					$('#sidebar').css({'left' : '0', 'margin-left' : '0'});
				}*/
				$this.removeClass('hide');
				$('.collapseBtn.rightbar').css('top', '120'+'px').css('right', '18'+'px').removeClass('shadow');
				$this.children('a').attr('title','Hide Right Sidebar');

			} else {
				//hide sidebar
				$('#sidebarbg-right').css('margin-right','-299'+'px');
				$('#sidebar-right').css('margin-right','-299'+'px');
				if($('#content').length) {
					$('#content').css('margin-right', '0');
				}
				if($('#content-one').length) {
					$('#content-one').css({'margin-left': '0', 'margin-right' : '0'});
				}
				if($('#content-two').length) {
					$('#content-two').css({'margin-right' : '0'});
				}
				$('.collapseBtn.rightbar').animate({ //use .hide() if you experience heavy animation :)
				    'right': '10',
				    'top': '78'
				  }, 500, 'easeInExpo', function() {
				    // Animation complete.

				}).addClass('shadow');
				//expand content
				$this.addClass('hide');
				$this.children('a').attr('title','Show Right Sidebar')
			}

		}
	});


	//------------- widget box magic -------------//

	var widget = $('div.box');
	var widgetOpen = $('div.box').not('div.box.closed');
	var widgetClose = $('div.box.closed');
	//close all widgets with class "closed"
	widgetClose.find('div.content').hide();
	widgetClose.find('.title>.minimize').removeClass('minimize').addClass('maximize');

	widget.find('.title>a').click(function (event) {
		event.preventDefault();
		var $this = $(this);
		if($this .hasClass('minimize')) {
			//minimize content
			$this.removeClass('minimize').addClass('maximize');
			$this.parent('div').addClass('min');
			cont = $this.parent('div').next('div.content')
			cont.slideUp(500, 'easeOutExpo'); //change effect if you want :)

		} else
		if($this .hasClass('maximize')) {
			//minimize content
			$this.removeClass('maximize').addClass('minimize');
			$this.parent('div').removeClass('min');
			cont = $this.parent('div').next('div.content');
			cont.slideDown(500, 'easeInExpo'); //change effect if you want :)
		}

	})

	//show minimize and maximize icons
	widget.hover(function() {
		    $(this).find('.title>a').show(50);
		}
		, function(){
			$(this).find('.title>a').hide();
	});

	//add shadow if hover box
	widget.hover(function() {
		    $(this).addClass('hover');
		}
		, function(){
			$(this).removeClass('hover');
	});


	//------------- Tooltips -------------//

	if (typeof $.prototype.qtip === 'function') {

		//top tooltip
		$('.tip').qtip({
			'content': false,
			'position': {
				my: 'bottom center',
				at: 'top center',
				viewport: $(window)
			},
			style: {
				classes: 'ui-tooltip-tipsy'
			}
		});

		//tooltip in right
		$('.tipR').qtip({
			'content': false,
			'position': {
				my: 'left center',
				at: 'right center',
				viewport: $(window)
			},
			style: {
				classes: 'ui-tooltip-tipsy'
			}
		});

		//tooltip in bottom
		$('.tipB').qtip({
			'content': false,
			'position': {
				my: 'top center',
				at: 'bottom center',
				viewport: $(window)
			},
			style: {
				classes: 'ui-tooltip-tipsy'
			}
		});

		//tooltip in left
		$('.tipL').qtip({
			'content': false,
			'position': {
				my: 'right center',
				at: 'left center',
				viewport: $(window)
			},
			style: {
				classes: 'ui-tooltip-tipsy'
			}
		});

	}

	//--------------- Boostrap tooltips ------------------//
	if (typeof $.prototype.tooltip === 'function') {
		$('.btip').tooltip();
	}


	//------------- Tags plugin  -------------//
	if (typeof $.prototype.select2 === 'function') {
		$("#tags").select2({
			tags:["red", "green", "blue", "orange"]
		});
	}

    //--------------- Dialogs ------------------//
    if (typeof $.prototype.dialog === 'function') {
/*
	    $('#modal_save_params').dialog({
			'autoOpen': false,
			'modal': true,
			'dialogClass': 'dialog',
			'buttons': {
				"Close": function() {
					$(this).dialog("close");
				}
			}
		});

		// JQuery UI Modal Dialog
		$('#modal').dialog({
			'autoOpen': false,
			'modal': true,
			'dialogClass': 'dialog',
			'buttons': {
				"Close": function() {
					$(this).dialog("close");
				}
			}
		});
*/
		$("div.dialog button").addClass("btn");
/*
		//Boostrap modal
		$('#myModal').modal({ show: false});
		//add event to modal after closed
		$('#myModal').on('hidden', function () {
		  	$.pnotify({
			    title: 'Modal',
			    'text': 'Modal window is closed',
			    icon: 'picon icon16 entypo-icon-warning white',
			    opacity: 0.95,
			    sticker: false,
			    history: false
			});
		});
*/
	}

	//--------------- Popovers ------------------//
	if (typeof $.prototype.tooltip === 'function') {

		//using data-placement trigger
		$("a[rel=popover]")
	      .popover()
	      .click(function(e) {
	        e.preventDefault()
	    });

	    //using js trigger
	    $("a[rel=popoverTop]")
	      .popover({placement: 'top'})
	      .click(function(e) {
	        e.preventDefault()
	    });

    }

    //--------------- Pines notify  ------------------//

    if (typeof $.prototype.pnotify === 'function') {

	    //regular notice
	    $('#noticeR').click(function(){
			$.pnotify({
			    title: 'Regular Notice',
			    'text': 'Check me out! I\'m a notice.',
			    icon: 'picon icon16 entypo-icon-warning white',
			    opacity: 0.95,
			    sticker: false,
			    history: false
			});
		});

		//Sticky notice
	    $('#noticeS').click(function(){
			$.pnotify({
			    title: 'Sticky Notice',
			    'text': 'Check me out! I\'m a sticky notice. You\'ll have to close me yourself.',
			    hide: false,
			    icon: 'picon icon16 entypo-icon-warning white',
			    opacity: 0.95,
			    history: false,
			    sticker: false
			});
		});

		//Regular info
	    $('#infoR').click(function(){
			$.pnotify({
				'type': 'info',
			    title: 'New Thing',
	    		'text': 'Just to let you know, something happened.',
			    icon: 'picon icon16 brocco-icon-info white',
			    opacity: 0.95,
			    history: false,
			    sticker: false
			});
		});

		//Sticky info
	    $('#infoS').click(function(){
			$.pnotify({
				'type': 'info',
			    title: 'Sticky Info',
	   			'text': 'Sticky info, you know, like a newspaper covered in honey.',
			    icon: 'picon icon16 brocco-icon-info white',
			    hide: false,
			    opacity: 0.95,
			    history: false,
			    sticker: false
			});
		});

		//Regular success
	    $('#successR').click(function(){
			$.pnotify({
				'type': 'success',
			    title: 'Regular Success',
	    		'text': 'That thing that you were trying to do worked!',
			    icon: 'picon icon16 iconic-icon-check-alt white',
			    opacity: 0.95,
			    history: false,
			    sticker: false
			});
		});

		//Sticky success
	    $('#successS').click(function(){
			$.pnotify({
				'type': 'success',
			    title: 'Sticky Success',
	    		'text': 'Sticky success... I\'m not even gonna make a joke.',
			    icon: 'picon icon16 iconic-icon-check-alt white',
			    opacity: 0.95,
			    hide:false,
			    history: false,
			    sticker: false
			});
		});

		//Regular success
	    $('#errorR').click(function(){
			$.pnotify({
				'type': 'error',
			    title: 'Oh No!',
	    		'text': 'Something terrible happened.',
			    icon: 'picon icon24 typ-icon-cancel white',
			    opacity: 0.95,
			    history: false,
			    sticker: false
			});
		});

		//Sticky success
	    $('#errorS').click(function(){
			$.pnotify({
				'type': 'error',
			    title: 'Oh No!',
	    		'text': 'Something terrible happened.',
			    icon: 'picon icon24 typ-icon-cancel white',
			    opacity: 0.95,
			    hide:false,
			    history: false,
			    sticker: false
			});
		});

	}

	//remove loadstate class from body and show the page
	setTimeout('$("html").removeClass("loadstate")',100);

});