 /* jQuery Pre loader
               -----------------------------------------------*/
 //reference: https://codepen.io/hariharakumar/pen/VmOdBx
 const perfData = window.performance.timing;
const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
 $(window).load(function() {
     $('.preloader').fadeOut(pageLoadTime); // set duration in brackets
 });
