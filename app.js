let actionHistory = [];
let llState = [];
let stackState = [];
let queueState = [];
let currentDsType = 'Linked List';

// ==========================================
// UI & STATE MANAGEMENT
// ==========================================
function switchTab(tabId) {
    // 1. Update Active Sidebar Tab
    document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
    if (window.event && window.event.target) {
        const activeItem = window.event.target.closest('li');
        if (activeItem) activeItem.classList.add('active');
    }

    // 2. Hide all button groups initially
    document.getElementById('btn-group-ll').classList.add('hidden');
    document.getElementById('btn-group-stack').classList.add('hidden');
    document.getElementById('btn-group-queue').classList.add('hidden');
    const appButtonGroup = document.getElementById('btn-group-app');
    const visualizationArea = document.querySelector('.visualization-area');
    if (appButtonGroup) appButtonGroup.classList.add('hidden');
    if (visualizationArea) visualizationArea.classList.remove('hidden');

    // 3. Grab the Position input field to hide/show it
    const posInput = document.getElementById('inputPos');

    // 4. Show specific controls based on selected tab
    if (tabId === 'linkedlist') {
        currentDsType = 'Linked List';
        document.getElementById('ds-title').innerText = "Linked List Operations";
        document.getElementById('btn-group-ll').classList.remove('hidden');
        posInput.classList.remove('hidden'); // SHOW Position input
        document.querySelector('.input-cluster').style.display = 'grid';
        document.getElementById('elevator-section').classList.add('hidden');
    } else if (tabId === 'stack') {
        currentDsType = 'Stack';
        document.getElementById('ds-title').innerText = "Stack Operations";
        document.getElementById('btn-group-stack').classList.remove('hidden');
        posInput.classList.add('hidden');    // HIDE Position input
        document.querySelector('.input-cluster').style.display = 'grid';
        document.getElementById('elevator-section').classList.add('hidden');
    } else if (tabId === 'queue') {
        currentDsType = 'Queue';
        document.getElementById('ds-title').innerText = "Queue Operations";
        document.getElementById('btn-group-queue').classList.remove('hidden');
        posInput.classList.add('hidden');    // HIDE Position input
        document.querySelector('.input-cluster').style.display = 'grid';
        document.getElementById('elevator-section').classList.add('hidden');
    } else if (tabId === 'application') {
        currentDsType = 'Application';
        document.getElementById('ds-title').innerText = "Elevator Simulation";
        document.getElementById('btn-group-app').classList.remove('hidden');
        posInput.classList.add('hidden');
        document.querySelector('.input-cluster').style.display = 'none';
        if (visualizationArea) visualizationArea.classList.add('hidden');
        document.getElementById('elevator-section').classList.remove('hidden');
        initElevator();
    }
    
    document.getElementById('visualCanvas').innerHTML = `<span class="placeholder">Ready...</span>`;
    logToConsole(`Switched to ${tabId}`);
    
    if(typeof updateHoverHistory === 'function') updateHoverHistory();
}

function operate(action) {
    if (window.event && window.event.target && window.event.target.tagName === 'BUTTON') {
        const btn = window.event.target;
        btn.classList.add('btn-bubble');
        setTimeout(() => btn.classList.remove('btn-bubble'), 300);
    }

    const val = document.getElementById('inputValue').value;
    const pos = document.getElementById('inputPos').value;
    
    // Clear inputs after grabbing values
    document.getElementById('inputValue').value = '';
    document.getElementById('inputPos').value = '';

    // Record to history array
    const timestamp = new Date().toLocaleTimeString();
    actionHistory.push({ time: timestamp, action: action, val: val, pos: pos });

    logToConsole(`Action: ${action} | Value: ${val || 'N/A'} | Pos: ${pos || 'N/A'}`);
    
    // Send to backend simulation
    simulateCppBackend(action, val, pos);
}

function logToConsole(msg) {
    const log = document.getElementById('console-log');
    log.innerHTML = `> ${msg}`;
}

// ==========================================
// HISTORY MODAL & HOVER LOGIC
// ==========================================
function showHistory(dsType) {
    const modal = document.getElementById('historyModal');
    const list = document.getElementById('historyList');
    document.getElementById('historyTitle').innerText = `${dsType} History`;
    
    list.innerHTML = ''; 

    // Determine the prefix to filter the correct logs for the active data structure
    let prefix = '';
    if (dsType === 'Linked List') prefix = 'll_';
    else if (dsType === 'Stack') prefix = 'stack_';
    else if (dsType === 'Queue') prefix = 'queue_';

    const filteredLogs = actionHistory.filter(log => log.action.startsWith(prefix));

    if (filteredLogs.length === 0) {
        list.innerHTML = '<li>No history recorded yet.</li>';
    } else {
        // Reverse array to show newest actions at the top of the list
        filteredLogs.slice().reverse().forEach(log => {
            let li = document.createElement('li');
            li.innerHTML = `<span class="timestamp">[${log.time}]</span> <span class="action">${log.action}</span> | Val: ${log.val || '-'} | Pos: ${log.pos || '-'}`;
            list.appendChild(li);
        });
    }

    modal.classList.remove('hidden');
}

