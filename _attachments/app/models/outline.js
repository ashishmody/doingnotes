Outline = function(attributes) {
  this._id = attributes._id;
  this._rev = attributes._rev;
  this.created_at = attributes.created_at || new Date().toJSON();
  this.updated_at = attributes.updated_at;
  this.title = attributes.title;
}

Outline.prototype = {
  valid: function() {
    this.errors = [];
    if(!this.title) {
      this.errors.push("You need to enter a title");
    };
    return this.errors.length === 0;
  },
  to_json: function() {
    return {
      _id: this._id,
      _rev: this._rev,
      created_at: this.created_at,
      updated_at: this.updated_at,
      type: 'Outline',
      title: this.title
    };
  }
};