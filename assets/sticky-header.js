$(window).scroll(function(){
  if ($(window).scrollTop() >= 330) {
    $('.sticky').addClass('fixed');
   }
   else {
    $('.sticky').removeClass('fixed');
   }
});

$(window).scroll(function(){
  if ($(window).scrollTop() >= 330) {
    $('body').addClass('product-fix');
   }
   else {
    $('body').removeClass('product-fix');
   }
});

$(window).scroll(function(){
    if ($(window).scrollTop() >= 200) {
        $('body').addClass('atc-fix');
    }
    else {
        $('body').removeClass('atc-fix');
    }
});