function closeHistory() {
    document.getElementById('historyModal').classList.add('hidden');
}

function updateHoverHistory() {
    const list = document.getElementById('hoverHistoryList');
    if (!list) return;
    
    document.getElementById('hoverHistoryTitle').innerText = `${currentDsType} History`;
    list.innerHTML = ''; 

    let prefix = '';
    if (currentDsType === 'Linked List') prefix = 'll_';
    else if (currentDsType === 'Stack') prefix = 'stack_';
    else if (currentDsType === 'Queue') prefix = 'queue_';

    const filteredLogs = actionHistory.filter(log => log.action.startsWith(prefix));

    if (filteredLogs.length === 0) {
        list.innerHTML = '<li>No history yet.</li>';
    } else {
        filteredLogs.slice().reverse().forEach(log => {
            let li = document.createElement('li');
            let actionName = log.action.replace(prefix, '').replace(/_/g, ' ');
            li.innerHTML = `<span class="timestamp">[${log.time}]</span> <span class="action">${actionName}</span> ${log.val ? ' | V:'+log.val : ''}${log.pos ? ' | P:'+log.pos : ''}`;
            list.appendChild(li);
        });
    }
}

// ==========================================
// BACKEND SIMULATION (C++ Bridge Replacement)
// ==========================================
function simulateCppBackend(action, val, pos) {
    val = parseInt(val);
    pos = parseInt(pos);

    // --- LINKED LIST ---
    if (action.startsWith('ll_')) {
        if (action === 'll_insert_start') {
            if(!isNaN(val)) llState.unshift(val);
            renderHorizontal(llState, 0, true, true);
        } else if (action === 'll_insert_end') {
            if(!isNaN(val)) llState.push(val);
            renderHorizontal(llState, llState.length - 1, true, true);
        } else if (action === 'll_insert_pos') {
            if(!isNaN(val) && !isNaN(pos) && pos > 0 && pos <= llState.length + 1) {
                llState.splice(pos - 1, 0, val);
                renderHorizontal(llState, pos - 1, true, true);
            } else { logToConsole("Error: Invalid position"); }
        } else if (action === 'll_delete_pos') {
            if(!isNaN(pos) && pos > 0 && pos <= llState.length) {
                llState.splice(pos - 1, 1);
                renderHorizontal(llState, -1, true, false);
            } else { logToConsole("Error: Invalid position"); }
        }
    } 
    // --- STACK ---
    else if (action.startsWith('stack_')) {
        if (action === 'stack_push') {
            if(!isNaN(val)) stackState.push(val);
            renderVertical(stackState, stackState.length - 1, true);
        } else if (action === 'stack_pop') {
            if(stackState.length > 0) stackState.pop();
            renderVertical(stackState, stackState.length - 1, false);
        } else if (action === 'stack_peek') {
            if(stackState.length > 0) {
                renderVertical(stackState, stackState.length - 1, false);
                logToConsole(`Peek Top: ${stackState[stackState.length - 1]}`);
            } else { logToConsole("Stack is empty"); }
        } else if (action === 'stack_isempty') {
            const isEmpty = stackState.length === 0;
            logToConsole(`Stack IsEmpty: ${isEmpty ? 'True' : 'False'}`);
        }
    } 
    // --- QUEUE ---
    else if (action.startsWith('queue_')) {
        if (action === 'queue_enqueue') {
            if(!isNaN(val)) queueState.push(val);
            renderHorizontal(queueState, queueState.length - 1, false, true);
        } else if (action === 'queue_dequeue') {
            if(queueState.length > 0) queueState.shift();
            renderHorizontal(queueState, 0, false, false);
        }
    }
}

