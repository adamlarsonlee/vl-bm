// NATO Alphabet
const natoAlphabet = [
    'Alpha', 'Bravo', 'Charlie', 'Delta', 'Echo', 'Foxtrot',
    'Golf', 'Hotel', 'India', 'Juliett', 'Kilo', 'Lima',
    'Mike', 'November', 'Oscar', 'Papa', 'Quebec', 'Romeo',
    'Sierra', 'Tango', 'Uniform', 'Victor', 'Whiskey', 'X-ray',
    'Yankee', 'Zulu'
];

const natoAlphabetGrandMode = natoAlphabet.map(name => name === 'Golf' ? 'Grandma' : name);

const isHome = () => document.getElementById('currentHole').value === '*';

// Function to populate hole dropdowns
function populateHoleDropdowns() {
    const grandmaMode = document.getElementById('grandmaModeToggle').checked;
    const currentHoleSelect = document.getElementById('currentHole');
    const nextHoleSelect = document.getElementById('nextHole');

    // Save current selections
    const currentHoleValue = currentHoleSelect.value;
    const nextHoleValue = nextHoleSelect.value;

    // Clear existing options (except Home for currentHole)
    currentHoleSelect.innerHTML = '<option value="*" selected>Home (J113508)</option>';
    nextHoleSelect.innerHTML = '<option value="">Select...</option>';

    // Populate dropdowns
    (grandmaMode ? natoAlphabetGrandMode : natoAlphabet).forEach(function(name) {

        // Add to Current Hole dropdown
        const currentOption = document.createElement('option');
        currentOption.value = name;
        currentOption.textContent = name;
        if (name === 'Charlie') {
            currentOption.disabled = true;
        }
        currentHoleSelect.appendChild(currentOption);

        // Add to Next Hole dropdown
        const nextOption = document.createElement('option');
        nextOption.value = name;
        nextOption.textContent = name;
        if (name === 'Charlie') {
            nextOption.disabled = true;
        }
        nextHoleSelect.appendChild(nextOption);
    });

    // Restore previous selections
    if (currentHoleValue) {
        if (grandmaMode && currentHoleValue === 'Golf') {
            currentHoleSelect.value = 'Grandma';
        } else if (!grandmaMode && currentHoleValue === 'Grandma') {
            currentHoleSelect.value = 'Golf';
        } else {
            currentHoleSelect.value = currentHoleValue;
        }
    }
    if (nextHoleValue) {
        if (grandmaMode && nextHoleValue === 'Golf') {
            nextHoleSelect.value = 'Grandma';
            updateTemporaryNameCurrent();
        } else if (!grandmaMode && nextHoleValue === 'Grandma') {
            nextHoleSelect.value = 'Golf';
            updateTemporaryNameCurrent();
        } else {
            nextHoleSelect.value = nextHoleValue;
        }
    }
}

// Function to populate depth dropdown based on current hole
function populateDepthDropdown() {
    const numberSelect = document.getElementById('currentDepth');
    const currentValue = numberSelect.value;

    // Clear existing options
    numberSelect.innerHTML = '';

    if (isHome()) {
        // For Home, only show 0
        const option = document.createElement('option');
        option.value = '0';
        option.textContent = '0';
        numberSelect.appendChild(option);
        numberSelect.value = '0';
    } else {
        // For other holes, show 1-100 and default to 1
        for (let i = 0; i <= 100; i++) {
            const option = document.createElement('option');
            option.value = i;
            option.textContent = i;
            numberSelect.appendChild(option);
        }
        // If current value was 0 or invalid, set to 1
        if (!currentValue) {
            numberSelect.value = '1';
        } else {
            numberSelect.value = currentValue;
        }
    }

    // Update button states based on new depth value
    updateRemoveDepthButton();
}

// Function to populate next depth dropdown (1-100)
function populateNextDepthDropdown() {
    const nextDepthSelect = document.getElementById('nextDepth');

    // Populate 0-100
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        nextDepthSelect.appendChild(option);
    }
    // Default to 1
    nextDepthSelect.value = '1';
}

// Initial population (default to Home)
populateDepthDropdown(true);
populateNextDepthDropdown();
updateRemoveDepthButton();

