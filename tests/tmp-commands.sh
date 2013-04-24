curl -H  'content-type:application/json'  -d '{"GphotoId": "1003" }'  https://Gphotodemo1.googleplex.com /_ah/api/Gphoto/v1/Gphotos

curl -H  'content-type:application/json'  -d '{"GphotoId": "1003" }'  https://Gphotodemo1.googleplex.com/_ah/api/Gphoto/v1/Gphotos


curl 'https://Gphotodemo1.googleplex.com/_ah/api/Gphoto/v1/Gphotos?limit=1'
{
 "cursor": "E-ABAIICKWoWc35nb29nbGUuY29tOmJlZXJkZW1vMXIPCxIJQmVlclN0b3JlGAMMFA==",
 "items": [
  {
   "numberOfComments": 0,
   "name": "Bud light",
   "numberOfDrinks": 3,
   "kindOfGphoto": "Ale",
   "score": 3,
   "location": "San Jose",
   "id": 3
  }
 ],
 "etag": "\"XM_v48Ac6D5RyQ2r4sG6FoX38H0/W6k8nbDP-T9StSHXQg5D9u2ieE8\""
}

echo "paging of Gphotos.. "
curl 'https://Gphotodemo1.googleplex.com/_ah/api/Gphoto/v1/Gphotos?cursor=E-ABAIICKWoWc35nb29nbGUuY29tOmJlZXJkZW1vMXIPCxIJQmVlclN0b3JlGAMMFA==&limit=1'


====


"aenhive" - print the index of the first letter that is not in alpha beta order

====


request_json = {
        path: '_ah/api/Gphoto/v1/Gphotos',
        method: "POST",
        params: "",
        body: '{"GphotoId":"' + $("#GphotoId").val() + '"}'
      };
gapi.config.update('googleapis.config/root', 'https://Gphotodemo1.googleplex.com/');

request = gapi.client.request(request_json);
request.execute(function(data) {
        
        $("#spinner").remove();
        if (data) { 
          var Gphotos = data.contents.items;  
          var items = [];
          }
});  

// Creates a HTTP request for making RESTful requests.

// Arguments:

// args - type: object. An object encapsulating the various arguments for this method. The path is required, the rest are optional. The values are described in detail below.
// path - type: string: The URL to handle the request.
// method - type: string: The HTTP request method to use. Default is 'GET'.
// params - type: Object: URL params in key-value pair form.
// headers - type: Object: Additional HTTP request headers.
// body - type: string: The HTTP request body (applies to PUT or POST).
// callback - type: Function: If supplied, the request is executed immediately and no gapi.client.HttpRequest object is returned.


