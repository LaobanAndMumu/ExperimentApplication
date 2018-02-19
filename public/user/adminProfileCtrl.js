(function(){
	angular
		.module("WebAppMaker")
		.controller("AdminProfileCtrl", adminProfileCtrl);
	
	function adminProfileCtrl($http,$location){
		
		vm = this;
		vm.inFile = [];
		vm.additions = [];
		vm.init = init;
		vm.update = update;
		vm.removeFromFile = removeFromFile;
		vm.removeAddition = removeAddition;
		vm.logout = logout;
		
		function init(){
			console.log('Trying to init');
			$http.get('/getProfileInfo').
			success(function(response){
				console.log("What we have: " + response);
				vm.inFile = response;
			}).
			error(function(){});
		}
		
		function update(){
			console.log("Updating...");
			$http({ url:'/setProfileInfo',
					method:"POST",
			        data:{ edits:vm.inFile.concat(vm.additions)}}).
			success(function(response){
				console.log("Rerouting");
				$location.url('/adminMenu');
			}).
			error(function(){});
		};
		
		function removeFromFile(item) { 
		  var index = vm.inFile.indexOf(item);
		  vm.inFile.splice(index, 1);     
		};
		
		function removeAddition(index) { 
		  vm.additions.splice(index, 1);     
		};
		
		
		function logout(){
			$http.post('/logout')
			.success(function(){
				$location.url('/login');
			});
		}
		
		
	}
		
})();