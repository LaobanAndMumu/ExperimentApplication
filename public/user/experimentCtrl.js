(function(){
	angular
		.module("WebAppMaker")
		.controller("ExperimentCtrl", experimentCtrl);

	function experimentCtrl($rootScope,$http,$location, $sce){
		var vm=this;
		vm.getQ = getQ;
		vm.nextQ = nextQ;
		vm.postToMongo = postToMongo;
		vm.showButton=showButton;
		vm.hideButton=hideButton;
		vm.logout = logout;
		vm.checkExtension = checkExtension;
		vm.activeQuestion=-1;
		vm.startTime = 0;
		vm.times = [];
		vm.answer = "";
		vm.answers = [];
		
		
		vm.fileName;
		vm.video=[];
		vm.src=[];
		vm.update=update;
		vm.getIframeSrc=getIframeSrc;
		
		function update(){
			vm.video.push({name:vm.fileName});
			vm.src=vm.fileName;
			vm.fileName='';
		}

		function getIframeSrc(index) {
			console.log('https://s3.amazonaws.com/esa-experiment-images/' + vm.src[index]);
		  return 'https://s3.amazonaws.com/esa-experiment-images/' + vm.src[index];
		};
		
		
		
		
		
		vm.isImage = false;
		vm.isVideo = false;
		vm.fileExtensions = ['tif', 'tiff', 'gif', 'jpeg', 'jpg',
		                     'jif', 'jfif', 'jp2', 'jpx', 'j2k', 
							 'j2c', 'fpx', 'pcd', 'png', 'pdf'];
		vm.config = { width: 650,
					  height: 360,
					  autoHide: false,
					  autoPlay: true,
					  responsive: true,
					  sources:[],
					  theme:{url: "http://www.videogular.com/styles/themes/default/latest/videogular.css"}};
		
		function getQ(user){
			$http.get('/getQuestion',user)
				.success( function(response){
					vm.questions=response[0].questions;
					console.log(vm.questions);
				})
				.error(function(response){		
				});
		}
		
		function nextQ(user){
			
			if(vm.startTime && !vm.answer){
				vm.error = "Please enter an answer.";
			}
			else{
				var datetime = new Date();
				var endTime = datetime.getTime();
				if( vm.startTime ){
					vm.times.push(endTime - vm.startTime);
					vm.answers.push(vm.answer);
					vm.answer = "";
					console.log(vm.answers);
				}
				vm.startTime = endTime;
				vm.activeQuestion = vm.activeQuestion + 1;
				
				
				if( vm.activeQuestion == vm.questions.length ){
					vm.postToMongo(user);
					vm.logout();
					$location.url('/login');
					alert('Thank you for participating!');
				}
				else{
					console.log(vm.questions[vm.activeQuestion].file);
					//vm.src = vm.questions[vm.activeQuestion].file;
					vm.checkExtension(vm.questions[vm.activeQuestion].file);
				}
				console.log(vm.times);
			}
			
			
		}
		
		function postToMongo(user){
			$http({url:'/resultsUpload',
				   method:"POST",
				   data:{ questions: vm.questions, 
                          answers: vm.answers,
			              times: vm.times}}).
			success(function(){}).
			
			error(function(){});
		}
		
		function checkExtension(fileName){
			var tokens = fileName.split('.');
			var extension = tokens[tokens.length-1];
			
						console.log(extension);

			for( ext in vm.fileExtensions ){
				if( extension == vm.fileExtensions[ext] ){
					console.log('matched');
					vm.isImage = true;
					vm.isVideo = false;
					vm.src.push("");
					vm.config.sources = [];
					console.log(vm.isImage);
                   
					return
				}
			}
			vm.isVideo = true;
			vm.isImage = false;
			//var path = "/user/fileUpload/" + fileName;
			var url = 'https://s3.amazonaws.com/esa-experiment-images/';
			vm.src.push(vm.questions[vm.activeQuestion].file);
            //yvm.src = vm.questions[vm.activeQuestion].file;
			//vm.config.sources = [{src:url+fileName,type:"video/mp4"}];
			console.log("Source: " + vm.src);
			console.log(vm.isImage);

			
		}
		
		function showButton(){
			getElementById("continue").style.visibility = 'visible';
		}
		function hideButton(){
			console.log("You shall not see the things I have done!");
			getElementById("continue").style.visibility = 'hidden';
		}
		
		function logout(){
				$http.post('/logout')
				.success(function(){
					$location.url('/login');
				});
			}
		
		
	}//end experimentCtrl
})();