// ==========================================
// RENDERERS (Visual Output)
// ==========================================
function renderHorizontal(arrayData, highlightIndex = -1, isLinkedList = false, isNew = false) {
    const canvas = document.getElementById('visualCanvas');
    canvas.className = 'canvas horizontal'; 
    canvas.innerHTML = ''; 

    if (arrayData.length === 0) { 
        canvas.innerHTML = `<span class="placeholder">Empty</span>`; 
        return; 
    }

    arrayData.forEach((item, index) => {
        let span = document.createElement('span');
        let classes = ['node'];
        if (index === highlightIndex) {
            classes.push('highlight');
            if (isNew) classes.push('new-node');
        }
        span.className = classes.join(' ');
        span.innerText = item; 
        canvas.appendChild(span);
        
        // Only draw arrows if it's a linked list
        if (isLinkedList && index < arrayData.length - 1) {
            let arrow = document.createElement('span'); 
            arrow.className = 'arrow';
            arrow.innerText = '->'; 
            canvas.appendChild(arrow);
        }
    });
}

function renderVertical(arrayData, highlightIndex = -1, isNew = false) {
    const canvas = document.getElementById('visualCanvas');
    canvas.className = 'canvas vertical'; 
    canvas.innerHTML = ''; 

    if (arrayData.length === 0) { 
        canvas.innerHTML = `<span class="placeholder">Stack is Empty</span>`; 
        return; 
    }

    arrayData.forEach((item, index) => {
        let span = document.createElement('span');
        let classes = ['node'];
        if (index === highlightIndex) {
            classes.push('highlight');
            if (isNew) classes.push('new-node');
        }
        span.className = classes.join(' ');
        span.innerText = item; 
        canvas.appendChild(span);
    });
}

// ==========================================
// ELEVATOR SIMULATION
// ==========================================

// Elevator State
const TOTAL_FLOORS = 11; // 0-10
let elevatorState = {
    currentFloor: 0,
    direction: 'idle', // 'up', 'down', 'idle'
    isMoving: false,
    requestQueue: [], // Queue for requests
    visitedStack: [], // Stack for history
    linkedListFloors: [], // Linked list representation
    isProcessing: false
};

// Initialize Linked List representation of floors
function initLinkedList() {
    elevatorState.linkedListFloors = [];
    for (let i = 0; i < TOTAL_FLOORS; i++) {
        elevatorState.linkedListFloors.push({
            floor: i,
            prev: i > 0 ? i - 1 : null,
            next: i < TOTAL_FLOORS - 1 ? i + 1 : null
        });
    }
    renderLinkedList();
}

// Generate floor elements
function generateFloors() {
    const floorsContainer = document.getElementById('floorsContainer');
    floorsContainer.innerHTML = '';
    
    for (let i = TOTAL_FLOORS - 1; i >= 0; i--) {
        const floor = document.createElement('div');
        floor.className = 'floor';
        floor.id = `floor-${i}`;
        floor.innerHTML = `
            <span>${i}</span>
            <button class="floor-call-btn" onclick="callElevator(${i})">â¬†</button>
        `;
        floorsContainer.appendChild(floor);
    }
}

// Generate inside lift buttons
function generateInsideButtons() {
    const container = document.getElementById('insideButtons');
    container.innerHTML = '';
    
    for (let i = 0; i < TOTAL_FLOORS; i++) {
        const btn = document.createElement('button');
        btn.className = 'floor-btn';
        btn.innerText = i;
        btn.onclick = () => pressFloorButton(i);
        btn.id = `inside-btn-${i}`;
        container.appendChild(btn);
    }
}

// Generate call buttons for each floor
function generateCallButtons() {
    const container = document.getElementById('callButtons');
    container.innerHTML = '';
    
    for (let i = 0; i < TOTAL_FLOORS; i++) {
        const btn = document.createElement('button');
        btn.className = 'call-btn';
        btn.innerText = `Call ${i}`;
        btn.onclick = () => callElevator(i);
        btn.id = `call-btn-${i}`;
        container.appendChild(btn);
    }
}

// Initialize elevator
function initElevator() {
    initLinkedList();
    generateFloors();
    generateInsideButtons();
    generateCallButtons();
    updateElevatorDisplay();
    logOperation('System', 'Elevator initialized');
}

// Press floor button inside lift
function pressFloorButton(floor) {
    if (elevatorState.isProcessing) {
        logOperation('Inside Lift', `Floor ${floor} already in queue`);
        return;
    }
    
    // Add to queue (enqueue)
    elevatorState.requestQueue.push(floor);
    
    // Visual feedback
    document.getElementById(`inside-btn-${floor}`).classList.add('pressed');
    setTimeout(() => {
        document.getElementById(`inside-btn-${floor}`).classList.remove('pressed');
    }, 200);
    
    // Update visualizations
    renderQueue();
    updateExplanation('queue', `Floor ${floor} added to Queue (enqueue) - Requests processed in FIFO order`);
    logOperation('Inside Lift', `Pressed floor ${floor} - Added to queue`);
    
    // Start processing if not already moving
    if (!elevatorState.isProcessing) {
        processQueue();
    }
}

