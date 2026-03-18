import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

const messages = {
  'en-US': {
    app: { title: 'Interview Challenge Archive' },
    home: {
      loadingMore: 'Loading more projects',
      emptySearchTitle: 'Nothing found for this search',
      emptySearchDescriptionMarkdown: 'Try a different query in the [search tab]({openSearchLink}) or [clear search]({clearSearchLink}).'
    },
    maintenance: {
      eyebrow: 'Maintenance mode',
      title: 'We are polishing the experience',
      description: 'The archive is temporarily unavailable while we ship UI refinements and feature updates. Everything should be back online shortly.',
      preview: {
        kicker: 'Archive update',
        title: 'Fresh tiles. Same vault.',
        description: 'Layout polish and maintenance handling are being shipped without changing the overall feel.',
        tiles: {
          curated: {
            title: 'Curated entries',
            subtitle: 'Poster-style browsing stays intact.'
          },
          search: {
            title: 'Search + labels',
            subtitle: 'The archive structure remains familiar.'
          }
        }
      }
    },
    notfound: {
      eyebrow: 'Page not found',
      description: 'The page you are looking for does not exist or has been moved. Return to the homepage to continue browsing.',
      action: 'Go Home'
    },
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
      submissions: {
        label: 'Submissions',
        title: 'Submissions',
        description: 'The table gives you a quick view of what is already shared and what still needs an update before anyone reviews it. Use this space to keep each challenge entry clear over time: start by submitting one repository, then return whenever you want to add progress, feedback, or context so your work stays understandable and easy to follow.',
        actions: {
          submit: 'Submit',
          update: 'Update'
        },
        table: {
          columns: {
            repo: 'Repo',
            pullRequest: 'Pull request',
            update: 'Actions'
          },
          loading: 'Loading submitted repositories...',
          empty: 'No submitted repositories were found yet.',
          noPullRequest: 'Not available'
        },
        status: {
          loaded: 'Loaded {count} submitted repositories.'
        },
        dialog: {
          title: {
            submit: 'Submit repository',
            update: 'Update repository'
          },
          steps: {
            repository: 'Repository',
            details: 'Details'
          },
          fields: {
            organization: 'Organization',
            repository: 'Repository'
          },
          hints: {
            organization: 'Select an organization where you are an owner.',
            repository: 'Select one of your public repositories.'
          },
          empty: {
            organizations: 'No owned organizations are available for this account.',
            repositories: 'No public repositories were found for the selected organization.'
          },
          nextStepPlaceholder: 'Next wizard step is not implemented yet.',
          actions: {
            cancel: 'Cancel',
            next: 'Next',
            back: 'Back',
            close: 'Close'
          }
        },
        errors: {
          rateLimited: 'GitHub API rate limit reached. Connect GitHub and try again later.',
          loadFailed: 'Failed to load submissions from GitHub.'
        }
      },
      login: {
        label: 'Login',
        title: 'Login to your account',
        description: 'Connect GitHub or LinkedIn to keep your archive session in the current browser tab.',
        helper: 'OAuth opens in a secure popup and stores your session for this tab only.',
        actions: {
          loginWith: 'Login with {provider}'
        },
        status: {
          connected: 'Connected with {provider}.'
        },
        errors: {
          blocked: 'The login popup was blocked. Allow popups and try again.',
          cancelled: 'The login flow was closed before it finished.',
          failed: 'Login failed. Please try again.'
        },
        session: {
          connectedAs: 'Signed in for this tab',
          provider: 'Provider: {provider}',
          tokenStored: 'Session token stored in the tab session.'
        },
        logout: 'Logout'
      },
      account: {
        label: 'Account',
        title: 'Account',
        description: 'Manage connected providers and switch account sessions from one place.',
        connectedAccounts: 'Connected accounts',
        logout: 'Logout',
        unknownProvider: 'Unknown provider',
        actions: {
          connect: 'Connect',
          disconnect: 'Disconnect'
        },
        rows: {
          connected: 'Connected',
          expired: 'Session expired',
          notConnected: 'Not connected'
        },
        status: {
          connected: 'Connected with {provider}.',
          disconnected: 'Disconnected {provider}.'
        }
      },
      about: {
        label: 'About', title: 'About Interview Challenge Archive',
        description: "Interview Challenge Archive is a public collection of take-home interview tasks, designed to make them discoverable and searchable on {github}. Candidates share what companies asked for, what they delivered, and what happened after the deadline, so this work does not disappear into private chats or forgotten repositories.\n\nThe archive is especially useful for people who are just starting out or have not yet gone through many interview processes, as it provides concrete, real-world examples of what to expect and how others approached similar tasks. It is also easy to reference alongside professional profiles on {linkedin}. Using AI during these assignments is acceptable, but the shared outcomes still reflect individual judgment, trade-offs, and execution.\n\nThe only requirement for inclusion is that the submission is made by the candidate, includes additional context, and is stored in a public repository.\n\nThe project started before AI coding assistants were something you could rely on every day. At the time, {primaryAuthor} was not thinking about monetization - this was more of a personal challenge to see if a product like this could run almost entirely on GitHub infrastructure, even though it would have been simpler to build it on a more traditional setup. Finding time to actually finish it was not easy, so progress was slow. Early on, the design took inspiration from {multiverse}, but it never stayed a direct copy. The project only really came together after adopting vibe coding, which finally made it possible to turn it into a working release. Instead of copying the original theme, the interface was rebuilt piece by piece by asking AI tools to recreate specific ideas and elements, which is why it looks similar in spirit but different in execution. This release also moved forward much faster, helped by {aiTools}.",
        details: 'Use the bottom navigation to move between dedicated search, submission, login, and information pages.',
        sections: {
          socialNetworks: 'Social networks'
        }
      }
    }
  },
  'lt-LT': {
    app: { title: 'Interview Challenge Archive' },
    maintenance: {
      eyebrow: 'Techninė priežiūra',
      title: 'Tobuliname naudojimo patirtį',
      description: 'Saugykla laikinai nepasiekiama, kol diegiame dizaino patobulinimus ir funkcinius atnaujinimus. Netrukus viskas turėtų vėl veikti.',
      preview: {
        kicker: 'Saugyklos atnaujinimas',
        title: 'Atnaujintos kortelės. Ta pati saugykla.',
        description: 'Tvarkome išdėstymą ir priežiūros logiką nekeisdami bendro produkto jausmo.',
        tiles: {
          curated: {
            title: 'Atrinkti įrašai',
            subtitle: 'Poster tipo naršymas išlieka toks pats.'
          },
          search: {
            title: 'Paieška + žymos',
            subtitle: 'Saugyklos struktūra lieka pažįstama.'
          }
        }
      }
    }
  }
}

function createTestI18n (locale = 'en-US') {
  return createI18n({
    legacy: false,
    locale,
    fallbackLocale: 'en-US',
    messages
  })
}

export function mountWithApp (component, options = {}) {
  const { pinia = createPinia(), global = {}, locale = 'en-US', ...mountOptions } = options

  return mount(component, {
    ...mountOptions,
    global: {
      ...global,
      plugins: [pinia, createTestI18n(locale), ...(global.plugins ?? [])]
    }
  })
}
