/* global TrelloPowerUp */
/* global parseDate */
/* global dateToStr */

var t = TrelloPowerUp.iframe()
var Promise = TrelloPowerUp.Promise;

//Add listener for submit
window.kitSelection.addEventListener('submit', function(event){
  // Stop the browser trying to submit the form itself.
  event.preventDefault();

  //record data
  var kitDetails = {
    kit: document.getElementById('kitType').value, 
    kitOrderDate: formatDate(document.getElementById('orderDate').value), 
    kitDeliveryDate: formatDate(document.getElementById('deliveryDate').value), 
    kitNotes: document.getElementById('notes').value,
    kitUser: document.getElementById('member').value,
    kitStatus: document.getElementById('status').value,
    kitReceivedDate: formatDate(document.getElementById('receivedDate').value),
    kitReceiver: document.getElementById('receivedBy').value,
    kitComplete: document.getElementById('kitComplete').value == "true"
  }
  
  return t.set('card', 'shared', kitDetails)
    .then(function(){
          t.closePopup()
    })

});

//Listener for delete
window.kitSelection.addEventListener('reset', function(event){
  // Stop the browser trying to submit the form itself.
  event.preventDefault();

  console.log("Deleting kit order")
  return t.remove('card', 'shared', ['kit','kitOrderDate', 'kitDeliveryDate','kitNotes', 'kitUser', 'kitStatus', 'kitReceivedDate', 'kitReceiver', 'kitComplete'])
    .then(function(){
          t.closePopup()
    })

});


//Defaults
var prom = t.get('card','shared')
  .then(function(cardData) {
    console.log(cardData)
    document.getElementById('kitType').value= cardData.kit;
    document.getElementById('orderDate').valueAsDate = parseDate(cardData.kitOrderDate);
    document.getElementById('deliveryDate').valueAsDate = parseDate(cardData.kitDeliveryDate);
    document.getElementById('notes').value = cardData.kitNotes;
    document.getElementById('member').value = cardData.kitUser;
    document.getElementById('status').value = cardData.kitStatus;
    document.getElementById('receivedDate').valueAsDate = parseDate(cardData.kitReceivedDate);
    document.getElementById('receivedBy').value = cardData.kitReceiver;
    document.getElementById('kitComplete').value = cardData.kitComplete.toString();
})

//Resize to fit form
t.render(function(){
  t.sizeTo(document.body).done()
})