// Call elevator from floor
function callElevator(floor) {
    // Check direction rules
    if (elevatorState.isMoving) {
        if (elevatorState.direction === 'up' && floor < elevatorState.currentFloor) {
            logOperation('Floor Call', `Ignored - Lift moving UP, request for floor ${floor} is below`);
            updateExplanation('queue', `Request ignored - Lift moving ${elevatorState.direction.toUpperCase()}, cannot serve lower floor`);
            return;
        }
        if (elevatorState.direction === 'down' && floor > elevatorState.currentFloor) {
            logOperation('Floor Call', `Ignored - Lift moving DOWN, request for floor ${floor} is above`);
            updateExplanation('queue', `Request ignored - Lift moving ${elevatorState.direction.toUpperCase()}, cannot serve higher floor`);
            return;
        }
    }
    
    // Add to queue (enqueue)
    elevatorState.requestQueue.push(floor);
    
    // Visual feedback
    const floorEl = document.getElementById(`floor-${floor}`);
    floorEl.classList.add('call-waiting');
    
    // Update visualizations
    renderQueue();
    updateExplanation('queue', `Floor ${floor} call added to Queue (enqueue)`);
    logOperation('Floor Call', `Called lift at floor ${floor}`);
    
    // Start processing if not already moving
    if (!elevatorState.isProcessing) {
        processQueue();
    }
}

// Process the request queue
async function processQueue() {
    if (elevatorState.requestQueue.length === 0) {
        elevatorState.isProcessing = false;
        elevatorState.direction = 'idle';
        updateElevatorDisplay();
        updateExplanation('queue', 'Queue empty - Lift idle');
        return;
    }
    
    elevatorState.isProcessing = true;
    
    // Dequeue the first request
    const targetFloor = elevatorState.requestQueue.shift();
    renderQueue();
    updateExplanation('queue', `Dequeued floor ${targetFloor} - Processing request`);
    logOperation('Queue', `Processing request for floor ${targetFloor}`);
    
    // Determine direction
    const diff = targetFloor - elevatorState.currentFloor;
    elevatorState.direction = diff > 0 ? 'up' : diff < 0 ? 'down' : 'idle';
    updateElevatorDisplay();
    
    // Move elevator
    await moveToFloor(targetFloor);
    
    // Push to stack (visited history)
    elevatorState.visitedStack.push(elevatorState.currentFloor);
    renderStack();
    updateExplanation('stack', `Visited floor ${elevatorState.currentFloor} stored in Stack (push)`);
    logOperation('Stack', `Floor ${elevatorState.currentFloor} added to history`);
    
    // Open doors
    openDoors();
    await sleep(1000);
    closeDoors();
    
    // Process next request
    processQueue();
}

// Move elevator to target floor with animation
async function moveToFloor(targetFloor) {
    elevatorState.isMoving = true;
    
    const startFloor = elevatorState.currentFloor;
    const diff = targetFloor - startFloor;
    const steps = Math.abs(diff);
    const floorHeight = 36; // height of each floor in pixels
    
    for (let i = 1; i <= steps; i++) {
        const currentStep = startFloor + (diff > 0 ? i : -i);
        
        // Determine if we should slow down (last 2 floors)
        const elevator = document.getElementById('elevator');
        if (Math.abs(targetFloor - currentStep) <= 2) {
            elevator.classList.add('slowing');
            elevator.classList.remove('moving');
        } else {
            elevator.classList.add('moving');
            elevator.classList.remove('slowing');
        }
        
        elevatorState.currentFloor = currentStep;
        updateElevatorDisplay();
        
        // Animate
        const bottomPos = 4 + (currentStep * floorHeight);
        document.getElementById('elevator').style.bottom = `${bottomPos}px`;
        
        // Linked List traversal explanation
        if (currentStep > 0 && currentStep < TOTAL_FLOORS - 1) {
            updateExplanation('ll', `Traversing Linked List: Floor ${currentStep-1} â†’ Floor ${currentStep} â†’ Floor ${currentStep+1}`);
        }
        
        await sleep(500);
    }
    
    elevatorState.isMoving = false;
    elevatorState.direction = 'idle';
    updateElevatorDisplay();
    
    const elevator = document.getElementById('elevator');
    elevator.classList.remove('moving', 'slowing');
}

// Open elevator doors
function openDoors() {
    const elevator = document.getElementById('elevator');
    elevator.classList.add('doors-open');
    logOperation('Doors', 'Opening doors...');
}

