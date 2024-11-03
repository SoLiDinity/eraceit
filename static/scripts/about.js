document.addEventListener('DOMContentLoaded', () => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      console.log(entry);

      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  });

  const hidden = document.querySelectorAll('.hidden');
  hidden.forEach((el) => {
    observer.observe(el);
  });
});