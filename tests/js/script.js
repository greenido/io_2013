/*
  This file contain HTML5 app that use jQuery with GAE REST API
	Author: Ido Green
  Date: May 2013

ToDos:
1. LawnChair - add config for app and save all Picturesques in indexedDB.
2. Geo - maps for the location.
3. WebIntent - share

Oauth - https://code.google.com/p/google-api-javascript-client/wiki/Samples

*/

// scope our features/functions 
var PicturesqueApp = {};

//
// Constants
//
PicturesqueApp.callingServerHtml = '<p id="spinner"><img src="img/loader.gif"/></p>';

// prod: Picturesque-app.googleplex.com 
var proxyServer = "";
if (document.URL.indexOf("Picturesque-app") < 0) {
  // we are in dev mode - let's use our little proxy
  proxyServer = 'curl_proxy.php?url=';
}

//
// Entry points to the API
//
PicturesqueApp.serverUrl = proxyServer + 
        'https://Picturesque-app.googleplex.com/_ah/api/Picturesque/v1/Picturesque';
PicturesqueApp.searchUrl = proxyServer + 
        'https://Picturesque-app.googleplex.com/_ah/api/Picturesque/v1/search'; 
PicturesqueApp.commentsUrl = proxyServer + 
        'https://Picturesque-app.googleplex.com/_ah/api/Picturesque/v1/comments'
PicturesqueApp.commentManUrl = proxyServer + 
        'https://Picturesque-app.googleplex.com/_ah/api/Picturesque/v1/comment'
PicturesqueApp.cursor = undefined;

