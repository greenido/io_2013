/*
  This file contain HTML5 app that use jQuery with GAE REST API
	Author: Ido Green
  Date: May 2013

ToDos:
1. LawnChair - add config for app and save all Gphotos in indexedDB.
2. Geo - maps for the location.
3. WebIntent - share

Oauth - https://code.google.com/p/google-api-javascript-client/wiki/Samples

*/

// scope our features/functions 
var GphotoApp = {};

//
// Constants
//
GphotoApp.callingServerHtml = '<p id="spinner"><img src="img/loader.gif"/></p>';

// prod: Gphotodemo1.googleplex.com 
var proxyServer = "";
if (document.URL.indexOf("Gphotodemo1") < 0) {
  // we are in dev mode - let's use our little proxy
  proxyServer = 'curl_proxy.php?url=';
}

//
// Entry points to the API
//
GphotoApp.serverUrl = proxyServer + 
        'https://Gphotodemo1.googleplex.com/_ah/api/Gphoto/v1/Gphoto';
GphotoApp.searchUrl = proxyServer + 
        'https://Gphotodemo1.googleplex.com/_ah/api/Gphoto/v1/search'; 
GphotoApp.commentsUrl = proxyServer + 
        'https://Gphotodemo1.googleplex.com/_ah/api/Gphoto/v1/comments'
GphotoApp.commentManUrl = proxyServer + 
        'https://Gphotodemo1.googleplex.com/_ah/api/Gphoto/v1/comment'
GphotoApp.cursor = undefined;

GphotoApp.location = function(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      GphotoApp.curLocation = position.coords.latitude + " , "+ position.coords.longitude;
      console.log (" TODO - show on a map | cur Lat: "+ position.coords.latitude +
                   " Long: "+ position.coords.longitude);

    }, function(error) {
      console.error("Error occurred. The code: " + error.code);
      console.log("error.code can be: \
        0: unknown error \
        1: permission denied \
        2: position unavailable (error response from locaton provider) \
        3: timed out");
    });
  }
}

// clear the values of the Gphoto modal. Useful before enteting a new Gphoto
GphotoApp.clearFields = function() {
  $("#GphotoDetailsModal input[id^='Gphoto']").each(function() {      
    $(this).val("");
  });
}

// clear the Gphoto's comment modal.
GphotoApp.clearCommentsFields = function() {
  $("#GphotoCommentsModal input[id^='Gphoto']").each(function() {      
    $(this).val("");
  });
  $("#GphotoCommentId").val($("#gGphotoId").val());
}

// Show a list of Gphotos on our page
GphotoApp.showList = function(data) {
  $("#spinner").remove();
  if (data.error) {
    $('<h3/>', {
      html: "Could not find Gphoto: " +$("#gGphotoId").val()
    }).appendTo('#results');
    return;
  }

  // We check for items because there are cases where we get errors in 'data'
  if (data && data.items) { 
    var Gphotos = data.items;
    var items = [];
    
    // lets save the cursor so we could pagination on the list
    GphotoApp.cursor = data.cursor;

    $.each(Gphotos, function(key, val) {
      var details = "<div class='GphotoDetails'>";
      for (var prop in val) {
        details += prop + ": " + val[prop] + "<br/>";
      }
      details += "</div>";
      items.push('<li><img src="img/88-Gphoto-mug.png"/><span class="label label-warning">' + val.name + 
        '</span> - Id: ' + val.GphotoId + '<br/>' + details + '</li>');
    });

    $('<ol/>', {
      'class': 'GphotoItem',
      html: items.join('')
    }).appendTo('#results');

    // If we have more results 
    if (GphotoApp.cursor !== undefined) {
      // lets add pagination
      var pagingHTML = '<ul class="pager"> \
        <li> \
          <button class="btn btn-large GphotoListBut">More &rarr;</button> \
        </li> \
      </ul>';
      $("#results").append(pagingHTML);
    }
  }
  else if (data && !data.items) {
    // just one Gphoto so data.items is undefined
    var details = "<div class='GphotoDetails'>";
      for (var prop in data) {
        details += prop + ": " + data[prop] + "<br/>";
      }
      details += "</div>";
    $('#results').append('<img src="img/88-Gphoto-mug.png"/><span class="label label-warning">' + data.name + 
        '</span> - Id: ' + data.GphotoId + '<br/>' + details);
  }
}

