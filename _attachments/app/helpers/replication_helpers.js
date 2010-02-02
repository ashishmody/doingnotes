var ReplicationHelpers = {
  getLocationHash: function(){
    return hex_md5(window.location.host);
  },
  
  showChangesWarning: function(context, changed_rev, doc, lines){
    var outline = context.getOutlineId();
    // console.log(doc.outline_id, ' versus ', outline_id)
    // if(changed_rev == doc._rev && outline_id == doc.outline_id){
    if(changed_rev == doc._rev){
      Sammy.log('This has changed in another application:', lines)
      if(context.$element().find('#change-warning:visible').length == 0){
        $('#change-warning').slideDown('slow');
      }
    }  
  },
  
  parseLineAndShowChangesWarning: function(context, couchapp, line, lines){
    var line_json = JSON.parse(line)
    var changed_rev = line_json.changes[0].rev;
    couchapp.db.openDoc(line_json.id, {
      success: function(doc) {
        context.showChangesWarning(context, changed_rev, doc, lines);
      }
    });
  },
  
  checkForUpdates: function(couchapp){
    var context    = this;
    var source     = context.getLocationHash();
    var url        = context.HOST + '/' + context.DB + 
                     '/_changes?filter=doingnotes/changed&source=' + source;   
    
    if(context.getOutlineId()){ 
      $.getJSON(url, function(json){
        var since = json.last_seq;
        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange=function() {
          if(xmlhttp.readyState == 3){
            if(xmlhttp.responseText.match(/changes/)){
              var lines = xmlhttp.responseText.split("\n");
              if(lines[lines.length-2].length != 0){ 
                lines = lines.remove("");
                $.each(lines, function(i, line){
                  context.parseLineAndShowChangesWarning(context, couchapp, line, lines);
                });
              }
            }
            if(xmlhttp.responseText.match(/last_seq/)){
              Sammy.log('Timeout in checkForUpdates:', xmlhttp.responseText)
            }
          }
        }
        xmlhttp.open("GET", url + '&feed=continuous&heartbeat=5000&since=' + since, true);
        xmlhttp.send(null);
      });
    }
  },

  replicateUp: function(){
    var context = this;   
    $.post(context.HOST + '/_replicate', 
      '{"source":"' + context.DB + '", "target":"' + context.SERVER + '/' + context.DB + '", "continuous":true}',
      function(){
        Sammy.log('replicating to ', context.SERVER)
      },"json");
  },
  
  replicateDown: function(){
    var context = this;
    $.post(context.HOST + '/_replicate', 
      '{"source":"' + context.SERVER + '/' + context.DB + '", "target":"' + context.DB + '", "continuous":true}',
      function(){
        Sammy.log('replicating from ', context.SERVER)
      },"json");
  }
}