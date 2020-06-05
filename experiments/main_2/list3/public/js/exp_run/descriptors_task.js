

function make_slides(f) {
  var   slides = {};

  slides.i0 = slide({
    name : "i0",
    exp_start: function() {
    }
  });

  slides.training_and_calibration = slide({
    name: "training_and_calibration",
    start_camera: function (e) {
      $("#start_camera").hide();
      $("#start_calibration").show();
      init_webgazer();
    },

    finish_calibration_start_task: function (e) {
      if (precision_measurement > PRECISION_CUTOFF) {
        $("#plotting_canvas").hide();
        $("#webgazerVideoFeed").hide();
        $("#webgazerFaceOverlay").hide();
        $("#webgazerFaceFeedbackBox").hide();
        webgazer.pause();
        exp.go();
      }
      else {
        exp.accuracy_attempts.push(precision_measurement);
        swal({
          title: "Calibration Fail",
          text: "Either you haven't performed the calibration yet, or your calibration score is too low. Your calibration score must be 50% to begin the task. Please click Recalibrate to try calibrating again.",
          buttons: {
            cancel: false,
            confirm: true
          }
        })
      }
    }
  });

  slides.sound_test = slide({
    name: "sound_test",
    soundtest_OK : function(e){
      exp.trial_no = 0;
      exp.go();
    }
  });

  slides.practice = slide({
    name : "practice",
    start: function(){
      $(".err").hide();
      console.log("in practice")
    },
    present: exp.practice,
    present_handle : function(stim) {
      //aud.pause();
      this.stim = stim;
      $(".second_slide").hide();
      $(".grid_button").hide();
      $(".grid-container").hide();

      exp.objects =     ["","apples, pears, bananas and oranges.",
                        "apples, pears, bananas and oranges.",
                        "scissors, pencils, erasers and rulers.",
                        "scissors, pencils, erasers and rulers.",
                        "plates, forks, spoons and knives.",
                        "plates, forks, spoons and knives."]


      if ((stim.displayID == 1)| (stim.displayID == 3)| (stim.displayID == 5)) {
        var init_sentence = "This is " + stim.figure + ". " + stim.figure + " gives out " + stim.setting + " to children every day."
        var init_image = '<img src="images/'+ stim.figure + '.png" style="height:300px" class="center">';
        $(".sentence").html(init_sentence);
        $(".sentence").show();
        $(".image").html(init_image);
        $(".second_slide").show();

      }
      else if ((stim.displayID == 2)| (stim.displayID == 4)| (stim.displayID == 6)) {
        var second_sentence = "Here is what " + stim.figure + " has on Tuesday. " + stim.figure + " has " + exp.objects[stim.displayID]
        $(".sentence").html(second_sentence);
        $(".sentence").show();
        var second_image = '<img src="images/p.trial_'+ stim.displayID+ '.jpg" style="height:300px" class="center">';
        $(".image").html(second_image);
        $(".grid_button").show();
      }

    },

    second_slide: function(){
      $(".second_slide").hide();
      var second_sentence = "Here is what " + this.stim.figure + " has on Monday. " + this.stim.figure + " has " + exp.objects[this.stim.displayID] + " " + this.stim.pronoun + " always brings more than enough. The leftover " + this.stim.setting + " are put in the middle."
      $(".sentence").html(second_sentence);
      var second_image = '<img src="images/p.trial_'+ this.stim.displayID+ '.jpg" style="height:300px" class="center">';
      $(".image").html(second_image);
      $(".grid_button").show();
    },

    grid: function(){
      $(".err").hide();
      $(".image").html("  ");
      $(".sentence").hide();
      $(".grid_button").hide();

      exp.selection = 0;
      exp.timer = 0;
      exp.trial_start = Date.now();

      var aud = document.getElementById("stim");
      console.log(this.stim.prime);
      aud.src = "audio/"+this.stim.prime+".wav";
      aud.load();
      aud.currentTime = 0;
      aud.play();

      exp.display_imgs(this.stim); // display images in the grid
      $(".grid-container").show();

      $(".loc").bind("click",function(e){
        $(".err").hide();
        e.preventDefault();
        var loc = $(this).data().loc
        if (["AOI5","AOI6"].includes(loc)) {
          $(".err").show();
          console.log("should show error");
        } else {
          exp.selection = loc;
          exp.timer = (Date.now()-exp.trial_start);
          $(".loc").unbind('click')
          _s.button();
        }
       });

    },

    button : function() {
      console.log("Selection: ",exp.selection)
      console.log("Timer: ",exp.timer)
      this.log_responses();
      _stream.apply(this); /* use _stream.apply(this); if and only if there is
      "present" data. (and only *after* responses are logged) */
    },

    log_responses : function() {
      exp.data_trials.push({
          "displayID" : this.stim.displayID,
          "ExpFiller" : this.stim.ExpFiller,
          "setting" : this.stim.setting,
          "figure" : this.stim.figure,
          "Intro_object" : this.stim.Intro_object,
          "Res_object" : this.stim.Res_object,
          "object1" : this.stim.object1,
          "object2" :  this.stim.object2,
          "object3" :  this.stim.object3,
          "object4" : this.stim.object4,
          "display_type" : this.stim.display_type,
          "location1" : this.stim.location1,
          "location2" : this.stim.location2,
          "location3" : this.stim.location3,
          "location4" : this.stim.location4,
          "location5" : this.stim.location5,
          "location6" : this.stim.location6,
          "location7" : this.stim.location7,
          "location8" : this.stim.location8,
          "location9" : this.stim.location9,
          "location10" : this.stim.location10,
          "condition1" : this.stim.condition1,
          "size1" : this.stim.size1,
          "target1" : this.stim.target1,
          "competitor1" : this.stim.competitor1,
          "target_object1" : this.stim.target_object1,
          "target_figure1" : this.stim.target_figure1,
          "determiner1" : this.stim.determiner1,
          "object1" : this.stim.object1,
          "instruction1" : this.stim.instruction1,
          "prime" : this.stim.prime,
          "correctAns1"  : this.stim.correctAns1,
          "correctAns2" : this.stim.correctAns2,
          "response" : exp.selection,
          "response_time" : exp.timer,
          "slide_number" : exp.phase,
        });
      }

  });

  slides.afterpractice = slide({
    name : "afterpractice",
    button : function() {
      exp.go(); //use exp.go() if and only if there is no "present" data.
    }
  });

  slides.trial = slide({
    name : "trial",
    present: exp.stims_shuffled, //every element in exp.stims is passed to present_handle one by one as 'stim'
    start: function(){

    },
    present_handle : function(stim) {
      //aud.pause();
      exp.selection = 0;
      exp.timer = 0;
      exp.trial_start = Date.now();
      console.log("timer:"+(Date.now()-exp.trial_start))

      exp.tlist = [];
      exp.xlist = [];
      exp.ylist = [];

      $(".err").hide();
      $(".grid-container").hide();
      $(".loader").show();

      this.stim = stim; // store this information in the slide so you can record it later
      exp.display_imgs(this.stim); // display images in the grid

      // audio stuff
      var aud = document.getElementById("stim");
      console.log(stim.Prime);
      aud.src = "audio/"+stim.Prime+".wav";
      aud.load();
        aud.addEventListener('canplaythrough', ()=> {
            setTimeout(function(){
                $(".loader").hide();
                $(".grid-container").show();
                var img = document.querySelector('img')
                aud.play();
                webgazer.resume();
                console.log("loaded audio");
                console.log("All Images loaded !")
            }, 1000);


        }, false);

      webgazer.setGazeListener(function(data, elapsedTime) {
        if (data == null) {
          return;
        }
        var xprediction = data.x; //these x coordinates are relative to the viewport
        var yprediction = data.y; //these y coordinates are relative to the viewport
        exp.tlist.push(elapsedTime);
        exp.xlist.push(xprediction);
        exp.ylist.push(yprediction);
      });

      $(".loc").bind("click",function(e){
        e.preventDefault();
        exp.selection = $(this).data().loc
        exp.timer = (Date.now()-exp.trial_start)
        $(".loc").unbind('click')
        _s.button();
      });
    },

    button : function() {
      webgazer.pause();
      console.log("Selection: ",exp.selection);
      console.log("Timer: ",exp.timer);
      this.log_responses();
      _stream.apply(this); /* use _stream.apply(this); if and only if there is
      "present" data. (and only *after* responses are logged) */

    },
    log_responses : function() {
      exp.data_trials.push({
          "displayID" : this.stim.displayID,
          "setting" : this.stim.setting,
          "figure" : this.stim.figure,
          "display_type" : this.stim.display_type,
          "location1" : this.stim.location1,
          "location2" : this.stim.location2,
          "location3" : this.stim.location3,
          "location4" : this.stim.location4,
          "location5" : this.stim.location5,
          "location6" : this.stim.location6,
          "location7" : this.stim.location7,
          "location8" : this.stim.location8,
          "location9" : this.stim.location9,
          "location10" : this.stim.location10,
          "Prime" : this.stim.Prime,
          "target1" : this.stim.target1,
          "target2" : this.stim.target2,
          "competitor1" : this.stim.competitor1,
          "competitor2" : this.stim.competitor2,
          "condition" : this.stim.condition,
          "determiner" : this.stim.determiner,
          "size" : this.stim.size,
          "ExpFiller" : this.stim.ExpFiller,
          "correctAns1" : this.stim.correctAns1,
          "correctAns2" : this.stim.correctAns2,
          "list" : this.stim.list,
          "target_object3" :this.stim.target_object3,
          "target_figure3" :this.stim.target_figure3,
          "instruction3" : this.stim.instruction3,
          "response_time" : exp.timer,
          "response" : exp.selection,
          'time' : exp.tlist,
          'x' : exp.xlist,
          'y': exp.ylist,
          "slide_number" : exp.phase,
      });
      }
  });

  slides.subj_info =  slide({
    name : "subj_info",
    submit : function(e){
      lg = $("#language").val();
      age = $("#participantage").val();
      gend = $("#gender").val();
      eyesight = $("#eyesight").val();
      eyesight_task = $("#eyesight_task").val();
      if(lg == '' || age == '' || gend == '' || eyesight == '-1' || eyesight_task == '-1'){
        $(".err_part2").show();
      } else {
        $(".err_part2").hide();
        exp.subj_data = {
          language : $("#language").val(),
          age : $("#participantage").val(),
          gender : $("#gender").val(),
          eyesight : $("#eyesight").val(),
          eyesight_task : $("#eyesight_task").val(),
          comments : $("#comments").val(),
          accuracy : precision_measurement,
          previous_accuracy_attempts : exp.accuracy_attempts,
          time_in_minutes : (Date.now() - exp.startT)/60000
        };
        webgazer.pause();
        exp.go();
      }
    }
  });

  slides.thanks = slide({
    name : "thanks",
    start : function() {
      webgazer.stopVideo();
      exp.data= {
        "trials" : exp.data_trials,
        "system" : exp.system,
        "subject_information" : exp.subj_data,
      };
      console.log(turk);
      setTimeout(function() {turk.submit(exp.data);}, 1000);
    }
  });

  return slides;
}

