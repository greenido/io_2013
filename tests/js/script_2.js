//
// ================ Google API ================ 
// API Explorer:
// https://developers.google.com/apis-explorer/?base=https://GPhoto.googleplex.com/_ah/api#p/GPhoto/v1/
//
//

// scope our features/functions 
var GphotoApp = {};

// Load service
function loadGapi() {
  // Set the API key
  gapi.client.setApiKey('AIzaSyD_mrsCOGa_cip-_O9YzmruYQ831uQcqPE');
  // Set: name of service, version and callback function Gphotodemo1 GPhoto
  gapi.client.load('GPhoto', 'v1', getGphotos);
}

// return a list of Gphotos
function getGphotos() {
  //
  //
  //Gphotos.list(); listGphoto
  //
   var req = gapi.client.GPhoto.Gphotos.list();
   req.execute(function(data) {
    $("#results").html('');
    showList(data); 
  });
}

function showList(data) {
  if (data && data.items) { 
    var Gphotos = data.items;
    var items = [];
    $.each(Gphotos, function(key, val) {
      var details = "<div class='GphotoDetails'><pre>";
      for (var prop in val) {
          if (prop === "GphotoId") {
            details += "GphotoId: " + val[prop.id] + "<br/>";
          }
          else {              
            details += prop + ": " + val[prop] + "<br/>";
          }
      }
      details += "</pre></div>";
      items.push('<li><img src="http://db.tt/naae4baA"/><span class="label label-warning">' + val.GphotoName + 
        '</span> - Id: ' + val.id + '<br/>' + details + '</li>');
    });

    $('<ol/>', {
      'class': 'GphotoItem',
      html: items.join('')
    }).appendTo('#results');
  }
}