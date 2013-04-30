/*
This file contain HTML5 app that use Gapi js client lib with GAE REST API
Source: https://code.google.com/u/bma@google.com/p/Picturesqueiodemo/
Author: Ido Green
Date: May 2013

Key features:
* GCE - The 4 CRUD operations.
* OAuth2.0 out of the box.
* Working with binary data.
* LawnChair - add config for app and save all Picturesques in indexedDB.
* Oauth - https://code.google.com/p/google-api-javascript-client/wiki/Samples
* http://code.google.com/p/google-api-javascript-client/

Yep: simplicity is the ultimate sophistication
https://developers.google.com/apis-explorer/?base=https://picturesque-app.appspot.com/_ah/api#p/picturesque/v1/

*/


// ================ Google API ================ 
//
// Load our service
function loadGapi() {
  gapi.client.setApiKey('AIzaSyD_mrsCOGa_cip-_O9YzmruYQ831uQcqPE');
  // Set: name of service, version and callback function
  gapi.client.load('picturesque', 'v1', getPicturesques);
}

// return a list of Picturesques
function getPicturesques() {
  var req = gapi.client.picturesque.photo.list(); 
  req.execute(function(data) {
    console.log("-- We have " + data.items.length + " Picturesques --");
    //console.log("Picturesques: " +  JSON.stringify(data));  
     
    // var Picturesques = data.items;
    // var i=1;
    // $.each(Picturesques, function(key, val) {
    //   //var details = JSON.stringify(val);
    //   console.log(i + ") Saving locally: " + val.id + " Name: "+ val.title) ;
    //   i++;
    //   //offline - save Picturesques
    //   PicturesqueApp.db.savePicturesque(val);
    // });

  });
}
// ================ Google API ================ 


