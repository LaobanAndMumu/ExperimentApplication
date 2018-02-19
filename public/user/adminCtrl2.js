(function(){
	angular
		.module("WebAppMaker")
		.controller("AdminCtrl", adminCtrl);
		
	function adminCtrl($http,$rootScope,$location) {
		var vm = this;
		
		vm.error = "Administration."
		
		vm.logout = logout;
		
		function logout(){
			$http.post('/logout')
			.success(function(){
				$location.url('/login');
			});
		}
		
		
	}
		
})();