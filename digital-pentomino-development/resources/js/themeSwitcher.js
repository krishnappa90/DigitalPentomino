//consider 4 ids:
// ids: defaultTheme, dayTheme, iceTheme, blackAndWhiteTheme
document.getElementById('switcher-id').href = 'resources/css/themes/defaultTheme.css';
let style = localStorage.getItem('style');

if (style == null){
     setTheme('default');
    //document.getElementById('switcher-id').href = 'resources/css/defaultTheme.css';
} 
else if (style == "default"){
     //setTheme(style);
     document.getElementById('switcher-id').href = 'resources/css/themes/defaultTheme.css';
} 