// Handle signature mode toggle
function toggleSignatureMode() {
    const mode = document.querySelector('input[name="signatureMode"]:checked').value;
    const signatureGroup = document.getElementById('signatureGroup');
    const signaturesGroup = document.getElementById('signaturesGroup');
    const bookmarkSection = document.getElementById('bookmarkSection');
    const listsContainer = document.getElementById('listsContainer');
    const nextDepthGroup = document.getElementById('nextDepthGroup');
    const temporaryNameNextContainer = document.getElementById('temporaryNameNextContainer');
    const wormholeTypeGroup = document.getElementById('wormholeTypeGroup');
    const includeCosmicCheckbox = document.getElementById('includeCosmicSignatures').parentElement;

    if (mode === 'single') {
        signatureGroup.style.display = 'block';
        signaturesGroup.style.display = 'none';
        bookmarkSection.style.display = 'block';
        listsContainer.classList.remove('active');
        wormholeTypeGroup.style.display = 'block';
        includeCosmicCheckbox.style.display = 'none';
        // Show next depth only if not at Home - will be controlled by generateString()
        if (!isHome()) {
            nextDepthGroup.style.display = 'flex';
            temporaryNameNextContainer.style.display = 'block';
        }
    } else if (mode === 'wanderer') {
        // Wanderer mode - hide most inputs, will pull data from Wanderer API
        signatureGroup.style.display = 'none';
        signaturesGroup.style.display = 'none';
        bookmarkSection.style.display = 'none';
        listsContainer.classList.add('active');
        wormholeTypeGroup.style.display = 'none';
        includeCosmicCheckbox.style.display = 'none';
        nextDepthGroup.style.display = 'none';
        temporaryNameNextContainer.style.display = 'none';
    } else {
        // All signatures mode
        signatureGroup.style.display = 'none';
        signaturesGroup.style.display = 'block';
        bookmarkSection.style.display = 'none';
        listsContainer.classList.add('active');
        wormholeTypeGroup.style.display = 'none';
        includeCosmicCheckbox.style.display = 'flex';
        // Hide next depth section in all signatures mode
        nextDepthGroup.style.display = 'none';
        temporaryNameNextContainer.style.display = 'none';
    }
}

// Add event listeners for radio buttons
document.getElementById('singleSignature').addEventListener('change', function() {
    toggleSignatureMode();
    saveSettings();
});
document.getElementById('allSignatures').addEventListener('change', function() {
    toggleSignatureMode();
    saveSettings();
});
document.getElementById('useWanderer').addEventListener('change', function() {
    toggleSignatureMode();
    saveSettings();
});

// Add event listener for cosmic signatures checkbox
document.getElementById('includeCosmicSignatures').addEventListener('change', function() {
    generateBookmarksFromSignatures();
    saveSettings();
});

// Dark mode toggle functionality
const darkModeToggle = document.getElementById('darkModeToggle');

// Function to update EVE login button based on dark mode
function updateEveLoginButton() {
    const eveLoginImage = document.getElementById('eveLoginImage');
    if (isDarkMode()) {
        eveLoginImage.src = 'https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-white-large.png';
    } else {
        eveLoginImage.src = 'https://web.ccpgamescdn.com/eveonlineassets/developers/eve-sso-login-black-large.png';
    }
}

// Load dark mode preference from localStorage
const isDarkMode = () => localStorage.getItem('darkMode') === 'true';
if (isDarkMode()) {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}
updateEveLoginButton();

// Add event listener for dark mode toggle
darkModeToggle.addEventListener('change', function() {
    if (this.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'true');
    } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'false');
    }
    updateEveLoginButton();
    saveSettings();
});

// Grandma mode toggle functionality
const grandmaModeToggle = document.getElementById('grandmaModeToggle');

// Add event listener for grandma mode toggle
grandmaModeToggle.addEventListener('change', function() {
    populateHoleDropdowns();
    saveSettings();
});

document.getElementById('signature').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^a-zA-Z]/g, '');
    generateString();
});

document.getElementById('signatures').addEventListener('input', function(e) {
    generateBookmarksFromSignatures();
});

document.getElementById('currentHole').addEventListener('change', function() {
    generateString();
    generateBookmarksFromSignatures();
});