/// init ///
function init_explogic() {

  //Experiment constants
  PRECISION_CUTOFF = 50;
  NUM_COLS = 2;
  MIN_WINDOW_WIDTH = 1280; //TODO
  BUTTON_HEIGHT = 30;
  CTE_BUTTON_WIDTH = 100;
  NXT_BUTTON_WIDTH = 50;
  IMG_HEIGHT = 500;
  IMG_WIDTH = 167;

  //Initialize data frames
  exp.accuracy_attempts = [];
  exp.data_trials = [];
  exp.tlist = []; //TESTING
  exp.xlist = [];
  exp.ylist = [];
  exp.clicked = null
  //exp.descriptors = _.shuffle(descriptors)   // shuffle list of descriptors
  exp.stims_shuffled = _.shuffle(exp.stims);

  //create experiment order/make slides     //add practice slide
  exp.structure=["i0",  "training_and_calibration", "sound_test", "practice", "afterpractice", "trial",  "subj_info", "thanks"];
  exp.slides = make_slides(exp);
  exp.nQs = utils.get_exp_length();

  exp.system = {
    Browser : BrowserDetect.browser,
    OS : BrowserDetect.OS,
    screenH: screen.height,
    screenW: screen.width,
    windowH: window.innerHeight,
    windowW: window.innerWidth,
    imageH: IMG_HEIGHT,
    imageW: IMG_WIDTH
  };

  // experiment function
  exp.display_imgs = function(stim){
    var loc1_img = '<img src="images/'+stim.location1+'.png"style="height:100px" class="left">';
    $(".loc1").html(loc1_img);
    var loc2_img = '<img src="images/'+stim.location2+'.png" style="height:100px" class="center">';
    $(".loc2").html(loc2_img);
    var loc3_img = '<img src="images/'+stim.location3+'.png" style="height:100px" class="center">';
    $(".loc3").html(loc3_img);
    var loc4_img = '<img src="images/'+stim.location4+'.png" style="height:100px" class="center">';
    $(".loc4").html(loc4_img);
    var loc5_img = '<img src="images/'+stim.location5+'.png" style="height:90px" class="right">';
    $(".loc5").html(loc5_img);
    var loc6_img = '<img src="images/'+stim.location6+'.png" style="height:90px" class="left">';
    $(".loc6").html(loc6_img);
    var boy = '<img src="images/boy.png" class="kid-img" align="buttom">';
    var girl = '<img src="images/girl.png" class="kid-img" align="buttom">';
    $(".loc7").html(boy);
    $(".loc8").html(boy);
    $(".loc9").html(girl);
    $(".loc10").html(girl);
  };

  // EXPERIMENT RUN
  $('.slide').hide(); //hide everything

  //make sure turkers have accepted HIT (or you're not in mturk)
  $("#windowsize_err").hide();
  $("#start_button").click(function() {
    if (turk.previewMode) {
      $("#mustaccept").show();
    } else {
      $("#start_button").click(function() {$("#mustaccept").show();});
      if (window.innerWidth >=  MIN_WINDOW_WIDTH){
        exp.startT = Date.now();
        exp.go();
        // set up canvas for webgazer
        ClearCanvas();
        helpModalShow();
        $("#start_calibration").hide();
        $("#begin_task").hide();
      }
      else {
          $("#windowsize_err").show();
      }
    }
  });

  $(".response_button").click(function(){
    var val = $(this).val();
    _s.continue_button(val);
  });
  exp.go(); //show first slide
}
