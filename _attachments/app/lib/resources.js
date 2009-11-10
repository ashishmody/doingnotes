function pluralize(text) {
  text = text.toString().toLowerCase();
  if(text.match(/s$/)) {
   return text;
  } else {
   return text + 's';
  }
}

function template_file_for(resource_path, template){ 
 return 'app/templates/' + pluralize(resource_from_path(resource_path)) + '/' + template + '.mustache';
}

function resource_from_path(path){
 return /^#\/(\w+)(\/|)/.exec(path)[1];;
}

var Resources = function(app, couchapp) {
  this.helpers({
    render: function(template, data, callback) {            
      this.partial(template_file_for(this.path, template), data, callback);
    },
  
    new_object: function(name) {
      var plural_name = name.toLowerCase() + 's';
      this.partial(template_file_for(name, 'new'));
    },
  
    create_object: function(name, params, options, callback) {
      options = options || {};
      var context = this;
      var _prototype = eval(name);
      var object = new _prototype(params);
      if(object.valid()) {
        couchapp.db.saveDoc(object.to_json(), {
          success: function(res) {
            if(options.message) {
              context.trigger('notice', {message: options.message});
            }
            if(options.success) {
              options.success(object);
            }            
            callback(res);
          },
          error: function(response_code, res) {
            context.trigger('error', {message: 'Error saving ' + name + ': ' + res});
          }
        });
      } else {
        context.trigger('error', {message: object.errors.join(", ")});
      };
    },
  
    list_objects: function(type, view_name, options, callback) {
      var context = this;      
      var collection = pluralize(type);
      var view = {};
      couchapp.design.view(view_name, {
         success: function(json) { 
           if (json['rows'].length > 0) {   
             view[collection] = json['rows'].map(function(row) {return row.value});                       
             if (options['sort'] == 'byText') {
               view[collection].sort(byText);
             } else {
               view[collection].sort(byDate);
             }
           } else {                   
             view[collection] = [];
           }
           callback(view);
         }
       });
    },
  
    load_object: function(type, id, callback){
      var context = this;
      couchapp.db.openDoc(id, {
        success: function(doc) {
          var _prototype = eval(type);
          var view_prototype = eval(type + 'View');
          var view = new view_prototype(new _prototype(doc));
          if(doc) {
            callback(view);
          } else {
            context.trigger('error', type + ' with ID "' + id + '" not found.');
          }
        },
        error: function() {
          context.notFound();
        }
      });
    },
  
    object_from_params: function(object_view, params) { 
      $.each(params, function(key, value){
        if (typeof(value) == 'string') {
          object_view.object()[key] = value;
        }
      });
      return object_view;
    },
  
    update_object: function(name, params, options, callback) {
      options = options || {};
      var context = this;
      this.load_object(name, params['id'], function(object_view){
        object_view = context.object_from_params(object_view, params);
        var object = object_view.object();
        object.updated_at = new Date().toJSON();
        if(object.valid()) {
          couchapp.db.saveDoc(object.to_json(), {
            success: function(res) {
              if(options.message) {     
                context.trigger('notice', {message: options.message});                
              }
              if(options.success) {
                options.success(object);
              }                          
              callback(res);
            },
            error: function(response_code, res) {
              context.trigger('error', {message: 'Error saving ' + name + ': ' + res});
            }
          });
        } else {
          context.trigger('error', {message: object.errors.join(", ")});
        };
      });
    },
    
    delete_object: function(params, options, callback) {
      options = options || {};
      var context = this;
      var doc = {_id : params.id, _rev : params.rev};
      couchapp.db.removeDoc(doc, {
        success: function() {
          if(options.message) {
            context.flash = {message: options.message, type: 'notice'};
          }
          callback();
        },
        error: function(response_code, json) {
          context.flash = {message: 'Error deleting note: ' + json};
        }
      }); 
      return false;
    }
  });
};