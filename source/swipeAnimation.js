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
});