// Close elevator doors
function closeDoors() {
    const elevator = document.getElementById('elevator');
    elevator.classList.remove('doors-open');
    logOperation('Doors', 'Closing doors...');
}

// Update elevator display (floor and direction)
function updateElevatorDisplay() {
    document.getElementById('elevatorFloor').innerText = elevatorState.currentFloor;
    
    const dirEl = document.getElementById('elevatorDirection');
    if (elevatorState.direction === 'up') {
        dirEl.innerText = 'â†‘';
        dirEl.style.color = 'var(--green)';
    } else if (elevatorState.direction === 'down') {
        dirEl.innerText = 'â†“';
        dirEl.style.color = 'var(--red)';
    } else {
        dirEl.innerText = 'â—';
        dirEl.style.color = 'var(--muted)';
    }
}

// Render queue visualization
function renderQueue() {
    const container = document.getElementById('queueVisualization');
    if (elevatorState.requestQueue.length === 0) {
        container.innerHTML = '<span class="placeholder">Empty queue</span>';
        return;
    }
    
    container.innerHTML = '';
    elevatorState.requestQueue.forEach((floor, index) => {
        const node = document.createElement('span');
        node.className = 'node' + (index === 0 ? ' highlight' : '');
        node.innerText = floor;
        container.appendChild(node);
        
        if (index < elevatorState.requestQueue.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'arrow';
            arrow.innerText = '->';
            container.appendChild(arrow);
        }
    });
}

// Render stack visualization
function renderStack() {
    const container = document.getElementById('stackVisualization');
    if (elevatorState.visitedStack.length === 0) {
        container.innerHTML = '<span class="placeholder">Empty stack</span>';
        return;
    }
    
    container.innerHTML = '';
    // Show stack from top (most recent) to bottom
    [...elevatorState.visitedStack].reverse().forEach((floor, index) => {
        const node = document.createElement('span');
        node.className = 'node' + (index === 0 ? ' highlight' : '');
        node.innerText = floor;
        container.appendChild(node);
    });
}

// Render linked list visualization
function renderLinkedList() {
    const container = document.getElementById('llVisualization');
    if (elevatorState.linkedListFloors.length === 0) {
        container.innerHTML = '<span class="placeholder">No floors</span>';
        return;
    }
    
    container.innerHTML = '';
    elevatorState.linkedListFloors.forEach((node, index) => {
        const floorNode = document.createElement('span');
        floorNode.className = 'node';
        if (node.floor === elevatorState.currentFloor) {
            floorNode.classList.add('highlight');
        }
        floorNode.innerText = node.floor;
        container.appendChild(floorNode);
        
        if (index < elevatorState.linkedListFloors.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'arrow';
            arrow.innerText = '<->';
            container.appendChild(arrow);
        }
    });
}

// Update explanation panel
function updateExplanation(type, message) {
    const el = document.getElementById(`${type}Explanation`);
    if (el) {
        el.innerText = message;
    }
}