document.getElementById('nextHole').addEventListener('change', function() {
    const currentHole = document.getElementById('currentHole').value;
    const nextHole = document.getElementById('nextHole').value;
    const codeSelect = document.getElementById('code');
    document.getElementById('signature').value = '';
    document.getElementById('code').value = '';

    // Auto-select C3 when Current Hole is Home and Next Hole is Alpha
    if (isHome() && nextHole === 'Alpha') {
        codeSelect.value = 'C3';
    }

    // Auto-select C5 when Current Hole is Home and Next Hole is Bravo
    if (isHome() && nextHole === 'Bravo') {
        codeSelect.value = 'C5';
    }

    generateString();
    generateBookmarksFromSignatures();
});

document.getElementById('currentDepth').addEventListener('change', function() {
    updateRemoveDepthButton();
    generateString();
    generateBookmarksFromSignatures();
});

document.getElementById('nextDepth').addEventListener('change', function() {
    generateString();
    generateBookmarksFromSignatures();
});

document.getElementById('code').addEventListener('change', function() {
    generateString();
    generateBookmarksFromSignatures();
});

function updateTemporaryNameCurrent() {
    const currentHole = document.getElementById('currentHole').value;
    const currentDepth = document.getElementById('currentDepth').value;
    const nextHole = document.getElementById('nextHole').value;

    if (isHome()) {
        document.getElementById('temporaryNameCurrent').textContent = `${nextHole.toUpperCase() || ' '}`;
    } else {
        if (currentDepth === '0') {
            document.getElementById('temporaryNameCurrent').textContent = `${currentHole.toUpperCase()}`;
        } else {
            const currentHoleLetter = currentHole ? currentHole.charAt(0) : '';
            const depthString = getAllDepths().join('');
            document.getElementById('temporaryNameCurrent').textContent = `${currentHoleLetter}${depthString === currentHole.toUpperCase() ? '' : depthString}`;
        }
    }
}

function generateString() {
    const currentHole = document.getElementById('currentHole').value;
    const currentDepth = document.getElementById('currentDepth').value;
    const nextDepth = document.getElementById('nextDepth').value;
    const nextHole = document.getElementById('nextHole').value;
    const signature = document.getElementById('signature').value;
    const codeSelect = document.getElementById('code');
    const code = codeSelect.value;

    // Check signature mode
    const mode = document.querySelector('input[name="signatureMode"]:checked').value;
    const isAllSignaturesMode = mode === 'all';
    const isWandererMode = mode === 'wanderer';

    // Show/hide fields based on Current Hole
    const nextHoleGroup = document.getElementById('nextHoleGroup');
    const currentDepthGroup = document.getElementById('currentDepthGroup');
    const nextDepthGroup = document.getElementById('nextDepthGroup');
    const temporaryNameNextContainer = document.getElementById('temporaryNameNextContainer');

    if (isHome()) {
        nextHoleGroup.style.display = 'flex';
        currentDepthGroup.style.display = 'none';
        nextDepthGroup.style.display = 'none';
        temporaryNameNextContainer.style.display = 'none';
    } else {
        nextHoleGroup.style.display = 'none';
        currentDepthGroup.style.display = 'block';
        // Only show next depth section if in single signature mode
        if (isAllSignaturesMode || isWandererMode) {
            nextDepthGroup.style.display = 'none';
            temporaryNameNextContainer.style.display = 'none';
        } else {
            nextDepthGroup.style.display = 'flex';
            temporaryNameNextContainer.style.display = 'block';
        }
    }

    updateTemporaryNameCurrent();

    // Enable/disable Make Current button based on Next Hole selection
    const makeCurrentButton = document.getElementById('makeCurrentButton');
    makeCurrentButton.disabled = !nextHole;

    // Update depth dropdown based on current hole
    populateDepthDropdown();

    // Update UI based on validation
    const outputBox = document.getElementById('output');
    const copyButton = document.getElementById('copyButton');

    let isBookmarkValid = false;
    if (isHome()) {
        // For Home, require nextHole, signature, and code
        isBookmarkValid = nextHole && signature && code && signature.length === 3;
    } else {
        // For other holes, require currentHole, signature, and code
        isBookmarkValid = currentHole && signature && code && signature.length === 3;
    }

    if (isBookmarkValid) {
        outputBox.classList.remove('invalid');
        outputBox.classList.add('valid');
        copyButton.disabled = false;
    } else {
        outputBox.classList.remove('valid');
        outputBox.classList.add('invalid');
    }

    let result;

    // If current hole is Home, just use next hole's name
    if (isHome()) {
        result = ` ${nextHole || ''} ${signature} ${code}`.toUpperCase();
    } else {
        // Get first letter of current hole
        const currentHoleLetter = currentHole ? currentHole.charAt(0) : '';
        const depthString = getAllDepths().join('');

        // Build the string: space + current hole letter + depths + next depth + space + signature + space + code
        result = ` ${currentHoleLetter}${depthString === '0' ? '' : depthString}-${nextDepth} ${signature} ${code}`.toUpperCase();

        document.getElementById('temporaryNameNext').textContent = `${currentHoleLetter}${depthString === '0' ? '' : depthString}${nextDepth}`;
    }

    // Update output
    document.getElementById('output').textContent = result;
}