//
// Start the party
// 
$(function() {
  // init data/UI
  PicturesqueApp.location();
  dragImg();

  $("a").tooltip();
  $(".alert").hide();

  //
  // Search after (good) Picturesques
  // 
  $("#searchPicturesque").keydown(function(event) {
    if (event.which == 13) {
        var searchTerm = $("#searchPicturesque").val(); 
        $('#results').html(PicturesqueApp.callingServerHtml);
        var req = gapi.client.picturesque.photo.list( {'title' : searchTerm});
        req.execute(function(searchOutput) {
          PicturesqueApp.showList(searchOutput);  
        });
    }
  });

  // set our last item back
  $("#gPicturesqueId").val(localStorage.getItem("gPicturesqueId"));

  // save our id for the future
  $("#gPicturesqueId").blur(function() {
    localStorage.setItem("gPicturesqueId", this.value);
  });
  
  //
  // Updating/Adding Picturesque 
  //
  $("#PicturesqueDetailsModalBut").click(function(data) {
    console.log("Fetch the Picturesque and show its data in our dialog");	
    var PicturesqueId = $("#gPicturesqueId").val();
    
    $('#results').html(PicturesqueApp.callingServerHtml);

    var req = gapi.client.picturesque.photo.get( {'id' : PicturesqueId});
    req.execute(function(data) {
      $("#spinner").remove();
      if (data.code >= 400) {
        // we have an error(s)
        $('#alertContent').html("Error: " + data.message);
        $('.alert').show();
        return;
      }
     
      if (data.id) {
        $("#PicturesqueId").val(data.id);  
        $("#title").val(data.title); 
        //$("#PicturesqueScore").val(data.score);
        //$("#PicturesqueScoreText").val(data.score);
        $("#PicturesqueDescription").val(data.description);
        
        // TODO:
        $("#PicturesqueTags").val(data.tags);

     
        if (data.base64Photo !== null ) {
          imgHtml = "<img src='data:image/png;base64," + data.base64Photo + "' id='upImg'/>";
          $('#imgdrop').html(imgHtml);
        }
        else {
          console.log ("Need to check why we don't have a photo with this item... not so good!");
        }
  
        $('#PicturesqueDetailsModal').modal('show');
      }
      else {
        $('#alertContent').html("Could not get Picturesque: " + $("#gPicturesqueId").val());
        $('.alert').show();
      } 
    });
  });
	
  // Get One Picturesque
  $(".onePicturesqueBut").click(function(data) {
    PicturesqueApp.cursor = undefined;
    $('#results').html(PicturesqueApp.callingServerHtml);
    var req = gapi.client.picturesque.photo.get({
      'id' :  $("#gPicturesqueId").val()
    });

    req.execute(function(data) {
      PicturesqueApp.showList(data);  
    });

  });

  // Delete Picturesque
  $("#PicturesqueDelBut").click(function() {
    $('#results').html(PicturesqueApp.callingServerHtml);
    var req = gapi.client.picturesque.photo.delete({
      'id' :  $("#gPicturesqueId").val()
    });

    req.execute(function(data) {
      PicturesqueApp.showList(data);  
    });
  });

  // Add new Picturesque
  $("#PicturesqueAddBut").click(function(data) {
    PicturesqueApp.clearFields();
   // $("#PicturesqueDescription").val(PicturesqueApp.curLocation);
   // $("#PicturesqueScore").change();

    $('#PicturesqueDetailsModal').modal('show');

  });

  // Actions for the modal
  $("#cancelPicturesque").click(function(data) {
    PicturesqueApp.clearFields();
    $('#PicturesqueDetailsModal').modal('hide');
  });

  //
  // Save Picturesque - Add new or update
  //
  $("#savePicturesque").click(function() {
    console.log("Going to save the Picturesque...");
    var features = {};

    // extract all the info from the form's fields
    $("#PicturesqueDetailsModal input[id^='Picturesque']").each(function() {      
      features[$(this).attr('name')] = $(this).val();
    });
    delete features['undefined'];
    
    // Get the select value as well. features[$('#PicturesqueNumDrinks').attr('name')] = $('#PicturesqueNumDrinks').val();
    if ($('#upImg')[0] !== null) { 
      var tmpImg = $('#upImg')[0]; // keep it one image per Picturesque
      var PicturesqueImg64 = getBase64Image(tmpImg);
      features['base64Photo'] = PicturesqueImg64; // {"value" : PicturesqueImg64};
    } 
    var req;
    if ( !features['PicturesqueId']) {
      // In case we have an empty PicturesqueId, do not send it, 
      // so the server will take it as a new Picturesque
      delete features['PicturesqueId'];

      req = gapi.client.picturesque.photo.insert( features );
    }
    else {
      // It's an update of a Picturesque
      features['id']        = features['PicturesqueId'];
      delete features['PicturesqueId'];

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
          tmpHTML += 'id: ' + data.id + " Name: " + data.title;
        }
        $('#results').html("");
        $('#alertContent').html(tmpHTML);
        $('.alert').show();

    });

    $('#PicturesqueDetailsModal').modal('hide');
  });

  $("#PicturesqueScore").change(function() {
    $("#PicturesqueScoreText").val($("#PicturesqueScore").val());
  })

  //
  // Show Picturesque(s) in a list format
  //
  $(".PicturesqueListBut").live("click", function() {
    var maxPicturesques = $("#listNumPicturesque").val();   
    $('#results').html(PicturesqueApp.callingServerHtml);
    var req = gapi.client.picturesque.photo.list({
      'limit' : maxPicturesques,
      'cursor': PicturesqueApp.cursor
    });

    req.execute(function(data) {
      PicturesqueApp.showList(data);  
    });

  }); // end of Picturesque lists


  //
  // Save new comments 
  // oauth example
  //
  $("#saveCommentsPicturesque").click(function() {
    var features = {};

    var tmpDate = new Date();
    // Using format: Jun 1 2005 1:33PM
    tmpDate = tmpDate.format("mmm d yyyy h:MTT"); 

    features['date'] = tmpDate;
    features['comment']  = $("#PicturesqueComment").val();
    $("#PicturesqueCommentsModal input[id^='Picturesque']").each(function() {      
      features[$(this).attr('name')] = $(this).val();
    });

    //var json = JSON.stringify(features); 
    $('#results').html(PicturesqueApp.callingServerHtml);

    var req = gapi.client.picturesque.photo.comments.insert(features);
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

    $('#PicturesqueCommentsModal').modal('hide');
  });  


  // Show comments on specific Picturesque
  // Use - https://Picturesquedemo1.googleplex.com/_ah/api/Picturesque/v1/comments?PicturesqueId=3003'
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

      var req = gapi.client.picturesque.photo.comments.list({
        'PicturesqueId': $("#gPicturesqueId").val()
      });

      req.execute(function(data) {
        $("#spinner").remove();
        PicturesqueApp.showComments(data);
      });
    }
  })

  //
  // comments dialog actions
  //
  $("#PicturesqueAddComment").click(function(data) {
      PicturesqueApp.clearCommentsFields();
      PicturesqueApp.checkAuth();
      $('#PicturesqueCommentsModal').modal('show');
    });

  $("#cancelCommentsPicturesque").click(function(data) {
      $('#PicturesqueCommentsModal').modal('hide');
    });


  
}); // end of the party
