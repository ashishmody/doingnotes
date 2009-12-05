var OutlineHelpers = {
  bindSubmitOnBlurAndAutogrow: function(){
    $('textarea.expanding').autogrow();
    $('textarea.expanding').bind('blur', function(e){
      note = new NoteElement($(e.target));
      console.log('blur')
      note.unfocusTextarea();
      note.submitIfChanged();
    });
  },
  
  getOutlineId: function(){
    return this.$element().find('h2#outline-id').html();
  }
}