var OutlineConflictHelpers = {
  findNoteElementById: function(id){
    return new NoteElement(this.$element().find('li#edit_note_' + id).find('textarea.expanding:first'))
  },
  
  checkForNewUpdatesAndConflictsOrShow: function(couchapp, solve){
    if(config.CHECK_FOR_UPDATES && !this.onServer()){
      
      this.checkForUpdates(couchapp);
      
      ConflictDetector(this, couchapp);
      ConflictPresenter(this, couchapp);
      ConflictResolver(this, couchapp);      
      var conflictDetector = new ConflictDetector(this, couchapp);

      if(solve){
        conflictDetector.presenter.showConflicts();
      } else {
        conflictDetector.checkForOldConflicts();
        conflictDetector.checkForNewConflicts();
      }
    }
  }
}