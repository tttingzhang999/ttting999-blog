import { computed } from 'vue'

/**
 * Site-wide statistics derived from real data sources:
 * - years: years of experience from earliest workExperience.startDate
 * - projectCount: total entries in useProjectsData()
 * - articleCount: helper to count blog collection results passed in by caller
 */
export const useSiteStats = () => {
  const resume = useResumeData()
  const projects = useProjectsData()

  const years = computed(() => {
    const dates = (resume.value?.workExperience ?? [])
      .map((e) => e.startDate)
      .filter((s): s is string => Boolean(s))
      .map((s) => new Date(`${s}-01`))
      .filter((d) => !isNaN(d.getTime()))
    if (!dates.length) return 0
    const earliest = Math.min(...dates.map((d) => d.getTime()))
    const yrs = (Date.now() - earliest) / (1000 * 60 * 60 * 24 * 365.25)
    return Math.max(0, Math.floor(yrs))
  })

  const projectCount = computed(() => projects.value?.length ?? 0)

  return { years, projectCount }
}
