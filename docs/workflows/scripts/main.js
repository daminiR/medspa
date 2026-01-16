/**
 * Luxe Medical Spa - System Workflows Main JavaScript
 * Handles parent tabs, subtabs, content loading, and interactive features
 */

// Cache for loaded tab content
const tabCache = {};

// Tab configuration - maps tab IDs to their file paths
const TAB_CONFIG = {
    // Strategy group
    'strategy': 'tabs/strategy.html',
    'competitors': 'tabs/competitors.html',
    'gaps': 'tabs/gaps.html',
    'medspa-insights': 'tabs/medspa-insights.html',
    'roadmap': 'tabs/roadmap/index.html',

    // Workflows group
    'patient-journey': 'tabs/patient-journey.html',
    'booking': 'tabs/booking.html',
    'treatment': 'tabs/treatment.html',
    'billing': 'tabs/billing.html',

    // Architecture group
    'overview': 'tabs/overview.html',
    'integrations': 'tabs/integrations.html',
    'backend': 'tabs/backend/index.html',

    // Features group
    'voice-ai': 'tabs/voice-ai.html',
    'patient-portal': 'tabs/patient-portal.html',
    'wow-features': 'tabs/wow-features.html',
    '3d-prompts': 'tabs/3d-prompts.html',

    // Progress group
    'feature-checklist': 'tabs/feature-checklist/index.html',
    'testing': 'tabs/testing.html',

    // Guides group
    'prompting': 'tabs/prompting.html'
};

// Parent tab to subtabs mapping
const TAB_GROUPS = {
    'group-strategy': ['strategy', 'competitors', 'gaps', 'medspa-insights', 'roadmap'],
    'group-workflows': ['patient-journey', 'booking', 'treatment', 'billing'],
    'group-architecture': ['overview', 'integrations', 'backend'],
    'group-features': ['voice-ai', 'patient-portal', 'wow-features', '3d-prompts'],
    'group-progress': ['feature-checklist', 'testing'],
    'group-guides': ['prompting']
};

/**
 * Fetch and load tab content
 */
async function loadTabContent(tabId) {
    const contentEl = document.getElementById('tab-content-area');
    if (!contentEl) return;

    // Check cache first
    if (tabCache[tabId]) {
        contentEl.innerHTML = tabCache[tabId];
        initializeTabFeatures(contentEl);
        return;
    }

    const filePath = TAB_CONFIG[tabId];
    if (!filePath) {
        console.warn(`No file path configured for tab: ${tabId}`);
        return;
    }

    // Show loading state
    contentEl.innerHTML = '<div class="loading-spinner">Loading...</div>';

    try {
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const html = await response.text();
        tabCache[tabId] = html;
        contentEl.innerHTML = html;

        // Initialize any interactive features in the loaded content
        initializeTabFeatures(contentEl);
    } catch (error) {
        console.error(`Failed to load tab content for ${tabId}:`, error);
        contentEl.innerHTML = `
            <div class="note" style="background: #ffe5e5; border-color: #dc3545;">
                <strong>Error loading content</strong>
                <p>Could not load ${filePath}. The file may not exist yet.</p>
            </div>
        `;
    }
}

/**
 * Initialize interactive features for loaded content
 */
function initializeTabFeatures(container) {
    // Initialize edge case collapsibles
    container.querySelectorAll('.edge-cases-header').forEach(header => {
        if (header.dataset.initialized) return;
        header.dataset.initialized = 'true';
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            header.classList.toggle('collapsed');
            content.classList.toggle('expanded');
        });
    });

    // Initialize checkboxes with localStorage persistence
    container.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        if (checkbox.dataset.initialized) return;
        checkbox.dataset.initialized = 'true';

        const key = `checkbox_${checkbox.id || checkbox.name || Math.random()}`;
        const saved = localStorage.getItem(key);
        if (saved === 'true') checkbox.checked = true;

        checkbox.addEventListener('change', () => {
            localStorage.setItem(key, checkbox.checked);
            updateProgress();
        });
    });
}

/**
 * Handle parent tab click
 */
function selectParentTab(groupId) {
    const parentTabs = document.querySelectorAll('.nav-tab');
    const subtabContainers = document.querySelectorAll('.subtabs-container');

    // Update parent tab active state
    parentTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.group === groupId);
    });

    // Show corresponding subtabs
    subtabContainers.forEach(container => {
        container.classList.toggle('active', container.id === groupId);
    });

    // Auto-select first subtab in the group
    const firstSubtab = TAB_GROUPS[groupId]?.[0];
    if (firstSubtab) {
        selectSubtab(groupId, firstSubtab);
    }
}

/**
 * Handle subtab click
 */
