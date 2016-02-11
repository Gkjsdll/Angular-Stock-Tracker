"use strict";

var app = angular.module("angularStocks", ["ui.router"]);

app.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state("home", {url: "/", templateUrl: "/partials/home.html"})
    .state("list", {url: "/list", templateUrl: "/partials/list.html", controller: "listCtrl"})
    .state("add", {url: "/add", templateUrl: "/partials/add.html", controller: "addCtrl"});

    $urlRouterProvider.otherwise("/");
});

app.controller("listCtrl", function($scope, Stocks) {
  $scope.list = Stocks.list;
});

app.controller("addCtrl", function($scope, $state, Stocks) {
  Stocks.searchResults = [];
  $scope.searchResults = Stocks.searchResults;
  $scope.add = function(){
    Stocks.addBySymbol($scope.symbol);
  };

  $scope.search = function() {
    Stocks.search($scope.searchText);
  }

});

app.service("Stocks", function($http, $state) {
  if(!this.list) this.list = [];
  if(!this.searchResults) this.searchResults = [];
  if(!this.tracking) this.tracking = [];
  if(!this.symbols) this.symbols = [];

  var thisService = this;

  this.addBySymbol = function(symbol) {
    if(thisService.symbols.includes(symbol)){
      swal("Symbol already being tracked", "", "Error");
    }
    else {
      $http.jsonp(`http://dev.markitondemand.com/MODApis/Api/v2/Quote/jsonp?symbol=${symbol}&jsoncallback=JSON_CALLBACK`)
      .then(function(res){
        if(res.data.Message){
          swal("Invalid Symbol", `No stock matches the symbol: ${symbol}`, "error");
        }
        else{
          thisService.list.push(res.data);
          thisService.symbols.push(symbol);
          $state.go("list");
        }
      }, function(err) {
        alert("Error. Check console for details.")
        console.error(err);
      });
    }
  }

  this.search = function(searchText) {
    $http.jsonp(`http://dev.markitondemand.com/MODApis/Api/v2/Lookup/jsonp?input=${searchText}&jsoncallback=JSON_CALLBACK`)
    .then(function(res){
      if(res.data.length === 0) swal("No stocks found", `No stock matches the search term: ${searchText}`, "error");
      thisService.searchResults.splice(0, thisService.searchResults.length);
      res.data.forEach(function(curr){ thisService.searchResults.push(curr); });
    },function(err){
      return console.error(err);
    })
  }

});
