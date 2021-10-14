/* global TrelloPowerUp */
/* global getTaskGrid */
/* global getChecklistByName */

var t = TrelloPowerUp.iframe()
var Promise = TrelloPowerUp.Promise; 
  
//create table with tasks as columns-------------------------------------------------------------------------------------------------------------------------------
  
  
  
//function that changes undefined values to empty strings (for table/grid value display purposes)
function evaluateUndefined(val){
      if(val == null) {
            return "";
      }
      else {
            return val;
      }
}
//function that changes the format of the date strings
//Edit note: Removed year from dates, should be obvious which year
function formatDate(date){
      var formattedDate = date.substr(0,11);
      return formattedDate;
}


//Return a table populated with the provided data
//TODO: Make generic so we can use for any table layout
function populateTable(data){
  var table = document.createElement("table");
  table.id = "mainTable"

  //write data to table
  for (var i = 0; i < data.length; i++) {
        var currentRow = table.insertRow(i);

        for(var j = 0; j < data[i].length; j++){
              var currentCell = currentRow.insertCell(j);

              if(i == 0){
                    currentCell.innerHTML = evaluateUndefined(data[i][j]);
              }
              else if (j == 0) {
                    currentCell.innerHTML = evaluateUndefined(data[i][j]);
                    currentCell.classList.add("unit-label");
              }
              else {
                    currentCell.innerHTML = evaluateUndefined(data[i][j]["date"]);
                    if(currentCell.innerHTML != ""){
                        //format date to display
                        currentCell.innerHTML = formatDate(data[i][j]["date"]);
                        //determine background color
                        if(data[i][j]["complete"] === true){
                           currentCell.classList.add('table-item-complete');
                        }
                        else if(data[i][j]["overdue"] === true){
                           currentCell.classList.add('table-item-overdue');
                        }
                    }
                    else{
                      currentCell.innerHTML = evaluateUndefined(data[i][j])
                    }
              }
        }
  }
  
  return table
}
//----------------------------------------------------------------------------------------------------------------------------------------------------------------















//create table with dates as columns-------------------------------------------------------------------------------------------------------------------------------

/*
      IMPORTANT: Please note the formatting for this section is not complete. It displays correct data but still needs to be updated to look as desired as well as the code still needs to be made more readable
*/

 
//This function associates the dates with the tasks returning an array of objects that include each individual task with the associated date
//DEPREC: Original data now includes task and unit
function associateData(origData){

    var newArray = [];
    for (var i = 1; i < origData.length; i++) {
     for(var j = 1; j < origData[i].length; j++){
       if(origData[i][j].date){
         origData[i][j].task = origData[0][j];
         origData[i][j].unit = origData[i][0];
         newArray.push(origData[i][j]);
       }
     }
    }
    console.log(newArray);
    return newArray;

}

//this function takes a list of dates and returns the list of date in ascending order as well as having removed duplicates
function createMasterDates(dates){
    //get rid of duplicate dates
    var datesMasterList = [];
    var uniqueDates = [];
    for (var i = 0; i < dates.length; i++) {
        if(!datesMasterList.includes(dates[i])){
            uniqueDates.push(dates[i]);
            datesMasterList.push(dates[i]);
        }
    }

   //sort the dates ascending
   for (var i = 0; i < uniqueDates.length; i++) {
       uniqueDates[i] = {
          textDate: uniqueDates[i],
          numericDate: Date.parse(uniqueDates[i])
       }
   }
   uniqueDates.sort(function(a, b){return a.numericDate - b.numericDate});   
   for (var i = 0; i < uniqueDates.length; i++) {
       uniqueDates[i] = uniqueDates[i].textDate;
   }            
   return uniqueDates;
}



//Takes in data, switches it to have columns as dates
//TODO: Break into smaller functions; integrate with generic version of populateTable
function switchToDates(data){
      //associate dates with tasks in the data set
      //var newData = associateData(data);    
      var newData = data
  
     //grab dates from data to use and make them unique and in order
      var dates = [];
      for (var i = 0; i < newData.length; i++) {
        dates.push(newData[i].date);
      }
      var datesMaster = createMasterDates(dates);

      //create an array where each item in the array is an array with the date and associated tasks/units
      var all = [];
      for(var i = 0; i < datesMaster.length; i++){
          all.push([datesMaster[i]]);

          for(var j = 0; j < newData.length; j++){
              if(datesMaster[i] == newData[j].date){
                all[i].push([newData[j].unit,newData[j].task]);
              }
          }
      }

      //format array
      for (var i = 0; i < all.length; i++) {
          for(var j = 1; j < all[i].length; j++) {
              if(all[i][j].length > 1) {
                  all[i][j] = all[i][j].join('; ')
              }
          }
      }

      //Add button for adding more dates
      var buttonContainer = document.getElementById("button-container");
      var addMoreBtn = document.createElement("button");
      addMoreBtn.innerHTML = "Add 7 More Dates...";
      addMoreBtn.classList.add("date-item-button");
      addMoreBtn.addEventListener("click", function() {addMoreDateItems(7)});
      buttonContainer.appendChild(addMoreBtn)
}


//Add numItems more dates to the container
function writeDateItems(container, numItems, all) {
      for(var i = 0; i < numItems; i++){
              var currentDateObject = document.createElement("div");
              container.appendChild(currentDateObject);
              currentDateObject.classList.add('dateItem');
          for(var j = 0; j < all[i].length; j++){
              if(j == 0){
                  currentDateObject.innerHTML = currentDateObject.innerHTML + "<p class='date-title'>" + all[i][j] + "</p>";
              }
              else {
                  currentDateObject.innerHTML = currentDateObject.innerHTML + "<p>" + all[i][j] + "</p>";
              }
          }




      }
        //newDiv = document.createElement("div");
        //container.appendChild(newDiv);
        //newDiv.classList.add("dateItem");
        //newDiv.appendChild(addMoreBtn);
        //addMoreBtn.classList.add("date-item-button");
        //addMoreBtn.innerHTML= "Click to See 7 More Dates...";
}


      writeDateItems(7);


function addMoreDateItems(increment, all, container, numDateItems) {
  if (increment >= all.length) {
    increment = all.length - numDateItems;
    container.innerHTML = "";
    writeDateItems(numDateItems + increment);
    //addMoreBtn.disabled = true;
    //addMoreBtn.innerHTML = "No more dates/tasks to view. You are viewing all Dates with scheduled tasks.";
    return;
  }
  else {
    console.log("smaller");
    container.innerHTML = "";
    writeDateItems(increment);
    return;
  }
}

      
        
//-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  
  
  
  
  
  
  
  
  
  
  
  
  
  
  
//----------------------------------------------------------------------------------------

//-------------------------------------------Main---------------------------------------------------
var gridPromise = getTaskGrid(t)

gridPromise.then(function(grid){
  var tableContainer = document.getElementById('table-container')
  tableContainer.appendChild(populateTable(grid))
})

console.log(gridPromise)