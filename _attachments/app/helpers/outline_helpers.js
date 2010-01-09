var OutlineHelpers = {
  bindSubmitOnBlurAndAutogrow: function(){
    $('textarea.expanding').autogrow();
    $('textarea.expanding').bind('blur', function(e){
      note = new NoteElement($(e.target));
      note.unfocusTextarea();
      note.submitIfChanged();
    });
    $("a.image").bind("click", function(){
      $(this).parent().next('ul.indent').toggle();
      $(this).toggleClass('down');
      return false;
    });
  },
  
  unbindSubmitOnBlurAndAutogrow: function(){
    $('textarea.expanding').unbind('blur');
    $('textarea.expanding').unbind('focus');
    $('a.image').unbind('click');		
  },
  
  getOutlineId: function(){
    if((this.$element().find('h2#outline-id')).length != 0){
      return this.$element().find('h2#outline-id').html();
    }
  },
  
  getLocationHash: function(){
    return hex_md5(window.location.host);
  },
  
  renderOutline: function(context, view, notes, couchapp, solve){
    context.render('show', view, function(response){
      context.app.swap(response);
      first_note = new NoteElement($('ul#notes li:first').find('textarea.expanding'));
      if(notes.notes.length > 1) {
        first_note.renderNotes(context, notes, notes.notes.length); 
      }
      first_note.focusTextarea();
      context.checkForUpdatesAndConflicts(couchapp);
      if(solve){
        context.showConflicts(context, couchapp);
      }
      $('#spinner').hide(); 
    });
  },
  
  showConflicts: function(context, couchapp){
    var context = this;
    var outline_id = context.getOutlineId();
    
    couchapp.design.view('notes_with_conflicts_by_outline', {
      key: outline_id,
      success: function(json) {
        if (json.rows.length > 0) { 
          var notes_with_conflicts = json.rows.map(function(row) {return row.value});
          $.each(notes_with_conflicts, function(i, conflicting_note_json){
            var url = context.localServer() + '/' + context.db() + '/' + conflicting_note_json._id + '?rev=' + conflicting_note_json._conflicts[0];
            $.getJSON(url, function(overwritten_note_json){              
              var note = new NoteElement(context.$element().find('li#edit_note_' + overwritten_note_json._id).find('textarea.expanding:first'))
              note.insertConflictFields(context, overwritten_note_json, conflicting_note_json);
            });
          });
        }    
      }
    });
  },
  
  checkForUpdatesAndConflicts: function(couchapp){
    var context = this;

    performCheckForUpdates = function(){
      var outline_id = context.getOutlineId();
      var source = context.getLocationHash();
      
      if(outline_id){
        couchapp.design.view('notes_with_conflicts_by_outline', {
          startkey: [outline_id, source],
          endkey:   [outline_id, source, {}]
        //   success: function(json) {
        //     if (json.rows.length > 0) { 
        //       var notes_with_conflicts = json.rows.map(function(row) {return row.value});
        //       $.each(notes_with_conflicts, function(i, note){
        //         var url = context.localServer() + '/' + context.db() + '/' + note._id + '?rev=' + note._conflicts[0];
        //         $.getJSON(url, function(overwritten_note_json){
        //           var note = new NoteElement(context.$element().find('li#edit_note_' + overwritten_note_json._id).find('textarea.expanding:first'))
        //           note.emphasizeBackground();
        //         });
        //         $('#conflict-update').slideDown("slow");
        //       });
        //     }    
        //   }
        });
      }
      // setTimeout("performCheckForUpdates()", 5000);
    }
    
    performCheckForConflicts = function(){
      var outline_id = context.getOutlineId();
      
      if(outline_id){
        couchapp.design.view('notes_with_conflicts_by_outline', {
          key: outline_id,
          success: function(json) {
            if (json.rows.length > 0) { 
              var notes_with_conflicts = json.rows.map(function(row) {return row.value});
              $.each(notes_with_conflicts, function(i, note){
                var url = context.localServer() + '/' + context.db() + '/' + note._id + '?rev=' + note._conflicts[0];
                $.getJSON(url, function(overwritten_note_json){
                  var note = new NoteElement(context.$element().find('li#edit_note_' + overwritten_note_json._id).find('textarea.expanding:first'))
                  note.emphasizeBackground();
                });
                $('#conflict-update').slideDown("slow");
              });
            }    
          }
        });
      }
      // setTimeout("performCheckForConflicts()", 4000);
    }

    // performCheckForConflicts();
    // performCheckForUpdates();
  },
  
  replicateUp: function(){
    var context = this;    
    $.post(this.localURL() + '/_replicate', 
      '{"source":"' + this.db() + '", "target":"' + context.serverURL() + '/' + this.db() + '", "continuous":true}',
      function(){
        Sammy.log('replicating to ', context.serverURL())
      },"json");
  },
  
  replicateDown: function(){
    var context = this;
    $.post(this.localURL() + '/_replicate', 
      '{"source":"' + context.serverURL() + '/' + this.db() + '", "target":"' + this.db() + '", "continuous":true}',
      function(){
        Sammy.log('replicating from ', context.serverURL())
      },"json");
  }, 
  
  localURL: function(){
    return "http://localhost:" + this.localPort();
  },
  
  serverURL: function(){
    return "http://localhost:" + this.serverPort();
  },
  
  localPort: function(){
    return "5984";
  },
  
  serverPort: function(){
    return "5985";
  },
  
  db: function(){
    return "doingnotes"
  }
}