function generateBookmarksFromSignatures() {
    const signaturesText = document.getElementById('signatures').value;
    const currentHole = document.getElementById('currentHole').value;
    const currentDepth = document.getElementById('currentDepth').value;
    const nextDepth = document.getElementById('nextDepth').value;
    const nextHole = document.getElementById('nextHole').value;
    const code = document.getElementById('code').value;

    // Clear existing bookmarks
    clearBookmarks();

    // Parse signatures line by line and collect them
    const lines = signaturesText.split('\n');
    const signatures = [];

    for (let line of lines) {
        if (line.includes('Unstable Wormhole') || line.includes('Cosmic Signature')) {
            // Extract the signature code (e.g., "NLC-815")
            const parts = line.trim().split(/\s+/);
            if (parts.length > 0) {
                const isCosmicSignature = line.includes('Cosmic Signature');
                const isUnstableWormhole = line.includes('Unstable Wormhole');
                signatures.push({
                    code: parts[0].substring(0, 3),
                    isCosmicSignature: isCosmicSignature,
                    isUnstableWormhole: isUnstableWormhole
                });
            }
        }
    }

    // Filter out cosmic signatures if checkbox is unchecked
    const includeCosmicSignatures = document.getElementById('includeCosmicSignatures').checked;
    const filteredSignatures = includeCosmicSignatures
        ? signatures
        : signatures.filter(sig => !sig.isCosmicSignature);

    // Sort signatures
    filteredSignatures.sort((a, b) => a.code.localeCompare(b.code));

    // Generate bookmarks
    filteredSignatures.forEach((sig, i) => {
        const signature = sig.code.substring(0, 3);
        const isCosmicSignature = sig.isCosmicSignature;
        const isUnstableWormhole = sig.isUnstableWormhole;

        // Generate bookmark based on current form state
        let bookmarkText;
        if (isHome()) {
            bookmarkText = ` ${nextHole || ''} ${signature} ${code}`.toUpperCase();
        } else {
            const currentHoleLetter = currentHole ? currentHole.charAt(0) : '';
            const depthString = getAllDepths().join('');
            bookmarkText = ` ${currentHoleLetter}${depthString === '0' ? '' : depthString}-${i + 1} ${signature} `.toUpperCase();
        }

        // Add bookmark to the list
        if (bookmarkText.trim()) {
            addBookmark(bookmarkText, isCosmicSignature, isUnstableWormhole);
        }
    });
}

let depthCounter = 1;

function addDepth() {
    const depthContainer = document.getElementById('depthContainer');
    const newSelect = document.createElement('select');
    newSelect.className = 'depth-field';
    newSelect.id = 'currentDepth' + depthCounter;

    // Populate with 1-100
    for (let i = 1; i <= 100; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        newSelect.appendChild(option);
    }
    newSelect.value = '1';

    // Add event listener
    newSelect.addEventListener('change', function() {
        generateString();
        generateBookmarksFromSignatures();
    });

    depthContainer.appendChild(newSelect);
    depthCounter++;
    updateRemoveDepthButton();
    generateString();
    generateBookmarksFromSignatures();
}

function removeDepth() {
    const depthContainer = document.getElementById('depthContainer');
    const depthFields = depthContainer.querySelectorAll('.depth-field');

    // Only remove if there's more than one depth field
    if (depthFields.length > 1) {
        // Remove the last depth field
        depthFields[depthFields.length - 1].remove();
        updateRemoveDepthButton();
        generateString();
        generateBookmarksFromSignatures();
    }
}

