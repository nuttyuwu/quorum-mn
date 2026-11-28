const hero = document.querySelector('.hero');
const workflow = hero.querySelector('.workflow');
const replay = workflow.querySelector('.replay');

function playFlow() {
  hero.classList.remove('running');
  // Flush the previous sequence so a replay also works mid-animation.
  void workflow.offsetWidth;
  hero.classList.add('running');
}

replay.hidden = false;
replay.addEventListener('click', playFlow);
hero.querySelector('a[href="#workflow"]').addEventListener('click', (event) => {
  event.preventDefault();
  workflow.focus({ preventScroll: true });
  workflow.scrollIntoView({ block: 'nearest' });
  playFlow();
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      observer.disconnect();
      playFlow();
    }
  }, { threshold: 0.35 });
  observer.observe(workflow);
} else {
  playFlow();
}
