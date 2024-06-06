import App from './modules/models/app.js';

var swiper = new Swiper('.Slider-container', {
  effect: 'cards',
  grabCursor: true,
  centerdSlides: true,
  loop: true,
  longSwipes: true,
  speed: 700,
});

window.addEventListener('load', function () {
  const ele = document.getElementById('file-explorer');
  ele.onFileMouseEnter = () => {
    swiper.disable();
  };
  ele.onFileMouseLeave = () => {
    swiper.enable();
  };

  const markdown_editor = document.getElementById('markdown-editor');
  ele.onFileOpen = (file) => {
    markdown_editor.file = file;
  };

  const calendar = document.getElementById('calendar');
  calendar.onDatePicked = (date) => {
    if (!App.get_file_store().get_file("journals")) {
      App.get_file_store().create_directory("journals");
    }
    let file = App.get_file_store().get_file("journals/"+date.toDateString() + '.md');
    if (!file) {
      file = App.get_file_store().create_file("journals/"+date.toDateString() + '.md');
    }
    markdown_editor.file = file;
  }
});