function updateRemoveDepthButton() {
    const depthContainer = document.getElementById('depthContainer');
    const depthFields = depthContainer.querySelectorAll('.depth-field');
    const removeButton = document.getElementById('removeDepthButton');
    const addButton = document.getElementById('addDepthButton');

    // Disable remove button if only one depth field left
    removeButton.disabled = depthFields.length <= 1;

    // Disable add button if current depth is 0
    const currentDepth = document.getElementById('currentDepth');
    addButton.disabled = currentDepth && currentDepth.value === '0';
}

function getAllDepths() {
    const depthFields = document.querySelectorAll('.depth-field');
    const depths = [];
    depthFields.forEach(field => {
        const value = field.value;
        if (value) {
            depths.push(value);
        }
    });
    return depths;
}

function clearExtraDepths() {
    const depthContainer = document.getElementById('depthContainer');
    const depthFields = depthContainer.querySelectorAll('.depth-field');
    // Remove all but the first depth field
    for (let i = 1; i < depthFields.length; i++) {
        depthFields[i].remove();
    }
    depthCounter = 1;
    updateRemoveDepthButton();
}

function makeCurrentFromNext() {
    const nextHole = document.getElementById('nextHole').value;
    if (nextHole) {
        document.getElementById('currentHole').value = nextHole;
        document.getElementById('signature').value = '';
        document.getElementById('code').value = '';
        clearExtraDepths();
        generateString();
        generateBookmarksFromSignatures();
    }
}

function goToNext() {
    const nextDepthSelect = document.getElementById('nextDepth');
    const currentNextDepth = parseInt(nextDepthSelect.value) || 0;
    const newDepth = currentNextDepth + 1;

    if (newDepth <= 100) {
        nextDepthSelect.value = newDepth.toString();
    }

    document.getElementById('signature').value = '';

    generateString();
    generateBookmarksFromSignatures();
}

function resetDepth() {
    const nextDepthSelect = document.getElementById('nextDepth');
    nextDepthSelect.value = '1';
    generateString();
    generateBookmarksFromSignatures();
}

function copyToClipboard(elementId) {
    const text = document.getElementById(elementId).textContent;
    navigator.clipboard.writeText(text).then(function() {
        const message = document.getElementById('copiedMessage');
        message.textContent = `Copied ${text} to clipboard!`;
        message.style.display = 'block';
        setTimeout(function() {
            message.style.display = 'none';
        }, 2000);
    }).catch(function(err) {
        alert('Failed to copy: ' + err);
    });
}

// Bookmarks list management
let bookmarkCounter = 0;

