(function(){
	angular
		.module("WebAppMaker")
		.controller("AdminPassCtrl", adminPassCtrl);
	
	function adminPassCtrl($http,$location){
		
		vm = this;
		vm.getPasswords = getPasswords;
		vm.showExperiment = showExperiment;
		vm.deleteExperiment=deleteExperiment;
		vm.activeExperiment = -1;
		vm.experiments = [];
		vm.logout = logout;
		
		function getPasswords(){
			$http({url:'/retrievePasswords',
			       method:"GET"}).
			success(function(response){
				console.log(response);
				vm.experiments = response;
			}).
			error(function(){});
		}
		
		function showExperiment(index){
			console.log('sight beyond sight!');
			vm.activeExperiment = index;
		}
		
		function deleteExperiment(item){
			
			var index = vm.experiments.indexOf(item);
			var exp = item.expID;
			vm.experiments.splice(index, 1);   
			
			$http({ url:'/deleteExperiment',
			        method:"POST",
			        data:{name:exp}}).
			success(function(){}).
			error(function(){});
		}
		
		function logout(){
			$http.post('/logout')
			.success(function(){
				$location.url('/login');
			});
		}
		
	}
		
})();