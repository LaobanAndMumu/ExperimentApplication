(function(){
	angular
		.module("WebAppMaker")
		.config(configuration);
		
		function configuration($routeProvider,$sceDelegateProvider){
			$routeProvider
				.when("/login",{
					templateUrl: "/user/login.html",
					controller: "LoginCtrl",
					controllerAs: "model"
				})
				.when("/profile",{
					templateUrl: "/user/profile.html",
					controller: "ProfileCtrl",
					controllerAs: "model",	
					resolve:{
						logincheck: checkLoggedin
					}
				})
				.when("/experiment",{
					templateUrl:"/user/experiment.html",
					controller: "ExperimentCtrl",
					controllerAs: "model",
					resolve:{
						logincheck: checkLoggedin
					}
				})
				.when("/admin",{
					templateUrl:"/user/admin.html",
					controller: "AdminCtrl",
					controllerAs: "model",
					resolve:{
						adminUser: checkAdmin
					}
				})
				.when("/adminMenu",{
					templateUrl:"/user/adminMenu.html",
					controller: "AdminMenuCtrl",
					controllerAs: "model",
					resolve:{
						adminUser: checkAdmin
					}
				})
				.when("/adminProfile",{
					templateUrl:"/user/adminProfile.html",
					controller: "AdminProfileCtrl",
					controllerAs: "model",
					resolve:{
						adminUser: checkAdmin
					}
				})
				.when("/adminPasswords",{
					templateUrl:"/user/adminPasswords.html",
					controller: "AdminPassCtrl",
					controllerAs: "model",
					resolve:{
						adminUser: checkAdmin
					}
				})
				.when("/adminData",{
					templateUrl:"/user/adminData.html",
					controller: "AdminDataCtrl",
					controllerAs: "model",
					resolve:{
						adminUser: checkAdmin
					}
				});
			$sceDelegateProvider.resourceUrlWhitelist([
				'self',
				'https://s3.amazonaws.com/esa-experiment-images/**'
			  ]);
		}
		
		var checkAdmin = function($q, $timeout, $http, $location, $rootScope){
			var deferred = $q.defer();
			
			$http.get('/isAdmin').success(function(user){
				$rootScope.errorMessage = null;
				if(user !== '0'){
					$rootScope.currentUser =  user;
					deferred.resolve();
				}
				else{
					$rootScope.errorMessage = "Nope!";
					deferred.reject();
					$location.url('/profile');
				}
			});
			return deferred.promise;
		};
		
		
		var checkLoggedin = function($q, $timeout, $http, $location, $rootScope){
			var deferred = $q.defer();
			
			$http.get('/loggedin').success(function(user){
				$rootScope.errorMessage = null;
				if(user !== '0'){
					$rootScope.currentUser =  user;
					deferred.resolve();
				}
				else{
					$rootScope.errorMessage = "Nope!";
					deferred.reject();
					$location.url('/login');
				}
			});
			return deferred.promise;
		};
		
		
		
})();