var myApp = angular.module("WebAppMaker", []);

myApp.directive('fileModel', ['$parse', function ($parse) {
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
}]);

myApp.service('fileUpload', ['$http', function ($http) {
	
	
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
	

}]);

myApp.controller('myCtrl', ['$scope','fileUpload', function($scope,fileUpload){
   // $scope.uploads=[];
	//$scope.waiting = true;
	
	$scope.filename='';
	
    $scope.uploadFile = function(){
        var file = $scope.myFile;
        console.log('file is ' );
        console.dir(file);
        var uploadUrl = "/upload";
        
		fileUpload.uploadFileToUrl(file, uploadUrl, $scope.uploads);
		$scope.$parent.filename = file.name;	
		//$scope.uploads.push(file.name);
					
    };
}]);
	
	
myApp.controller("AdminCtrl",['$scope','$http','$location', function($scope,$http,$location) {

		$scope.questions=[];
		$scope.description='';
		$scope.options=[];
		$scope.option='';
		$scope.hiddenQuestion=true;
		$scope.hiddenOption=true;
		$scope.picture;
		$scope.filename = '';
		
		$scope.addQuestion=function(){
			
			$scope.questions.push({file:$scope.filename,
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
			$http({url:'/finalize',
			        method:"POST",
			        data:{questions:$scope.questions}})
			.success(function(){});
		};
		
		var vm = this;
		
		vm.error = "Administration."
		
		vm.logout = logout;
		
		function logout(){
			$http.post('/logout')
			.success(function(){
				$location.url('/login');
			});
		}
}]);
 


