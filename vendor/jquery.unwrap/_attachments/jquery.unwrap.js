/*!
 * unwrap - v0.1 - 7/18/2009
 * http://benalman.com/projects/jquery-unwrap-plugin/
 * 
 * Copyright (c) 2009 "Cowboy" Ben Alman
 * Licensed under the MIT license
 * http://benalman.com/about/license/
 */

(function($) {
  '$:nomunge'; // Used by YUI compressor.
  
  $.fn.unwrap = function() {
    this.parent(':not(body)')
      .each(function(){
        $(this).replaceWith( this.childNodes );
      });
    
    return this;
  };
  
})(jQuery);
