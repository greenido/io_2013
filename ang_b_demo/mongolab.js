// This is a module for cloud persistance in mongolab - https://mongolab.com
// https://api.mongolab.com/api/1/databases/birra1/collections/main/516bb824e4b0ecff296de7f9?apiKey=iEAWUcq9c0_wSxizTq_tJl5xr5V1S6N1

angular.module('mongolab', ['ngResource']).
    factory('Project', function($resource) {
      var Project = $resource('https://api.mongolab.com/api/1/databases' +
        '/birra1/collections/main/:id',
        //  '/angularjs/collections/projects/:id',
          { apiKey: 'iEAWUcq9c0_wSxizTq_tJl5xr5V1S6N1' }, {
          //{ apiKey: '4f847ad3e4b08a2eed5f3b54' }, {
            update: { method: 'PUT' }
          }
      );
 
      Project.prototype.update = function(cb) {
        return Project.update({id: this._id.$oid},
            angular.extend({}, this, {_id:undefined}), cb);
      };
 
      Project.prototype.destroy = function(cb) {
        return Project.remove({id: this._id.$oid}, cb);
      };
 
      return Project;
    });