//
// ================ Google API ================ 
// API Explorer:
// https://developers.google.com/apis-explorer/?base=https://Picturesque.googleplex.com/_ah/api#p/Picturesque/v1/
//
//

// scope our features/functions 
var PicturesqueApp = {};

// Load service
function loadGapi() {
  // Set the API key
  gapi.client.setApiKey('AIzaSyD_mrsCOGa_cip-_O9YzmruYQ831uQcqPE');
  // Set: name of service, version and callback function Picturesquedemo1 Picturesque
  gapi.client.load('Picturesque', 'v1', getPicturesques);
}

// return a list of Picturesques
function getPicturesques() {
  //
  //
  //Picturesques.list(); listPicturesque
  //
   var req = gapi.client.picturesque.photo.list();
   req.execute(function(data) {
    $("#results").html('');
    showList(data); 
  });
}

function showList(data) {
  if (data && data.items) { 
    var Picturesques = data.items;
    var items = [];
    $.each(Picturesques, function(key, val) {
      var details = "<div class='PicturesqueDetails'><pre>";
      for (var prop in val) {
          if (prop === "PicturesqueId") {
            details += "PicturesqueId: " + val[prop.id] + "<br/>";
          }
          else {              
            details += prop + ": " + val[prop] + "<br/>";
          }
      }
      details += "</pre></div>"; 
      items.push('<li><img src="http://db.tt/naae4baA"/><span class="label label-warning">' + val.title + 
        '</span> - Id: ' + val.id + '<br/>' + details + '</li>');
    });

    $('<ol/>', {
      'class': 'PicturesqueItem',
      html: items.join('')
    }).appendTo('#results');
  }
}