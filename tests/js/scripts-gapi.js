/*
This file contain HTML5 app that use Gapi js client lib with GAE REST API
Source: https://code.google.com/u/bma@google.com/p/Gphotoiodemo/
Author: Ido Green
Date: May 2013

Key features:
1. LawnChair - add config for app and save all Gphotos in indexedDB.
2. Geo - maps for the location.
3. WebIntent - Sharing.

* Oauth - https://code.google.com/p/google-api-javascript-client/wiki/Samples
* http://code.google.com/p/google-api-javascript-client/

Yep: simplicity is the ultimate sophistication
https://developers.google.com/apis-explorer/?base=https://GPhoto-io2013.appspot.com/_ah/api#p/GPhoto/v1/

http://developers.google.com/apis-explorer/?base=https://Gphotodemo1.googleplex.com/_ah/api#p/GPhoto/v1/

*/


// ================ Google API ================ 
//
// Load our service
function loadGapi() {
  // Set the API key  AIzaSyAlZqy1ElhVN_Hbutey0xNabhZ14bEpcAo
  // Ido - AIzaSyD_mrsCOGa_cip-_O9YzmruYQ831uQcqPE
  gapi.client.setApiKey('AIzaSyAlZqy1ElhVN_Hbutey0xNabhZ14bEpcAo');
  // Set: name of service, version and callback function
  gapi.client.load('GPhoto', 'v1', getGphotos);
}

// return a list of Gphotos
function getGphotos() {
  var req = gapi.client.GPhoto.Gphotos.list(); 
  req.execute(function(data) {
    console.log("-- We have " + data.items.length + " Gphotos --");
    //console.log("Gphotos: " +  JSON.stringify(data));  
     
    // var Gphotos = data.items;
    // var i=1;
    // $.each(Gphotos, function(key, val) {
    //   //var details = JSON.stringify(val);
      
    //   console.log(i + ") Saving locally: " + val.id + " Name: "+ val.GphotoName) ;
    //   i++;
    //   //offline - save Gphotos
    //   GphotoApp.db.saveGphoto(val);
    // });

  });
}
// ================ Google API ================ 


