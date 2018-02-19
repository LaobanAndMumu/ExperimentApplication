(function(){
	angular
		.module("WebAppMaker")
		.controller("ProfileCtrl",profileCtrl);
		
	function profileCtrl($rootScope,$http,$location){
	
		var vm = this;
		
		vm.name = "";
		vm.age;
		vm.gender = "";
		vm.answers=[];
		vm.addToUser = addToUser;
		vm.check = check;
		vm.init=init;
		vm.inFile=[];
		
		function init(){
			console.log('Trying to init');
			$http.get('/getProfileInfo').
			success(function(response){
				console.log("What we have: " + response);
				vm.inFile = response;
			}).
			error(function(){});
		}
		
		function check(){
			if (!vm.name){
				vm.nameError = "Please enter a name.";
			}
			if (!vm.age){
				vm.ageError = "Please enter an age.";
			}
			if(!vm.gender){
				vm.genderError = "Please enter a gender.";
			}
			
			for( ans in vm.answers ){
				if(!vm.answers[ans]){
					vm.generalError = "Please fill out all fields.";
					return false;
				}
			}
			
			if( vm.name && vm.age && vm.gender ){
				return true;
			}
			return false;
		}
		
		function addToUser(){	
			if( vm.check() ){
				$http({ url: '/addPersonal', 
						method: 'POST',
						data:{name:vm.name,
							  age:vm.age,
							  gender:vm.gender,
							  personal: vm.inFile,
							  answers:vm.answers}})
				.success(function(response){ 
					console.log(response);
					if(response){
						$rootScope.currentUser = response;
						$location.url('/experiment');
					}
					else{
						vm.error = "Please choose a different user name.";
						console.log('error');
					}
				});
			}
		}
	}

})();