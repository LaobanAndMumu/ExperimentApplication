//var myApp = angular.module("WebAppMaker", []);

(function(){
	angular
		.module("WebAppMaker")
		.directive('fileModel', fileModel)
		.service('fileUpload', fileUpload)
		.controller("AdminCtrl",AdminCtrl);
		//.controller('myCtrl', myCtrl);
		
		function fileModel($parse){
			return {
				restrict: 'A',
				link: function(scope, element, attrs) {
					var model = $parse(attrs.fileModel);
					var modelSetter = model.assign;
					
					element.bind('change', function(){
						scope.$apply(function(){
							modelSetter(scope, element[0].files[0]);
						});
					});
				}
			};
		}	
		
		function fileUpload($http){
			this.uploadFileToUrl = function(file, uploadUrl, uploads){
				var fd = new FormData();
				fd.append('file', file);
				$http.post(uploadUrl, fd, {
					transformRequest: angular.identity,
					headers: {'Content-Type': undefined}
				})
				.success(function(){
					//uploads.push("./fileUpload/"+file.name);
				})
				.error(function(){
				});
				
			}
		}
		
		function AdminCtrl($scope,$http,$location,fileUpload){
			$scope.questions=[];
			$scope.description='';
			$scope.options=[];
			$scope.option='';
			$scope.hiddenQuestion=true;
			$scope.hiddenOption=true;
			$scope.picture;
			$scope.filename = '';
			var vm = this;
			
			
			
			vm.error = "Administration."
			
			vm.insert = insert;
			
			vm.logout = logout;
			
			vm.uploadFile = uploadFile;
			
			$scope.addQuestion=function(){
				
				$scope.questions.push({
										file:$scope.filename,
									   description:$scope.description,
									   options:$scope.options});
				$scope.filename = '';
				$scope.description='';
				$scope.options=[];
			
			};
			
			$scope.addOption=function(){
				$scope.options.push($scope.option);
				$scope.option='';
				
			};
			
			$scope.showQuestion=function(){
				$scope.hiddenQuestion=!$scope.hiddenQuestion;
			};
			
			$scope.showOption=function(){
				$scope.hiddenOption=!$scope.hiddenOption;
			};
			
			$scope.removeQuestion = function(item) { 
			  var index = $scope.questions.indexOf(item);
			  $scope.questions.splice(index, 1);     
			};
			
			$scope.submitExperiment = function(){
				
				possible = makePassword();
				
				if(!checkPass(possible)){
					possible = makePassword();
				}
				if(!checkPass(possible)){
					possible = makePassword();
				}
				if(!checkPass(possible)){
					possible = makePassword();
				}

				
				console.log('new password');
				$http({url:'/finalize',
						method:"POST",
						data:{password:possible,
						      questions:$scope.questions}})
				.success(function(){
					console.log('entered!');
					
				});
				$location.url('/adminMenu');
			};
			
			function checkPass( possible ){
				var bool = false;
				console.log('Client checkPass');
				$http({url:'/checkPass',
				       method:"POST",
					   data:{possibility:possible}}).
				success(function(response){
					console.log('The truth: ' + response);
					bool =  response;
				});
				return bool;
			}
			
			function makePassword(){
				pass = '';
				alphaNum = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
				for( var i = 0; i < 8; i++){
					pass += alphaNum.charAt(Math.floor(Math.random()*alphaNum.length));
				}
				return pass;
			}
			
			function insert(index){	
				$scope.questions.splice(index,0,{
					                   file:$scope.filename,
									   description:$scope.description,
									   options:$scope.options});
				$scope.filename = '';
				$scope.description='';
				$scope.options=[];
			
			}
			
			function logout(){
				$http.post('/logout')
				.success(function(){
					$location.url('/login');
				});
			}
			
			function uploadFile(){
				console.log("Attempting...");
				var file = $scope.myFile;
				console.log('file is ' );
				console.dir(file);
				var uploadUrl = "/upload";
				
				fileUpload.uploadFileToUrl(file, uploadUrl, $scope.uploads);
				$scope.filename = file.name;								
			};
		}
})();