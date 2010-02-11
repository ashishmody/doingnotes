Outlines = function(sammy, couchapp) { with(sammy) {
  var context;

  get('#/outlines', function() { with(this) {
    list_objects('Outline', 'outlines', [], function(json){ 
      var view = {};
      if (json.outlines.length > 0){
        var outlines = json.outlines.sort(byDate);
        view.outlines = outlines.map(function(outline){return new OutlineView(outline)});
        view.outlines = view.outlines.map(function(outline){
          return {
            title: outline.title(), 
            short_created_at: outline.short_created_at(),
            _id: outline._id()
          }
        }); 
      } else {
        view.empty = "You have no outlines yet."
      }
      render('index', view);
      $('#spinner').hide(); 
    });
    return false;
  }});

  get('#/outlines/new', function() { with(this) {
    new_object('outline', function(outline){  
      render('new', outline);
      $('#spinner').hide(); 
    });
    return false;
  }});

  get('#/outlines/:id', function() {
    var view = {};
    context = this;    
    couchapp.design.view('notes_by_outline', {
      startkey: [context.params.id],
      endkey: [context.params.id, {}],
      success: function(json) {
        if(json.rows[0]) {
          view.title      = json.rows[0].value.title;
          view.outline_id = json.rows[0].value._id;
          json.rows.splice(0,1);        
          if (json.rows.length > 0) { 
            var notes = json.rows.map(function(row) {return new Note(row.value)}); 
            view.notes = [(new NoteCollection(notes)).firstNote()];
            context.renderOutline(view, (new NoteCollection(notes)), couchapp, context.params.solve);
          } else {
            context.create_object('Note', {outline_id: view.outline_id, first_note: true, text:'', source: context.getLocationHash()}, {}, function(note){
              view.notes = [note];
              context.renderOutline(view, (new NoteCollection([])), couchapp, context.params.solve);
            })            
          } 
        } else {
          flash = {message: 'Outline does not exist.', type: 'error'};
          redirect('#/outlines', flash);
        }      
      }
    });
    return false;
  });
  
  get('#/outlines/edit/:id', function(){
    context = this;
    context.load_object_view('Outline', context.params.id, function(outline_view){
      context.partial('app/templates/outlines/edit.mustache', outline_view, function(outline_view){
        context.app.swap(outline_view);
        $('#spinner').hide(); 
      });
    });
    return false;
  });
  
  post('#/outlines', function(){ with(this){
    create_object('Outline', params, {message: "Here is your new outline"}, function(outline){
      redirect('#/outlines/' + outline._id, flash);
    });
    return false;
  }});
  
  put('#/outlines/:id', function(){ with(this) {    
    update_object('Outline', params, {}, function(outline){
      trigger('notice', {message: 'Title successfully changed'});
      $('#spinner').hide(); 
    });
    return false;
  }});

  route('delete', '#/outlines/:id', function() {
    context = this;
    context.couchapp.design.view('notes_by_outline', {
      startkey: [context.params.id],
      endkey: [context.params.id, {}],
      success: function(json) {
        if (json.rows.length > 0) { 
          var outline_and_notes = json.rows.map(function(row) {return row.value}); 
          context.couchapp.db.bulkRemove({docs: outline_and_notes}, {
            success: function() {
              context.flash = {message: 'Outline deleted.', type: 'notice'}
              $('#spinner').hide(); 
              context.redirect('#/outlines', flash);
            },
            error: function(response_code, json) {
              context.flash = {message: 'Error deleting outline: ' + json, type: 'error'};
            }
          });
        }      
      }
    });
    return false;
  });
}};