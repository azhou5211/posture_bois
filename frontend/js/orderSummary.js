/* sendRequest */

//Add listener for submit
document.getElementById('downloadButton').onclick = function(){
  //Download by open window
  var pName = document.getElementById("propertyName").value
  window.open("orderSummary/" + pName)
};

document.getElementById('downloadAllButton').onclick = function(){
  window.open("orderSummary/All")
}

//Defaults
// var prom = sendRequest("GET", "propertyList").then(function(pList){
//   pList = JSON.parse(pList)
//   var pSelect = document.getElementById("propertyName")
//   for(var i in pList){
//     var option = document.createElement("option");     
//     option.value = pList[i];
//     option.innerHTML = pList[i];
//     pSelect.appendChild(option)
//   }
// })

// console.log(prom)



