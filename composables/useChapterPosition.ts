export function useChapterPosition(ids: () => string[]) {
  const active = ref('');
  let frame = 0;
  const update = () => {
    frame = 0;
    const available = ids();
    active.value = available.reduce((current, id) => {
      const element = document.getElementById(id);
      if (!element) return current;
      const threshold = Math.max(120, parseFloat(getComputedStyle(element).scrollMarginTop) || 0) + 2;
      return element.getBoundingClientRect().top <= threshold ? id : current;
    }, available[0] ?? '');
  };
  const request = () => { if (!frame) frame = requestAnimationFrame(update); };
  onMounted(() => {
    update();
    window.addEventListener('scroll', request, {passive:true});
    window.addEventListener('resize', request);
  });
  onBeforeUnmount(() => {
    cancelAnimationFrame(frame);
    window.removeEventListener('scroll', request);
    window.removeEventListener('resize', request);
  });
  return active;
}
