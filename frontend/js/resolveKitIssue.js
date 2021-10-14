/* global TrelloPowerUp */
/* global parseDate */
/* global dateToStr */

var t = TrelloPowerUp.iframe()
var Promise = TrelloPowerUp.Promise;

//Add listener for submit
window.resolutionForm.addEventListener('submit', function(event){
  // Stop the browser trying to submit the form itself.
  event.preventDefault();

  //record data
  var resolutionDetails = {
    kitReceivedDateOverride: formatDate(document.getElementById('overrideDate').value), 
    kitResolvedStatus: document.getElementById('resolved').checked, 
    kitResolvedDate: formatDate(document.getElementById('resolvedDate').value),
    kitResolvedNotes: document.getElementById('notes').value,
  }
  
  return t.member('all').then(function(user){
    resolutionDetails.kitResolvedUser = user.fullName
  }).then(function(){
    return t.set('card', 'shared', resolutionDetails)
      .then(function(){
            t.closePopup()
      })
  })
});

//Defaults
var prom = t.get('card','shared')
      .then(function(cardData) {
        console.log(cardData);
        document.getElementById('overrideDate').valueAsDate = parseDate(cardData.kitReceivedDateOverride);
        document.getElementById('resolved').checked = cardData.kitResolvedStatus;
        document.getElementById('resolvedDate').valueAsDate = parseDate(cardData.kitResolvedDate);
        document.getElementById('notes').value = cardData.kitResolvedNotes;
})
console.log(prom)

//Function for checkbox to show date
function yesnoCheck() {
    if (document.getElementById('resolved').checked) {
        document.getElementById('resolvedDate').style.display = 'block';
        document.getElementById('resolvedDateLabel').style.display = 'block';
    } else {
        document.getElementById('resolvedDate').style.display = 'none';
        document.getElementById('resolvedDateLabel').style.display = 'none';
    }
    t.sizeTo(document.body).done()
}

//Update and resize
t.render(function(){
  yesnoCheck()
})