// start the party
// 
$(function() {
  // init data/UI
  GphotoApp.location();
  dragImg();

  $("a").tooltip();
  $(".alert").hide();

  //
  // Search after (good) Gphotos
  // 
  $("#searchGphoto").keydown(function(event) {
    if (event.which == 13) {
        var searchTerm = $("#searchGphoto").val(); 
        $('#results').html(GphotoApp.callingServerHtml);
        var req = gapi.client.GPhoto.Gphoto.search( {'term' : searchTerm});
        req.execute(function(searchOutput) {
          GphotoApp.showList(searchOutput);  
        });
    }
  });

  // set our last item back
  $("#gGphotoId").val(localStorage.getItem("gGphotoId"));

  // save our id for the future
  $("#gGphotoId").blur(function() {
    localStorage.setItem("gGphotoId", this.value);
  });

  //
  // Updating/Adding Gphoto 
  //
  $("#GphotoDetailsModalBut").click(function(data) {
    console.log("Fetch the Gphoto and show its data in our dialog");	
    var GphotoId = $("#gGphotoId").val();
    
    $('#results').html(GphotoApp.callingServerHtml);

    var req = gapi.client.GPhoto.Gphotos.get( {'id' : GphotoId});
    req.execute(function(data) {
      $("#spinner").remove();
      if (data.code >= 400) {
        // we have an error(s)
        $('#alertContent').html("Error: " + data.message);
        $('.alert').show();
        return;
      }
     
      if (data.id) {
        $("#GphotoId").val(data.id);  
        $("#GphotoName").val(data.GphotoName); 
        $("#GphotoScore").val(data.score);
        $("#GphotoScoreText").val(data.score);
        var tmpLocation = "32.06,34.77"; // default is Google office in TLV
        if (data.latitude && data.longitude) {
            tmpLocation = data.latitude + "," + data.longitude;
            $("#GphotoDesc").val(tmpLocation);
        }
        
        var mapImg = '<img border=0 src="http://maps.googleapis.com/maps/api/staticmap?center=' +
            tmpLocation + '&zoom=14&size=262x112&maptype=roadmap&markers=color:blue%7Clabel:S%7C' + 
            tmpLocation + '&sensor=true"/>';
        $("#localMap").html(mapImg);
        $("#GphotoTags").val(data.kindOfGphoto);

        var imgData64 = null;
        if (data.image !== null && data.image.value !== null) {
          imgData64 = data.image.value;
          imgHtml = "<img src='data:image/png;base64," + imgData64 + "' id='upImg'/>";
          $('#imgdrop').html(imgHtml);
        }
        
        $('#GphotoDetailsModal').modal('show');
      }
      else {
        $('#alertContent').html("Could not get Gphoto: " + $("#gGphotoId").val());
        $('.alert').show();
      } 
    });
  });
	
  // Get One Gphoto
  $(".oneGphotoBut").click(function(data) {
    GphotoApp.cursor = undefined;
    $('#results').html(GphotoApp.callingServerHtml);
    var req = gapi.client.GPhoto.Gphotos.get({
      'id' :  $("#gGphotoId").val()
    });

    req.execute(function(data) {
      GphotoApp.showList(data);  
    });

  });

  // Delete Gphoto
  $("#GphotoDelBut").click(function() {
    $('#results').html(GphotoApp.callingServerHtml);
    var req = gapi.client.GPhoto.Gphotos.delete({
      'id' :  $("#gGphotoId").val()
    });

    req.execute(function(data) {
      GphotoApp.showList(data);  
    });
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
  // Save Gphoto - Add new or update
  //
  $("#saveGphoto").click(function() {
    console.log("Going to save the Gphoto...");
    var features = {};

    // extract all the info from the form's fields
    $("#GphotoDetailsModal input[id^='Gphoto']").each(function() {      
      features[$(this).attr('name')] = $(this).val();
    });
    delete features['undefined'];
    var latLong = features['location'].split(",");
    delete features['location'];

    // Get the select value as well.
    features[$('#GphotoNumDrinks').attr('name')] = $('#GphotoNumDrinks').val();
    if ($('#upImg')[0] !== null) { 
      var tmpImg = $('#upImg')[0]; // keep it one image per Gphoto
      var GphotoImg64 = getBase64Image(tmpImg);
      features['image'] =  {"value" : GphotoImg64};
    } 
    var req;
    if ( !features['GphotoId']) {
      // In case we have an empty GphotoId, do not send it, 
      // so the server will take it as a new Gphoto
      delete features['GphotoId'];
      
      features['latitude'] =  GphotoApp.lang;
      features['longitude'] = GphotoApp.long;

      req = gapi.client.GPhoto.Gphotos.insert( features );
    }
    else {
      // It's an update of a Gphoto
      features['id']        = features['GphotoId'];
      delete features['GphotoId'];
      features['latitude']  = latLong[0];
      features['longitude'] = latLong[1];
      req = gapi.client.GPhoto.Gphotos.update( features ); 
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
          tmpHTML += 'id: ' + data.id + " Name: " + data.GphotoName;
        }
        $('#results').html("");
        $('#alertContent').html(tmpHTML);
        $('.alert').show();

    });

    $('#GphotoDetailsModal').modal('hide');
  });

  $("#GphotoScore").change(function() {
    $("#GphotoScoreText").val($("#GphotoScore").val());
  })

  //
  // Show Gphoto(s) in a list format
  //
  $(".GphotoListBut").live("click", function() {
    var maxGphotos = $("#listNumGphoto").val();   
    $('#results').html(GphotoApp.callingServerHtml);
    var req = gapi.client.GPhoto.Gphotos.list({
      'limit' : maxGphotos,
      'cursor': GphotoApp.cursor
    });

    req.execute(function(data) {
      GphotoApp.showList(data);  
    });

  }); // end of Gphoto lists


  //
  // save new comments 
  // oauth example
  //
  $("#saveCommentsGphoto").click(function() {
    var features = {};

    var tmpDate = new Date();
    // Using format: Jun 1 2005 1:33PM
    tmpDate = tmpDate.format("mmm d yyyy h:MTT"); 

    features['date'] = tmpDate;
    features['comment']  = $("#GphotoComment").val();
    $("#GphotoCommentsModal input[id^='Gphoto']").each(function() {      
      features[$(this).attr('name')] = $(this).val();
    });

    //var json = JSON.stringify(features); 
    $('#results').html(GphotoApp.callingServerHtml);

    var req = gapi.client.GPhoto.Gphotos.comments.insert(features);
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

    $('#GphotoCommentsModal').modal('hide');
  });  


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

      var req = gapi.client.GPhoto.Gphotos.comments.list({
        'GphotoId': $("#gGphotoId").val()
      });

      req.execute(function(data) {
        $("#spinner").remove();
        GphotoApp.showComments(data);
      });
    }
  })

  //
  // comments dialog actions
  //
  $("#GphotoAddComment").click(function(data) {
      GphotoApp.clearCommentsFields();
      GphotoApp.checkAuth();
      $('#GphotoCommentsModal').modal('show');
    });

  $("#cancelCommentsGphoto").click(function(data) {
      $('#GphotoCommentsModal').modal('hide');
    });


  
}); // end of the party