// Log operation to the operation log
function logOperation(operation, detail) {
    const log = document.getElementById('operationLog');
    const time = new Date().toLocaleTimeString();
    
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="time">[${time}]</span><span class="operation">${operation}:</span> <span class="detail">${detail}</span>`;
    
    log.appendChild(entry);
    log.scrollTop = log.scrollHeight;
}

// Reset elevator
function resetElevator() {
    elevatorState = {
        currentFloor: 0,
        direction: 'idle',
        isMoving: false,
        requestQueue: [],
        visitedStack: [],
        linkedListFloors: [],
        isProcessing: false
    };
    
    initLinkedList();
    renderQueue();
    renderStack();
    renderLinkedList();
    
    document.getElementById('elevator').style.bottom = '4px';
    updateElevatorDisplay();
    
    // Clear floor call waiting states
    for (let i = 0; i < TOTAL_FLOORS; i++) {
        const floorEl = document.getElementById(`floor-${i}`);
        if (floorEl) floorEl.classList.remove('call-waiting');
    }
    
    document.getElementById('operationLog').innerHTML = '<span class="placeholder">Elevator reset...</span>';
    logOperation('System', 'Elevator reset');
    updateExplanation('queue', 'Queue cleared');
    updateExplanation('stack', 'History cleared');
    updateExplanation('ll', 'Floors reconnected');
}

// Utility function
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==========================================
// ELEVATOR SIMULATION OVERRIDES
// Keeps Application Mode modular while preserving existing demos above.
// ==========================================
function createElevatorState() {
    return {
        currentFloor: 0,
        visualFloor: 0,
        direction: 'idle',
        isMoving: false,
        requestQueue: [],
        visitedStack: [],
        linkedListFloors: [],
        activeTarget: null,
        rafId: null,
        initialized: false
    };
}

function initElevator() {
    if (!elevatorState || typeof elevatorState.visualFloor === 'undefined') {
        elevatorState = createElevatorState();
    }

    initLinkedList();
    generateFloors();
    generateInsideButtons();
    generateCallButtons();
    elevatorState.initialized = true;
    renderElevatorState();

    const log = document.getElementById('operationLog');
    if (log && log.querySelector('.placeholder')) {
        log.innerHTML = '';
        logOperation('System', 'Elevator initialized. Queue, Stack, and Linked List views are ready.');
    }
}

function initLinkedList() {
    elevatorState.linkedListFloors = [];
    for (let i = 0; i < TOTAL_FLOORS; i++) {
        elevatorState.linkedListFloors.push({
            floor: i,
            prev: i > 0 ? i - 1 : null,
            next: i < TOTAL_FLOORS - 1 ? i + 1 : null
        });
    }
}

function generateFloors() {
    const floorsContainer = document.getElementById('floorsContainer');
    if (!floorsContainer) return;
    floorsContainer.innerHTML = '';

    for (let i = TOTAL_FLOORS - 1; i >= 0; i--) {
        const floor = document.createElement('div');
        floor.className = 'floor';
        floor.id = `floor-${i}`;
        floor.innerHTML = `<span>Floor ${i}</span><span class="floor-marker"></span>`;
        floorsContainer.appendChild(floor);
    }
}

function generateInsideButtons() {
    const container = document.getElementById('insideButtons');
    if (!container) return;
    container.innerHTML = '';

    for (let i = 0; i < TOTAL_FLOORS; i++) {
        const btn = document.createElement('button');
        btn.className = 'floor-btn';
        btn.innerText = i;
        btn.onclick = () => pressFloorButton(i);
        btn.id = `inside-btn-${i}`;
        container.appendChild(btn);
    }
}

function generateCallButtons() {
    const container = document.getElementById('callButtons');
    if (!container) return;
    container.innerHTML = '';

    for (let i = TOTAL_FLOORS - 1; i >= 0; i--) {
        const row = document.createElement('div');
        row.className = 'call-row';

        const label = document.createElement('span');
        label.innerText = `Floor ${i}`;

        const select = document.createElement('select');
        select.id = `destination-${i}`;
        select.setAttribute('aria-label', `Destination from floor ${i}`);
        for (let floor = 0; floor < TOTAL_FLOORS; floor++) {
            const option = document.createElement('option');
            option.value = floor;
            option.innerText = floor;
            if (floor === Math.min(TOTAL_FLOORS - 1, i + 1)) option.selected = true;
            select.appendChild(option);
        }

        const btn = document.createElement('button');
        btn.className = 'call-btn';
        btn.innerText = 'Call';
        btn.onclick = () => callElevator(i);
        btn.id = `call-btn-${i}`;

        row.appendChild(label);
        row.appendChild(select);
        row.appendChild(btn);
        container.appendChild(row);
    }
}

function pressFloorButton(floor) {
    const btn = document.getElementById(`inside-btn-${floor}`);
    if (btn) {
        btn.classList.add('pressed');
        setTimeout(() => btn.classList.remove('pressed'), 220);
    }

    addElevatorRequest(floor, `inside lift button ${floor}`);
}

function callElevator(floor) {
    const destinationSelect = document.getElementById(`destination-${floor}`);
    const destination = destinationSelect ? Number(destinationSelect.value) : floor;
    const pickupAccepted = addElevatorRequest(floor, `outside call at floor ${floor}`);

    if (pickupAccepted && destination !== floor) {
        addElevatorRequest(destination, `destination ${destination} selected from floor ${floor}`);
    }
}

function addElevatorRequest(floor, source) {
    floor = Number(floor);

    if (elevatorState.isMoving && elevatorState.direction === 'up' && floor < elevatorState.currentFloor) {
        logOperation('Queue', `Ignored floor ${floor}. Lift is moving UP, so lower-floor requests are skipped.`);
        updateExplanation('queue', `Request ignored: floor ${floor} is below the current path while moving UP.`);
        return false;
    }

    if (elevatorState.isMoving && elevatorState.direction === 'down' && floor > elevatorState.currentFloor) {
        logOperation('Queue', `Ignored floor ${floor}. Lift is moving DOWN, so higher-floor requests are skipped.`);
        updateExplanation('queue', `Request ignored: floor ${floor} is above the current path while moving DOWN.`);
        return false;
    }

    if (floor === elevatorState.currentFloor && !elevatorState.isMoving) {
        logOperation('Door', `Lift is already at floor ${floor}. Doors open for the request.`);
        openDoors();
        return false;
    }

    const duplicate = elevatorState.requestQueue.some(request => request.floor === floor) || elevatorState.activeTarget === floor;
    if (duplicate) {
        logOperation('Queue', `Floor ${floor} already exists in the queue, so no duplicate enqueue is needed.`);
        return false;
    }

    elevatorState.requestQueue.push({ floor, source });
    const floorEl = document.getElementById(`floor-${floor}`);
    if (floorEl) floorEl.classList.add('call-waiting');
    renderQueue();
    logOperation('Queue', `Enqueue floor ${floor} from ${source}. FIFO order is preserved.`);
    updateExplanation('queue', `Floor ${floor} added to Queue (enqueue). Requests are served from front to rear.`);
    processQueue();
    return true;
}

function processQueue() {
    if (elevatorState.isMoving) return;

    if (elevatorState.requestQueue.length === 0) {
        elevatorState.direction = 'idle';
        elevatorState.activeTarget = null;
        updateElevatorDisplay();
        updateExplanation('queue', 'Queue empty. Lift is idle and waiting for enqueue.');
        return;
    }

    const request = elevatorState.requestQueue.shift();
    elevatorState.activeTarget = request.floor;
    renderQueue();
    logOperation('Queue', `Dequeue floor ${request.floor}. It is now the active destination.`);
    updateExplanation('queue', `Floor ${request.floor} removed from Queue (dequeue) and sent to movement logic.`);
    moveToFloor(request.floor);
}

function moveToFloor(targetFloor) {
    const startFloor = elevatorState.currentFloor;
    const distance = Math.abs(targetFloor - startFloor);
    if (distance === 0) {
        arriveAtFloor(targetFloor);
        return;
    }

    elevatorState.isMoving = true;
    elevatorState.direction = targetFloor > startFloor ? 'up' : 'down';
    updateElevatorDisplay();
    closeDoors();

    const startTime = performance.now();
    const duration = 700 + distance * 300;
    const elevator = document.getElementById('elevator');
    if (elevator) elevator.classList.add('moving');

    const step = now => {
        const elapsed = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - elapsed, 3);
        elevatorState.visualFloor = startFloor + (targetFloor - startFloor) * eased;
        elevatorState.currentFloor = Math.round(elevatorState.visualFloor);
        updateElevatorDisplay();
        updateElevatorPosition();
        renderLinkedList();

        const currentNode = elevatorState.linkedListFloors[elevatorState.currentFloor];
        if (currentNode) {
            const link = elevatorState.direction === 'up' ? 'next' : 'prev';
            updateExplanation('ll', `Moving to next node in Linked List: at floor ${currentNode.floor}, following ${link} pointers toward ${targetFloor}.`);
        }

        if (elapsed < 1) {
            elevatorState.rafId = requestAnimationFrame(step);
        } else {
            arriveAtFloor(targetFloor);
        }
    };

    logOperation('Linked List', `Traversal starts at floor ${startFloor} and moves ${elevatorState.direction.toUpperCase()} toward floor ${targetFloor}.`);
    elevatorState.rafId = requestAnimationFrame(step);
}

function arriveAtFloor(floor) {
    const elevator = document.getElementById('elevator');
    if (elevator) elevator.classList.remove('moving');

    elevatorState.visualFloor = floor;
    elevatorState.currentFloor = floor;
    elevatorState.isMoving = false;
    elevatorState.activeTarget = null;
    elevatorState.direction = 'idle';
    elevatorState.visitedStack.push(floor);

    const floorEl = document.getElementById(`floor-${floor}`);
    if (floorEl) floorEl.classList.remove('call-waiting');

    renderElevatorState();
    logOperation('Stack', `Push floor ${floor}. It is now on top of the visited-floor Stack.`);
    updateExplanation('stack', `Visited floor ${floor} stored in Stack (push). Newest movement is shown at the top.`);
    openDoors();

    setTimeout(() => {
        closeDoors();
        processQueue();
    }, 850);
}

function openDoors() {
    const elevator = document.getElementById('elevator');
    if (elevator) elevator.classList.add('doors-open');
    logOperation('Door', 'Door open animation shows passenger pickup/drop-off.');
}

function closeDoors() {
    const elevator = document.getElementById('elevator');
    if (elevator) elevator.classList.remove('doors-open');
}

function renderElevatorState() {
    updateElevatorDisplay();
    updateElevatorPosition();
    renderQueue();
    renderStack();
    renderLinkedList();
}

function updateElevatorDisplay() {
    const floorEl = document.getElementById('elevatorFloor');
    if (floorEl) floorEl.innerText = elevatorState.currentFloor;

    const dirEl = document.getElementById('elevatorDirection');
    if (!dirEl) return;

    if (elevatorState.direction === 'up') {
        dirEl.innerText = 'UP';
        dirEl.style.color = 'var(--green)';
    } else if (elevatorState.direction === 'down') {
        dirEl.innerText = 'DOWN';
        dirEl.style.color = 'var(--red)';
    } else {
        dirEl.innerText = 'IDLE';
        dirEl.style.color = 'var(--muted)';
    }
}

function updateElevatorPosition() {
    const elevator = document.getElementById('elevator');
    if (!elevator) return;

    const percent = (elevatorState.visualFloor / (TOTAL_FLOORS - 1)) * 100;
    elevator.style.bottom = `calc(${percent}% - ${(percent / 100) * 56}px)`;
}

function renderQueue() {
    const container = document.getElementById('queueVisualization');
    if (!container) return;

    if (elevatorState.requestQueue.length === 0) {
        container.innerHTML = '<span class="placeholder">Empty queue</span>';
        return;
    }

    container.innerHTML = '';
    elevatorState.requestQueue.forEach((request, index) => {
        const node = document.createElement('span');
        node.className = 'node' + (index === 0 ? ' highlight' : '');
        node.innerText = `${index === 0 ? 'Front ' : ''}${request.floor}`;
        container.appendChild(node);

        if (index < elevatorState.requestQueue.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'arrow';
            arrow.innerText = '->';
            container.appendChild(arrow);
        }
    });
}

function renderStack() {
    const container = document.getElementById('stackVisualization');
    if (!container) return;

    if (elevatorState.visitedStack.length === 0) {
        container.innerHTML = '<span class="placeholder">Empty stack</span>';
        return;
    }

    container.innerHTML = '';
    elevatorState.visitedStack.slice().reverse().forEach((floor, index) => {
        const node = document.createElement('span');
        node.className = 'node' + (index === 0 ? ' highlight' : '');
        node.innerText = `${index === 0 ? 'Top ' : ''}${floor}`;
        container.appendChild(node);
    });
}

function renderLinkedList() {
    const container = document.getElementById('llVisualization');
    if (!container) return;

    if (elevatorState.linkedListFloors.length === 0) {
        container.innerHTML = '<span class="placeholder">No floors</span>';
        return;
    }

    container.innerHTML = '';
    elevatorState.linkedListFloors.forEach((node, index) => {
        const floorNode = document.createElement('span');
        floorNode.className = 'node';
        if (node.floor === elevatorState.currentFloor) floorNode.classList.add('highlight');
        if (node.floor === elevatorState.activeTarget) floorNode.classList.add('target');
        floorNode.innerText = node.floor;
        container.appendChild(floorNode);

        if (index < elevatorState.linkedListFloors.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'arrow';
            arrow.innerText = '<->';
            container.appendChild(arrow);
        }
    });

    const currentNode = elevatorState.linkedListFloors[elevatorState.currentFloor];
    if (currentNode) {
        updateExplanation('ll', `Current node ${currentNode.floor}: prev=${currentNode.prev === null ? 'null' : currentNode.prev}, next=${currentNode.next === null ? 'null' : currentNode.next}.`);
    }
}

function updateExplanation(type, message) {
    const el = document.getElementById(`${type}Explanation`);
    if (el) el.innerText = message;
}

function logOperation(operation, detail) {
    const log = document.getElementById('operationLog');
    if (!log) return;

    const placeholder = log.querySelector('.placeholder');
    if (placeholder) log.innerHTML = '';

    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="time">[${time}]</span><span class="operation">${operation}:</span> <span class="detail">${detail}</span>`;

    log.prepend(entry);
    while (log.children.length > 10) log.removeChild(log.lastChild);
}

function resetElevator() {
    if (elevatorState && elevatorState.rafId) cancelAnimationFrame(elevatorState.rafId);
    elevatorState = createElevatorState();
    initElevator();
    const log = document.getElementById('operationLog');
    if (log) log.innerHTML = '<span class="placeholder">Elevator reset...</span>';
    logOperation('System', 'Queue cleared, Stack cleared, and lift returned to floor 0.');
    updateExplanation('queue', 'Queue cleared. Waiting for enqueue.');
    updateExplanation('stack', 'Stack cleared. No visited floors yet.');
    updateExplanation('ll', 'Linked List rebuilt from floor 0 through floor 10.');
}