function addBookmark(bookmarkText, isCosmicSignature = false, isUnstableWormhole = false) {
    if (!bookmarkText || bookmarkText.trim() === '') return;

    const copyIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    `;

    const bookmarksList = document.getElementById('bookmarksList');
    const bookmarkItem = document.createElement('div');
    bookmarkItem.className = 'bookmark-item';
    bookmarkItem.id = 'bookmark-' + bookmarkCounter;

    // Apply light yellow background for Cosmic Signatures
    if (isCosmicSignature) {
        if (isDarkMode()) {
            bookmarkItem.style.backgroundColor = '#ba8e23';
        } else {
            bookmarkItem.style.backgroundColor = '#ffffc5';
        }
    }
    // Apply light green background for Unstable Wormholes
    else if (isUnstableWormhole) {
        if (isDarkMode()) {
            bookmarkItem.style.backgroundColor = '#06402b';
        } else {
            bookmarkItem.style.backgroundColor = '#d4edda';
        }
    }

    const bookmarkTextSpan = document.createElement('span');
    bookmarkTextSpan.className = 'bookmark-text';
    bookmarkTextSpan.textContent = bookmarkText;
    bookmarkTextSpan.id = 'bookmark-text-' + bookmarkCounter;
    bookmarkTextSpan.onclick = () => copyToClipboard(bookmarkTextSpan.id);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.onclick = () => copyToClipboard(bookmarkTextSpan.id);
    copyButton.innerHTML = copyIcon;

    bookmarkItem.appendChild(bookmarkTextSpan);
    bookmarkItem.appendChild(copyButton);
    bookmarksList.appendChild(bookmarkItem);

    // Extract temporary name (first part before space, without dash)
    const tempName = bookmarkText.trim().split(' ')[0].replace('-', '');
    addTempName(tempName, isCosmicSignature, isUnstableWormhole);

    bookmarkCounter++;
}

function addTempName(tempNameText, isCosmicSignature = false, isUnstableWormhole = false) {
    if (!tempNameText || tempNameText.trim() === '') return;

    const copyIcon = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
    `;

    const tempNamesList = document.getElementById('tempNamesList');
    const tempNameItem = document.createElement('div');
    tempNameItem.className = 'temp-name-item';
    tempNameItem.id = 'temp-name-' + bookmarkCounter;

                // Apply light yellow background for Cosmic Signatures
    if (isCosmicSignature) {
        if (isDarkMode()) {
            tempNameItem.style.backgroundColor = '#ba8e23';
        } else {
            tempNameItem.style.backgroundColor = '#ffffc5';
        }
    }
    // Apply light green background for Unstable Wormholes
    else if (isUnstableWormhole) {
        if (isDarkMode()) {
            tempNameItem.style.backgroundColor = '#06402b';
        } else {
            tempNameItem.style.backgroundColor = '#d4edda';
        }
    }

    const tempNameTextSpan = document.createElement('span');
    tempNameTextSpan.className = 'temp-name-text';
    tempNameTextSpan.textContent = tempNameText;
    tempNameTextSpan.id = 'temp-name-text-' + bookmarkCounter;
    tempNameTextSpan.onclick = () => copyToClipboard(tempNameTextSpan.id);

    const copyButton = document.createElement('button');
    copyButton.className = 'copy-button';
    copyButton.onclick = () => copyToClipboard(tempNameTextSpan.id);
    copyButton.innerHTML = copyIcon;

    tempNameItem.appendChild(tempNameTextSpan);
    tempNameItem.appendChild(copyButton);
    tempNamesList.appendChild(tempNameItem);
}

function clearBookmarks() {
    const bookmarksList = document.getElementById('bookmarksList');
    bookmarksList.innerHTML = '';
    const tempNamesList = document.getElementById('tempNamesList');
    tempNamesList.innerHTML = '';
    bookmarkCounter = 0;
}

// Settings management functions
function saveSettings() {
    const settings = {
        signatureMode: document.querySelector('input[name="signatureMode"]:checked').value,
        includeCosmicSignatures: document.getElementById('includeCosmicSignatures').checked,
        grandmaMode: document.getElementById('grandmaModeToggle').checked
    };
    localStorage.setItem('vaporLockSettings', JSON.stringify(settings));

    generateBookmarksFromSignatures();
}

function loadSettings() {
    const savedSettings = localStorage.getItem('vaporLockSettings');
    if (!savedSettings) return;

    try {
        const settings = JSON.parse(savedSettings);

        // Load signature mode
        if (settings.signatureMode) {
            const modeMap = {
                'single': 'singleSignature',
                'all': 'allSignatures',
                'wanderer': 'useWanderer'
            };
            const radioId = modeMap[settings.signatureMode] || 'singleSignature';
            document.getElementById(radioId).checked = true;
        }

        // Load include cosmic signatures
        if (settings.includeCosmicSignatures !== undefined) {
            document.getElementById('includeCosmicSignatures').checked = settings.includeCosmicSignatures;
        }

        // Load grandma mode
        if (settings.grandmaMode !== undefined) {
            document.getElementById('grandmaModeToggle').checked = settings.grandmaMode;
        }
    } catch (e) {
        console.error('Failed to load settings:', e);
    }
}

// ===== EVE Online SSO Configuration =====
const EVE_SSO_CONFIG = {
    clientId: '08df6b6a778d4b5a980dad71696f2a18',
    redirectUri: 'https://adamlarsonlee.github.io/vl-bm/',
    scopes: 'publicData esi-location.read_location.v1',
    authorizationEndpoint: 'https://login.eveonline.com/v2/oauth/authorize',
    tokenEndpoint: 'https://login.eveonline.com/v2/oauth/token',
    verifyEndpoint: 'https://login.eveonline.com/oauth/verify'
};

// ===== PKCE Helper Functions =====
function generateRandomString(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    return Array.from(randomValues)
        .map(x => charset[x % charset.length])
        .join('');
}

async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return base64UrlEncode(hash);
}

