/* global TrelloPowerUp */
/* global getChecklistByName */
/* global parseDate */
/* global formatDate */
/* global sendRequest */

var t = TrelloPowerUp.iframe()
var Promise = TrelloPowerUp.Promise;

//Function to open card


//Add event to update
function updateTasks(date){
	boardId = t.getContext()["board"]

	//Clear list
	window.taskList.innerHTML = ""

	//Add event listener
	window.taskList.addEventListener("click", function(e){
		if(e.target && e.target.hasAttribute("unitId")){
			t.showCard(e.target.getAttribute("unitId"))
		}
	})

	return sendRequest("GET", "dailyTasks/" + boardId, {"date": date}).then(function(taskString){
		var tasks = JSON.parse(taskString);
	    for(var i = 0; i < tasks.length; i++){
	      console.log(tasks[i]);
	      var task = document.createElement('li');
	      task.innerHTML = 'Unit ' + tasks[i]["unitName"] + ': ' + tasks[i]["name"];
	      if(tasks[i]["complete"]){
	      	task.innerHTML = "<s>" + task.innerHTML + "</s>"
	      }
	      task.setAttribute("unitId",tasks[i]["unitId"]);
	      window.taskList.appendChild(task);
	    }
  	})
}

//Add listener for submit
window.dateInput.addEventListener('blur', function(event){
  // Stop the browser trying to submit the form itself.
  event.preventDefault();
  updateTasks(formatDate(dateInput.value));
})


//Default to today
dateInput.valueAsDate = new Date()
updateTasks(dateToStr(new Date()))
