angular
.module('ionicApp', ['ionic', 'ngStorage'])

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
//  https://medium.com/@petehouston/awesome-local-storage-for-ionic-with-ngstorage-c11c0284d658#.20ehiorvs
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
.service('MatchConfigService', function(StorageService) {
  var matchList = new Object();

  var addMatch = function(newObj) {
        StorageService.add(newObj);
  };

  var getMatch = function(){
      return StorageService.getAll();
  };

  return {
    addMatch: addMatch,
    getMatch: getMatch
  };

})
.service('ActionService', function() {
  var actionsList = new Array();

  var addActions = function(newObj) {
      actionsList = newObj;
  };

  var getActions = function(){
      return actionsList;
  };

  return {
    addActions: addActions,
    getActions: getActions
  };

})
.service('StopWatchService', function() {
  var infoHalf = new Array();

  var addInfoHalf = function(newObj) {
      infoHalf = newObj;
  };

  var getInfoHalf = function(){
      return infoHalf;
  };

  return {
    addInfoHalf: addInfoHalf,
    getInfoHalf: getInfoHalf
  };

})
//filter used by clocwatch to show the clock
.filter('mmss', function () {
  return function (time) {
    var sec_num = parseInt(time, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    //if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = minutes+':'+seconds;
    return time;
  }
})
//It is used by filter player numbers in array
.filter('filterPosition', function() {
    return function(numberArray) {
      //sort method does a lexicographic sort by default 
      //http://stackoverflow.com/questions/1063007/how-to-sort-an-array-of-integers-correctly
      return numberArray.sort((a, b) => a - b);      
    };
})
//It is used to show Sim  or Não in table players
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
//it is used to remove players who they aren't starting playing the game
.filter('filterPlayer', function() {
    return function(playersArray) {
        var filtered = new Array();
        angular.forEach(playersArray, function(player, key){
         if(player.start == true){
          filtered.push(player);
         }           
        });
        return filtered;
    };
})

//http://stackoverflow.com/questions/32285679/angularjs-how-to-make-a-stop-watch-starting-from-000000-format
.controller("StopWatchCtrl",function($scope, $timeout, $interval, StopWatchService){
   $scope.timeChoose = false;
   $scope.typeHalf = new Object();
   $scope.showStartButton = true;
   //timer with timeout
   $scope.timerWithTimeout = 0;
   $scope.startTimerWithTimeout = function() {   
    $scope.typeHalf.type = $scope.timeChoose;
    $scope.typeHalf.timeStart = new Date();
    $scope.typeHalf.show = true;
    StopWatchService.addInfoHalf($scope.typeHalf);

    $scope.showStartButton = false;
    $scope.timerWithTimeout = 0;
    if($scope.myTimeout){
      $timeout.cancel($scope.myTimeout);
    }
    $scope.onTimeout = function(){
        $scope.timerWithTimeout++;
        $scope.myTimeout = $timeout($scope.onTimeout,1000);
    }
    $scope.myTimeout = $timeout($scope.onTimeout,1000);
  };
  
  $scope.resetTimerWithTimeout = function(){
    $scope.typeHalf.type = undefined;
    $scope.typeHalf.timeStart = undefined;
    $scope.typeHalf.show = false;
    StopWatchService.addInfoHalf($scope.typeHalf);

    $scope.showStartButton = true;
    $scope.timerWithTimeout = 0;
    $timeout.cancel($scope.myTimeout);
  } 
})
//http://www.gajotres.net/storing-data-in-ionic-framework-and-onsenui/2/
.controller('InitConfigMatchCtrl', function($scope, MatchConfigService, ActionService) {
  $scope.showForm = true;

  $scope.match = new Object();

   var actions = [{index: "PE", name : "Passe Errado"}, 
                    {index: "DCB", name:"Desarme C/ Bola"},
                    {index: "DSB", name:"Desarme S/ Bola"},
                    {index: "BLO", name:"Bloqueio"},
                    {index: "IP", name:"Interceptação de Passe"},
                    {index: "BLO", name:"Bloqueio"},
                    {index: "BP", name:"Bola Perdida"},
                    {index: "GOL", name:"Gol"},
                    {index: "FNG", name:"Finalização no Gol"},
                    {index: "FFG", name:"Finalização Fora do Gol"},
                    {index: "DBE", name:"Drible"}];

  ActionService.addActions(actions);
 
  $scope.submit = function(){
    $scope.match.date = new Date();
    MatchConfigService.addMatch($scope.match);    
  }  
})
.controller('FillTablePlayersCtrl', function($scope,MatchConfigService) {
  
  $scope.tableHeader = ["Nome","Posição","Número","Começa Jogo"];
  $scope.numbers = ["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22"];
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
  $scope.players = new Array();
  $scope.player = new Object();

  $scope.addPlayer = function(){
    if($scope.player.start == undefined) $scope.player.start = false;
    $scope.players.push($scope.player);

    // remove num into numbers array    
    var index = $scope.numbers.indexOf($scope.player.number);
    $scope.numbers.splice(index,1);
    $scope.player = new Object();
  }

  $scope.removePlayer = function(player){
    // add num into numbers array
    $scope.numbers.push(player.number);
    var index = $scope.players.indexOf(player);
    $scope.players.splice(index, 1);
  }

  $scope.editPlayer = function(player){
    // add num into numbers array
    $scope.numbers.push(player.number);
    $scope.player = player;
  }

  $scope.saveToMatch = function(){
    var match = MatchConfigService.getMatch();
    match.players = $scope.players;
    MatchConfigService.addMatch(match);
  }

})
.controller('ScoutCtrl', function($scope, $filter, $ionicModal, $ionicPopover,MatchConfigService,ActionService, StopWatchService) {
  
  
  $scope.rows = [0,1,2,3,4,5,6,7,8,9];
  $scope.columns = [0,1,2,3,4,5,6,7,8,9];
  $scope.typeHalf = StopWatchService.getInfoHalf();
  
  $scope.displayTable = $scope.typeHalf.show;

  $scope.match = MatchConfigService.getMatch();
  $scope.players = $scope.match.players;
  $scope.actions = ActionService.getActions();

  $scope.movement = new Object();

  $scope.playerSelected = -1;

  $ionicPopover.fromTemplateUrl('templates/selectPlayers.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openPopoverPlayer = function($event) {
    $scope.modal.show($event);
  };
  $scope.closePopoverPlayer = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

  $ionicPopover.fromTemplateUrl('templates/selectActions.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(popover) {
    $scope.popover = popover;
  });  

   $scope.openPopoverAction = function($event) {
      $scope.popover.show($event);
   };

   $scope.closePopoverAction = function() {
      $scope.popover.hide();
      console.log("closePopover");
   };

   //Cleanup the popover when we're done with it!
   $scope.$on('$destroy', function() {
      $scope.popover.remove();
      console.log("destroy");
   });

   // Execute action on hide popover
   $scope.$on('popover.hidden', function() {
      // Execute action
      console.log("hidden");
   });

   // Execute action on remove popover
   $scope.$on('popover.removed', function() {
      // Execute action
      console.log("removed");
   });
 /***/
 $scope.selectPlayer = function(indexPlayer,$event){
   $scope.playerSelected = indexPlayer;
   // find player and call movement popover to choose the movement
   $scope.openPopoverAction($event);
 }

  $scope.selectAction = function(action,$event){
   $scope.movement.action = action;
   if($scope.players[$scope.playerSelected].movements == undefined){
     $scope.players[$scope.playerSelected].movements = new Array();
   }
   $scope.players[$scope.playerSelected].movements.push($scope.movement);
   console.log($scope.players);
   $scope.movement = new Object();
   $scope.closePopoverPlayer();
   $scope.closePopoverAction();
 }
 

  $scope.openOptions = function(row,column,$event){
    var typeHalf = StopWatchService.getInfoHalf();
    var move = new Object();
    move.actionTime = new Date();
    move.row = row;
    move.column = column;
    move.type = typeHalf.type;
    move.timeStart = typeHalf.timeStart;
    $scope.movement = move;
    $scope.openPopoverPlayer($event);
    
    //Using item sliding
    //ToastController - show up a message when event is hitting
    //Select event: https://ionicframework.com/docs/v2/api/components/select/Select/
    //Popover : https://ionicframework.com/docs/v2/api/components/popover/PopoverController/
      // http://mcgivery.com/understanding-ionic-framework-action-sheet/
  }

  $scope.showValues = function(){
    $scope.match.players = $scope.players;
    MatchConfigService.addMatch($scope.match);    
  }

  $scope.items = [];
  $scope.items[0] = ["00","01","02","03","04","05","06","07","08","09"];
  $scope.items[1] = ["10","11","12","13","14","15","16","17","18","19"];
  $scope.items[2] = ["20","21","22","23","24","25","26","27","28","29"];
  $scope.items[3] = ["30","31","32","33","34","35","36","37","38","39"];
  $scope.items[4] = ["40","41","42","43","44","45","46","47","48","49"];
  
});