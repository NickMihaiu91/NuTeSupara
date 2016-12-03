var appMaster = {
    
    preLoader: function () {
        imageSources = []
        $('img').each(function () {
            var sources = $(this).attr('src');
            imageSources.push(sources);
        });
        if ($(imageSources).load()) {
            $('.pre-loader').fadeOut('slow');
        }
    },
    
    smoothScroll: function () {
        // Smooth Scrolling
        $('a[href*=#]:not([href=#carousel-example-generic])').click(function () {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') && location.hostname == this.hostname) {
                
                var target = $(this.hash);
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    $('html,body').animate({
                        scrollTop: target.offset().top
                    }, 1000);
                    return false;
                }
            }
        });
    },
    
    animateScript: function () {
        $('.scrollpoint.sp-effect1').waypoint(function () { $(this).toggleClass('active'); $(this).toggleClass('animated fadeInLeft'); }, { offset: '100%' });
        $('.scrollpoint.sp-effect2').waypoint(function () { $(this).toggleClass('active'); $(this).toggleClass('animated fadeInRight'); }, { offset: '100%' });
        $('.scrollpoint.sp-effect3').waypoint(function () { $(this).toggleClass('active'); $(this).toggleClass('animated fadeInDown'); }, { offset: '100%' });
        $('.scrollpoint.sp-effect4').waypoint(function () { $(this).toggleClass('active'); $(this).toggleClass('animated fadeIn'); }, { offset: '100%' });
        $('.scrollpoint.sp-effect5').waypoint(function () { $(this).toggleClass('active'); $(this).toggleClass('animated fadeInUp'); }, { offset: '100%' });
    },
    
    scrollMenu: function () {
        var num = 50; //number of pixels before modifying styles
        
        $(window).bind('scroll', function () {
            if ($(window).scrollTop() > num) {
                $('nav').addClass('scrolled');

            } else {
                $('nav').removeClass('scrolled');
            }
        });
    },
    
    setMinBannerHeight: function () {
        var docHeight = $(window).height();
        $('.tp-banner').css('min-height', docHeight + 'px');
    }
}; // AppMaster

var displayMessages = {
    defaultMessage: 'Ești la doar un pas de a notifica chelnerul, introdu codul mesei:',
    onInputFocused: 'Apasă pe TRIMITE după introducerea codului.',
    onButtonClicked: 'Un moment, validăm codul introdus.',
    errorMessage: 'Codul introdus este incorect.',
    redirectToButtonPage: 'Succes!'
};

var pageMethods = {
    bindPageEvents: function () {
        $('.table-code-input').focus(function () {
            $('.message-text').removeClass('error-message');
            $('.message-text').text(displayMessages.onInputFocused);
        });
        
        $('.send-code-button').on('click', function () {
            var code = $('.table-code-input').val().trim(),
                $message = $('.message-text');
            
            if (code === '') {
                $message.addClass('error-message');
                window.buttonProgress = 1;
                window.buttonStatus = -1;
                return $message.text(displayMessages.errorMessage);
            }
            
            $message.removeClass('error-message');
            $message.text(displayMessages.onButtonClicked);
            
            //check code is valid on server
            $.post("/checkAccessCode", { id: code }, function (data) {
                window.buttonProgress = 1;
                $message.removeClass('error-message');
                $message.text(displayMessages.redirectToButtonPage);
                
                setTimeout(function () {
                    window.location = 'notifica_social?id=' + code;
                }, 1000);
            })
            .fail(function () {
                window.buttonProgress = 1;
                window.buttonStatus = -1;
                $message.addClass('error-message');
                $message.text(displayMessages.errorMessage);
            });
        });

        $('#restaurant-location, #restaurant-name').focus(function () { 
            $('form .success-message').hide();
        });
    }
};

$(document).ready(function () {
    
    Parse.initialize("jGLu65innC9pkiF7uXcgCGEBKhbc3P4GKqcHzFbo", "8nApGfppr36PDmS4CPSKEtqGuRPgmvwgJf7lrQta");
    
    appMaster.smoothScroll();
    
    appMaster.animateScript();
    
    appMaster.setMinBannerHeight();
    
    appMaster.scrollMenu();
    
    pageMethods.bindPageEvents();
    
    [].slice.call(document.querySelectorAll('button.progress-button')).forEach(function (bttn) {
        new ProgressButton(bttn, {
            callback: function (instance) {
                window.buttonProgress = 0;
                window.buttonStatus = 1;
                var interval = setInterval(function () {
                    window.buttonProgress = Math.min(window.buttonProgress + Math.random() * 0.2, 1);
                    instance._setProgress(window.buttonProgress);
                    
                    if (window.buttonProgress >= 1) {
                        instance._stop(window.buttonStatus);
                        clearInterval(interval);
                    }
                }, 200);
            }
        });
    });
});

// page events - handlers
function submitRestaurantForm() {
    var restaurantName = $('#restaurant-name').val(),
        restaurantLocation = $('#restaurant-location').val();
    
    if (!restaurantName.trim())
        return false;
    
    var RestaurantObject = Parse.Object.extend("Restaurant");
    var restaurantObject = new RestaurantObject();
    restaurantObject.save({ name: restaurantName, city: restaurantLocation }).then(function (object) {
        $('form .success-message').show();
    });

    return false;
}

