// scope our features/functions 

PicturesqueApp.db = new Lawnchair( {name:'PicturesqueApp.db'}, function(e){
	console.log('Lawnchair (and Picturesques) are open');
});

// saving Picturesques per their ID
PicturesqueApp.db.savePicturesque = function(Picturesque) {
	var PicturesqueStr = JSON.stringify(Picturesque);
	var PicturesqueId  = picturesque.photoId;
	if (Picturesque.hasOwnProperty("id")) {
		PicturesqueId = Picturesque.id;
	}
	
	PicturesqueApp.db.save( { key: PicturesqueId, value: PicturesqueStr } , function(tmpData) {
		var PicturesqueInfo = $.parseJSON(tmpData.value);
		PicturesqueApp.tmpSaveId = PicturesqueInfo.PicturesqueId;
	});
}

// Get all Picturesques
PicturesqueApp.db.allPicturesques = function() {
	console.log("==== Get All the Picturesques from our local data ====");	
	var items = PicturesqueApp.db.all(function(arr) {
	  arr.forEach( function(entry) {
	    console.log("PicturesqueId: " + entry.key + " value:" + entry.value);
	  });
	});
}

// find specific Picturesque
PicturesqueApp.db.getPicturesque = function(PicturesqueId) {
    PicturesqueApp.db.get(PicturesqueId, function(tmp) {
    	if (tmp !== undefined && tmp !== null) {
        	console.log('We got back Picturesque.Id: ' + tmp.key + " with these properties: "+ tmp.value);
        	PicturesqueApp.tmpGetId = tmp.key;
    	}
    	else {
    		console.warn('Opss... Could not find locally PicturesqueId');
    	}
    });
}

// remove everything to keep a clean yard
PicturesqueApp.db.deleteAll = function() {
    PicturesqueApp.db.nuke();
    console.log ("* we clean all our local data");
}