/**
 * ROLE_CONFIG — single source of truth for every role's:
 *   - display metadata (label, color, gradient, icon description)
 *   - permissions (what actions the role can perform)
 *   - visibleDocTypes (doc type filters shown in the UI)
 *   - hiddenSections (section keys that must be hidden)
 *   - navItems (sidebar links)
 *   - dashboardType (which top-level dashboard component to render)
 */
import {
  FiHome, FiUpload, FiClock, FiGitMerge,
  FiActivity, FiUsers, FiUser,
} from 'react-icons/fi';

// ─── Permission flags ───────────────────────────────────────────────────────
export const PERMISSIONS = {
  // Approval
  CAN_APPROVE:          'canApprove',
  CAN_REJECT:           'canReject',
  // Documents
  VIEW_ALL_DOCUMENTS:   'viewAllDocuments',
  VIEW_OWN_DOCUMENTS:   'viewOwnDocuments',
  DELETE_DOCUMENTS:     'deleteDocuments',
  DOWNLOAD_REPORTS:     'downloadReports',
  // Audit
  VIEW_AUDIT_LOGS:      'viewAuditLogs',
  // Compare
  VERSION_COMPARE:      'versionCompare',
  // Admin
  MANAGE_USERS:         'manageUsers',
  // Notes
  ADD_LEGAL_NOTES:      'addLegalNotes',
  REQUEST_CHANGES:      'requestChanges',
  // Reports
  GENERATE_COMPLIANCE_REPORTS: 'generateComplianceReports',
};

// ─── Document type groups ───────────────────────────────────────────────────
export const DOC_TYPE_GROUPS = {
  LEGAL: [
    'TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'NDA',
    'VENDOR_CONTRACT', 'PURCHASE_AGREEMENT',
  ],
  HR: [
    'EMPLOYMENT_CONTRACT', 'HR_POLICY', 'COMPLIANCE_POLICY',
  ],
  COMPLIANCE: [
    // all types visible
    'TERMS_OF_SERVICE', 'PRIVACY_POLICY', 'NDA',
    'VENDOR_CONTRACT', 'PURCHASE_AGREEMENT',
    'EMPLOYMENT_CONTRACT', 'HR_POLICY', 'COMPLIANCE_POLICY', 'OTHER',
  ],
};

