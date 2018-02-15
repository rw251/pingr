module.exports = () => {

  Sideshow.config.language = "en";
  // Sideshow.config.autoSkipIntro = true;
  Sideshow.init();

  Sideshow.registerWizard({
    name: "introducing_pingr",
    title: "Introducing PINGR",
    description: "Introducing the main features and concepts of PINGR. ",
    estimatedTime: "3 Minutes",
    affects: [
    //   { hash: "#overview" }, //This tutorial would be eligible for URLs like this "http://www.foo.com/bar#messages"
    // { route: "/*", caseSensitive: true },  //This tutorial would be eligible for URLs like this "http://www.foo.com/adm/orders"
      function(){
        console.log('//Here we could do any checking to infer if this tutorial is eligible the current screen/context.');
        //After this checking, just return a boolean indicating if this tutorial will be available.
        return true;//$(".grid").length > 0;
      }
    ]
  }).storyLine({
    showStepPosition: true,
    steps: [
      {
		    title: "The PINGR tutorial",
		    text: "OK! Let's show you how to use PINGR."
		  },
      {
		    title: "Here to help",
		    text: "PINGR is here to suggest actions to improve patient care. All of it's suggestions are based on your practice's data."
      },
      {
        title: "You can help PINGR",
        text: "Your input improves PINGR over time. By giving a thumb_down you help PINGR's suggestions for all users"
      },
      {
        title: "System Buttons",
        text: "These buttons are system level buttons. They are used to let you log out, change your password or contact the admins to help you out!",
        lockSubject: true,
        subject: ".nav.navbar-nav.navbar-right"
      },
      {
        title: "Navigation",
        text: "With these buttons you can access other panels in the system. In general you will move from left (overview panel) to right (action plans panel).",
        lockSubject: true,
        subject: "#mainTab"
      },
      {
        title: "Navigation",
        text: "Press these buttons to take you to a specific part of the system in case you want to go somewhere specific.",
        lockSubject: true,
        subject: "#mainTab"
      },
      {
        title: "The log out button.",
        text: "Click this button if you want to log out of the system.",
        subject: ".nav.navbar-nav.navbar-right",
        targets: "#suggs"
      }
    ]
  });
};