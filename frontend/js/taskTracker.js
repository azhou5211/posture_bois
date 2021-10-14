/* global TrelloPowerUp */
/* global getChecklistByName */
/* global parseDate */
/* global formatDate */
/* global sendRequest */

var t = TrelloPowerUp.iframe()
var Promise = TrelloPowerUp.Promise;

//Add listener for submit
window.taskList.addEventListener('submit', function(event){
  // Stop the browser trying to submit the form itself.
  event.preventDefault();
  context = t.getContext();
  var taskList = document.getElementById("taskList")
  
  //Loop through items, gather all promises to join
  var inputs = taskList.getElementsByTagName('input')
  var requestPromises = []
  for(var i = 0; i < inputs.length; i++){
    var taskInput = inputs[i]
    //Update if value is not default
    if(taskInput.value != taskInput.defaultValue && !(taskInput.value == null || taskInput.value == "")){      
      var data = {"checkitemId": taskInput.name, "cardId": context["card"], "newDate":formatDate(taskInput.value)}
      requestPromises.push(sendRequest("POST", "taskDate", context["member"], data))
      // requestPromises.push(sendRequest("POST", "taskDate", data))
    }
  }
  
  //Execute promises
  Promise.all(requestPromises).then(function(){
    t.closePopup();
  })
});



//Set default values
getChecklistByName(t, "Turn Tasks").then(function(cl){
    var taskList = document.getElementById("taskList")
    console.log(cl)

  
    //Add new ones based on checklist
    for(var i in cl["checkItems"]){
      var item = cl["checkItems"][i]

      if(item["state"] == "incomplete"){
        var tup = item["name"].split("-")

        
        var label = document.createElement("label")
        var input = document.createElement("input")        
        input.type = "date"
        input.name = item["id"]
        
        //Set date to current recorded date if available, and set default to detect future changes
        if(tup.length > 1){
          var newDate = parseDate(tup[1])   
          input.valueAsDate = newDate
          input.defaultValue  = input.value
        } 
        label.htmlFor = item["id"]
        label.innerHTML = tup[0]
        
        //Add elemenets
        taskList.insertBefore(label, document.getElementById("finalBreak"))
        taskList.insertBefore(input, document.getElementById("finalBreak"))
      }
    }
  
  //Add the button
  //taskList.appendChild(document.createElement("br"))
  //var button = document.createElement("Button")
  //button.type = "submit"
  //button.class = "mod-primary"
  //button.innerHTML = "Update"
  //taskList.appendChild(button)
  

}).then(function(){ //REsize once done
  t.sizeTo(document.body).done()
})


