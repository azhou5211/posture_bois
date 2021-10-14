/* global TrelloPowerUp */
/* global maintenanceInspectionButton */
/* global kitOrderButton */
/* global editKitOrderButton */
/* global taskTrackerButton */
/* global taskGridButton */
/* global getTargetCompletionDate */
/* global getGanttChartUrl */

var Promise = TrelloPowerUp.Promise;
var GREY_TRUCK_ICON = window.location.origin + '/assets/Grey%20Truck.png'
var typeLabels = "Full;Partial;Light;Rented" 

TrelloPowerUp.initialize({
  //Board BUuttons
  'board-buttons': function(t){
    return sendRequest("GET", "user/" + t.getContext()["member"] + "/permissions").then(function(permissions){
      buttonList = [dailyTasksButton,weeklyTasksButton,taskGridButton];
      if(permissions.includes("View Reports")){
        buttonList.push(reportsButton);
      }
      return buttonList;
    })
  },
  
  // Buttons
  'card-buttons': function(t, options) {
    return Promise.all([t.card('all'), sendRequest("GET", "user/" + t.getContext()["member"] + "/permissions")])
      .then(function([card, permissions]){
        permissions = JSON.parse(permissions);

        var buttonList = [
          //Order/confirm kit
          Promise.all([t.get('card','shared','kit', "None"), t.get('card','shared','kitStatus'), t.list('all')]).then(function([kitOrder, kitStatus, list]){
              var existingUpgrade = "None"
              for(var i = 0; i < card["labels"].length; i++){
                if(typeLabels.includes(card["labels"][i]["name"])){
                   existingUpgrade = card["labels"][i]["name"];
                   break;
                }
              }
              if((kitOrder =="None" || kitOrder == null) && existingUpgrade == "None" && permissions.includes("Order Kits") && list["name"] != "Moved In"){
                return kitOrderButton
              }
              else if(kitOrder !== "None" && kitStatus !== "Delivered" && permissions.includes("Mark Kits Received")){
                  return confirmKitDeliveryButton
              }
          }),
          
          //Edit kit
          ((permissions.includes("Edit Kit Orders")) ? editKitOrderButton : {}),

          //Resolve kit
          Promise.all([t.get('card','shared','kit',"None"), t.member('all')]).then(function([kitOrder, member]){
              if(permissions.includes("Resolve Missing Kits") && kitOrder != "None"){
                return resolveKitOrderButton
              }
          }),
        
          //Maintenance Inspection
          t.list('all').then(function(list){
            if(list["name"] == "Needs Maintenance Inspection" && permissions.includes("Complete Maintenance Inspections")){
              return maintenanceInspectionButton
            }
            else if(list["name"] == "Not Ready" && permissions.includes("Schedule Tasks")){
              return taskTrackerButton
            }
          }),

          //Resurface TRacker
          t.list('all').then(function(list){
            if(["Needs Maintenance Inspection","Not Ready","Ready"].includes(list["name"]) && permissions.includes("Record Resurfacing")){
              return resurfaceTrackerButton
            }
          })
        ]
      
        return Promise.all(buttonList)
      })
  },
  
  //Badges
  'card-badges': function(t, options) {
      
    var nullBadge = {icon: null, text: null }
    
    //kit order badge
    var kitBadge = t.get('card', 'shared')
      .then(function(cardData) {
        var kit = cardData.kit
        if(!kit){ 
          return nullBadge
        }
        return {
          icon: GREY_TRUCK_ICON,
          text: kit.slice(0,1), 
          color: (cardData.kitStatus === "Delivered") ? ((!cardData.kitComplete && !cardData.kitResolvedStatus) ? "orange" : "green") : "yellow"
        }
    })
    
    //Task progress badge
    var taskBadge = t.list('all').then(function(list){
      if(list["name"] != "Not Ready" && list["name"] != "Needs Maintenance Inspection"){ throw new Error("Not in Not Ready list") }
      return t.card('all')
    }).then(function(card){
      var vacantDate = getVacantDate(card)
      var dateDifferential = Math.round((new Date() - vacantDate) / (24 * 60 * 60 * 1000))
      return {
          icon: BLACK_TOOLS_ICON,
          text: Math.abs(dateDifferential) + " days vacant",
          color: dateDifferential < 10 ? "green" : (dateDifferential < 15 ? "orange" : "red")
      } 
    }, function(){ return nullBadge})
    
    
    
    //Return promise
    return Promise.all([kitBadge, taskBadge])
  },
  
  //Detailed Badges
  'card-detail-badges': function(t, options) {
    
    var nullBadge = {title: null, text: null, color: null}
    
    //Kit order badge
    var kitBadge = Promise.all([t.get('card','shared'), t.card('all'), sendRequest("GET", "user/" + t.getContext()["member"] + "/permissions"), t.list('all')])
      .then(function([cardData, card, permissions, list]) {
        var kit = cardData.kit
        var kitDate = cardData.kitOrderDate
        var deliveryDate = cardData.kitDeliveryDate
        var notes = cardData.kitNotes
        var user = cardData.kitUser
        var status = cardData.kitStatus
        if(typeof(status) === "undefined"){status = "Ordered"}
        var receivedDate = cardData.kitReceivedDate
        var receivedDateOverride = cardData.kitReceivedDateOverride
        var receivedBy = cardData.kitReceiver
        displayItems = [
                {text: "Type: " + kit},
                {text: "Ordered On: " + kitDate},
                {text: "Delivery On: " + deliveryDate},
                {text: "Notes: " + notes},
                {text: "Ordered By: " + user},
                {text: "Order Status: " + status},
        ]
        if(typeof(receivedDate) !== "undefined"){
          displayItems.push(
                {text: "Recorded Received On: " + receivedDate},
                {text: "Received By: " + receivedBy},
                {text: "Arrived Complete: " + cardData.kitComplete},
          )
        }
        if(typeof(receivedDateOverride) !== "undefined"){
          displayItems.push(
                {text: "Actually Received On: " + receivedDateOverride}
          )
        }
        //Resolution if applicable
        if(!cardData.kitComplete){
          displayItems.push(
            {text: "Resolved: " + cardData.kitResolvedStatus}
          )
          if(cardData.kitResolvedStatus){
            displayItems.push(
              {text: "Resolved On: " + cardData.kitResolvedDate},
              {text: "Resolved By: " + cardData.kitResolvedUser},
              {text: "Resolved Notes: " + cardData.kitResolvedNotes},
            )
          }
        }

        //Block ordering a kit if already upgraded or rented
        var allowOrder = true;
        for(var i = 0; i < card["labels"].length; i++){
          if(typeLabels.includes(card["labels"][i]["name"])){
             allowOrder = false;
             break;
          }
        }
        if(!permissions.includes("Order Kits") || list["name"] == "Moved In"){
          allowOrder = false;
        }
        var cbFunc = null;
        if(kit){
          cbFunc = function(t, opts){return t.popup({
              title: "Order Details",
              items: displayItems
            })
          }
        }
        else if(allowOrder){
          cbFunc = function(t, opts){
            context = t.getContext()
            args = "?boardId=" + context["board"] + "&cardId=" + context["card"]
            return t.popup({  
              title:"Kit Order", 
              url:'views/kitOrder.html' + args
            })
          }
        }

        var actualReceivedDate = (typeof(receivedDateOverride) !== "undefined") ? receivedDateOverride : receivedDate
        return {
          title: "Kit Order",
          text: status === "Delivered" ? (kit + " delivered on " + actualReceivedDate) : (kit ? kit + " arriving on " + deliveryDate : "No Kit Ordered"),
          color: kit ? ((cardData.kitStatus === "Delivered") ? ((!cardData.kitComplete && !cardData.kitResolvedStatus) ? "orange" : "green") : "yellow") : null, 
          callback: cbFunc     
        }
    });
  
    
    ///Days vacant badge
    var taskBadge = t.list('all').then(function(list){
        if(list["name"] != "Not Ready" && list["name"] != "Needs Maintenance Inspection"){ throw new Error("Not in Not Ready list") }
        return t.card('all');
      }).then(function(card){
        var vacantDate = getVacantDate(card)
        var dateDifferential = Math.round((new Date() - vacantDate) / (24 * 60 * 60 * 1000))
        return {
            title: "Days Vacant",
            icon: BLACK_TOOLS_ICON,
            text: Math.abs(dateDifferential) + " days vacant",
            color: dateDifferential < 10 ? "green" : (dateDifferential < 15 ? "orange" : "red")
        } 
      }, function(){ return nullBadge});


    ///Amenities badge
    var amenitiesBadge = getAmenities(t).then(function(amenities){
      // Set amenities, and record total
      var displayItems = [];
      var total = 0;
      for(var amenity in amenities){
        if (amenities.hasOwnProperty(amenity)){
          displayItems.push({"text": amenity + ": $" + amenities[amenity]});
          total += parseInt(amenities[amenity]);
        }
      }

      // Prepare callback
      cbFunc = function(t, opts){
        return t.popup({
          title: "Amenities",
          items: displayItems
        })
      }

      // Return
      return {
          title: "Amenities",
          text: "$" + total,
          callback: cbFunc     
      }
    });
  
  
    
    //Return all
    return Promise.all([kitBadge, taskBadge, amenitiesBadge])
  
  },

  //SORTERS
  'list-sorters': function (t) {
    return t.list('name', 'id')
    .then(function (list) {
      return [{
        text: "Days Vacant",
        callback: function (t, opts) {
          // Trello will call this if the user clicks on this sort
          // opts.cards contains all card objects in the list
          var sortedCards = opts.cards.sort(
            function(a,b) {

              if (getVacantDate(a) > getVacantDate(b)) {
                return 1;
              } else if (getVacantDate(a) < getVacantDate(b)) {
                return -1;
              }
              return 0;
            });
          
          return {
            sortedIds: sortedCards.map(function (c) { return c.id; })
          };
        }
      }];
    });
  }
});
