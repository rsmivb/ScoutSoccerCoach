angular.module('ionicApp', ['ionic', 'ngStorage'])

.config(function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('eventmenu', {
      url: "/event",
      abstract: true,
      templateUrl: "templates/event-menu.html"
    })
    .state('eventmenu.home', {
      url: "/home",
      views: {
        'menuContent' :{
          templateUrl: "templates/home.html"
        }
      }
    })
    .state('eventmenu.scoutInit', {
      url: "/scoutInit",
      views: {
        'menuContent' :{
          templateUrl: "templates/scoutInit.html",
          controller: "InitConfigMatchCtrl"
        }
      }
    })
    .state('eventmenu.scout', {
      url: "/scout",
      views: {
        'menuContent' :{
          templateUrl: "templates/scout.html",
          controller: "ScoutCtrl"
        }
      }
    })
    .state('eventmenu.tablePlayers', {
      url: "/tablePlayers",
      views: {
        'menuContent' :{
          templateUrl: "templates/tablePlayers.html",
          controller: "FillTablePlayersCtrl"
        }
      }
    })
  
  $urlRouterProvider.otherwise("/event/home");
})

.service('matchConfigService', function() {
  var matchList = [];

  var addMatch = function(newObj) {
      matchList.push(newObj);
  };

  var getMatch = function(){
      return matchList;
  };

  return {
    addMatch: addMatch,
    getMatch: getMatch
  };

})
/**  https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.20ehiorvs
// create a new factory to storage service
.factory ('StorageService', function ($localStorage) {
  $localStorage = $localStorage.$default({
    things: []
  });
  var _getAll = function () {
    return $localStorage.things;
  };

  var _add = function (thing) {
    $localStorage.things.push(thing);
  }

  var _remove = function (thing) {
    $localStorage.things.splice($localStorage.things.indexOf(thing), 1);
  }

  return {
      getAll: _getAll,
      add: _add,
      remove: _remove
    };
})
*/

//http://www.gajotres.net/storing-data-in-ionic-framework-and-onsenui/2/
.controller('InitConfigMatchCtrl', function($scope,matchConfigService,$localStorage) {
  $scope.showForm = true;

  $scope.match = [];
 
  $scope.submit = function(){
    $scope.match.date = new Date();   
    //console.log($scope.match);
    matchConfigService.addMatch($scope.match);
    if(typeof(Storage) != "undefined"){
      $localStorage.match = $scope.match;
      console.log($localStorage.match);
      console.log("Local Storage done!");
    }
    else{
      console.log("Local Storage is not working");
    }
  }  
})

.controller('FillTablePlayersCtrl', function($scope,matchConfigService) {

  $scope.tableHeader = ["Nome","Posição","Número","Começa Jogo"];
  $scope.numbers = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22];
  $scope.positions = [{"index" : "G", "name": "Goleiro"},
        {"index" : "Z", "name": "Zagueiro"},
        {"index" : "LD", "name": "Lateral Direito"},
        {"index" : "LE", "name": "Lateral Esquerdo"},
        {"index" : "V", "name": "Volante"},
        {"index" : "AD", "name": "Ala Direita"},
        {"index" : "AE", "name": "Ala Esquerda"},
        {"index" : "A", "name": "Apoiador"},
        {"index" : "MA", "name": "Meia Atacante"},
        {"index" : "P", "name": "Ponta"},
        {"index" : "SA", "name": "Segunda Atacante"},
        {"index" : "CA", "name": "Centroavante"}];


  $scope.players = [];
  $scope.player = {};

  $scope.addPlayer = function(){
    var match = matchConfigService.getMatch();
    if($scope.player.start == undefined || $scope.player.start == null) $scope.player.start = false;  
    $scope.players.push($scope.player);
    console.log($scope.players);
    $scope.player = {};
  }

  $scope.removePlayer = function(player){
    var index = $scope.players.indexOf(player);
    $scope.players.splice(index, 1);
  }

  $scope.editPlayer = function(player){
    $scope.player = player;
  }
})
/** Filter need to be improved */
.filter('filterPosition', function() {
  console.log("filter: ");
    return function(x) {
      console.log("filter: " + x);
        angular.forEach(positions, function(value, key){
         if(value.index == x)
           console.log("filter: " + value.name);
           return value.name;
         });
    };
})

.filter('filterStartGame', function() {
    return function(x) {
        if(x == false){
          return "Não";
        }
        else{
          return "Sim";
        }        
    };
})
.controller('ScoutCtrl', function($scope, $ionicPopover) {//$ionicActionSheet,
  
  $scope.rows = [1,2,3,4,5,6,7,8,9,10];
  $scope.columns = [1,2,3,4,5,6,7,8,9,10];
  
  $scope.players = ["Fulano","Beltrano", "Ciclano"];
  $scope.movements = ["Passe Errado", 
                      "Desarme C/Bola",
                      "Desarme S/Bola",
                      "Bloqueio",
                      "Interceptação Passe",
                      "Bola Perdida",
                      "Gol",
                      "Finalização no Gol",
                      "Finalização Fora do Gol",
                      "Drible"];

  $ionicPopover.fromTemplateUrl('templates/popover.html', {
    scope: $scope,
  }).then(function(popover) {
    $scope.popover = popover;
  });
 
   $scope.openPopover = function($event) {
      $scope.popover.show($event);
   };

   $scope.closePopover = function() {
      $scope.popover.hide();
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.popover.remove();
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
   });

  $scope.saveMove = function(position,$event){
    console.log(position);
    $scope.openPopover($event);
    
    //Using item sliding
    //ToastController - show up a message when event is hitting
    //Select event: https://ionicframework.com/docs/v2/api/components/select/Select/
    //Popover : https://ionicframework.com/docs/v2/api/components/popover/PopoverController/
    //$ionicActionSheet.show({
      // http://mcgivery.com/understanding-ionic-framework-action-sheet/
    //  titleText: 'ActionSheet Example' + row +"_" + column
    //});
  };

});