// TODO:
// ================ Google API ================ 
// API Explorer:
// https://code.google.com/apis/explorer/?base=https://Gphotodemo1.googleplex.com/_ah/api#_s=Gphoto&_v=v1

// Load our service
function loadGapi() {
  // Set the API key
  gapi.client.setApiKey('AIzaSyD_mrsCOGa_cip-_O9YzmruYQ831uQcqPE');
  // Set: name of service, version and callback function
  gapi.client.load('Gphoto', 'v1', getGphotos);
}

// return a list of Gphotos
function getGphotos() {
   var req = gapi.client.Gphoto.Gphotos.list();
   req.execute(function(response) {
   console.log("Gphotos: " +  JSON.stringify(response));
  });
}

// ================ Google API ================ 

//
// Start the party
//
$(function() {
  // init data/UI
  GphotoApp.location();
  $("a").tooltip();
  $(".alert").hide();

  //
  // Our search after (good) Gphotos
  // 
  // TODO: show the power of: https://code.google.com/apis/explorer/?
  // base=https://Gphotodemo1.googleplex.com/_ah/api#_s=Gphoto&_v=v1&_m=Gphotos.search
  // &query=numberOfDrinks%20%3E%2010%20AND%20%20score%20%3E%201
  //
  $("#searchGphoto").keydown(function(event) {
    if (event.which == 13) {
        var searchTerm = encodeURIComponent($("#searchGphoto").val());
        $('#results').html(GphotoApp.callingServerHtml);
        var req = gapi.client.Gphoto.Gphotos.search( {'query' : searchTerm});
        req.execute(function(searchOutput) {
          GphotoApp.showList(searchOutput);  
        });

      // Old jQuery code:
      //   $.ajax({
      //   url:  GphotoApp.searchUrl + "?query_string='" + searchTerm + "'",
      //   dataType: 'json',
      //   contentType: 'application/json',
      //   type: 'GET',
      //   success: function(data) {
      //     GphotoApp.showList(data);
      //   },
      //   error: function(xhr, ajaxOptions, thrownError) {
      //     console.error("Could not fetch Gphoto: " + $("#gGphotoId").val() + 
      //       " Error: " + xhr.status) + " err thrown: " + thrownError;
      //     $('#alertContent').html("Could not get Gphoto: " + $("#gGphotoId").val());
      //     $('.alert').show();
      //   }
      // });
    }
  });


  //
  // Updating/Adding Gphoto 
  //
  $("#GphotoDetailsModalBut").click(function(data) {
    console.log("Fetch the Gphoto and show its data in our dialog");	
    var GphotoId = $("#gGphotoId").val();
    var params = '{"GphotoId": "' + GphotoId + '"}'; 

    $('#results').html(GphotoApp.callingServerHtml);

    var req = gapi.client.Gphoto.Gphotos.get( {'GphotoId' : GphotoId});
    req.execute(function(data) {
      $("#spinner").remove();
      if (data.code >= 400) {
        // we have an error(s)
        $('#alertContent').html("Error: " + data.message);
        $('.alert').show();
        return;
      }

      if (data) {
        data = data.items[0];
      }
      if (data.GphotoId) {
        $("#GphotoId").val(data.GphotoId);  
        $("#GphotoName").val(data.name); 
        $("#GphotoScore").val(data.score);
        $("#GphotoScoreText").val(data.score);
        $("#GphotoDesc").val(data.location);
        $("#GphotoTags").val(data.kindOfGphoto);
          //TODO:
          // $("#GphotoDesc").val(data.);               
        // GphotoNumDrinks.select
        $('#GphotoDetailsModal').modal('show');
      }
      else {
        $('#alertContent').html("Could not get Gphoto: " + $("#gGphotoId").val());
        $('.alert').show();
      } 
    });

    // $.ajax({
    //   url: GphotoApp.serverUrl + "s&postData=" + params,
    //   dataType: 'json',
    //   contentType: 'application/json',
    //   type: 'POST',
    //   data: params,
    //   success: function(data) {
       
    //     $("#spinner").remove();
    //     if (data && data.id) {
    //       $("#GphotoId").val(data.id);  
    //       $("#GphotoName").val(data.name); 
    //       $("#GphotoScore").val(data.score);
    //       $("#GphotoScoreText").val(data.score);
    //       $("#GphotoDesc").val(data.location);
    //       $("#GphotoTags").val(data.kindOfGphoto);
    //       //TODO:
    //       // $("#GphotoDesc").val(data.);               
    //       // GphotoNumDrinks.select
    //       $('#GphotoDetailsModal').modal('show');
    //     }
    //     else {
    //       $('#alertContent').html("Could not get Gphoto: " + $("#gGphotoId").val());
    //       $('.alert').show();
    //     }
    //   },
    //   error: function(xhr, ajaxOptions, thrownError) {
    //     $("#spinner").remove();
    //     console.error("Could not fetch Gphoto: " + $("#gGphotoId").val() + 
    //       " Error: " + xhr.status) + " err thrown: " + thrownError;
    //     $('#alertContent').html("Could not get Gphoto: " + $("#gGphotoId").val());
    //     $('.alert').show();
    //   }
    // });


  });
	
  // Add new Gphoto
  $("#GphotoAddBut").click(function(data) {
    GphotoApp.clearFields();
    $("#GphotoDesc").val(GphotoApp.curLocation);
    $("#GphotoScore").change();

    // Using our Geo information to have a small map of the area around us
    var mapImg = '<img border=0 src="http://maps.googleapis.com/maps/api/staticmap?center=' +
      GphotoApp.curLocation + '&zoom=14&size=262x112&maptype=roadmap&markers=color:blue%7Clabel:S%7C' + 
      GphotoApp.curLocation + '&sensor=true"/>';
    $("#localMap").html(mapImg);

    $('#GphotoDetailsModal').modal('show');
  });

  // Actions for the modal
  $("#cancelGphoto").click(function(data) {
    GphotoApp.clearFields();
    $('#GphotoDetailsModal').modal('hide');
  });

  //
  // Save Gphoto new/update
  //
  $("#saveGphoto").click(function() {
    console.log("Save the Gphoto...");
    var features = {};

    // extract all the info from the form's fields
    $("#GphotoDetailsModal input[id^='Gphoto']").each(function() {      
      features[$(this).attr('name')] = $(this).val();
    });
    delete features['undefined'];

    // Get the select value as well.
    features[$('#GphotoNumDrinks').attr('name')] = $('#GphotoNumDrinks').val();
    //var json = JSON.stringify(features); 
    var req;
    // In case we have an empty GphotoId,
    // let's not send it, so the server will 'know'
    // it's a new Gphoto
    if ( !features['GphotoId']) {
      delete features['GphotoId'];

      var tmpImg = $('#imgTesT');
      var GphotoImg = getBase64Image(tmpImg);
      features['picture'] = GphotoImg;
      req = gapi.client.Gphoto.Gphotos.add( features );
    }
    else {
      // It's an update of a Gphoto
      req = gapi.client.Gphoto.Gphotos.update( features ); 
    }
    
    req.execute(function(data) {
      var tmpHTML;
        if (data.error && data.error.code > 200) {
          console.error("Err Code: " + data.error.code + " Err: " + data.error.message);
          tmpHTML = data.error.message;
        }
        else {
          tmpHTML = '<h4>Your Gphoto is Safe</h4>';
          tmpHTML += "<img src='img/Gphoto24.jpg'/>"
          tmpHTML += 'id: ' + data.GphotoId;
        }
        $('#results').html("");
        $('#alertContent').html(tmpHTML);
        $('.alert').show();

    });

    // $.ajax({
    //   url: GphotoApp.serverUrl + "&postData="+json,
    //   dataType: 'json',
    //   contentType: 'application/json',
    //   type: "POST",
    //   data: json,
    //   success: function(data) {
    //     var tmpHTML;
    //     if (data.error && data.error.code > 200) {
    //       console.error("Err Code: " + data.error.code + " Err: " + data.error.message);
    //       tmpHTML = data.error.message;
    //     }
    //     else {
    //       tmpHTML = '<h4>Your Gphoto is Safe</h4>';
    //       tmpHTML += "<img src='img/Gphoto24.jpg'/>"
    //       tmpHTML += 'id: ' + data.GphotoId;
    //     }
    //     $('#results').html("");
    //     $('#alertContent').html(tmpHTML);
    //     $('.alert').show();
    //   },

    //   error: function(xhr, ajaxOptions, thrownError) {
    //     console.error("Err status: " + xhr.status) + " err: " + thrownError;
    //      $('#alertContent').html("Could not save - please try again later...");
    //      $('.alert').show();
    //   }
    // });

    $('#GphotoDetailsModal').modal('hide');
  });

  $("#GphotoScore").change(function() {
    $("#GphotoScoreText").val($("#GphotoScore").val());
  })

  //
  // Show Gphoto(s) in a list format
  //
  $(".GphotoListBut").live("click", function() {
    var params  = '';
    var tmpUrl  = GphotoApp.serverUrl + "s"; // it's Gphotos not just one Gphoto.
    var typeReq = "GET";
    var maxGphotos = $("#listNumGphoto").val();
    if ($(this).data("oneGphoto") === 1 && $("#gGphotoId").val()) {
        typeReq = "POST";
        params  = '{"GphotoId":"' + $("#gGphotoId").val() + '"}';
        tmpUrl += "&postData=" + params; 
    }
    else {
      if (GphotoApp.cursor !== undefined) {
        tmpUrl += "&cursor=" + GphotoApp.cursor;
      }
      tmpUrl += "&limit=" + maxGphotos;
    }
    
    $('#results').html(GphotoApp.callingServerHtml);
    var req = gapi.client.Gphoto.Gphotos.list({
      'limit' : maxGphotos,
      'cursor': GphotoApp.cursor
    });

    req.execute(function(data) {
      GphotoApp.showList(data);  
    });

    // $.ajax({
    //   url: tmpUrl,
    //   dataType: 'json',
    //   contentType: 'application/json',
    //   type: typeReq,
    //   data: params,
    //   success: function(data) {
    //     GphotoApp.showList(data);
    //   },
    //   error: function(xhr, ajaxOptions, thrownError) {
    //     $("#spinner").remove();
    //     console.error("Gphoto list error: " + xhr.status) + " err: " + thrownError;
    //     $('<h3/>', {
    //         html: "Could not find GphotoId: " +$("#gGphotoId").val()
    //       }).appendTo('#results');
    //   }
    // });


  }); // end of Gphoto lists


  // Show comments on specific Gphoto
  // Use - https://Gphotodemo1.googleplex.com/_ah/api/Gphoto/v1/comments?GphotoId=3003'
  $("#GphotoComments").click(function() {
    if ($("#gGphotoId").val() == undefined || $("#gGphotoId").val() < 0) {
      console.error("Comments error - missing GphotoId: " + $("#gGphotoId").val() );
      $('<h3/>', {
        html: "Could not fetch comments for GphotoId: " + $("#gGphotoId").val()
      }).appendTo('#results');
    } 
    else {
      // we are all good (more or less) fetch the comments
      $('#results').html(GphotoApp.callingServerHtml);

      var req = gapi.client.Gphoto.comments.list({
        'GphotoId': $("#gGphotoId").val(),
        'limit' : 10
       // 'cursor': GphotoApp.cursor
      });

      req.execute(function(data) {
        $("#spinner").remove();

        if (data.error) {
          $('<h3/>', {
            html: "Could not find comments for GphotoId: " +$("#gGphotoId").val() +
            " Err:" + data.message
          }).appendTo('#results');
          return;
        }

        if (data && data.items) { 
          var comments = data.items;
          var items = [];
          $.each(comments, function(key, val) {
          
          var details = "<div class='GphotoComm'>";
          for (var prop in val) {
            if (prop !== "GphotoId") {
              if (prop === "date") {
                details += "(" + decodeURIComponent(val[prop]) + ")<br/>";
              }
              else {
                details += prop + ": " + val[prop] + "<br/>";
              }
            }
          }
          details += "</div>";
          items.push('<li><img src="img/Gphoto24.jpg"/><span class="label label-warning">' + 
            val.GphotoId +  
            '</span><br/>' + details + '</li>');
          });
          $('<ol/>', {
            'class': 'GphotoItem',
            html: items.join('')
          }).appendTo('#results');
        }
      });

      // $.ajax({
      //   url: GphotoApp.commentsUrl + "?GphotoId=" + $("#gGphotoId").val(),
      //   dataType: 'json',
      //   contentType: 'application/json',
      //   type: "GET",
      //   success: function(data) {
      //     $("#spinner").remove();
      //     if (data.error) {
      //       $('<h3/>', {
      //         html: "Could not find comments for GphotoId: " +$("#gGphotoId").val()
      //       }).appendTo('#results');
      //       return;
      //     }

      //     if (data && data.items) { 
      //       var comments = data.items;
      //       var items = [];
      //       $.each(comments, function(key, val) {
            
      //       var details = "<div class='GphotoComm'>";
      //       for (var prop in val) {
      //         if (prop !== "GphotoId") {
      //           if (prop === "date") {
      //             details += "(" + decodeURIComponent(val[prop]) + ")<br/>";
      //           }
      //           else {
      //             details += prop + ": " + val[prop] + "<br/>";
      //           }
      //         }
      //       }
      //       details += "</div>";
      //       items.push('<li><img src="img/Gphoto24.jpg"/><span class="label label-warning">' + 
      //         val.GphotoId +  
      //         '</span><br/>' + details + '</li>');
      //       });
      //       $('<ol/>', {
      //         'class': 'GphotoItem',
      //         html: items.join('')
      //       }).appendTo('#results');
      //     } // end of If
      //   },
      //   error: function(xhr, ajaxOptions, thrownError) {
      //     $("#spinner").remove();
      //     console.error("Gphoto list error: " + xhr.status) + " err: " + thrownError;
      //     $('<h3/>', {
      //         html: "Could not find GphotoId: " +$("#gGphotoId").val()
      //       }).appendTo('#results');
      //   }
      // });
    }
  })

  //
  // comments
  //
  $("#GphotoAddComment").click(function(data) {
      GphotoApp.clearCommentsFields();
      $('#GphotoCommentsModal').modal('show');
    });

  $("#cancelCommentsGphoto").click(function(data) {
      $('#GphotoCommentsModal').modal('hide');
    });

  $("#saveCommentsGphoto").click(function() {
      console.log("Save the comment.");
    var features = {};

    var tmpDate = new Date();
    // we wish this format: Jun 1 2005 1:33PM
    tmpDate = tmpDate.format("mmm d yyyy h:MTT"); 

    features['date'] = tmpDate;
    features['comment']  = $("#GphotoComment").val();
    $("#GphotoCommentsModal input[id^='Gphoto']").each(function() {      
      features[$(this).attr('name')] = $(this).val();
    });

    //var json = JSON.stringify(features); 
    $('#results').html(GphotoApp.callingServerHtml);

    var req = gapi.client.Gphoto.comments.add(features);
    req.execute(function(data) {
      var tmpHTML;
      $("#spinner").remove();
      if (data.error && data.error.code > 200) {
        console.error("Err Code: " + data.error.code + " Err: " + data.error.message);
        tmpHTML = data.error.message;
      }
      else {
        tmpHTML = '<h4>Your great comment on Gphoto ' + data.GphotoId + ' is Safe</h4>';
        tmpHTML += "<img src='img/Gphoto-icon-36.png'/>"
      }
      $('#results').html("");
      $('#alertContent').html(tmpHTML);
      $('.alert').show(); 
    });  


    // $.ajax({
    //   url: GphotoApp.commentManUrl + "&postData="+json,
    //   dataType: 'json',
    //   contentType: 'application/json',
    //   type: "POST",
    //   data: json,
    //   success: function(data) {
        
    //   },

    //   error: function(xhr, ajaxOptions, thrownError) {
    //     $("#spinner").remove();
    //     console.error("Err status: " + xhr.status) + " err: " + thrownError;
    //      $('#alertContent').html("Could not save a comment - please try again later...");
    //      $('.alert').show();
    //   }
    // });

    $('#GphotoCommentsModal').modal('hide');
  });  


}); // end of the party
