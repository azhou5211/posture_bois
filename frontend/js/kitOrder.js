/* global TrelloPowerUp */
/* global orderKit */
/* global formatDate */

var t = TrelloPowerUp.iframe()
var Promise = TrelloPowerUp.Promise;

//Add listener for submit
window.kitSelection.orderButton.addEventListener('click', function(event){
  // Stop the browser trying to submit the form itself, and prevent double-clicks
  event.preventDefault();
  if(event.detail > 1){
    return null
  }
  document.activeElement.disabled = true;

  //Check for weekend delivery
  const picker = document.getElementById('deliveryDate');
  var day = new Date(picker.value).getUTCDay();
  console.log(day)
  if([6,0].includes(day)){
    document.activeElement.disabled = false;
    picker.value = '';
    t.popup({
        type: 'confirm',
        title: "Invalid Date",
        message: "Deliveries are not available on weekends. Please choose a different date.",
        confirmText: "OK",
        onConfirm: function(t, opts){
          context = t.getContext()
          args = "?boardId=" + context["board"] + "&cardId=" + context["card"]
          return t.popup({
            title:"Kit Order", 
            url:'kitOrder.html' + args
          })
        },
        confirmStyle: 'primary', 
      });
    return
  }

  //Check order if necessary
  t.card('labels').then(function(card){
    var existingUpgrade = "None"
    var typeLabels = "Full;Partial;Light;Pre-Bridge;Rented"
    
    for(var i = 0; i < card["labels"].length; i++){
      if(typeLabels.includes(card["labels"][i]["name"])){
         existingUpgrade = card["labels"][i]["name"];
         break;
      }
    }

    if(existingUpgrade != "None"){
      var confirmStr = "This unit is " + (existingUpgrade === "Rented" ? "already rented" : "marked as a " + existingUpgrade) + ", are you sure you want to order a kit?"
      document.activeElement.disabled = false;
      t.popup({
        type: 'confirm',
        title: "Confirm Kit Order",
        message: confirmStr,
        confirmText: "Yes, order a kit",
        onConfirm: completeOrder,
        confirmStyle: 'danger', 
        cancelText: "No, do not place an order",
        onCancel: function(t, opts){ t.closePopup()} 
      })
    }
    else if(window.deliveryDate.value == ''){
      document.activeElement.disabled = false
      t.popup({
        type: 'confirm',
        title: "Missing Date",
        message: "Please select a delivery date and try again.",
        confirmText: "OK",
        onConfirm: function(t, opts){},
        confirmStyle: 'primary', 
      })
    }
    else{
      completeOrder(t, null)
    }
  })

});

function completeOrder(t, opts){
  //Get date
  var today = dateToStr(new Date())
  var dDateStr = formatDate(window.deliveryDate.value)

  //send email and record data
  var kitDetails = {kit: window.kitType.value, kitOrderDate:today, kitDeliveryDate:dDateStr, kitNotes:window.notes.value, kitStatus: "Ordered"}

  //loading screen
  t.popup({
    title: "Ordering Kit",
    items: [
            {text: "Type: " + kitDetails.kit},
            {text: "Ordered On: " + kitDetails.kitOrderDate},
            {text: "Delivery On: " + kitDetails.kitDeliveryDate},
            {text: "Notes: " + kitDetails.kitNotes}
    ]
  })
  //Send order email
  t.member('all').then(function(member){
    kitDetails.kitUser = member.fullName
    return Promise.all([orderKit(t, kitDetails), t.set('card', 'shared', kitDetails)])
  }).then(function(){
      t.closePopup()
  })
};

//Defaults
var dateObject = new Date()
dateObject.setDate(dateObject.getDate() + 14)
if([6,0].includes(dateObject.getUTCDay())){
  dateObject.setDate(dateObject.getDate() + 1 + dateObject.getUTCDay() / 6)
}
document.getElementById('deliveryDate').valueAsDate = dateObject

console.log("Loading")
//Resize to fit form
t.render(function(){
  console.log("Rendering")
  t.sizeTo(document.body).done()
})

