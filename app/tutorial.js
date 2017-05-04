var tutorial = {
  run: function(){
    var intro = introJs();
    intro.setOptions({
      steps: [
        {
          intro: "<h2 class='text-center'>Hello!</h2>"
                  +"<h4>It's great to have you here on PINGR!<br/>"
                  +"This guide is going to help get you started on some of the features we've got here."
                  +"</h4>"
        },
        {
          intro: "<h2 class='text-center'>Here to help</h2><br/>"
                +"<h4>PINGR is here to suggest actions to improve patient care.<br/>"
                +"All of it's suggestions are based on your practice's data.<br/>"
                +"</h4>"
        },
        {
          intro: "<h2 class='text-center'>You can help PINGR</h2><br/>"
                +"<h4>Your input improves PINGR over time.<br/>"
                +"By giving a <i class='material-icons icon-in-text'>thumb_up</i> or <i class='material-icons icon-in-text'>thumb_down</i> you help PINGR's suggestions for <strong>all</strong> users<br/>"
                +"</h4>"
        },
        {
          element: document.querySelector('#system-buttons'),
          position: "bottom-left-aligned",
          intro: "<h2 class='text-center'>System Buttons</h2><br/>"
                +"<h4>These buttons are system level buttons<br/>"
                +"They are used to let you log out, change your password or contact the admins to help you out!"
                +"</h4>"
        },
        {
          element: document.querySelector('#mainTab'),
          position: "bottom-right-aligned",
          intro: "<h2 class='text-center'>Navigation</h2><br/>"
                +"<h4>With these buttons you can access other panels in the system.<br/>"
                +"<h4>In general you will move from left (overview panel) to right (action plans panel).<br/>"
                +"</h4>"
        },
        {
          element: document.querySelector('#mainTab'),
          position: "bottom-right-aligned",
          intro: "<h2 class='text-center'>Navigation</h2><br/>"
                +"<h4>Press these buttons to take you to a specific part of the system in case you want to go somewhere specific<br/>"
                +"</h4>"
        },
        {
          element: document.querySelector('.title-row'),
          position: "bottom-middle-aligned",
          intro: "<h2 class='text-center'>Cards and panels</h2><br/>"
                +"<h4>Each panel is split into a number of cards.<br/>"
                +"Each card represents a differnt function.<br/>"
                +"</h4>"
        },
        {
          element: document.querySelector('#overview-card'),
          intro: "<h2 class='text-center'>Cards and panels</h2><br/>"
                +"This card (the location card) for example tells you that you are in the overview panel.<br/>"
                +"There is a locaion card in every panel!<br/>"
                +"</h4>"
        },
        {
          element: document.querySelector('#tab-plan-team #advice-list .col-md-4'),
          position: "right",
          intro: "<h2 class='text-center'>Suggested Actions</h2><br/>"
                +"advice-list<br/>"
                +"<br/>"
                +"</h4>"
        },
        {
          element: document.querySelector('#teamActionCard .card-content'),
          position: "right",
          intro: "<h2 class='text-center'>Suggested Actions</h2><br/>"
                +"teamActionCard<br/>"
                +"<br/>"
                +"</h4>"
        },
        {
          element: document.querySelector('#teamSuggestionListCard .card-content'),
          position: "right",
          intro: "<h2 class='text-center'>Suggested Actions</h2><br/>"
                +"teamActionCard<br/>"
                +"<br/>"
                +"</h4>"
        },
        {
          intro: "<h1 class='text-center'>-- E N D --</h1>"
        }
      ]
    });
    intro.start();
  }
};

module.exports = tutorial;
