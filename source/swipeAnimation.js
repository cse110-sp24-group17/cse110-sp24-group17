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
  const defaultVolume = 0.4;
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
      cardShuffleSound.volume = defaultVolume;
      cardShuffleSound.play();
    }
  });
});
document.getElementById("default").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#FEF9EC');
});
document.getElementById("darkMode").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#606060');
});
document.getElementById("yellow").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#FFD15A');
});
document.getElementById("blue").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#5E94FF');
});
document.getElementById("purple").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#A695B1');

});

const colorIcons = document.getElementsByClassName("colorIcons");
for (let i = 0; i < colorIcons.length; i++) {
  colorIcons[i].addEventListener("mouseover", function() {
    this.style.cursor = "pointer";
  });
}
