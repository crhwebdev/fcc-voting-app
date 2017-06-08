'use strict';

(function (self) {
    //get page elements
    var newPollForm = document.getElementById('new-poll-form');
    var newPollSubmitBtn = document.getElementById('new-poll-submit-btn');

    //#poll-form  -  on submit : for voteing
    //post to /poll/:id/vote
    //newPollForm.addEventListener('submit', (e) =>{        
    //    e.preventDefault();            
    //call vote api goes here    
    //    console.log('voting for ' + voteOption);        
    //});

    //#delete-poll-btn - on click : for deleting the current poll
    //post to poll/delete/:id route
    newPollSubmitBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var newPollTitle = document.getElementById('new-poll-title').value;
        var newPollOptions = document.getElementById('new-poll-options').value;
        var headers;
        var fetchInit;
        //check to see if fields filled in.  If they are not, throw an error
        if (!newPollTitle || !newPollOptions) {
            console.log("Fill out form data!");
        } else {
            headers = new Headers();
            headers.set("Content-Type", "application/json");
            //NOTE: remove < and > tags to prevent xss attacks
            fetchInit = {
                method: 'POST',
                headers: headers,
                credentials: 'include',
                cache: 'default',
                body: JSON.stringify({ title: newPollTitle, options: newPollOptions.split('\n') })
            };
            //add call to polls/user/new/
            fetch('/polls/user/new', fetchInit);
            console.log('adding poll: ' + newPollTitle);
        }
    });
})(typeof self !== 'undefined' ? self : undefined);