// ─── Per-role configuration ─────────────────────────────────────────────────
export const ROLE_CONFIG = {

  ADMIN: {
    label:        'Admin',
    dashboardType: 'ADMIN',
    gradient:     'from-primary-700 to-violet-700',
    accentColor:  'primary',
    tagline:      'Full system access — manage users, view all documents, all analytics.',
    permissions: [
      PERMISSIONS.CAN_APPROVE,
      PERMISSIONS.CAN_REJECT,
      PERMISSIONS.VIEW_ALL_DOCUMENTS,
      PERMISSIONS.DELETE_DOCUMENTS,
      PERMISSIONS.DOWNLOAD_REPORTS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.VERSION_COMPARE,
      PERMISSIONS.MANAGE_USERS,
      PERMISSIONS.ADD_LEGAL_NOTES,
      PERMISSIONS.REQUEST_CHANGES,
      PERMISSIONS.GENERATE_COMPLIANCE_REPORTS,
    ],
    navItems: [
      { to: '/dashboard', icon: FiHome,     label: 'Dashboard'        },
      { to: '/upload',    icon: FiUpload,   label: 'Upload & Analyze' },
      { to: '/history',   icon: FiClock,    label: 'All History'      },
      { to: '/compare',   icon: FiGitMerge, label: 'Version Compare'  },
      { to: '/audit',     icon: FiActivity, label: 'Audit Logs'       },
      { to: '/admin',     icon: FiUsers,    label: 'Admin Panel'      },
      { to: '/profile',   icon: FiUser,     label: 'Profile'          },
    ],
  },

  EMPLOYEE: {
    label:        'Employee',
    dashboardType: 'EMPLOYEE',
    gradient:     'from-blue-600 to-indigo-600',
    accentColor:  'blue',
    tagline:      'Submit documents for compliance review and track your submission status.',
    permissions: [
      PERMISSIONS.VIEW_OWN_DOCUMENTS,
      PERMISSIONS.DOWNLOAD_REPORTS,
    ],
    navItems: [
      { to: '/dashboard', icon: FiHome,   label: 'Dashboard'       },
      { to: '/upload',    icon: FiUpload, label: 'Submit Document' },
      { to: '/history',   icon: FiClock,  label: 'My Submissions'  },
      { to: '/profile',   icon: FiUser,   label: 'Profile'         },
    ],
  },

  LEGAL: {
    label:        'Legal Team',
    dashboardType: 'REVIEWER',
    gradient:     'from-violet-700 to-purple-700',
    accentColor:  'violet',
    tagline:      'Review, approve, and manage legal compliance documents.',
    infoMessage:  'You can analyze any document, approve or reject pending submissions, compare versions, and view the audit trail.',
    permissions: [
      PERMISSIONS.CAN_APPROVE,
      PERMISSIONS.CAN_REJECT,
      PERMISSIONS.VIEW_ALL_DOCUMENTS,
      PERMISSIONS.DOWNLOAD_REPORTS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.VERSION_COMPARE,
      PERMISSIONS.ADD_LEGAL_NOTES,
      PERMISSIONS.REQUEST_CHANGES,
    ],
    visibleDocTypes: DOC_TYPE_GROUPS.LEGAL,
    hiddenSections: ['hrDocuments', 'employeePolicies', 'complianceMetrics', 'userManagement'],
    quickActions: [
      { to: '/upload',  labelKey: 'analyzeDocument', desc: 'AI-powered legal doc analysis'  },
      { to: '/history', labelKey: 'allDocuments',    desc: 'Full report history'             },
      { to: '/compare', labelKey: 'versionCompare',  desc: 'Diff two document versions'     },
      { to: '/audit',   labelKey: 'auditTrail',      desc: 'All actions and changes'        },
    ],
    navItems: [
      { to: '/dashboard', icon: FiHome,     label: 'Dashboard'        },
      { to: '/upload',    icon: FiUpload,   label: 'Analyze Document' },
      { to: '/history',   icon: FiClock,    label: 'Legal Documents'  },
      { to: '/compare',   icon: FiGitMerge, label: 'Version Compare'  },
      { to: '/audit',     icon: FiActivity, label: 'Audit Trail'      },
      { to: '/profile',   icon: FiUser,     label: 'Profile'          },
    ],
  },

  HR: {
    label:        'HR Team',
    dashboardType: 'REVIEWER',
    gradient:     'from-green-600 to-teal-600',
    accentColor:  'green',
    tagline:      'Manage employment contracts, policies, and HR compliance documents.',
    infoMessage:  'You can upload and analyze HR documents, approve or reject HR submissions, and compare policy versions.',
    permissions: [
      PERMISSIONS.CAN_APPROVE,
      PERMISSIONS.CAN_REJECT,
      PERMISSIONS.VIEW_ALL_DOCUMENTS,
      PERMISSIONS.DOWNLOAD_REPORTS,
      PERMISSIONS.VERSION_COMPARE,
    ],
    visibleDocTypes: DOC_TYPE_GROUPS.HR,
    hiddenSections: ['vendorContracts', 'nda', 'privacyPolicies', 'complianceDashboard', 'auditLogs'],
    quickActions: [
      { to: '/upload',  labelKey: 'uploadHrDocument',  desc: 'Contracts, policies, handbooks' },
      { to: '/history', labelKey: 'hrDocumentLibrary',  desc: 'All uploaded HR documents'      },
      { to: '/compare', labelKey: 'comparePolicies',    desc: 'Detect policy changes'           },
    ],
    navItems: [
      { to: '/dashboard', icon: FiHome,     label: 'Dashboard'       },
      { to: '/upload',    icon: FiUpload,   label: 'Upload HR Doc'   },
      { to: '/history',   icon: FiClock,    label: 'HR Documents'    },
      { to: '/compare',   icon: FiGitMerge, label: 'Policy Compare'  },
      { to: '/profile',   icon: FiUser,     label: 'Profile'         },
    ],
  },

  COMPLIANCE_OFFICER: {
    label:        'Compliance Officer',
    dashboardType: 'REVIEWER',
    gradient:     'from-emerald-700 to-teal-700',
    accentColor:  'emerald',
    tagline:      'Monitor compliance posture, approve documents, and review audit logs.',
    infoMessage:  'You can analyze all document types, approve or reject pending submissions, view the full audit log, compare versions, and monitor org-wide compliance scores.',
    permissions: [
      PERMISSIONS.CAN_APPROVE,
      PERMISSIONS.CAN_REJECT,
      PERMISSIONS.VIEW_ALL_DOCUMENTS,
      PERMISSIONS.DELETE_DOCUMENTS,
      PERMISSIONS.DOWNLOAD_REPORTS,
      PERMISSIONS.VIEW_AUDIT_LOGS,
      PERMISSIONS.VERSION_COMPARE,
      PERMISSIONS.GENERATE_COMPLIANCE_REPORTS,
    ],
    visibleDocTypes: DOC_TYPE_GROUPS.COMPLIANCE,
    hiddenSections: ['userManagement'],
    quickActions: [
      { to: '/upload',  labelKey: 'analyzeDocument', desc: 'AI-powered compliance analysis' },
      { to: '/history', labelKey: 'allReports',      desc: 'All documents across teams'     },
      { to: '/compare', labelKey: 'versionCompare',  desc: 'Diff document versions'         },
      { to: '/audit',   labelKey: 'auditLogs',       desc: 'Full system audit trail'        },
    ],
    navItems: [
      { to: '/dashboard', icon: FiHome,     label: 'Dashboard'        },
      { to: '/upload',    icon: FiUpload,   label: 'Analyze Document' },
      { to: '/history',   icon: FiClock,    label: 'All Reports'      },
      { to: '/compare',   icon: FiGitMerge, label: 'Version Compare'  },
      { to: '/audit',     icon: FiActivity, label: 'Audit Logs'       },
      { to: '/profile',   icon: FiUser,     label: 'Profile'          },
    ],
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Returns the config for a given role string, defaults to EMPLOYEE */
export const getRoleConfig = (role) =>
  ROLE_CONFIG[role] || ROLE_CONFIG.EMPLOYEE;

/** Check if a role has a specific permission */
export const hasPermission = (role, permission) =>
  (ROLE_CONFIG[role]?.permissions || []).includes(permission);

/** All reviewer roles (share one dashboard) */
export const REVIEWER_ROLES = ['LEGAL', 'HR', 'COMPLIANCE_OFFICER'];

/** Maps quick action labelKey → display strings */
export const QUICK_ACTION_LABELS = {
  analyzeDocument:   { label: 'Analyze Document',    icon: 'FiUpload'   },
  uploadHrDocument:  { label: 'Upload HR Document',  icon: 'FiUpload'   },
  allDocuments:      { label: 'All Documents',        icon: 'FiFileText' },
  hrDocumentLibrary: { label: 'HR Document Library',  icon: 'FiFileText' },
  allReports:        { label: 'All Reports',           icon: 'FiFileText' },
  versionCompare:    { label: 'Version Compare',       icon: 'FiGitMerge' },
  comparePolicies:   { label: 'Compare Policies',      icon: 'FiGitMerge' },
  auditTrail:        { label: 'Audit Trail',            icon: 'FiActivity' },
  auditLogs:         { label: 'Audit Logs',             icon: 'FiActivity' },
};
