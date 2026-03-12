$('.product-faq h2').click(function(){
    $(this).toggleClass('close');
    $(this).parents('.container').find('.accordion-wapper').toggleClass('active');
    $(this).next('.accordion-wapper').slideToggle();
});