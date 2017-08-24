angular.module('phantomApp', ['ngRoute','ngMessages'])

  .config(function($routeProvider) {
    $routeProvider
      .when('/',
        {
          controller: 'PhantomListController',
          templateUrl: 'link-list.html'
        })
      .when('/bookmark-added',
        {
          controller: 'AddedController',
          templateUrl: 'link-added.html'
        })
      .otherwise({riderectTo: '/'});
  })


  // Create service to load initial JSON
  .service('PhantomService', function($http, $q) {
    var deferred = $q.defer();
    $http.get('js/bookmarks.json').then(function(data){
      deferred.resolve(data);
    });
    this.getData = function() {
      return deferred.promise;
    }
  })

  // service to pass on data between diferent views | controllers
  .service('NewLinkService', function() {
    var newlink = [];
    var addNewLink = function(newObj) {
        newlink.push(newObj);
    };
    var getNewLink = function(){
        return newlink;
    };
    var clearNewLink = function(){
        return newlink = [];
    };
    return {
      addNewLink: addNewLink,
      getNewLink: getNewLink,
      clearNewLink: clearNewLink
    };
  })

  // Create the main controller
  .controller('PhantomListController', function($scope, PhantomService, NewLinkService, $filter, $routeParams, $location) {

    $scope.links = [];
    $scope.currentPage = $scope.currentPage || 0;
    $scope.numPerPage = 20;
    $scope.pages = 0;
    $scope.totalPages = 1;
 
    // Grab and use a JSON file as the default link's database
    var localLinks = localStorage['linkList'];
    var promise = PhantomService.getData();
    promise.then(function(data){
      // check if there is localStorage, if so use that, else use the default json
      if(localLinks !== undefined) {
        $scope.links = JSON.parse(localLinks);
      } else {
        $scope.links = data.data.bookmark;
      }
      $scope.totalPages = $scope.numPages();
    });

    //links manipulation
    $scope.addLink = function() {
      // checks if it is undefined and if it already exists
      if($scope.addNewLink !== undefined) {
        if($scope.inArray($scope.addNewLink,$scope.links) == true) {
          console.log("Already exists");
          exists.validationError = true;
        } else {
          $scope.links.push({'url' : $scope.addNewLink}); // add it to the array
          // $scope.links.unshift({'url' : $scope.addNewLink}); // add it to the array (at[0])
          NewLinkService.addNewLink($scope.addNewLink); // use the service to pass it on to the other view
          $scope.updateList();
          $scope.addNewLink = ''; // clean the input field
          $location.path('/bookmark-added/'); // go to the thank you view
        }

      }
    }

    // check if value exists in array
    $scope.inArray = function(value,array) {
        var count = $scope.links.length;
        for(var i=0;i<count;i++) {
            if(array[i].url===value){
              return true;
            }
        }
        return false;
    }

    $scope.editLink = function(link) {
      $scope.links[$scope.links.indexOf(link)].url = link.url; // update the existing array object
      $scope.updateList();
    }

    $scope.deleteLink = function(link) {
      $scope.links.splice($scope.links.indexOf(link), 1); // remove that array object
      $scope.updateList();
    }

    $scope.updateList = function() {
      localStorage['linkList'] = JSON.stringify($scope.links); // update local storage
      $scope.totalPages = $scope.numPages(); // update the total amount of pages
    }

    // pagination
    $scope.pages = function(num) {
      return new Array(num);   
    }
    $scope.numPages = function () {
      return Math.ceil($scope.links.length / $scope.numPerPage);
    }
    $scope.goToPage = function(page) {
      console.log(page); // TODO: go to the right page!
    }


  })

  .controller('AddedController', function($scope, PhantomService, NewLinkService, $filter, $routeParams, $location) {
    // get the new link url from the previous controller
    $scope.newlink = NewLinkService.getNewLink();

    $scope.goBack = function() {
      $scope.newlink = NewLinkService.clearNewLink();
      $location.path('/');
    }
  })

  .filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }

});