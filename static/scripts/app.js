// import { showAlertPopUp } from './utils/showAlertPopup.js'

document.addEventListener('DOMContentLoaded', () => {
  const socket = io();

  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const fileNames = document.getElementById('fileNames');
  const removeFile = document.getElementById('removeFile');
  const submitBtn = document.getElementById('submitBtn');
  const uploadIcon = document.getElementById('uploadIcon');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('drawer');
  const xdrawer = document.getElementById('x-drawer');
  const popup = document.getElementById('popup');

  const dropEvents = ['dragenter', 'dragover', 'dragleave', 'drop'];
  const imageTypes = ['image/png', 'image/jpg', 'image/jpeg'];

  burger.addEventListener('click', () => {
    if (drawer.classList.contains('hide-small')) {
      drawer.classList.remove('hide-small');
    }
  });

  xdrawer.addEventListener('click', () => {
    if (!drawer.classList.contains('hide-small')) {
      drawer.classList.add('hide-small');
    }
  });

  const showSpinner = () => {
    const spinner = document.getElementById('loadingSpinner');
    spinner.classList.remove('hidden');
  };

  const hideIcon = () => {
    uploadIcon.classList.add('hidden');
  };

  const triggerPopup = (popup) => {
    popup.style.opacity = '1';

    setTimeout(() => {
      popup.style.opacity = '0';
    }, 5000);
  };

  socket.on('processing_status', (data) => {
    hideIcon();
    showSpinner();

    if (data.status === 'Processing completed') {
      setTimeout(() => {
        document.getElementById('loadingSpinner').classList.add('hidden');
        uploadIcon.classList.remove('hidden');
      }, 500);
    }
  });

  dropEvents.forEach((eventName) => {
    dropZone.addEventListener(eventName, (e) => e.preventDefault());
  });

  dropZone.addEventListener('dragover', () => dropZone.classList.add('dragover'));

  dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));

  dropZone.addEventListener('drop', (event) => {
    dropZone.classList.remove('dragover');

    const files = event.dataTransfer.files;

    if (files.length) {
      if (!imageTypes.includes(files[0].type)) {
        triggerPopup(popup);
        return;
      }

      fileInput.files = files;
      fileNames.textContent = `File dipilih: ${files[0].name}`;

      if (dropZone.classList.contains('border-dashed')) {
        dropZone.classList.remove('border-dashed');
        dropZone.classList.add('border-solid');
      }

      if (!uploadIcon.classList.contains('glow')) {
        uploadIcon.classList.add('glow');
      }

      if (removeFile.disabled && submitBtn.disabled) {
        removeFile.disabled = false;
        submitBtn.disabled = false;

        if (removeFile.classList.contains('disabled') && submitBtn.classList.contains('disabled')) {
          removeFile.classList.remove('disabled');
          submitBtn.classList.remove('disabled');
        }
      }
    }
  });

  dropZone.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) {
      if (!imageTypes.includes(fileInput.files[0].type)) {
        triggerPopup(popup);
        return;
      }

      fileNames.textContent = `File dipilih: ${fileInput.files[0].name}`;

      if (dropZone.classList.contains('border-dashed')) {
        dropZone.classList.remove('border-dashed');
        dropZone.classList.add('border-solid');
      }

      if (!uploadIcon.classList.contains('glow')) {
        uploadIcon.classList.add('glow');
      }

      if (removeFile.disabled && submitBtn.disabled) {
        removeFile.disabled = false;
        submitBtn.disabled = false;

        if (removeFile.classList.contains('disabled') && submitBtn.classList.contains('disabled')) {
          removeFile.classList.remove('disabled');
          submitBtn.classList.remove('disabled');
        }
      }
    }
  });

  removeFile.addEventListener('click', (e) => {
    e.preventDefault();

    fileInput.value = '';

    fileNames.textContent = 'Tidak ada file yang dipilih!';

    if (dropZone.classList.contains('border-solid')) {
      dropZone.classList.remove('border-solid');
      dropZone.classList.add('border-dashed');
    }

    if (uploadIcon.classList.contains('glow')) {
      uploadIcon.classList.remove('glow');
    }

    if (!removeFile.disabled && !submitBtn.disabled) {
      removeFile.disabled = true;
      submitBtn.disabled = true;

      if (!removeFile.classList.contains('disabled') && !submitBtn.classList.contains('disabled')) {
        removeFile.classList.add('disabled');
        submitBtn.classList.add('disabled');
      }
    }
  });
});
