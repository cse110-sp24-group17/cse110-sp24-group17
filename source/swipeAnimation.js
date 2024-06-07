import App from './modules/models/app.js';

window.addEventListener('load', function () {
  const swiper = new Swiper('.Slider-container', {
    effect: 'cards',
    grabCursor: true,
    centerdSlides: true,
    loop: true,
    longSwipes: true,
    speed: 700,
  });
  
  const ele = document.getElementById('file-explorer');
  ele.onFileMouseEnter = () => {
    swiper.disable();
  };
  ele.onFileMouseLeave = () => {
    swiper.enable();
  };

  

  const markdown_editor = document.getElementById('markdown-editor');
  markdown_editor.onSave = () => {
    ele.render();
  }
  ele.onFileOpen = (file) => {
    markdown_editor.filename = file.get_path();
  };

  const calendar = document.getElementById('calendar');
  calendar.onDatePicked = (date) => {
    if (!App.get_file_store().get_file("journals")) {
      App.get_file_store().create_directory("journals");
    }
    const filename = "journals/"+date.toDateString() + '.md';
    markdown_editor.filename = filename;
  }

  const textarea = this.document.getElementById("scratchPadInput");
  let file = App.get_file_store().get_file("scratch.txt");
  if (file) {
    textarea.value = file.get_content();
  }
  textarea.addEventListener("input", () => {
    const content = textarea.value;
    if (content) {
      let file = App.get_file_store().get_file("scratch.txt");
      if (!file) {
        file = App.get_file_store().create_file("scratch.txt");
      }
      textarea.addEventListener("input", () => {
        const content = textarea.value;
        if (content) {
          let file = App.get_file_store().get_file("scratch.txt");
          if (!file) {
            file = App.get_file_store().create_file("scratch.txt");
          }
          file.set_content(content);
          App.get_file_store().sync();
        }
      });
    }
  });


  /* Sound effects Logic */
  let isMuted = false;
  console.log('isMuted', isMuted);
  // Function to toggle mute state
  function toggleMute() {
    isMuted = !isMuted;
    const muteButton = document.getElementById('audioIcon');
    if(isMuted) {
        muteButton.src = 'assets/mute.svg';
    } else {
        muteButton.src = 'assets/audioOn.svg';
    }
    console.log('isMuted', isMuted);

  }
  document.getElementById('audioIcon').addEventListener('click', toggleMute);
  
  swiper.on('slideChangeTransitionStart', function () {
    if (!isMuted) {
        const cardShuffleSound = new Audio('assets/soundEffects/cardShuffle.mp3');
        cardShuffleSound.volume = 0.40;
        cardShuffleSound.play();
    }
});
  
    /* // General Click SoundEffect function
    function playSoundEffect(audioFilePath) {
      const clickSound = new Audio(audioFilePath);
      clickSound.play();
    } */
});