function base64UrlEncode(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

// ===== OAuth Flow Functions =====
async function loginToEve() {
    // Generate PKCE values
    const codeVerifier = generateRandomString(128);
    const codeChallenge = await generateCodeChallenge(codeVerifier);
    const state = generateRandomString(32);

    // Store PKCE values for later
    sessionStorage.setItem('eve_code_verifier', codeVerifier);
    sessionStorage.setItem('eve_state', state);

    // Build authorization URL
    const params = new URLSearchParams({
        response_type: 'code',
        redirect_uri: EVE_SSO_CONFIG.redirectUri,
        client_id: EVE_SSO_CONFIG.clientId,
        scope: EVE_SSO_CONFIG.scopes,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state
    });

    // Redirect to EVE SSO
    window.location.href = `${EVE_SSO_CONFIG.authorizationEndpoint}?${params.toString()}`;
}

async function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');

    if (!code) {
        return; // Not a callback
    }

    // Verify state to prevent CSRF
    const savedState = sessionStorage.getItem('eve_state');
    if (state !== savedState) {
        alert('Security error: State mismatch. Please try logging in again.');
        return;
    }

    // Get code verifier
    const codeVerifier = sessionStorage.getItem('eve_code_verifier');
    if (!codeVerifier) {
        alert('Error: Missing code verifier. Please try logging in again.');
        return;
    }

    try {
        // Exchange code for token
        const tokenResponse = await fetch(EVE_SSO_CONFIG.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Host': 'login.eveonline.com'
            },
            body: new URLSearchParams({
                grant_type: 'authorization_code',
                code: code,
                client_id: EVE_SSO_CONFIG.clientId,
                code_verifier: codeVerifier
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            throw new Error(`Token exchange failed: ${errorText}`);
        }

        const tokenData = await tokenResponse.json();

        // Store tokens
        localStorage.setItem('eve_access_token', tokenData.access_token);
        localStorage.setItem('eve_refresh_token', tokenData.refresh_token);
        localStorage.setItem('eve_token_expires', Date.now() + (tokenData.expires_in * 1000));

        // Get character info from JWT
        const jwtPayload = JSON.parse(atob(tokenData.access_token.split('.')[1]));
        localStorage.setItem('eve_character_id', jwtPayload.sub.split(':')[2]);
        localStorage.setItem('eve_character_name', jwtPayload.name);

        // Clean up session storage and URL
        sessionStorage.removeItem('eve_code_verifier');
        sessionStorage.removeItem('eve_state');
        window.history.replaceState({}, document.title, window.location.pathname);

        // Update UI
        await updateLoginUI();
    } catch (error) {
        console.error('OAuth error:', error);
        alert('Login failed: ' + error.message);
    }
}

async function refreshAccessToken() {
    const refreshToken = localStorage.getItem('eve_refresh_token');

    if (!refreshToken) {
        console.error('No refresh token available');
        return false;
    }

    try {
        const tokenResponse = await fetch(EVE_SSO_CONFIG.tokenEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: EVE_SSO_CONFIG.clientId
            })
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('Token refresh failed:', errorText);
            return false;
        }

        const tokenData = await tokenResponse.json();

        // Update stored tokens
        localStorage.setItem('eve_access_token', tokenData.access_token);
        localStorage.setItem('eve_refresh_token', tokenData.refresh_token);
        localStorage.setItem('eve_token_expires', Date.now() + (tokenData.expires_in * 1000));

        console.log('Access token refreshed successfully');
        return true;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
}

