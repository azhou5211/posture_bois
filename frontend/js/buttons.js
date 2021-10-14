/* global makeUnitNotReady */
/* global confirmKitDelivery */

var BLACK_TOOLS_ICON = window.location.origin +  '/assets/Black%20Tools.png'
var GREY_TRUCK_ICON = window.location.origin + '/assets/Grey%20Truck.png'

//Today's scheduled tasks
var dailyTasksButton = {
  icon: {
    dark: BLACK_TOOLS_ICON,
    light: BLACK_TOOLS_ICON
  },
  text: 'Today',
  callback: function(t) {
    return t.modal({
      title:"Daily Tasks", 
      url:'views/dailyTasks.html',
    })
  },
  condition: 'edit'
}

//Week's scheduled tasks
var weeklyTasksButton = {
  icon: {
    dark: BLACK_TOOLS_ICON,
    light: BLACK_TOOLS_ICON
  },
  text: 'This Week',
  callback: function(t) {
    return t.modal({
      title:"Weekly Tasks", 
      url:'weeklyTasks/' + t.getContext().board + ".html",
      fullscreen: true
    })
  },
  condition: 'edit'
}

//Task Grid button
var taskGridButton = {
  icon: {
    dark: BLACK_TOOLS_ICON,
    light: BLACK_TOOLS_ICON
  },
  text: 'Grid',
  callback: function(t) {
    return t.modal({
      title:"Task Grid", 
      url:'views/grid.html',
      fullscreen: true
    })
  },
  condition: 'edit'
}

// Reports Dropdown
var reportsButton = {
  text: 'Reports',
  callback: function(t) {
    return t.popup({
      title: "Select a Report",
      items: [{
          text: "Kit Orders",
          callback: function(t){
            context = t.getContext();
            //Download by open window
            window.open(window.location.origin + "/orderSummary/" + context["board"] + "?userId="+context["member"]);
          },
        },
        {
          text: "Resurfaces",
          callback: function(t){
            context = t.getContext();
            //Download by open window
            window.open(window.location.origin + "/resurfaceSummary/" + context["board"] + "?userId="+context["member"]);
          }
        },
      ]
    })
  },
  condition: 'edit'
}


//Order Kit Button
var kitOrderButton = {
  icon: GREY_TRUCK_ICON,
  text: 'Order Kit',
  condition: 'edit',
  callback: function(t) {
    context = t.getContext()
    args = "?boardId=" + context["board"] + "&cardId=" + context["card"]
    return t.popup({
      title:"Kit Order", 
      url:'views/kitOrder.html' + args
    })
  }
}

//Confirm kit delivery Button
var confirmKitDeliveryButton = {
  icon: GREY_TRUCK_ICON,
  text: 'Confirm Kit Delivery',
  condition: 'edit',
  callback: function(t) {
    context = t.getContext()
    args = "?boardId=" + context["board"] + "&cardId=" + context["card"]
    t.popup({
      title:"Confirm", 
      url:'views/kitOrderConfirm.html' + args
    })
  }
}

//Edit Order Details Button
var editKitOrderButton = {
  icon: GREY_TRUCK_ICON,
  text: 'Edit Kit Order',
  condition: 'edit',
  callback: function(t) {
    return t.popup({
      title:"Edit Order", 
      url:'views/editKitOrder.html'
    })
  }
}

//Resolve Order Errors Button
var resolveKitOrderButton = {
  icon: GREY_TRUCK_ICON,
  text: 'Resolve',
  condition: 'edit',
  callback: function(t) {
    return t.popup({ 
      title:"Resolve Order", 
      url:'views/resolveKitIssue.html'
    })
  }
}

//Maintenance Inspection
var maintenanceInspectionButton = {
  icon: BLACK_TOOLS_ICON,
  text: 'Finish Inspection',
  condition: 'edit',
  callback: function(t) {
    makeUnitNotReady(t)
 }
}

//Task Tracker
var taskTrackerButton = {
  icon: BLACK_TOOLS_ICON,
  text: 'Schedule',
  condition: 'edit',
  callback: function(t) {
    return t.popup({
      title:"Schedule", 
      url:'views/taskTracker.html'
    })
  }
}

//Rehab tracker
var resurfaceTrackerButton = {
  icon: BLACK_TOOLS_ICON,
  text: 'Record Resurface',
  condition: 'edit',
  callback: function(t) {
    return t.popup({
      title:"Resurface Tracker", 
      url:'views/resurfaceTracker.html?cardId=' + t.getContext()["card"]
    })
  }
}