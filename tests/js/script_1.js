
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
      items.push('<li><img src="img/b3_40.png"/><span class="label label-warning">' + val.PicturesqueName + 
        '</span> - Id: ' + val.id + '<br/>' + details + '</li>');
    });

    $('<ol/>', {
      'class': 'PicturesqueItem',
      html: items.join('')
    }).appendTo('#results');
  }
}

var apiUrl = "https://Picturesque-app.appspot.com/_ah/api/Picturesque/v1/Picturesque";
$.ajax({
  url: apiUrl,
  dataType: 'json',
  contentType: 'application/json',
  type: "GET",
  success: function(data) {
    $('#results').html('');
    showList(data);
  },
  error: function(xhr, ajaxOptions, thrownError) {
    console.error("Picturesque list error: " + xhr.status) + " err: " + thrownError;
    $('<h3/>', {
        html: "Could not find Picturesques"
      }).appendTo('#results');
  }
 
});
