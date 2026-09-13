import { nextTick } from 'vue';

export const useThemeTransition = () => {
  const visual = useVisualTransition();
  const toggleThemeWithTransition = async (
    _event: MouseEvent,
    colorMode: { value: string; preference: string },
  ) => visual.run(async () => {
    colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark';
    await nextTick();
  });
  return { toggleThemeWithTransition };
};
