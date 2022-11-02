jQuery(document).ready(function($) {
    'use strict';

    ;( function ( document, window, index )
    {
        var inputs = document.querySelectorAll( '.inputfile' );
        Array.prototype.forEach.call( inputs, function( input )
        {
            var label	 = input.nextElementSibling,
                labelVal = label.innerHTML;

            input.addEventListener( 'change', function( e )
            {
                var fileName = '';
                if( this.files && this.files.length > 1 )
                    fileName = ( this.getAttribute( 'data-multiple-caption' ) || '' ).replace( '{count}', this.files.length );
                else
                    fileName = e.target.value.split( '\\' ).pop();

                if( fileName )
                    label.querySelector( 'span' ).innerHTML = fileName;
                else
                    label.innerHTML = labelVal;
            });

            // Firefox bug fix
            input.addEventListener( 'focus', function(){ input.classList.add( 'has-focus' ); });
            input.addEventListener( 'blur', function(){ input.classList.remove( 'has-focus' ); });
        });
    }( document, window, 0 ));


    // modal popup sign in

    $(".header-sign .login-btn, .footer-sign-in").click(function(){
        $(".modal-sign-up").hide();
        $(".modal-forgot-in").hide();
        $(".modal-sign-in").show();
    });
    $(".header-sign .signup-btn, .footer-sign-up").click(function(){
        $(".modal-sign-in").hide();
        $(".modal-forgot-in").hide();
        $(".modal-sign-up").show();
    });
    $(".forgotPbtn").click(function(){
        $(".modal-sign-in").hide();
        $(".modal-forgot-in").show();
        $(".modal-sign-up").hide();
    });
    $(".resendMail").click(function(){
        $(".modal-sign-in").hide();
        $(".modal-resendMail-in").show();
        $(".modal-sign-up").hide();
    });

    // search area

    $('.user-top-drop, .notification-box').hide();

     $('.search-area, .user-top, .notification-area').click(function(e){
        e.stopPropagation();
     });

     $('html').click(function() {

        $('.user-top-drop').hide();
        $('.user-top').removeClass('open-user')

        $('.notification-box').hide();
        $('.notification-area').removeClass('open-notification')
    })

    $('.user-top-menu a').click(function(e) {
        $('.user-top-drop').toggle();
        $('.user-top').toggleClass('open-user')
    });

    $('.notification-btn').click(function(e) {
        $('.notification-box').toggle();
        $('.notification-area').toggleClass('open-notification')
    });

    $('.privacy-close').click(function(e) {
        $('.privacy-popup').hide();
    });

    $('.chatbox-open').click(function(e) {
        $('.chatbox-popup').fadeToggle();
    });

});

$(document).ready(function(){
    $('[data-toggle="tooltip"]').tooltip();   
});

$(document).ready(function() {
    $('#example').DataTable();
} );

$(document).ready(function() {
    $('.mdb-select').materialSelect();
});

$(function() {
    $('input[name="daterange"]').daterangepicker({
        opens: 'left'
    }, function(start, end, label) {
        console.log("A new date selection was made: " + start.format('YYYY-MM-DD') + ' to ' + end.format('YYYY-MM-DD'));
    });
});


