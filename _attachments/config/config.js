var Config = {
  DB:     "doingnotes",
  SERVER: "http://localhost:5985",
  HOST:   "http://localhost:5984",
  
  onServer: function(){
    return (window.location.protocol + '//' + window.location.host == this.SERVER)
  }
}
