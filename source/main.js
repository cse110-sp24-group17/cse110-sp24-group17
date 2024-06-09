import App from './modules/models/app.js';

document.addEventListener('DOMContentLoaded', () => {
  const card1 = document.getElementById('JournalView');
  const card2 = document.getElementById('ProjectView');
  let isDragging = false;
  let startX, currentX;
  const threshold = 100;
  let activeCard = card1;
  let hiddenCard = card2;

  hiddenCard.style.zIndex = '10';
  activeCard.style.zIndex = '20';
  setTimeout(() => {
    hiddenCard.style.transform = 'translateX(30px) translateY(20px) scale(0.95) rotateZ(1deg)';
  }, 100);

  function activateSwiper() {
    activeCard.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
  }

  function deactivateSwiper() {
    activeCard.removeEventListener('mousedown', onDragStart);
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    isDragging = false;
  }

    function swapCards() {
      [activeCard, hiddenCard] = [hiddenCard, activeCard];
      hiddenCard.style.transform = 'translateX(30px) translateY(20px) scale(0.95) rotateZ(1deg)';
      activeCard.style.transform = 'translateX(0px) scale(1.0) rotateZ(0deg)';

      activeCard.addEventListener('mousedown', onDragStart);
      document.addEventListener('mousemove', onDragMove);
      document.addEventListener('mouseup', onDragEnd);
    }

    function onDragStart(e) {
      isDragging = true;
      startX = e.pageX;
      activeCard.style.cursor = 'grabbing';
      hiddenCard.classList.remove('hidden');
    }

    function onDragMove(e) {
      if (e.clientY === 0) return
      if (!isDragging) return;
      currentX = e.pageX - startX;
      if (Math.abs(currentX) < 10) return;
      const rotation = currentX / 10;
      const scale = 1 - Math.abs(currentX) / 1000;
      activeCard.style.transform = `translateX(${currentX}px) rotateZ(${rotation}deg) scale(${scale})`;
      hiddenCard.style.transform = `translateX(${30+0.2*scale*30}px) translateY(20px) scale(${0.95 + (Math.abs(currentX) / 1000) * 0.2}) rotateZ(${1-(rotation/10)}deg)`;
    }

    function onDragEnd(e) {
      if (!isDragging) return;
      isDragging = false;
      activeCard.style.cursor = 'grab';
      currentX = e.pageX - startX;
      if (Math.abs(currentX) > threshold) {
        activeCard.style.transform = `translateX(${Math.sign(currentX) * 150}px) rotateZ(${Math.sign(currentX) * 10}deg) scale(0.5)`;
        activeCard.removeEventListener('mousedown', onDragStart);
        document.removeEventListener('mousemove', onDragMove);
        document.removeEventListener('mouseup', onDragEnd);
        activeCard.style.zIndex = '10';
        hiddenCard.style.zIndex = '20';
        setTimeout(swapCards, 200);
        if (!isMuted) {
          const cardShuffleSound = new Audio('assets/soundEffects/cardShuffle.mp3');
          cardShuffleSound.volume = defaultVolume;
          cardShuffleSound.play();
        }
      } else {
        activeCard.style.transform = 'translateX(0px) rotateY(0deg) scale(1)';
        hiddenCard.style.transform = 'translateX(30px) translateY(20px) scale(0.95) rotateZ(1deg)';
      }
    }
  activateSwiper();

  const ele = document.getElementById('file-explorer');
  ele.onFileMouseEnter = () => {
    deactivateSwiper();
  };
  ele.onFileMouseLeave = () => {
    activateSwiper();
  };
  ele.onDeleteFile = (file) => {
    deactivateSwiper();
    activateSwiper();
  };

  const markdown_editor = document.getElementById('markdown-editor');
  markdown_editor.onSave = () => {
    ele.render();
  }
  ele.onFileOpen = (file) => {
    App.openFile(file.get_path());
  };
  App.addEventListener('tab-open', (e) => {
    markdown_editor.filename = e.detail.path;
  });

  function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  const calendar = document.getElementById('calendar');
  calendar.onDatePicked = (date) => {
    if (!App.get_file_store().get_file("journals")) {
      App.get_file_store().create_directory("journals");
    }
    const filename = "journals/"+formatDate(date)+ '.md';
    App.openFile(filename);
  }

  const textarea = document.getElementById("scratchPadInput");
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
      file.set_content(content);
      App.get_file_store().sync();
    }
  });

  function createTabElement(name) { 
    const res = document.createElement('div');
    res.classList.add('sampleTab');
    res.id = 'tab1';
    res.innerHTML = `
      <p class="tabTitles">${name.split('/').pop()}</p>
      <svg class="closeIcon" width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 2L9 9M9 2L2 9" stroke="black" stroke-width="3" stroke-linecap="round"/>
      </svg>
    `;
    return res;
  }

  const tabContainer = document.getElementById("tabContainer");
  function rerenderTabs() {
    tabContainer.innerHTML = '';
    App.getCurrentTabs().forEach((path) => {
      const tab = createTabElement(path);
      tab.addEventListener('click', () => {
        App.openFile(path);
      });
      tab.querySelector('.closeIcon').addEventListener('click', (e) => {
        e.stopPropagation();
        App.closeFile(path);
        rerenderTabs();
      });
      tabContainer.appendChild(tab);
    });
  }

  App.addEventListener('tab-open', (e) => {
    rerenderTabs();
  });
  
  let isMuted = false;
  const defaultVolume = 0.6;
  function toggleMute() {
    isMuted = !isMuted;
    const muteButton = document.getElementById('audioIcon');
    if(isMuted) {
      muteButton.src = 'assets/mute.svg';
    } else {
      muteButton.src = 'assets/audioOn.svg';
    }
  }
  document.getElementById('audioIcon').addEventListener('click', toggleMute);

  const colorIcons = document.getElementsByClassName("colorIcons");
  for (let i = 0; i < colorIcons.length; i++) {
    colorIcons[i].addEventListener("mouseover", function() {
      this.style.cursor = "pointer";
    });
  }
});

document.getElementById("default").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#E3DAC9');
  document.documentElement.style.setProperty('--accent-color', '#8B4513');
});
document.getElementById("darkMode").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#606060');
  document.documentElement.style.setProperty('--accent-color', '#606060');
});
document.getElementById("yellow").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#FFD15A');
  document.documentElement.style.setProperty('--accent-color', '#FFA800');
});
document.getElementById("blue").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#5E94FF');
  document.documentElement.style.setProperty('--accent-color', '#5E94FF');
});
document.getElementById("purple").addEventListener("click", function() {
  document.documentElement.style.setProperty('--background-color', '#b86fdc');
  document.documentElement.style.setProperty('--accent-color', '#b86fdc');

});
