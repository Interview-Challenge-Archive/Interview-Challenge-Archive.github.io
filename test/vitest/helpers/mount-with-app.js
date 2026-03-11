import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

const messages = {
  'en-US': {
    app: { title: 'Interview Challenge Archive' },
    home: { loadingMore: 'Loading more projects' },
    dock: {
      search: {
        label: 'Search', title: 'Search the vault',
        description: 'Look through saved interview notes, coding tests, and company-specific tasks.',
        queryFieldLabel: 'Query', queryHint: 'Search in project titles and descriptions',
        labelsFieldLabel: 'Labels', labelsHint: 'Choose one or more labels',
        resetAction: 'Reset', action: 'Search'
      },
      submit: {
        label: 'Submit', title: 'Submit a new entry',
        description: 'Document the full story behind a repo, assignment, or interview project so the task, stack, and outcome are easy to understand.',
        helper: 'Capture the project basics, the technical brief, how the company reacted, and whether it led to an offer.',
        sections: {
          basics: 'Project basics', technical: 'Technical scope',
          process: 'Process & outcome', notes: 'Detailed notes'
        },
        fields: {
          entryTitle: {
            label: 'Entry title',
            hint: 'Give the submission a short, searchable name.'
          },
          company: {
            label: 'Company',
            hint: 'Who assigned or inspired the project?'
          },
          role: {
            label: 'Role / position',
            hint: 'Which role was this project connected to?'
          },
          sourceUrl: {
            label: 'Source URL',
            hint: 'Link to the repo, task brief, or job post if you have one.'
          },
          stage: {
            label: 'Hiring stage',
            hint: 'Where did this task appear in the process?'
          },
          languages: {
            label: 'Languages',
            hint: 'Add one or more languages used in the project.'
          },
          stack: {
            label: 'Frameworks, tools, and libraries',
            hint: 'Capture the main stack, services, or tooling.'
          },
          taskType: {
            label: 'Task type',
            hint: 'What kind of assignment was it?'
          },
          difficulty: {
            label: 'Difficulty',
            hint: 'Record how demanding the work felt.'
          },
          timeLimit: {
            label: 'Time limit or expected effort',
            hint: 'Note any deadline, timebox, or estimated hours.'
          },
          submittedAt: {
            label: 'Submission date',
            hint: 'When did you send or finish the work?'
          },
          reaction: {
            label: 'Company reaction',
            hint: 'How did the company respond after reviewing it?'
          },
          taskSummary: {
            label: 'Task summary',
            hint: 'Describe the assignment, feature request, or challenge in plain language.'
          },
          deliverables: {
            label: 'Deliverables and constraints',
            hint: 'List required features, expectations, or restrictions.'
          },
          feedback: {
            label: 'Feedback received',
            hint: 'Save recruiter or interviewer feedback, even if it was brief.'
          },
          lessons: {
            label: 'Lessons learned',
            hint: 'What would you improve, reuse, or watch out for next time?'
          },
          notes: {
            label: 'Extra notes',
            hint: 'Add links, follow-up questions, compensation notes, or anything else useful.'
          }
        },
        flags: {
          submitted: { label: 'I submitted work back to the company' },
          publicRepo: { label: 'The repository can be shared publicly' },
          nda: { label: 'NDA or confidentiality limitations apply' }
        },
        offer: {
          label: 'Job offer outcome',
          hint: 'Did this process lead to an offer?',
          options: {
            pending: 'Still in progress',
            yes: 'Yes, I got an offer',
            no: 'No offer',
            withdrawn: 'I withdrew from the process',
            notApplicable: 'Not a hiring process'
          }
        },
        stageOptions: {
          applied: 'Application / screening',
          recruiterScreen: 'Recruiter screen',
          takeHome: 'Take-home assignment',
          technicalInterview: 'Technical interview',
          finalRound: 'Final round / onsite',
          selfDirected: 'Self-initiated or research'
        },
        taskTypeOptions: {
          takeHome: 'Take-home build',
          liveCoding: 'Live coding',
          systemDesign: 'System design',
          bugFix: 'Bug fix',
          featureBuild: 'Feature build',
          research: 'Research or analysis'
        },
        difficultyOptions: {
          lightweight: 'Lightweight',
          moderate: 'Moderate',
          demanding: 'Demanding'
        },
        reactionOptions: {
          noResponse: 'No response yet',
          followUp: 'Follow-up questions',
          nextRound: 'Advanced to the next round',
          positiveFeedback: 'Positive feedback only',
          rejected: 'Rejected after review'
        },
        action: 'Prepare submission'
      },
      login: {
        label: 'Login', title: 'Login to your account',
        description: 'Access saved submissions, favorites, and your personal activity.',
        email: 'Email', password: 'Password', action: 'Login'
      },
      about: {
        label: 'About', title: 'About Interview Challenge Archive',
        description: 'Interview Challenge Archive is a place to collect, organize, and review interview and hiring task material.',
        details: 'Use the bottom navigation to move between dedicated search, submission, login, and information pages.'
      }
    }
  }
}

function createTestI18n () {
  return createI18n({
    legacy: false,
    locale: 'en-US',
    fallbackLocale: 'en-US',
    messages
  })
}

export function mountWithApp (component, options = {}) {
  const { pinia = createPinia(), global = {}, ...mountOptions } = options

  return mount(component, {
    ...mountOptions,
    global: {
      ...global,
      plugins: [pinia, createTestI18n(), ...(global.plugins ?? [])]
    }
  })
}
