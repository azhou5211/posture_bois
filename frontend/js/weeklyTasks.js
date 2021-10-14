/* global TrelloPowerUp */
/* global getChecklistByName */
/* global parseDate */
/* global formatDate */
/* global sendRequest */

var t = TrelloPowerUp.iframe()
var Promise = TrelloPowerUp.Promise;


//Add event listener
window.taskContainer.addEventListener("click", function(e){
	if(e.target && e.target.hasAttribute("unitId")){
		t.showCard(e.target.getAttribute("unitId"))
	}
})

//Add listener for submit
window.dateInput.addEventListener('blur', function(event){
  // Stop the browser trying to submit the form itself.
  event.preventDefault();

  window.location.search = "?date=" + window.dateInput.value;
})

function PrintElem(elem)
{
    var mywindow = window.open('', 'PRINT', 'height=800,width=1200');

    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('<html><head><title>' + document.title  + '</title>');
    mywindow.document.write('</head><body >');
    mywindow.document.write('<h1>' + document.title  + '</h1>');
    mywindow.document.write(elem.innerHTML);
    mywindow.document.write('</body></html>');

    mywindow.document.close(); // necessary for IE >= 10
    mywindow.focus(); // necessary for IE >= 10*/

    mywindow.print();
    //mywindow.close();

    return true;
}

