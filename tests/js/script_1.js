
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
      items.push('<li><img src="img/b3_40.png"/><span class="label label-warning">' + val.GphotoName + 
        '</span> - Id: ' + val.id + '<br/>' + details + '</li>');
    });

    $('<ol/>', {
      'class': 'GphotoItem',
      html: items.join('')
    }).appendTo('#results');
  }
}

var apiUrl = "https://GPhoto-io2013.appspot.com/_ah/api/GPhoto/v1/Gphoto";
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
    console.error("Gphoto list error: " + xhr.status) + " err: " + thrownError;
    $('<h3/>', {
        html: "Could not find Gphotos"
      }).appendTo('#results');
  }
 
});
