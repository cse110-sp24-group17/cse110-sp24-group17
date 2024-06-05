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
});

