(function(){
	angular
		.module("WebAppMaker")
		.controller("AdminMenuCtrl", adminMenuCtrl);
	
	function adminMenuCtrl($http,$location){
		
		vm = this;
		vm.downloadUrl = "";
		vm.seeData = seeData;
		vm.newExperiment = newExperiment;
		vm.editProfile = editProfile;
		vm.viewExperiments = viewExperiments;
		vm.logout = logout;
		
		function seeData(){
			$location.url('/adminData');
		}
		
		function newExperiment(){
			$location.url('/admin');
		}
		
		function editProfile(){
			$location.url('/adminProfile');
		}
		
		function viewExperiments(){
			$location.url('/adminPasswords');
		}
		
		function logout(){
			$http.post('/logout')
			.success(function(){
				$location.url('/login');
			});
		}
	}
		
})();