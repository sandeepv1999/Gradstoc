jQuery(function() {

  var html = jQuery('html, body'),
      navContainer = jQuery('.nav-container'),
      navToggle = jQuery('.nav-toggle'),
      navDropdownToggle = jQuery('.has-dropdown');

  // Nav toggle
  navToggle.on('click', function(e) {
      var jQuerythis = jQuery(this);
      e.preventDefault();
      jQuerythis.toggleClass('is-active');
      navContainer.toggleClass('is-visible');
      html.toggleClass('nav-open');
  });

  // Nav dropdown toggle
  navDropdownToggle.on('click', function() {
      var jQuerythis = jQuery(this);
      jQuerythis.toggleClass('is-active').children('ul').toggleClass('is-visible');
  });
  // Prevent click events from firing on children of navDropdownToggle
  navDropdownToggle.on('click', '*', function(e) {
      e.stopPropagation();
  });
});

var ww = document.body.clientWidth;

jQuery(document).ready(function() {
  jQuery('.menus ul.menu li a.parent').after('<span class="new"></span>');
  jQuery(".nav li a").each(function() {
      if (jQuery(this).next().length > 0) {
          jQuery(this).addClass("parent");
      };
  })

  jQuery('.top-links li a.parent').after('<span class="new"></span>');
  jQuery(".top-links li a").each(function() {
      if (jQuery(this).next().length > 0) {
          jQuery(this).addClass("parent");
      };
  })

  adjustMenu();
})

jQuery(window).bind('resize orientationchange', function() {
  ww = document.body.clientWidth;
  adjustMenu();
});

var adjustMenu = function() {
  if (ww < 768) {
      jQuery(".nav li").unbind('mouseenter mouseleave');
      jQuery(".nav li a.parent").unbind('click').bind('click', function(e) {
          e.preventDefault();
          jQuery(this).parent("li").toggleClass("hover");
      });
  } else if (ww >= 768) {
      jQuery(".nav li").removeClass("hover");
      jQuery(".nav li a").unbind('click');
      jQuery(".nav li").unbind('mouseenter mouseleave').bind('mouseenter mouseleave', function() {
          jQuery(this).toggleClass('hover');
      });
  }
}

jQuery(document).ready(function() {
  jQuery(window).scroll(function() {
      if (jQuery(this).scrollTop() > 300) {
          jQuery('.scroll-top').fadeIn();
          jQuery('.header').addClass('fixed');
      } else {
          jQuery('.scroll-top').fadeOut();
          jQuery('.header.fixed').removeClass('fixed');
      }
  });
  jQuery('.scroll-top').click(function() {
      jQuery("html, body").animate({
          scrollTop: 0
      }, 600);
      return false;
  });

});
 