export interface WorkExperience {
  title: string
  company: string
  period: string
  startDate: string
  endDate: string | 'present'
  description: string[]
  technologies?: string[]
}

export interface TechnicalSkill {
  category: string
  skills: string[]
}

export interface SideProject {
  title: string
  description: string
  period: string
  startDate: string
  endDate: string | 'present'
  highlights: string[]
  technologies?: string[]
  github?: string
  demo?: string
  image?: string
}

export interface Resume {
  personalInfo: {
    name: string
    title: string
    email: string
    location?: string
    bio: string
    avatar?: string
  }
  workExperience: WorkExperience[]
  sideProjects: SideProject[]
  technicalSkills: TechnicalSkill[]
  socialLinks?: {
    github?: string
    linkedin?: string
    email?: string
    twitter?: string
  }
}