function selectSubtab(groupId, tabId) {
    const container = document.getElementById(groupId);
    if (!container) return;

    // Update subtab active states within this group
    container.querySelectorAll('.subtab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });

    // Load the content
    loadTabContent(tabId);

    // Save current state
    localStorage.setItem('activeGroup', groupId);
    localStorage.setItem('activeTab', tabId);
}

/**
 * Testing progress functions
 */
function saveTestProgress() {
    const sections = ['express-booking', 'waiting-room', 'messages', 'calendar', 'patient', 'billing'];
    const progress = {};

    sections.forEach(section => {
        const container = document.getElementById(section + '-tests');
        if (container) {
            const checkboxes = container.querySelectorAll('input[type="checkbox"]');
            progress[section] = Array.from(checkboxes).map(cb => cb.checked);

            const checked = progress[section].filter(Boolean).length;
            const total = progress[section].length;
            const percent = total > 0 ? Math.round((checked / total) * 100) : 0;

            const progressEl = document.getElementById(section + '-progress');
            if (progressEl) {
                progressEl.textContent = percent + '%';
                progressEl.style.color = percent === 100 ? '#10B981' : percent > 0 ? '#F59E0B' : '#666';
            }
        }
    });

    localStorage.setItem('testingProgress', JSON.stringify(progress));
}

function loadTestProgress() {
    const saved = localStorage.getItem('testingProgress');
    if (saved) {
        const progress = JSON.parse(saved);
        Object.keys(progress).forEach(section => {
            const container = document.getElementById(section + '-tests');
            if (container) {
                const checkboxes = container.querySelectorAll('input[type="checkbox"]');
                checkboxes.forEach((cb, index) => {
                    if (progress[section][index] !== undefined) {
                        cb.checked = progress[section][index];
                    }
                });
            }
        });
        saveTestProgress();
    }
}

function resetTestProgress() {
    if (confirm('Reset all testing progress? This cannot be undone.')) {
        localStorage.removeItem('testingProgress');
        document.querySelectorAll('#testing input[type="checkbox"]').forEach(cb => cb.checked = false);
        saveTestProgress();
    }
}

/**
 * Implementation Roadmap functions
 */
function toggleFeatureDetails() {
    const details = document.getElementById('feature-details');
    const btn = event.target;

    if (details.style.display === 'none') {
        details.style.display = 'block';
        btn.textContent = 'Hide Full Specs';
    } else {
        details.style.display = 'none';
        btn.textContent = 'View Full Specs & Checklist';
    }
}

function updateProgress() {
    const checkboxes = document.querySelectorAll('.requirements-checklist input[type="checkbox"]');
    if (checkboxes.length === 0) return;

    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const total = checkboxes.length;
    const percent = Math.round((checked / total) * 100);

    const progressBar = document.querySelector('.progress-bar-fill');
    const statusBadge = document.querySelector('.status-badge');

    if (progressBar) {
        progressBar.style.width = percent + '%';
        progressBar.textContent = percent + '% Complete';
    }

    if (statusBadge) {
        if (percent === 100) {
            statusBadge.className = 'status-badge status-complete';
            statusBadge.textContent = 'Complete!';
        } else if (percent > 0) {
            statusBadge.className = 'status-badge status-in-progress';
            statusBadge.textContent = 'In Progress (' + percent + '%)';
        } else {
            statusBadge.className = 'status-badge status-not-started';
            statusBadge.textContent = 'Not Started';
        }
    }

    localStorage.setItem('currentFeatureProgress', JSON.stringify({
        checked: Array.from(checkboxes).map(cb => cb.checked),
        percent: percent
    }));
}

function toggleSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (!section) return;

    if (section.style.display === 'none' || section.style.display === '') {
        section.style.display = 'block';
    } else {
        section.style.display = 'none';
    }
}

function switchTab(tabId) {
    // Find which group this tab belongs to
    for (const [groupId, tabs] of Object.entries(TAB_GROUPS)) {
        if (tabs.includes(tabId)) {
            selectParentTab(groupId);
            selectSubtab(groupId, tabId);
            return;
        }
    }
}

function promoteToCurrently(queuePosition) {
    alert('Feature promotion coming soon! For now, manually update the "Currently Building" section to work on this feature.');
}

/**
 * Initialize navigation
 */
function initializeNavigation() {
    // Parent tab clicks
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            selectParentTab(tab.dataset.group);
        });
    });

    // Subtab clicks
    document.querySelectorAll('.subtab').forEach(tab => {
        tab.addEventListener('click', () => {
            const groupId = tab.closest('.subtabs-container').id;
            selectSubtab(groupId, tab.dataset.tab);
        });
    });

    // Restore last active state or default to first tab
    const savedGroup = localStorage.getItem('activeGroup') || 'group-strategy';
    const savedTab = localStorage.getItem('activeTab') || 'strategy';

    selectParentTab(savedGroup);
    selectSubtab(savedGroup, savedTab);
}

/**
 * Print functionality
 */
function initializePrint() {
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
            e.preventDefault();
            window.print();
        }
    });

    window.addEventListener('beforeprint', () => {
        document.querySelectorAll('.edge-cases-content').forEach(content => {
            content.classList.add('expanded');
        });
    });

    window.addEventListener('afterprint', () => {
        document.querySelectorAll('.edge-cases-header').forEach(header => {
            if (header.classList.contains('collapsed')) {
                header.nextElementSibling.classList.remove('expanded');
            }
        });
    });
}

/**
 * Initialize everything on DOM ready
 */
document.addEventListener('DOMContentLoaded', () => {
    initializeNavigation();
    initializePrint();
});

// Export functions for global use
window.toggleFeatureDetails = toggleFeatureDetails;
window.updateProgress = updateProgress;
window.toggleSection = toggleSection;
window.switchTab = switchTab;
window.promoteToCurrently = promoteToCurrently;
window.resetTestProgress = resetTestProgress;
window.selectParentTab = selectParentTab;
window.selectSubtab = selectSubtab;
