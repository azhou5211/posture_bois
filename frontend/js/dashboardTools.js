function updateURLParameter(url, param, paramVal)
{
    var TheAnchor = null;
    var newAdditionalURL = "";
    var tempArray = url.split("?");
    var baseURL = tempArray[0];
    var additionalURL = tempArray[1];
    var temp = "";

    if (additionalURL) 
    {
        var tmpAnchor = additionalURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor = tmpAnchor[1];
        if(TheAnchor)
            additionalURL = TheParams;

        tempArray = additionalURL.split("&");

        for (var i=0; i<tempArray.length; i++)
        {
            if(tempArray[i].split('=')[0] != param)
            {
                newAdditionalURL += temp + tempArray[i];
                temp = "&";
            }
        }        
    }
    else
    {
        var tmpAnchor = baseURL.split("#");
        var TheParams = tmpAnchor[0];
            TheAnchor  = tmpAnchor[1];

        if(TheParams)
            baseURL = TheParams;
    }

    if(TheAnchor)
        paramVal += "#" + TheAnchor;

    var rows_txt = temp + "" + param + "=" + paramVal;
    return baseURL + "?" + newAdditionalURL + rows_txt;
}

/////////////////////HTTP REQUESTS//////////////////////////////////////////////
function sendRequest(method, command, data = {}){
   return new Promise(function(resolve, reject){
    var xhr = new XMLHttpRequest();
    
    //add data to url
    var base = window.location.origin;
    var url = base + "/" + command + '?token=' + "GUJf12Qx7v0xUk9mnqTShrk4BpmUpG26GB4dCNqhOeRE56bJfL8PNh7vdLH3" + "&"
    for (var key in data) {
      if (data.hasOwnProperty(key)) {
        val = data[key]
        url = url + encodeURIComponent(key) + "=" + encodeURIComponent(val) + "&"
      }
    }
    url = url.slice(0,-1)


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

    xhr.send();
   })
}