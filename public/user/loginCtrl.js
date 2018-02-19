(function(){
	angular
		.module("WebAppMaker")
		.controller("LoginCtrl", loginCtrl);
		
	function loginCtrl($http,$rootScope,$location) {
		var vm = this;
		
		vm.login = login;
		
		function login(user){
			user.username = "dummy";
			$http.post('/login',user)
			.success( function(response){
				$rootScope.currentUser = response;
				console.log(response);
				if( response.roles[0] == 'admin' ){
					$location.url('/adminMenu');
				}
				else{
					$location.url('/profile');
				}
			})
			.error(function(response){
				vm.error = 'Not a valid password';
			});
		}
	}
		
})();