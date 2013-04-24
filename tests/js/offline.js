// scope our features/functions 

GphotoApp.db = new Lawnchair( {name:'GphotoApp.db'}, function(e){
	console.log('Lawnchair (and Gphotos) are open');
});

// saving Gphotos per their ID
GphotoApp.db.saveGphoto = function(Gphoto) {
	var GphotoStr = JSON.stringify(Gphoto);
	var GphotoId  = Gphoto.GphotoId;
	if (Gphoto.hasOwnProperty("id")) {
		GphotoId = Gphoto.id;
	}
	
	GphotoApp.db.save( { key: GphotoId, value: GphotoStr } , function(tmpData) {
		var GphotoInfo = $.parseJSON(tmpData.value);
		GphotoApp.tmpSaveId = GphotoInfo.GphotoId;
	});
}

// Get all Gphotos
GphotoApp.db.allGphotos = function() {
	console.log("==== Get All the Gphotos from our local data ====");	
	var items = GphotoApp.db.all(function(arr) {
	  arr.forEach( function(entry) {
	    console.log("GphotoId: " + entry.key + " value:" + entry.value);
	  });
	});
}

// find specific Gphoto
GphotoApp.db.getGphoto = function(GphotoId) {
    GphotoApp.db.get(GphotoId, function(tmp) {
    	if (tmp !== undefined && tmp !== null) {
        	console.log('We got back Gphoto.Id: ' + tmp.key + " with these properties: "+ tmp.value);
        	GphotoApp.tmpGetId = tmp.key;
    	}
    	else {
    		console.warn('Opss... Could not find locally GphotoId');
    	}
    });
}

// remove everything to keep a clean yard
GphotoApp.db.deleteAll = function() {
    GphotoApp.db.nuke();
    console.log ("* we clean all our local data");
}