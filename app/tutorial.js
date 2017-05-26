var tutorial = {
    /*{
    /// ---- demostration of contents ---- ///
      // this is the target element - this needs to be as targeted as possible and I wouyld suggest a unique label - hence #xxx (id) not .xxx (class)
      e.g.
      element: document.querySelector('#system-buttons'),
      // this is the positon of the tutorial object relation to the target object
      e.g.
      position: "bottom-left-aligned",
      //this is the text
      //note: tp make it a manageable size for editiong and review split lines up using +
      //      split lines do not corrolate with carriage returns in the text - you need to use <br/> objects for this
      //      in case this isn't obvious, you can use full html in these objects
      e.g.
      intro: "<h2 class='text-center'>System Buttons</h2><br/>"
            +"<h4>These buttons are system level buttons<br/>"
            +"They are used to let you log out, change your password or contact the admins to help you out!"
            +"</h4>"
    */
  run: function(){

    var intro = introJs();
    intro.setOptions({
      steps: [
        {//overview:1
          intro: "<h2 class='text-center'>Hello!</h2>"
                  +"<h4>It's great to have you here on PINGR!<br/>"
                  +"This guide is going to help get you started on some of the features we've got here."
                  +"</h4>"
        },
        {//overview:2
          intro: "<h2 class='text-center'>Here to help</h2><br/>"
                +"<h4>PINGR is here to suggest actions to improve patient care.<br/>"
                +"All of it's suggestions are based on your practice's data.<br/>"
                +"</h4>"
        },
        {//overview:3
          intro: "<h2 class='text-center'>You can help PINGR</h2><br/>"
                +"<h4>Your input improves PINGR over time.<br/>"
                +"By giving a <i class='material-icons icon-in-text</i> or <i class='material-icons icon-in-text'>thumb_down</i> you help PINGR's suggestions for <strong>all</strong> users<br/>"
                +"</h4>"
        },
        {//overview:4
          element: document.querySelector('#system-buttons'),
          position: "bottom-left-aligned",
          intro: "<h2 class='text-center'>System Buttons</h2><br/>"
                +"<h4>These buttons are system level buttons<br/>"
                +"They are used to let you log out, change your password or contact the admins to help you out!"
                +"</h4>"
        },
        {//overview:5
          element: document.querySelector('#mainTab'),
          position: "bottom-right-aligned",
          intro: "<h2 class='text-center'>Navigation</h2><br/>"
                +"<h4>With these buttons you can access other panels in the system.<br/>"
                +"<h4>In general you will move from left (overview panel) to right (action plans panel).<br/>"
                +"</h4>"
        },
        {//overview:6
          element: document.querySelector('#mainTab'),
          position: "bottom-right-aligned",
          intro: "<h2 class='text-center'>Navigation</h2><br/>"
                +"<h4>Press these buttons to take you to a specific part of the system in case you want to go somewhere specific<br/>"
                +"</h4>"
        },
        {//overview:7
          element: document.querySelector('#title-row'),
          position: "bottom-middle-aligned",
          intro: "<h2 class='text-center'>Cards and panels</h2><br/>"
                +"<h4>Each panel is split into a number of cards.<br/>"
                +"Each card represents a differnt function.<br/>"
                +"</h4>"
        },
        {//overview:8
          element: document.querySelector('#overview-card'),
          //element: $('#overview-card'),
          //element: document.querySelector('#left-panel'),
          position: "right",
          intro: "<h2 class='text-center'>Cards and panels</h2><br/>"
                +"<h4>This card (the location card) for example tells you that you are in the overview panel.<br/>"
                +"There is a locaion card in every panel!<br/>"
                +"</h4>"
        },
        {//overview:9
          element: document.querySelector('#tab-plan-team #advice-list .col-md-4'),
          //position: "right",
          intro: "<h2 class='text-center'>Suggested Actions</h2><br/>"
                +"<h4>advice-list<br/>"
                +"<br/>"
                +"</h4>"
        },
        {//overview:10
          element: document.querySelector('#teamActionCard .card-content'),
          //position: "right",
          intro: "<h2 class='text-center'>Suggested Actions</h2><br/>"
                +"<h4>teamActionCard<br/>"
                +"<br/>"
                +"</h4>"
        },
        {//overview:11
          element: document.querySelector('#teamSuggestionListCard .card-content'),
          //position: "right",
          intro: "<h2 class='text-center'>TODO - TUTORIAL CARD IN PROGRESS</h2><br/>"
                +"<h4>teamActionCard<br/>"
                +"<br/>"
                +"</h4>"
        },
        {//overview:12
          element: document.querySelector('#overviewTableCard'),
          //position: "left",
          intro: "<h2 class='text-center'>TODO - TUTORIAL CARD IN PROGRESS</h2><br/>"
        }
      ]
    });

    //this makes sure that the object that we are interested in is always in view
    intro.onchange(function(targetElement){
        target = $(targetElement);
        console.log(targetElement.id);
        floatPane = $('div.introjsFloatingElement');
        if(target[0] != floatPane[0])
        {
          $('.main-panel-wide').scrollTop($(targetElement).offset().top - $('.main-panel-wide').offset().top + $('.main-panel-wide').scrollTop());
        }
    });

    intro.setOption('doneLabel', 'Lets go to Overview')

    intro.oncomplete(function() {
        window.location.href = '#indicators?tuttip=a1p1';
    });

    //if not on this page go to this page
    //this function runs after the tutorial session closes
    intro.onexit(function(){
      //remove overflow prevention at the end of the tutorial
      $('body').css({overflow: "auto"});
      //enable perfectScrollbar again
      $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar({wheelPropagation: true}).css({overflow: "auto"});

    });

    //apply hidden overflow to body for the duration of tutorial session
    $('body').css({overflow: "hidden"});
    $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar('destroy').css({overflow: "hidden"});

    //starts the tutorial
    intro.start();
  },
  runIndicator: function(){

      var intro = introJs();
      intro.setOptions({
        steps: [
          {//indicator:1
            element: document.querySelector('#indicatorHeadCard'),
            position: "bottom",
            intro: "<h2 class='text-center'>You made it!<br/>This is the Indicator page...</h2>"
          },
          {//indicator:2
            element: document.querySelector('#teamActionCard'),
            position: "right",
            intro: "<h2 class='text-center'>Next page then? ... lets do it!</h2>"
          },
          {//indicator:3
            element: document.querySelector('#dataBrowser'),
            position: "left",
            intro: "<h2 class='text-center'>This be the data panel</h2>"
          },
          {//indicator:4
            element: document.querySelector('#indicatorDataContainer'),
            position: "left",
            intro: "<h2 class='text-center'>Interract with this!</h2>"
          },
          {//indicator:5
            element: document.querySelector('#indicatorDataContainer #mainPage-tabs'),
            position: "left",
            intro: "<h2 class='text-center'>You will to press these!</h2>"
          },
          {//indicator:6
            intro: "<h2 class='text-center'>Next page then? ... lets do it!</h2>"
          }
        ]
      });
      intro.onchange(function(targetElement){
          target = $(targetElement);
          floatPane = $('div.introjsFloatingElement');
          if(target[0] != floatPane[0])
          {
            $('.main-panel-wide').scrollTop($(targetElement).offset().top - $('.main-panel-wide').offset().top + $('.main-panel-wide').scrollTop());
          }
      });

      intro.setOption('doneLabel', 'Next up, Patients');

      intro.oncomplete(function() {
           window.location.href = '#patient?tuttip=a2q4'
           $('body').css({overflow: "auto"});
           //enable perfectScrollbar again
      });

      intro.onexit(function(){
        //remove overflow prevention at the end of the tutorial
        $('body').css({overflow: "auto"});
        window.location.href = '#overview';
        //enable perfectScrollbar again
        $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar({wheelPropagation: true}).css({overflow: "auto"});
      });

      //apply hidden overflow to body for the duration of tutorial session
      $('body').css({overflow: "hidden"});
      $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar('destroy').css({overflow: "hidden"});

      intro.start();
    },
    runPatient: function(){

        var intro = introJs();
        intro.setOptions({
          steps: [
            {
              element: document.querySelector('#patient-Search'),
              position: "bottom",
              intro: "<h2 class='text-center'>You made it!</h2>"
            },
            {
              element: document.querySelector('#all-patient-list'),
              position: "top",
              intro: "<h2 class='text-center'>Check this list yo</h2>"
            }
          ]
        });
        // intro.onchange(function(targetElement){
        //     target = $(targetElement);
        //     floatPane = $('div.introjsFloatingElement');
        //     if(target[0] != floatPane[0])
        //     {
        //       $('.main-panel-wide').scrollTop($(targetElement).offset().top - $('.main-panel-wide').offset().top + $('.main-panel-wide').scrollTop());
        //     }
        // });
        //
        intro.setOption('doneLabel', 'Lets look at patient detail');

        intro.oncomplete(function() {
          //TODO check if there is a fixed case I can use here
          window.location.href = '#patients/55210?tuttip=b2q4'
        });

        intro.onexit(function(){
          //remove overflow prevention at the end of the tutorial
          $('body').css({overflow: "auto"});
          window.location.href = '#overview';
          //enable perfectScrollbar again
          $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar({wheelPropagation: true}).css({overflow: "auto"});
        });

        //apply hidden overflow to body for the duration of tutorial session
        $('body').css({overflow: "hidden"});
        $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar('destroy').css({overflow: "hidden"});

        intro.start();

      },
      runPatientSelected: function(){

          var intro = introJs();
          intro.setOptions({
            steps: [
              {
                intro: "<h2 class='text-center'>You made it!</h2>"
              }
            ]
          });

          intro.onexit(function(){
            //remove overflow prevention at the end of the tutorial
            $('body').css({overflow: "auto"});
            window.location.href = '#overview';
            //enable perfectScrollbar again
            $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar({wheelPropagation: true}).css({overflow: "auto"});
          });

          intro.oncomplete(function() {
               window.location.href = '#agreedactions?tuttip=a3r8'
               $('body').css({overflow: "auto"});
               //enable perfectScrollbar again
          });

          //apply hidden overflow to body for the duration of tutorial session
          $('body').css({overflow: "hidden"});
          $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar('destroy').css({overflow: "hidden"});

          intro.start();

        },
      runActionPlan: function(){

          var intro = introJs();
          intro.setOptions({
            steps: [
              {
                intro: "<h2 class='text-center'>You made it!</h2>"
              },
              {
                element: document.querySelector('#actionPlanCard'),
                position: "top",
                intro: "<h2 class='text-center'>This is the last card!</h2>"
              }
            ]
          });

          intro.onexit(function(){
            //remove overflow prevention at the end of the tutorial
            $('body').css({overflow: "auto"});
            window.location.href = '#overview';
            //enable perfectScrollbar again
            $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar({wheelPropagation: true}).css({overflow: "auto"});
          });

          intro.oncomplete(function() {
            $('body').css({overflow: "auto"});
            window.location.href = '#agreedactions'
            $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar({wheelPropagation: true}).css({overflow: "auto"});
          });

          //apply hidden overflow to body for the duration of tutorial session
          $('body').css({overflow: "hidden"});
          $('.sidebar .sidebar-wrapper, .main-panel, .main-panel-wide').perfectScrollbar('destroy').css({overflow: "hidden"});

          intro.start();
      }
};
module.exports = tutorial;
