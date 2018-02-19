(function(){
	angular
		.module("WebAppMaker")
		.controller("AdminDataCtrl", adminDataCtrl);
	
	function adminDataCtrl($http,$location){
		
		vm = this;
		vm.getPasswords = getPasswords;
		vm.getData = getData;
		vm.experiments = [];
		vm.links=[];
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
		
		function getData( name ){
			$http({url:'/retrieveData',
			       method:"GET",
				   params:{'name':name}}).
			success(function(response){
				content = response;
				console.log(content);
			data = new Blob(["{" + content + "}"],{type:"text/plain;charset=utf-8"});
			saveAs(data,name+'.json');
			}).
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