async function getCharacterLocation() {
    const accessToken = localStorage.getItem('eve_access_token');
    const characterId = localStorage.getItem('eve_character_id');
    const tokenExpires = localStorage.getItem('eve_token_expires');

    if (!accessToken || !characterId) {
        return null;
    }

    // Check if token is expired or will expire in the next 5 minutes
    const now = Date.now();
    const expiresIn = tokenExpires ? parseInt(tokenExpires) - now : 0;
    const fiveMinutes = 5 * 60 * 1000;

    if (expiresIn < fiveMinutes) {
        console.log('Access token expired or expiring soon, refreshing...');
        const refreshed = await refreshAccessToken();
        if (!refreshed) {
            console.error('Failed to refresh token, clearing auth data');
            logoutFromEve();
            return null;
        }
    }

    // Get the potentially refreshed token
    const currentToken = localStorage.getItem('eve_access_token');

    try {
        const response = await fetch(
            `https://esi.evetech.net/latest/characters/${characterId}/location/`,
            {
                headers: {
                    'Authorization': `Bearer ${currentToken}`
                }
            }
        );

        if (!response.ok) {
            // If we get a 401, try refreshing the token once more
            if (response.status === 401) {
                console.log('Got 401, attempting token refresh...');
                const refreshed = await refreshAccessToken();
                if (refreshed) {
                    // Retry the request with the new token
                    const retryToken = localStorage.getItem('eve_access_token');
                    const retryResponse = await fetch(
                        `https://esi.evetech.net/latest/characters/${characterId}/location/`,
                        {
                            headers: {
                                'Authorization': `Bearer ${retryToken}`
                            }
                        }
                    );

                    if (!retryResponse.ok) {
                        throw new Error('Failed to fetch location after token refresh');
                    }

                    const retryLocationData = await retryResponse.json();
                    const systemResponse = await fetch(
                        `https://esi.evetech.net/latest/universe/systems/${retryLocationData.solar_system_id}/`
                    );
                    const systemData = await systemResponse.json();

                    return {
                        systemId: retryLocationData.solar_system_id,
                        systemName: systemData.name
                    };
                } else {
                    logoutFromEve();
                    throw new Error('Failed to refresh token');
                }
            }
            throw new Error('Failed to fetch location');
        }

        const locationData = await response.json();

        // Get system name
        const systemResponse = await fetch(
            `https://esi.evetech.net/latest/universe/systems/${locationData.solar_system_id}/`
        );
        const systemData = await systemResponse.json();

        return {
            systemId: locationData.solar_system_id,
            systemName: systemData.name
        };
    } catch (error) {
        console.error('Error fetching location:', error);
        return null;
    }
}

async function refreshLocation() {
    const location = await getCharacterLocation();
    if (location) {
        document.getElementById('characterLocation').textContent = `Current System: ${location.systemName}`;
        localStorage.setItem('eve_current_system', location.systemName);
        localStorage.setItem('eve_current_system_id', location.systemId);
    } else {
        document.getElementById('characterLocation').textContent = 'Location unavailable';
    }
}

async function updateLoginUI() {
    const accessToken = localStorage.getItem('eve_access_token');
    const characterName = localStorage.getItem('eve_character_name');

    if (accessToken && characterName) {
        // Show logged in section
        document.getElementById('eveLoginSection').style.display = 'none';
        document.getElementById('eveLoggedInSection').style.display = 'block';
        document.getElementById('characterName').textContent = characterName;

        // Get and display location
        await refreshLocation();
    } else {
        // Show login button
        document.getElementById('eveLoginSection').style.display = 'block';
        document.getElementById('eveLoggedInSection').style.display = 'none';
    }
}

function logoutFromEve() {
    // Clear all EVE-related data
    localStorage.removeItem('eve_access_token');
    localStorage.removeItem('eve_refresh_token');
    localStorage.removeItem('eve_token_expires');
    localStorage.removeItem('eve_character_id');
    localStorage.removeItem('eve_character_name');
    localStorage.removeItem('eve_current_system');
    localStorage.removeItem('eve_current_system_id');

    // Update UI
    updateLoginUI();
}

// Keyboard shortcuts for copying bookmarks
document.addEventListener('keydown', function(e) {
    // Check if the key pressed is a number (1-9 or 0)
    const key = e.key;
    if (key >= '0' && key <= '9') {
        // Don't trigger if user is typing in an input field
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
            return;
        }

        e.preventDefault();

        // Convert key to index (1 = index 0, 2 = index 1, etc., 0 = index 9)
        let index;
        if (key === '0') {
            index = 9;
        } else {
            index = parseInt(key) - 1;
        }

        // Try to find and copy the bookmark at this index
        const bookmarkTextElement = document.getElementById('bookmark-text-' + index);
        if (bookmarkTextElement) {
            copyToClipboard('bookmark-text-' + index);
        }
    }
});

// Initialize
async function initialize() {
    loadSettings();
    populateHoleDropdowns();
    toggleSignatureMode();
    generateString();
    generateBookmarksFromSignatures();

    // Handle OAuth callback if present
    await handleOAuthCallback();

    // Update login UI
    await updateLoginUI();
}

initialize();