PicturesqueApp.location = function(){
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) {
      PicturesqueApp.curLocation = position.coords.latitude + " , "+ position.coords.longitude;
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

// clear the values of the Picturesque modal. Useful before enteting a new Picturesque
PicturesqueApp.clearFields = function() {
  $("#PicturesqueDetailsModal input[id^='Picturesque']").each(function() {      
    $(this).val("");
  });
}

// clear the Picturesque's comment modal.
PicturesqueApp.clearCommentsFields = function() {
  $("#PicturesqueCommentsModal input[id^='Picturesque']").each(function() {      
    $(this).val("");
  });
  $("#PicturesqueCommentId").val($("#gPicturesqueId").val());
}

// Show a list of Picturesques on our page
PicturesqueApp.showList = function(data) {
  $("#spinner").remove();
  if (data.error) {
    $('<h3/>', {
      html: "Could not find Picturesque: " +$("#gPicturesqueId").val()
    }).appendTo('#results');
    return;
  }

  // We check for items because there are cases where we get errors in 'data'
  if (data && data.items) { 
    var Picturesques = data.items;
    var items = [];
    
    // lets save the cursor so we could pagination on the list
    PicturesqueApp.cursor = data.cursor;

    $.each(Picturesques, function(key, val) {
      var details = "<div class='PicturesqueDetails'>";
      for (var prop in val) {
        details += prop + ": " + val[prop] + "<br/>";
      }
      details += "</div>";
      items.push('<li><img src="img/88-Picturesque-mug.png"/><span class="label label-warning">' + val.name + 
        '</span> - Id: ' + val.PicturesqueId + '<br/>' + details + '</li>');
    });

    $('<ol/>', {
      'class': 'PicturesqueItem',
      html: items.join('')
    }).appendTo('#results');

    // If we have more results 
    if (PicturesqueApp.cursor !== undefined) {
      // lets add pagination
      var pagingHTML = '<ul class="pager"> \
        <li> \
          <button class="btn btn-large PicturesqueListBut">More &rarr;</button> \
        </li> \
      </ul>';
      $("#results").append(pagingHTML);
    }
  }
  else if (data && !data.items) {
    // just one Picturesque so data.items is undefined
    var details = "<div class='PicturesqueDetails'>";
      for (var prop in data) {
        details += prop + ": " + data[prop] + "<br/>";
      }
      details += "</div>";
    $('#results').append('<img src="img/88-Picturesque-mug.png"/><span class="label label-warning">' + data.name + 
        '</span> - Id: ' + data.PicturesqueId + '<br/>' + details);
  }
}

// TODO:
// ================ Google API ================ 
// API Explorer:
// https://code.google.com/apis/explorer/?base=https://Picturesque-app.googleplex.com/_ah/api#_s=Picturesque&_v=v1

// Load our service
function loadGapi() {
  // Set the API key
  gapi.client.setApiKey('AIzaSyD_mrsCOGa_cip-_O9YzmruYQ831uQcqPE');
  // Set: name of service, version and callback function
  gapi.client.load('Picturesque', 'v1', getPicturesques);
}

// return a list of Picturesques
function getPicturesques() {
   var req = gapi.client.picturesque.photo.list();
   req.execute(function(response) {
   console.log("Picturesques: " +  JSON.stringify(response));
  });
}

// ================ Google API ================ 

//
// Start the party
//
$(function() {
  // init data/UI
  PicturesqueApp.location();
  $("a").tooltip();
  $(".alert").hide();

  //
  // Our search after (good) Picturesques
  // 
  // TODO: show the power of: https://code.google.com/apis/explorer/?
  // base=https://Picturesque-app.googleplex.com/_ah/api#_s=Picturesque&_v=v1&_m=Picturesques.search
  // &query=numberOfDrinks%20%3E%2010%20AND%20%20score%20%3E%201
  //
  $("#searchPicturesque").keydown(function(event) {
    if (event.which == 13) {
        var searchTerm = encodeURIComponent($("#searchPicturesque").val());
        $('#results').html(PicturesqueApp.callingServerHtml);
        var req = gapi.client.picturesque.photo.search( {'query' : searchTerm});
        req.execute(function(searchOutput) {
          PicturesqueApp.showList(searchOutput);  
        });

      // Old jQuery code:
      //   $.ajax({
      //   url:  PicturesqueApp.searchUrl + "?query_string='" + searchTerm + "'",
      //   dataType: 'json',
      //   contentType: 'application/json',
      //   type: 'GET',
      //   success: function(data) {
      //     PicturesqueApp.showList(data);
      //   },
      //   error: function(xhr, ajaxOptions, thrownError) {
      //     console.error("Could not fetch Picturesque: " + $("#gPicturesqueId").val() + 
      //       " Error: " + xhr.status) + " err thrown: " + thrownError;
      //     $('#alertContent').html("Could not get Picturesque: " + $("#gPicturesqueId").val());
      //     $('.alert').show();
      //   }
      // });
    }
  });


  //
  // Updating/Adding Picturesque 
  //
  $("#PicturesqueDetailsModalBut").click(function(data) {
    console.log("Fetch the Picturesque and show its data in our dialog");	
    var PicturesqueId = $("#gPicturesqueId").val();
    var params = '{"PicturesqueId": "' + PicturesqueId + '"}'; 

    $('#results').html(PicturesqueApp.callingServerHtml);

    var req = gapi.client.picturesque.photo.get( {'PicturesqueId' : PicturesqueId});
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
      if (data.PicturesqueId) {
        $("#PicturesqueId").val(data.PicturesqueId);  
        $("#PicturesqueName").val(data.name); 
        $("#PicturesqueScore").val(data.score);
        $("#PicturesqueScoreText").val(data.score);
        $("#PicturesqueDesc").val(data.location);
        $("#PicturesqueTags").val(data.kindOfPicturesque);
          //TODO:
          // $("#PicturesqueDesc").val(data.);               
        // PicturesqueNumDrinks.select
        $('#PicturesqueDetailsModal').modal('show');
      }
      else {
        $('#alertContent').html("Could not get Picturesque: " + $("#gPicturesqueId").val());
        $('.alert').show();
      } 
    });

    // $.ajax({
    //   url: PicturesqueApp.serverUrl + "s&postData=" + params,
    //   dataType: 'json',
    //   contentType: 'application/json',
    //   type: 'POST',
    //   data: params,
    //   success: function(data) {
       
    //     $("#spinner").remove();
    //     if (data && data.id) {
    //       $("#PicturesqueId").val(data.id);  
    //       $("#PicturesqueName").val(data.name); 
    //       $("#PicturesqueScore").val(data.score);
    //       $("#PicturesqueScoreText").val(data.score);
    //       $("#PicturesqueDesc").val(data.location);
    //       $("#PicturesqueTags").val(data.kindOfPicturesque);
    //       //TODO:
    //       // $("#PicturesqueDesc").val(data.);               
    //       // PicturesqueNumDrinks.select
    //       $('#PicturesqueDetailsModal').modal('show');
    //     }
    //     else {
    //       $('#alertContent').html("Could not get Picturesque: " + $("#gPicturesqueId").val());
    //       $('.alert').show();
    //     }
    //   },
    //   error: function(xhr, ajaxOptions, thrownError) {
    //     $("#spinner").remove();
    //     console.error("Could not fetch Picturesque: " + $("#gPicturesqueId").val() + 
    //       " Error: " + xhr.status) + " err thrown: " + thrownError;
    //     $('#alertContent').html("Could not get Picturesque: " + $("#gPicturesqueId").val());
    //     $('.alert').show();
    //   }
    // });


  });
	
  // Add new Picturesque
  $("#PicturesqueAddBut").click(function(data) {
    PicturesqueApp.clearFields();
    $("#PicturesqueDesc").val(PicturesqueApp.curLocation);
    $("#PicturesqueScore").change();

    // Using our Geo information to have a small map of the area around us
    var mapImg = '<img border=0 src="http://maps.googleapis.com/maps/api/staticmap?center=' +
      PicturesqueApp.curLocation + '&zoom=14&size=262x112&maptype=roadmap&markers=color:blue%7Clabel:S%7C' + 
      PicturesqueApp.curLocation + '&sensor=true"/>';
    $("#localMap").html(mapImg);

    $('#PicturesqueDetailsModal').modal('show');
  });

  // Actions for the modal
  $("#cancelPicturesque").click(function(data) {
    PicturesqueApp.clearFields();
    $('#PicturesqueDetailsModal').modal('hide');
  });

  //
  // Save Picturesque new/update
  //
  $("#savePicturesque").click(function() {
    console.log("Save the Picturesque...");
    var features = {};

    // extract all the info from the form's fields
    $("#PicturesqueDetailsModal input[id^='Picturesque']").each(function() {      
      features[$(this).attr('name')] = $(this).val();
    });
    delete features['undefined'];

    // Get the select value as well.
    features[$('#PicturesqueNumDrinks').attr('name')] = $('#PicturesqueNumDrinks').val();
    //var json = JSON.stringify(features); 
    var req;
    // In case we have an empty PicturesqueId,
    // let's not send it, so the server will 'know'
    // it's a new Picturesque
    if ( !features['PicturesqueId']) {
      delete features['PicturesqueId'];

      var tmpImg = $('#imgTesT');
      var PicturesqueImg = getBase64Image(tmpImg);
      features['picture'] = PicturesqueImg;
      req = gapi.client.picturesque.photo.add( features );
    }
    else {
      // It's an update of a Picturesque
      req = gapi.client.picturesque.photo.update( features ); 
    }
    
    req.execute(function(data) {
      var tmpHTML;
        if (data.error && data.error.code > 200) {
          console.error("Err Code: " + data.error.code + " Err: " + data.error.message);
          tmpHTML = data.error.message;
        }
        else {
          tmpHTML = '<h4>Your Picturesque is Safe</h4>';
          tmpHTML += "<img src='img/Picturesque24.jpg'/>"
          tmpHTML += 'id: ' + data.PicturesqueId;
        }
        $('#results').html("");
        $('#alertContent').html(tmpHTML);
        $('.alert').show();

    });

    // $.ajax({
    //   url: PicturesqueApp.serverUrl + "&postData="+json,
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
    //       tmpHTML = '<h4>Your Picturesque is Safe</h4>';
    //       tmpHTML += "<img src='img/Picturesque24.jpg'/>"
    //       tmpHTML += 'id: ' + data.PicturesqueId;
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

    $('#PicturesqueDetailsModal').modal('hide');
  });

  $("#PicturesqueScore").change(function() {
    $("#PicturesqueScoreText").val($("#PicturesqueScore").val());
  })

  //
  // Show Picturesque(s) in a list format
  //
  $(".PicturesqueListBut").live("click", function() {
    var params  = '';
    var tmpUrl  = PicturesqueApp.serverUrl + "s"; // it's Picturesques not just one Picturesque.
    var typeReq = "GET";
    var maxPicturesques = $("#listNumPicturesque").val();
    if ($(this).data("onePicturesque") === 1 && $("#gPicturesqueId").val()) {
        typeReq = "POST";
        params  = '{"PicturesqueId":"' + $("#gPicturesqueId").val() + '"}';
        tmpUrl += "&postData=" + params; 
    }
    else {
      if (PicturesqueApp.cursor !== undefined) {
        tmpUrl += "&cursor=" + PicturesqueApp.cursor;
      }
      tmpUrl += "&limit=" + maxPicturesques;
    }
    
    $('#results').html(PicturesqueApp.callingServerHtml);
    var req = gapi.client.picturesque.photo.list({
      'limit' : maxPicturesques,
      'cursor': PicturesqueApp.cursor
    });

    req.execute(function(data) {
      PicturesqueApp.showList(data);  
    });

    // $.ajax({
    //   url: tmpUrl,
    //   dataType: 'json',
    //   contentType: 'application/json',
    //   type: typeReq,
    //   data: params,
    //   success: function(data) {
    //     PicturesqueApp.showList(data);
    //   },
    //   error: function(xhr, ajaxOptions, thrownError) {
    //     $("#spinner").remove();
    //     console.error("Picturesque list error: " + xhr.status) + " err: " + thrownError;
    //     $('<h3/>', {
    //         html: "Could not find PicturesqueId: " +$("#gPicturesqueId").val()
    //       }).appendTo('#results');
    //   }
    // });


  }); // end of Picturesque lists


  // Show comments on specific Picturesque
  // Use - https://Picturesque-app.googleplex.com/_ah/api/Picturesque/v1/comments?PicturesqueId=3003'
  $("#PicturesqueComments").click(function() {
    if ($("#gPicturesqueId").val() == undefined || $("#gPicturesqueId").val() < 0) {
      console.error("Comments error - missing PicturesqueId: " + $("#gPicturesqueId").val() );
      $('<h3/>', {
        html: "Could not fetch comments for PicturesqueId: " + $("#gPicturesqueId").val()
      }).appendTo('#results');
    } 
    else {
      // we are all good (more or less) fetch the comments
      $('#results').html(PicturesqueApp.callingServerHtml);

      var req = gapi.client.Picturesque.comments.list({
        'PicturesqueId': $("#gPicturesqueId").val(),
        'limit' : 10
       // 'cursor': PicturesqueApp.cursor
      });

      req.execute(function(data) {
        $("#spinner").remove();

        if (data.error) {
          $('<h3/>', {
            html: "Could not find comments for PicturesqueId: " +$("#gPicturesqueId").val() +
            " Err:" + data.message
          }).appendTo('#results');
          return;
        }

        if (data && data.items) { 
          var comments = data.items;
          var items = [];
          $.each(comments, function(key, val) {
          
          var details = "<div class='PicturesqueComm'>";
          for (var prop in val) {
            if (prop !== "PicturesqueId") {
              if (prop === "date") {
                details += "(" + decodeURIComponent(val[prop]) + ")<br/>";
              }
              else {
                details += prop + ": " + val[prop] + "<br/>";
              }
            }
          }
          details += "</div>";
          items.push('<li><img src="img/Picturesque24.jpg"/><span class="label label-warning">' + 
            val.PicturesqueId +  
            '</span><br/>' + details + '</li>');
          });
          $('<ol/>', {
            'class': 'PicturesqueItem',
            html: items.join('')
          }).appendTo('#results');
        }
      });

      // $.ajax({
      //   url: PicturesqueApp.commentsUrl + "?PicturesqueId=" + $("#gPicturesqueId").val(),
      //   dataType: 'json',
      //   contentType: 'application/json',
      //   type: "GET",
      //   success: function(data) {
      //     $("#spinner").remove();
      //     if (data.error) {
      //       $('<h3/>', {
      //         html: "Could not find comments for PicturesqueId: " +$("#gPicturesqueId").val()
      //       }).appendTo('#results');
      //       return;
      //     }

      //     if (data && data.items) { 
      //       var comments = data.items;
      //       var items = [];
      //       $.each(comments, function(key, val) {
            
      //       var details = "<div class='PicturesqueComm'>";
      //       for (var prop in val) {
      //         if (prop !== "PicturesqueId") {
      //           if (prop === "date") {
      //             details += "(" + decodeURIComponent(val[prop]) + ")<br/>";
      //           }
      //           else {
      //             details += prop + ": " + val[prop] + "<br/>";
      //           }
      //         }
      //       }
      //       details += "</div>";
      //       items.push('<li><img src="img/Picturesque24.jpg"/><span class="label label-warning">' + 
      //         val.PicturesqueId +  
      //         '</span><br/>' + details + '</li>');
      //       });
      //       $('<ol/>', {
      //         'class': 'PicturesqueItem',
      //         html: items.join('')
      //       }).appendTo('#results');
      //     } // end of If
      //   },
      //   error: function(xhr, ajaxOptions, thrownError) {
      //     $("#spinner").remove();
      //     console.error("Picturesque list error: " + xhr.status) + " err: " + thrownError;
      //     $('<h3/>', {
      //         html: "Could not find PicturesqueId: " +$("#gPicturesqueId").val()
      //       }).appendTo('#results');
      //   }
      // });
    }
  })

  //
  // comments
  //
  $("#PicturesqueAddComment").click(function(data) {
      PicturesqueApp.clearCommentsFields();
      $('#PicturesqueCommentsModal').modal('show');
    });

  $("#cancelCommentsPicturesque").click(function(data) {
      $('#PicturesqueCommentsModal').modal('hide');
    });

  $("#saveCommentsPicturesque").click(function() {
      console.log("Save the comment.");
    var features = {};

    var tmpDate = new Date();
    // we wish this format: Jun 1 2005 1:33PM
    tmpDate = tmpDate.format("mmm d yyyy h:MTT"); 

    features['date'] = tmpDate;
    features['comment']  = $("#PicturesqueComment").val();
    $("#PicturesqueCommentsModal input[id^='Picturesque']").each(function() {      
      features[$(this).attr('name')] = $(this).val();
    });

    //var json = JSON.stringify(features); 
    $('#results').html(PicturesqueApp.callingServerHtml);

    var req = gapi.client.Picturesque.comments.add(features);
    req.execute(function(data) {
      var tmpHTML;
      $("#spinner").remove();
      if (data.error && data.error.code > 200) {
        console.error("Err Code: " + data.error.code + " Err: " + data.error.message);
        tmpHTML = data.error.message;
      }
      else {
        tmpHTML = '<h4>Your great comment on Picturesque ' + data.PicturesqueId + ' is Safe</h4>';
        tmpHTML += "<img src='img/flower26.png'/>"
      }
      $('#results').html("");
      $('#alertContent').html(tmpHTML);
      $('.alert').show(); 
    });  


    // $.ajax({
    //   url: PicturesqueApp.commentManUrl + "&postData="+json,
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

    $('#PicturesqueCommentsModal').modal('hide');
  });  


}); // end of the party
