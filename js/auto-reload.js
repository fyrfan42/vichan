/*
 * auto-reload.js
 * https://github.com/savetheinternet/Tinyboard/blob/master/js/auto-reload.js
 *
 * Brings AJAX to Tinyboard.
 *
 * Released under the MIT license
 * Copyright (c) 2012 Michael Save <savetheinternet@tinyboard.org>
 *
 * Usage:
 *   $config['additional_javascript'][] = 'js/jquery.min.js';
 *   //$config['additional_javascript'][] = 'js/titlebar-notifications.js';
 *   $config['additional_javascript'][] = 'js/auto-reload.js';
 *
 */

auto_reload_enabled = true; // for watch.js to interop

$(document).ready(function(){
	if($('div.banner').length == 0)
		return; // not index
		
	if($(".post.op").size() != 1)
	return; //not thread page
	
	var poll_interval;

	var end_of_page = false;

        var new_posts = 0;
	var first_new_post = null;

	if (typeof update_title == "undefined") {
	   var update_title = function() { };
	}

	if (typeof add_title_collector != "undefined")
	add_title_collector(function(){
	  return new_posts;
	});

	var window_active = true;
	$(window).focus(function() {
		window_active = true;
		recheck_activated();
	});
	$(window).blur(function() {
		window_active = false;
	});
	
	var recheck_activated = function() {
		if (new_posts && window_active &&
			$(window).scrollTop() + $(window).height() >=
			$(first_new_post).position().top) {

			new_posts = 0;
		}
		update_title();
	};

	var poll = function() {
		$.ajax({
			url: document.location,
			data: {nocache: Math.random()},
			success: function(data) {
				$(data).find('div.post.reply').each(function() {
					var id = $(this).attr('id');
					if($('#' + id).length == 0) {
						if (!new_posts) {
							first_new_post = this;
						}
						$(this).insertAfter($('div.post:last').next()).after('<br class="clear">');
						new_posts++;
						$(document).trigger('new_post', this);
						recheck_activated();
					}
				});
				time_loaded = Date.now(); // interop with watch.js
			}
		});
		
		clearTimeout(poll_interval);
		poll_interval = setTimeout(poll, end_of_page ? 3000 : 10000);
	};
	
	$(window).scroll(function() {
		recheck_activated();

		if($(this).scrollTop() + $(this).height() <
			$('div.post:last').position().top + $('div.post:last').height()) {
			end_of_page = false;
			return;
		}
		
		clearTimeout(poll_interval);
		poll_interval = setTimeout(poll, 100);
		end_of_page = true;
	}).trigger('scroll');

	poll_interval = setTimeout(poll, 3000);
});

