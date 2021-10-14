/* global TrelloPowerUp */
/* global orderKit */
/* global formatDate */

var t = TrelloPowerUp.iframe()
var Promise = TrelloPowerUp.Promise;

//Add listeners
window.kitConfirmation.submitButton.addEventListener('click', function(event){
  // Stop the browser trying to submit the form itself, and prevent double-clicks
  event.preventDefault();
  if(event.detail > 1){
    return null
  }
  document.activeElement.disabled = true;
  notes = document.getElementById('notes').value;
  if(document.getElementById('missing').checked){
    alertIncompleteKit(t, notes);
  }
  else{
    confirmKitDelivery(t);
  }
  console.log("Button click done")
});

//Function to show notes
function notesCheck() {
    if (document.getElementById('missing').checked) {
        document.getElementById('notes').style.display = 'block';
        document.getElementById('notesLabel').style.display = 'block';
    } else {
        document.getElementById('notes').style.display = 'none';
        document.getElementById('notesLabel').style.display = 'none';
    }
    t.sizeTo(document.body).done()
}

//Resize to fit form
t.render(function(){
  notesCheck()
})

