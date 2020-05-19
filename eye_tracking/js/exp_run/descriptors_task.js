

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

  // PRACTICE SLIDE

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
      exp.counter = 0;

    },
    present_handle : function(stim) {
      exp.selection_array=[];
      exp.time_array=[];
      exp.trial_start = Date.now();
      console.log("time:"+(Date.now()-exp.trial_start))

      $(".err").hide();
      $(".grid-container").show();
    
      this.stim = stim; // store this information in the slide so you can record it later

      // var instruction = stim.instruction3;
      // words = instruction.split(" ")
      // init_instruction = words[0]+ " " + words[1] + " " + words[2] + " ..."; // click on the
      // instruction1 = words[0]+ " " + words[1] + " " + words[2] + " " + words[3] + " " + words[4] + " " + words[5] + " ..."; // click on the boy that has
      // instruction2 = words[0]+ " " + words[1] + " " + words[2] + " " + words[3] + " " + words[4] + " " + words[5]+ " " + words[6] + " " + words[7] + " " + words[8] + " ..."; // click on the boy that has two of Susan's
      // instruction3 = words[0]+ " " + words[1] + " " + words[2] + " " + words[3] + " " + words[4] + " " + words[5]+ " " + words[6] + " " + words[7] + " " + words[8] + " " + words[9] + ".";  // click on the boy that has two of Susan's pears
      init_instruction = "1";
      instruction1 = "2";
      instruction2 = "3";
      instruction3 = "4";
      const instruction_array=[instruction1,instruction2,instruction3]
      $(".instruction").html(init_instruction);

      // first index is currentTime sec
      // second index is duration in msec
      const audio_array=[[1.79,895],[2.76,1115],[4.03,810]]
      var aud = document.getElementById("stim");
      console.log(stim.Prime);
      aud.src = "audio/"+stim.Prime+".wav";
      aud.load();
      console.log("loaded audio");
      aud.currentTime = 0;
      aud.play();
      setTimeout(function(){ // calls the pause function after 1605milliseconds
          aud.pause();
      },1695);

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

      var boy = '<img src="images/boy.png" style="height:200px" align="buttom">';
      var girl = '<img src="images/girl.png" style="height:200px" align="buttom">';
      $(".loc7").html(boy);
      $(".loc8").html(boy);
      $(".loc9").html(girl);
      $(".loc10").html(girl);

      $(".loc").bind("click",function(e){
        e.preventDefault();
        if (exp.counter>2){
          exp.selection_array.push($(this).data().loc)
          exp.time_array.push(Date.now()-exp.trial_start)
          exp.counter = 0;
          $(".loc").unbind('click')
          _s.button();
        } else {
          exp.selection_array.push($(this).data().loc)
          exp.time_array.push(Date.now()-exp.trial_start)
          $(".instruction").html(instruction_array[exp.counter])
          aud.currentTime = audio_array[exp.counter][0]
          aud.play();
          setTimeout(function(){
              aud.pause();
          },audio_array[exp.counter][1]);
          exp.counter++;
        }
       });

    },

    button : function() {
      console.log("Location array => ",exp.selection_array)
      console.log("Time array => ",exp.time_array)
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
        "response_times" : exp.time_array,
        "response" : exp.selection_array,
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
  MIN_WINDOW_WIDTH = 1280;
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
  exp.descriptors = _.shuffle(descriptors)   // shuffle list of descriptors

  //create experiment order/make slides
  exp.structure=["i0",  "training_and_calibration", "sound_test", "afterpractice", "trial", "afterpractice", "subj_info", "thanks"];
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

  exp.stims_shuffled = _.shuffle(exp.stims);

  // EXPERIMENT FUNCTIONS
  // exp.display_imgs = function(){
  //   if (document.getElementById("img_table") != null){
  //     $("#img_table tr").remove();
  //   }
  //   var table = document.createElement("table");
  //   var tr = document.createElement('tr');

  //   var cellwidth = MIN_WINDOW_WIDTH/NUM_COLS
  //   $("#continue_button").offset({top: (window.innerHeight/2)-(BUTTON_HEIGHT/2), left: (window.innerWidth/2)-(CTE_BUTTON_WIDTH/2)})
  //   $("#next_button").offset({top: (window.innerHeight/2)-(BUTTON_HEIGHT/2), left: (window.innerWidth/2)-(NXT_BUTTON_WIDTH/2)})


  //   // create table with img elements on L and R side. show these for 2 seconds (as a 'preview') and then show the Continue button to play audio
  //   for (i = 0; i < NUM_COLS; i++) {
  //     var img_td = document.createElement('td');
  //     img_td.style.width = cellwidth+'px';

  //     var img_fname = img_fnames[descriptor_name][i]
  //     var img = document.createElement('img');
  //     img.src = 'static/imgs/'+img_fname+'.png';
  //     img.id = img_fname;

  //     // place images at L and R
  //     if (img.id == img_fnames[descriptor_name][0]){
  //       img.style.marginRight = (cellwidth - IMG_WIDTH)  + 'px';
  //     } else {
  //       img.style.marginLeft = (cellwidth - IMG_WIDTH)  + 'px';
  //       console.log('img.style.marginLeft = ' + img.style.marginLeft)
  //     }
  //     // show continue button after preview
  //     setTimeout(function(){
  //       $("#img_table tr").hide();
  //       $("#continue_button").offset({top: (window.innerHeight/2)-(BUTTON_HEIGHT/2), left: (window.innerWidth/2)-(CTE_BUTTON_WIDTH/2)})
  //       $("#continue_button").show(); }, 2000); // preview imgs for 2 secs

  //       // HANDLING SELECTION
  //       // highlight selection in red, pause webgazer, disaplay selection for 1s before clearing
  //       img.onclick = function(){
  //         var id = $(this).attr("id");
  //         if (document.getElementById("aud").ended & exp.endPreview == true){
  //         exp.clicked = id;
  //         $(this).css("border","2px solid red");
  //         webgazer.pause();
  //         // next button appears after 1s to continue to next trial.
  //         /** NB there's a tiny bug s.t. the first time the Next button appears, it's slightly off center vertically.
  //         in terms of analysis, this doesn't matter too much as there's always going to be enough padding around the central button area that the difference is negligble.
  //         But it's annoying, and I can't figure out why it's happening.  If you find the bug and fix it please tell me your secrets! */
  //         setTimeout(function(){
  //           $("#img_table tr").remove();
  //           $("#next_button").show(); }, 1000);
  //         }
  //       };

  //     img_td.appendChild(img);
  //     tr.appendChild(img_td);
  //   }
  //   table.setAttribute('id', 'img_table')
  //   table.appendChild(tr);
  //   document.getElementById("imgwrapper").appendChild(table);
  // };


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
