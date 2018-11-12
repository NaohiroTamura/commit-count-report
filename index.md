---
layout: default
---

Example page


I should be using the custom font size defined at SCSS variables
{: .content}

Hey look I am using a Bootstrap variable color!
{: .primarycolor}

<div class="input-group mb-3">
    <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon1">@</span>
    </div>
    <input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="basic-addon1">
</div>

This is the last line.
{: .text-primary}

<button id="mybutton">Send an HTTP GET request to a page and get the result back</button>

<script>
$(document).ready(function(){
    console.log("button action loading");
    $("#mybutton").click(function(){
        console.log("button clicked");
        $.ajax({
            async: true,
            type: "GET",
            url: "http://127.0.0.1:8080/",
            // username and password didn't work, but Authorization header
            // username: "ec29e90c-188d-11e8-bb72-00163ec1cd01",
            // password: "0b82fe63b6bd450519ade02c3cb8f77ee581f25a810db28f3910e6cdd9d041bf",
            headers: {
                'Authorization': 'Basic ' + btoa('ec29e90c-188d-11e8-bb72-00163ec1cd01:0b82fe63b6bd450519ade02c3cb8f77ee581f25a810db28f3910e6cdd9d041bf')
            },
            data: {},
            dataType: "json", // PreFlight
            // crossDomain: true, // it's for JSONP
            xhrFields: {
                // withCredentials: true // it's for CORS Cookie
            }
        }).done(function(data, status){
            console.log("Data: " + JSON.stringify(data) + "\nStatus: " + status);
        }).fail(function(xhr, status, error){
            console.log("Failed: " + error + "\nStatus: " + status);
        });
        console.log("button action done");
    });
});
</script>
