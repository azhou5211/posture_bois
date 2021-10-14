var Promise = TrelloPowerUp.Promise;

function makeUnitNotReady(t){
  //Send request to make unit not ready
  context = t.getContext();
  var data = {"cardId":context["card"], "boardId":context["board"]}
  return sendRequest("POST", "makeUnitNotReady", context["member"], data).then(function(){
    t.showCard(t.getContext()["card"])
  })
}

function orderKit(t, kitDetails){
  context = t.getContext();
  kitDetails.cardId = context["card"];
  kitDetails.boardId = context["board"];
  return sendRequest("POST", "orderKit", context["member"], kitDetails)
}


function confirmKitDelivery(t, kitComplete=true, note=""){
  console.log("Confirming")
  //Get date
  var today = dateToStr(new Date())

  //Record delivery
  return t.member('all').then(function(member){  
    kitDetails = {kitReceivedDate: today, kitStatus: "Delivered", kitReceiver: member.fullName, kitComplete: kitComplete, kitReceivedNotes:note};
    return kitDetails;
  }).then(function(kitDetails){
    console.log("Details set", kitDetails);
    return t.set('card', 'shared', kitDetails); 
  }).then(function(){
    t.closePopup(); 
  })
}

function alertIncompleteKit(t, note=""){
  context = t.getContext();
  details = {
      "cardId" : context["card"],
      "boardId": context["board"],
      "note": note
    }
  return Promise.all([confirmKitDelivery(t, false, note), sendRequest("POST", "incompleteKit", context["member"], details)])
}

/////////////////////ADVANCED GETS///////////////////////////////////////////

function getGanttChartUrl(t){
  return t.card('id').then(function(){return "https://plot.ly/~BPM_Automation/0/utext-ugantt-chart/#/"})
}

function getEstimatedCompletionDate(t){
  return getChecklistByName(t, "Turn Tasks").then(function(cl){
    var lastItem = cl["checkItems"][cl["checkItems"].length - 1]
    var newDate =  parseDate(lastItem["name"].split("-")[1])
    return newDate
  })
  
}

function getVacantDate(card){
    //Regex to find move-out date
    var patt = /\nMove-Out Date[^\n]*\n/
    var line = patt.exec(card["desc"])[0]
    var strDate = line.split(":")[1]
    
    //Parse date
    var targetDate = parseDate(strDate)
    targetDate.setDate(targetDate.getDate())
    
    return targetDate
  
}

function getTaskGrid(t){
  context = t.getContext();
  return sendRequest("GET", "taskGrid/" + context["board"], context["member"]).then(function(response){
    return JSON.parse(response)
  }) 
}
////////////////////BASIC SETS//////////////////////////////////////////////

function moveToList(t, listName){
    var listId = getListId(t, listName);
    context = t.getContext();
    var cardId = context["card"];
    listId.then(function(listId){   
      var url = "https://api.trello.com/1/cards/" + cardId
      var data = {"idList":listId}
      sendRequest("PUT",url,data=data)
    })
} 

  
////////////////////BASIC GETS//////////////////////////////////////////////  
  
function getListId(t, listName, returnFunc){
  return t.lists('all').then(function(lists){
      var myList = lists.find(function(l){return l["name"] == listName})
      return myList["id"]
  })
}

function getCardFromContext(t){
  context = t.getCOntext();
  cardId = context["card"];
  return sendRequest("GET", "card/" + cardId, context["member"]).then(function(response){
    return JSON.parse(response)
  })
}



function getChecklistByName(t, checklistName){
  context = t.getContext();
  return sendRequest("GET", "checklist", context["member"], {"name":checklistName, "cardId":context["card"], "boardId": context["board"]}).then(function(response){
    return JSON.parse(response)
  })
                               
}

function getAmenities(t){
  context = t.getContext();
  return Promise.all([t.board('id'), t.card('name')]).then(function([board, card]){
      bId = board["id"]
      cName = card["name"]
      return sendRequest("GET", "amenities", context["member"], {"boardId":bId, "cardName":cName})
  }).then(function(response){
    return JSON.parse(response)
  })                            
}


/////////HELPER FUNCTIONS///////////////////////////
function parseDate(dateStr){
  if(dateStr == "dd-mm-yyyy" || dateStr == null || dateStr == ''){
   return null 
  }

  var tup = dateStr.split(/[//-]+/)
  var dt = new Date()

  dt.setMonth(parseInt(tup[0]) - 1)
  dt.setDate(parseInt(tup[1]))
  
  if(tup.length > 2){
    var year = parseInt(tup[2])
    if(year < 100){year = year + 2000}             
    dt.setFullYear(year)
  }

  return dt
}

function parseDateFromHTML(dateStr){
  if(dateStr == "dd-mm-yyyy" || dateStr == null || dateStr == ''){
   return null 
  }

  var tup = dateStr.split("-")
  var dt = new Date(parseInt(tup[0]),parseInt(tup[1]) - 1, parseInt(tup[2]))

  return dt
}

function formatDate(dateStr){
  var dt = parseDateFromHTML(dateStr)
  return dateToStr(dt)
}

function dateToStr(dt){
  if(dt == "dd-mm-yyyy" || dt == null || dt == ''){
    return ""
  }
  return (dt.getMonth() + 1) + '/' + dt.getDate() + '/' + (-100 + dt.getYear())
} 
  

/////////////////////HTTP REQUESTS//////////////////////////////////////////////
function sendRequest(method, command, userId = null, args = {}, data = {}){
   return new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    
    //add data to url
    var base = window.location.origin;
    var url = base + "/" + command
    if(userId != null){
      url = url + '?userId=' + userId + "&"
    }
    for (var key in args) {
      if (args.hasOwnProperty(key)) {
          url = url + key + "=" + args[key] + "&"
      }
    }
    // url = url.slice(0,-1)


    xhr.open(method, url); 
     
    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      }
    };
    xhr.onerror = function () {
      console.log("Rejected url", url)
      console.log("Reason", xhr.statusText)
      reject(
        { 
        status: this.status,
        statusText: xhr.statusText        
      });
    };

    if(data != {}){
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.send(JSON.stringify(data));
    }
    else{
      xhr.send();
    }
   })
}