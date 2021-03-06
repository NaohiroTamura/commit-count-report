---
layout: default
---
# Commit Count Report

FaaS Shell sample [Commit Count Report][1] Web GUI. *Get Commit Count* button privdes the same effect as the following git command:

```sh
$ git clone https://github.com/NaohiroTamura/faasshell
$ cd faasshell
$ git log --since=2018-06-21T00:00:00+00:00 --until=2018-07-20T00:00:00+00:00 --no-merges --format=%ae | grep fujitsu.com | wc -l
```

All results are logged into [Google Sheets][2]{: target="_blank"}.

[1]: https://github.com/NaohiroTamura/faasshell/blob/master/samples/demo_commit_count_report.md "Commit Count Report"
[2]: https://docs.google.com/spreadsheets/d/1ywCxG8xTKOYK89AEZIqgpTvbvpbrb1s4H_bMVvKV59I/edit#gid=0 "Google Sheets"

<div class="container-fluid">
    <div class="row">
        <div class="col-md-12">
            <div class="jumbotron">

<label for="github-url">GitHub Repository URL</label>
<div class="input-group mb-3">
    <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon1">https://github.com/</span>
    </div>
        <input type="text" class="form-control" id="github-url" placeholder="naohirotamura/faasshell" aria-describedby="basic-addon1">
    </div>

<label for="commiter-search">Commiter's search string</label>
<div class="input-group mb-3">
    <input type="text" class="form-control" id="commiter-search" placeholder="fujitsu.com" aria-label="fujitsu.com">
</div>

<label for="basic-url">Search Duration (Option)</label>
<div class="input-group mb-3">
    <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon3">Since</span>
    </div>
    <input type="text" class="form-control" id="date-since" placeholder="2018-06-21T00:00:00+00:00" aria-label="Since" aria-describedby="basic-addon3">
</div>

<div class="input-group mb-3">
    <div class="input-group-prepend">
        <span class="input-group-text" id="basic-addon4">Until</span>
    </div>
    <input type="text" class="form-control" id="date-until" placeholder="2018-07-20T00:00:00+00:00" aria-label="Until" aria-describedby="basic-addon4">
</div>

<div class="input-group mb-3">
  <button id="mybutton" class="btn btn-primary btn-large">Get Commit Count</button>
  <div id="myspinner" class="spinner-border text-primary ml-3" role="status">
    <span class="sr-only">Loading...</span>
  </div>
</div>

<label for="search-result">Result</label>
<div class="input-group mb-3">
    <input type="text" class="form-control" id="search-result">
</div>

            </div>
        </div>
    </div>
</div>

<script>
$(document).ready(function(){
    console.log("button action loading");
    console.log(`#commiter-search = ${$('#commiter-search').val()}`);
    console.log(`#github-url = ${$('#github-url').val()}`);
    console.log(`#date-since = ${$('#date-since').val()}`);
    console.log(`#date-until = ${$('#date-until').val()}`);
    $("#myspinner").hide();
    $("#mybutton").click(function(){
        console.log("button clicked");
        $('#search-result').val("");
        console.log(`#commiter-search = ${$('#commiter-search').val()}`);
        console.log(`#github-url = ${$('#github-url').val()}`);
        let github = $('#github-url').val().split('/');
        console.log(`owner = ${github[0]}`);
        console.log(`name = ${github[1]}`);
        console.log(`#date-since = ${$('#date-since').val()}`);
        console.log(`#date-until = ${$('#date-until').val()}`);
        $("#myspinner").show();
        $.ajax({
            async: true,
            type: 'POST',
            url: 'https://protected-depths-49487.herokuapp.com/statemachine/commit_count_report.json?blocking=true',
            //url: 'http://127.0.0.1:8080/statemachine/commit_count_report.json?blocking=true',
            headers: {
                'Authorization': 'Basic ' + btoa('ec29e90c-188d-11e8-bb72-00163ec1cd01:0b82fe63b6bd450519ade02c3cb8f77ee581f25a810db28f3910e6cdd9d041bf')
            },
            contentType: 'application/json; charset=utf-8',
            data: JSON.stringify({
                input: {
                    github: {
                        target: $('#commiter-search').val(),       // 'fujitsu.com',
                        owner:  github[0],                        // 'naohirotamura',
                        name:   github[1],                        // 'faasshell',
                        since:  $('#date-since').val(),           // '2018-06-21T00:00:00+00:00',
                        until:  $('#date-until').val(),           // '2018-07-20T00:00:00+00:00'
                    },
                    gsheet: {
                        sheetId: '1ywCxG8xTKOYK89AEZIqgpTvbvpbrb1s4H_bMVvKV59I'
                    }
                }
            }),
            dataType: 'json', // PreFlight
        }).done(function(data, status){
            console.log("Data: " + JSON.stringify(data) + "\nStatus: " + status);
            $('#search-result').val(data.output.github.output.values[0][5]);
            $("#myspinner").hide();
            console.log("Result: " + data.output.github.output.values[0][5] + "\n");
        }).fail(function(xhr, status, error){
            console.log("Failed: " + error + "\nStatus: " + status);
            $('#search-result').val(status);
            $("#myspinner").hide();
        });
        console.log("button action done");
    });
});
</script>
