// Smart Task Analyzer - Complete Working Solution
class TaskAnalyzer {
    constructor() {
        this.tasks = [];
        this.currentStrategy = 'smart_balance';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.updateUI();
        this.showMessage('🎉 Smart Task Analyzer Ready! Click "Load Sample Tasks" to start.', 'success');
    }

    bindEvents() {
        // Form submission
        document.getElementById('taskForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addTaskFromForm();
        });

        // Analyze button
        document.getElementById('analyzeBtn').addEventListener('click', () => {
            this.analyzeTasks();
        });

        // JSON load button
        document.getElementById('loadJsonBtn').addEventListener('click', () => {
            this.loadTasksFromJson();
        });

        // Sample tasks button
        document.getElementById('loadSampleBtn').addEventListener('click', () => {
            this.loadSampleTasks();
        });

        // Strategy changes
        document.querySelectorAll('input[name="strategy"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.currentStrategy = e.target.value;
                if (this.tasks.length > 0) {
                    this.analyzeTasks();
                }
            });
        });

        // Navigation menu items - Make them functional
        this.bindNavigationEvents();

        // Mobile menu toggle
        const toggle = document.querySelector('.toggle');
        const left = document.querySelector('.left');
        
        if (toggle) {
            toggle.addEventListener('click', () => {
                toggle.classList.toggle('active');
                left.classList.toggle('active');
            });
        }

        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').min = today;
    }

    bindNavigationEvents() {
        // Make navigation items functional
        const navItems = document.querySelectorAll('.left header nav ul li a');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all items
                navItems.forEach(nav => nav.classList.remove('nav-active'));
                
                // Add active class to clicked item
                item.classList.add('nav-active');
                
                // Show appropriate content based on navigation
                const title = item.querySelector('.title').textContent;
                this.handleNavigation(title);
            });
        });

        // Make upgrade button functional
        const upgradeBtn = document.querySelector('.upgrade .upBtn button');
        if (upgradeBtn) {
            upgradeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showMessage('🚀 Upgrade to PRO feature would be implemented here!', 'success');
            });
        }

        // Make user dropdown functional
        const userArrow = document.querySelector('.user .arrow');
        if (userArrow) {
            userArrow.addEventListener('click', () => {
                this.showMessage('👤 User menu would open here!', 'success');
            });
        }

        // Make notification bell functional
        const notificationBell = document.querySelector('.user .icon-btn');
        if (notificationBell) {
            notificationBell.addEventListener('click', () => {
                this.showMessage('🔔 Notifications would appear here!', 'success');
            });
        }
    }

    handleNavigation(title) {
        switch(title) {
            case 'Dashboard':
                this.showMessage('📊 Welcome to Dashboard!', 'success');
                break;
            case 'Task Analysis':
                this.showMessage('📈 Task Analysis view loaded!', 'success');
                // Auto-analyze if we have tasks
                if (this.tasks.length > 0) {
                    this.analyzeTasks();
                }
                break;
            case 'Priority Insights':
                this.showMessage('💡 Priority Insights view loaded!', 'success');
                break;
            case 'Settings':
                this.showMessage('⚙️ Settings view loaded!', 'success');
                break;
            default:
                this.showMessage(`📍 ${title} view loaded!`, 'success');
        }
    }

    addTaskFromForm() {
        const title = document.getElementById('taskTitle').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const estimatedHours = parseFloat(document.getElementById('estimatedHours').value);
        const importance = parseInt(document.getElementById('importance').value);
        const dependencies = document.getElementById('dependencies').value
            .split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id) && id > 0);

        // Validation
        if (!title) {
            this.showMessage('❌ Task title is required', 'error');
            document.getElementById('taskTitle').focus();
            return;
        }
        if (!dueDate) {
            this.showMessage('❌ Due date is required', 'error');
            document.getElementById('dueDate').focus();
            return;
        }
        if (isNaN(estimatedHours) || estimatedHours <= 0) {
            this.showMessage('❌ Please enter valid estimated hours (minimum 0.5)', 'error');
            document.getElementById('estimatedHours').focus();
            return;
        }
        if (isNaN(importance) || importance < 1 || importance > 10) {
            this.showMessage('❌ Importance must be between 1 and 10', 'error');
            document.getElementById('importance').focus();
            return;
        }

        const task = {
            title,
            due_date: dueDate,
            estimated_hours: estimatedHours,
            importance,
            dependencies
        };

        this.tasks.push(task);
        this.saveToLocalStorage();
        this.updateUI();
        this.clearForm();
        this.showMessage('✅ Task added successfully!', 'success');
    }

    clearForm() {
        document.getElementById('taskForm').reset();
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').min = today;
        document.getElementById('taskTitle').focus();
    }

    loadTasksFromJson() {
        const jsonInput = document.getElementById('jsonInput').value.trim();
        
        if (!jsonInput) {
            this.showMessage('❌ Please enter JSON data', 'error');
            document.getElementById('jsonInput').focus();
            return;
        }

        try {
            const parsedTasks = JSON.parse(jsonInput);
            
            if (!Array.isArray(parsedTasks)) {
                throw new Error('Expected an array of tasks');
            }

            // Validate each task has required fields
            parsedTasks.forEach((task, index) => {
                if (!task.title || !task.due_date || !task.estimated_hours || !task.importance) {
                    throw new Error(`Task ${index + 1} is missing required fields`);
                }
            });

            this.tasks = parsedTasks;
            this.saveToLocalStorage();
            this.updateUI();
            this.showMessage(`✅ Loaded ${parsedTasks.length} tasks from JSON!`, 'success');

        } catch (error) {
            this.showMessage(`❌ Error parsing JSON: ${error.message}`, 'error');
        }
    }

    loadSampleTasks() {
        const sampleTasks = [
            {
                "title": "🚨 Fix critical login bug",
                "due_date": new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "estimated_hours": 4,
                "importance": 9,
                "dependencies": []
            },
            {
                "title": "📝 Write project documentation",
                "due_date": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "estimated_hours": 6,
                "importance": 7,
                "dependencies": [1]
            },
            {
                "title": "⚙️ Setup CI/CD pipeline",
                "due_date": new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "estimated_hours": 8,
                "importance": 8,
                "dependencies": []
            },
            {
                "title": "🔍 Code review for feature X",
                "due_date": new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "estimated_hours": 2,
                "importance": 6,
                "dependencies": []
            },
            {
                "title": "👥 Team meeting preparation",
                "due_date": new Date().toISOString().split('T')[0],
                "estimated_hours": 1,
                "importance": 5,
                "dependencies": []
            }
        ];

        this.tasks = sampleTasks;
        this.saveToLocalStorage();
        this.updateUI();
        this.showMessage('✅ 5 sample tasks loaded! Now click "Analyze Tasks"', 'success');
    }

    analyzeTasks() {
        if (this.tasks.length === 0) {
            this.showMessage('❌ No tasks to analyze. Please add some tasks first.', 'error');
            return;
        }

        const analyzeBtn = document.getElementById('analyzeBtn');
        const originalText = analyzeBtn.innerHTML;
        
        analyzeBtn.classList.add('loading');
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '🔍 Analyzing Tasks...';

        // Use local analysis (bypass API completely)
        setTimeout(() => {
            this.performLocalAnalysis();
            
            analyzeBtn.classList.remove('loading');
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalText;
            
            this.displayResults(this.tasks);
            this.displaySuggestions(this.tasks.slice(0, 3));
            
            this.showMessage(`✅ Successfully analyzed ${this.tasks.length} tasks using ${this.getStrategyName(this.currentStrategy)} strategy!`, 'success');
        }, 800);
    }

    performLocalAnalysis() {
        const today = new Date();
        
        // Calculate scores for all tasks using smart algorithm
        const scoredTasks = this.tasks.map(task => {
            const dueDate = new Date(task.due_date);
            const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            // Calculate component scores
            let urgency, importance, effort, dependency;
            
            // Urgency score (based on days until due)
            if (daysUntilDue < 0) urgency = 1.0; // Overdue
            else if (daysUntilDue === 0) urgency = 0.9; // Due today
            else if (daysUntilDue <= 1) urgency = 0.8; // Tomorrow
            else if (daysUntilDue <= 3) urgency = 0.6; // 2-3 days
            else if (daysUntilDue <= 7) urgency = 0.4; // 4-7 days
            else urgency = 0.2; // More than 7 days
            
            // Importance score (normalize 1-10 to 0-1)
            importance = task.importance / 10;
            
            // Effort score (inverse relationship - lower effort = higher score)
            if (task.estimated_hours <= 1) effort = 1.0;
            else if (task.estimated_hours <= 4) effort = 0.7;
            else if (task.estimated_hours <= 8) effort = 0.4;
            else effort = 0.2;
            
            // Dependency score (tasks that block others get higher priority)
            dependency = task.dependencies && task.dependencies.length > 0 ? 0.8 : 0.3;
            
            // Get weights based on strategy
            const weights = this.getWeights();
            
            // Calculate overall priority score
            const priority_score = 
                (urgency * weights.urgency) +
                (importance * weights.importance) +
                (effort * weights.effort) +
                (dependency * weights.dependencies);
            
            const explanation = this.generateExplanation(urgency, importance, effort, dependency);
            
            return {
                ...task,
                priority_score: Math.min(1, Math.max(0, priority_score)),
                explanation,
                component_scores: {
                    urgency: Math.round(urgency * 100) / 100,
                    importance: Math.round(importance * 100) / 100,
                    effort: Math.round(effort * 100) / 100,
                    dependency: Math.round(dependency * 100) / 100
                }
            };
        });
        
        // Sort by priority score (highest first)
        this.tasks = scoredTasks.sort((a, b) => b.priority_score - a.priority_score);
        this.saveToLocalStorage();
    }

    getWeights() {
        const weights = {
            'smart_balance': { urgency: 0.4, importance: 0.3, effort: 0.2, dependencies: 0.1 },
            'fastest_wins': { urgency: 0.2, importance: 0.2, effort: 0.5, dependencies: 0.1 },
            'high_impact': { urgency: 0.2, importance: 0.6, effort: 0.1, dependencies: 0.1 },
            'deadline_driven': { urgency: 0.7, importance: 0.1, effort: 0.1, dependencies: 0.1 }
        };
        return weights[this.currentStrategy] || weights['smart_balance'];
    }

    generateExplanation(urgency, importance, effort, dependency) {
        const parts = [];
        if (urgency > 0.7) parts.push('high urgency');
        if (importance > 0.7) parts.push('high importance');
        if (effort > 0.7) parts.push('quick win');
        if (dependency > 0.7) parts.push('blocks other tasks');
        
        return parts.length > 0 
            ? `This task has ${parts.join(', ')}`
            : 'This task has moderate priority across all factors';
    }

    displayResults(tasks) {
        const container = document.getElementById('resultsContainer');
        const taskCount = document.getElementById('taskCount');
        
        taskCount.textContent = `${tasks.length} tasks analyzed (${this.getStrategyName(this.currentStrategy)})`;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="emptyState">
                    <span class="material-symbols-outlined">analytics</span>
                    <h3>No tasks analyzed yet</h3>
                    <p>Add tasks and click "Analyze Tasks" to see priority scores</p>
                </div>
            `;
            return;
        }

        container.innerHTML = tasks.map((task, index) => {
            const priorityClass = this.getPriorityClass(task.priority_score);
            const priorityLevel = this.getPriorityLevel(task.priority_score);
            
            return `
                <div class="taskItem ${priorityClass}">
                    <div class="taskHeader">
                        <div>
                            <div class="taskTitle">${task.title}</div>
                            <div class="taskRank">#${index + 1} in priority - ${priorityLevel} priority</div>
                        </div>
                        <div class="priorityScore">${task.priority_score.toFixed(3)}</div>
                    </div>
                    <div class="taskDetails">
                        <div class="taskDetail">
                            <span class="material-symbols-outlined">calendar_today</span>
                            Due: ${new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined">schedule</span>
                            ${task.estimated_hours}h estimated
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined">priority</span>
                            Importance: ${task.importance}/10
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined">link</span>
                            Dependencies: ${task.dependencies && task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}
                        </div>
                    </div>
                    <div class="taskExplanation">${task.explanation}</div>
                    <div class="taskScores">
                        <small>Component scores: Urgency (${task.component_scores.urgency}), Importance (${task.component_scores.importance}), Effort (${task.component_scores.effort}), Dependencies (${task.component_scores.dependency})</small>
                    </div>
                </div>
            `;
        }).join('');
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('suggestionsContainer');

        if (!suggestions || suggestions.length === 0) {
            container.innerHTML = `
                <div class="emptyState">
                    <span class="material-symbols-outlined">lightbulb</span>
                    <h3>No suggestions yet</h3>
                    <p>Analyze tasks to get personalized recommendations</p>
                </div>
            `;
            return;
        }

        container.innerHTML = suggestions.map((task, index) => {
            const reasons = [];
            if (task.component_scores.urgency > 0.7) reasons.push('urgent deadline');
            if (task.component_scores.importance > 0.7) reasons.push('high importance');
            if (task.component_scores.effort > 0.7) reasons.push('quick win');
            if (task.component_scores.dependency > 0.7) reasons.push('blocks other tasks');
            
            const reasonText = reasons.length > 0 ? reasons.join(', ') : 'balanced priority';

            return `
                <div class="suggestionItem">
                    <div class="suggestionRank">${index + 1}</div>
                    <div class="taskTitle">${task.title}</div>
                    <div class="taskDetails">
                        <div class="taskDetail">
                            <span class="material-symbols-outlined">calendar_today</span>
                            ${new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined">schedule</span>
                            ${task.estimated_hours}h
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined">priority</span>
                            Score: ${task.priority_score.toFixed(3)}
                        </div>
                    </div>
                    <div class="taskExplanation">
                        <strong>Why start this:</strong> Priority #${index + 1} - ${reasonText}
                    </div>
                </div>
            `;
        }).join('');
    }

    getStrategyName(strategy) {
        const names = {
            'smart_balance': 'Smart Balance',
            'fastest_wins': 'Fastest Wins', 
            'high_impact': 'High Impact',
            'deadline_driven': 'Deadline Driven'
        };
        return names[strategy] || strategy;
    }

    getPriorityClass(score) {
        if (score >= 0.7) return 'high-priority';
        if (score >= 0.4) return 'medium-priority';
        return 'low-priority';
    }

    getPriorityLevel(score) {
        if (score >= 0.7) return 'High';
        if (score >= 0.4) return 'Medium';
        return 'Low';
    }

    showMessage(message, type) {
        // Remove any existing messages first
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => {
            if (msg.parentNode) {
                msg.parentNode.removeChild(msg);
            }
        });

        // Create new message element
        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            z-index: 10000;
            padding: 15px 20px;
            border-radius: 8px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
        `;

        // Add styles for different message types
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#d4edda';
            messageDiv.style.color = '#155724';
            messageDiv.style.border = '1px solid #c3e6cb';
        } else {
            messageDiv.style.backgroundColor = '#f8d7da';
            messageDiv.style.color = '#721c24';
            messageDiv.style.border = '1px solid #f5c6cb';
        }

        // Add to body instead of main to ensure visibility
        document.body.appendChild(messageDiv);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.style.animation = 'slideOut 0.3s ease-in';
                setTimeout(() => {
                    if (messageDiv.parentNode) {
                        messageDiv.parentNode.removeChild(messageDiv);
                    }
                }, 300);
            }
        }, 5000);
    }

    saveToLocalStorage() {
        localStorage.setItem('smartTaskAnalyzer_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('smartTaskAnalyzer_strategy', this.currentStrategy);
    }

    loadFromLocalStorage() {
        const savedTasks = localStorage.getItem('smartTaskAnalyzer_tasks');
        const savedStrategy = localStorage.getItem('smartTaskAnalyzer_strategy');
        
        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);
            } catch (e) {
                this.tasks = [];
            }
        }
        
        if (savedStrategy) {
            this.currentStrategy = savedStrategy;
            const radio = document.querySelector(`input[value="${savedStrategy}"]`);
            if (radio) radio.checked = true;
        }
    }

    updateUI() {
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = this.tasks.length === 0;
        }
    }
}

// Add CSS animations for messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .success-message, .error-message {
        position: fixed !important;
        top: 100px !important;
        right: 20px !important;
        z-index: 10000 !important;
        padding: 15px 20px !important;
        border-radius: 8px !important;
        font-weight: 500 !important;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15) !important;
        animation: slideIn 0.3s ease-out !important;
        max-width: 400px !important;
    }
    
    .success-message {
        background-color: #d4edda !important;
        color: #155724 !important;
        border: 1px solid #c3e6cb !important;
    }
    
    .error-message {
        background-color: #f8d7da !important;
        color: #721c24 !important;
        border: 1px solid #f5c6cb !important;
    }
`;
document.head.appendChild(style);

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new TaskAnalyzer();
    console.log('🎯 Smart Task Analyzer initialized successfully!');
});