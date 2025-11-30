// Smart Task Analyzer - Complete Frontend Application
class TaskAnalyzer {
    constructor() {
        this.tasks = [];
        this.currentStrategy = 'smart_balance';
        this.apiBaseUrl = 'http://127.0.0.1:8000/api';
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadFromLocalStorage();
        this.updateUI();
        this.showMessage('Smart Task Analyzer loaded successfully!', 'success');
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

    addTaskFromForm() {
        const title = document.getElementById('taskTitle').value.trim();
        const dueDate = document.getElementById('dueDate').value;
        const estimatedHours = parseFloat(document.getElementById('estimatedHours').value);
        const importance = parseInt(document.getElementById('importance').value);
        const dependencies = document.getElementById('dependencies').value
            .split(',')
            .map(id => parseInt(id.trim()))
            .filter(id => !isNaN(id));

        // Validation
        if (!title) {
            this.showMessage('Task title is required', 'error');
            document.getElementById('taskTitle').focus();
            return;
        }

        if (!dueDate) {
            this.showMessage('Due date is required', 'error');
            document.getElementById('dueDate').focus();
            return;
        }

        if (isNaN(estimatedHours) || estimatedHours <= 0) {
            this.showMessage('Please enter a valid estimated time', 'error');
            document.getElementById('estimatedHours').focus();
            return;
        }

        if (isNaN(importance) || importance < 1 || importance > 10) {
            this.showMessage('Importance must be between 1 and 10', 'error');
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

        this.showMessage('Task added successfully!', 'success');
    }

    clearForm() {
        document.getElementById('taskForm').reset();
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dueDate').min = today;
        document.getElementById('taskTitle').focus();
    }

    loadTasksFromJson() {
        const jsonInput = document.getElementById('jsonInput').value.trim();
        
        if (!jsonInput) {
            this.showMessage('Please enter JSON data', 'error');
            document.getElementById('jsonInput').focus();
            return;
        }

        try {
            const parsedTasks = JSON.parse(jsonInput);
            
            if (!Array.isArray(parsedTasks)) {
                throw new Error('Expected an array of tasks');
            }

            // Validate each task
            parsedTasks.forEach((task, index) => {
                if (!task.title || !task.due_date || !task.estimated_hours || !task.importance) {
                    throw new Error(`Task ${index + 1} is missing required fields (title, due_date, estimated_hours, importance)`);
                }
            });

            this.tasks = parsedTasks;
            this.saveToLocalStorage();
            this.updateUI();
            this.showMessage(`Loaded ${parsedTasks.length} tasks from JSON`, 'success');

        } catch (error) {
            this.showMessage(`Error parsing JSON: ${error.message}`, 'error');
        }
    }

    loadSampleTasks() {
        const sampleTasks = [
            {
                "title": "Fix critical login bug",
                "due_date": new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "estimated_hours": 4,
                "importance": 9,
                "dependencies": []
            },
            {
                "title": "Write project documentation",
                "due_date": new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "estimated_hours": 6,
                "importance": 7,
                "dependencies": [1]
            },
            {
                "title": "Setup CI/CD pipeline",
                "due_date": new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "estimated_hours": 8,
                "importance": 8,
                "dependencies": []
            },
            {
                "title": "Code review for feature X",
                "due_date": new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                "estimated_hours": 2,
                "importance": 6,
                "dependencies": []
            },
            {
                "title": "Team meeting preparation",
                "due_date": new Date().toISOString().split('T')[0],
                "estimated_hours": 1,
                "importance": 5,
                "dependencies": []
            }
        ];

        this.tasks = sampleTasks;
        this.saveToLocalStorage();
        this.updateUI();
        this.showMessage('Sample tasks loaded successfully!', 'success');
    }

    async analyzeTasks() {
        if (this.tasks.length === 0) {
            this.showMessage('No tasks to analyze. Please add some tasks first.', 'error');
            return;
        }

        const analyzeBtn = document.getElementById('analyzeBtn');
        const originalText = analyzeBtn.innerHTML;
        
        analyzeBtn.classList.add('loading');
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<span class="material-symbols-outlined" aria-hidden="true">refresh</span> Analyzing...';

        try {
            const response = await fetch(`${this.apiBaseUrl}/tasks/analyze/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.tasks)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `API error: ${response.status}`);
            }

            // Update tasks with scores from backend
            this.tasks = data.tasks.map(task => ({
                ...task,
                // Ensure all tasks have the required fields
                title: task.title,
                due_date: task.due_date,
                estimated_hours: task.estimated_hours,
                importance: task.importance,
                dependencies: task.dependencies || []
            }));
            
            this.saveToLocalStorage();
            this.displayResults(data.tasks);
            
            // Get suggestions
            await this.getSuggestions();
            
            this.showMessage(data.message || `Analyzed ${data.tasks.length} tasks successfully!`, 'success');

        } catch (error) {
            console.error('Analysis error:', error);
            this.showMessage(`Analysis failed: ${error.message}`, 'error');
        } finally {
            analyzeBtn.classList.remove('loading');
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = originalText;
        }
    }

    async getSuggestions() {
        try {
            const response = await fetch(`${this.apiBaseUrl}/tasks/suggest/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.tasks)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `API error: ${response.status}`);
            }

            this.displaySuggestions(data.suggested_tasks);

        } catch (error) {
            console.error('Suggestions error:', error);
            // Fallback: use top 3 from analyzed tasks
            const topTasks = this.tasks.slice(0, 3);
            this.displaySuggestions(topTasks);
        }
    }

    displayResults(tasks) {
        const container = document.getElementById('resultsContainer');
        const taskCount = document.getElementById('taskCount');
        
        taskCount.textContent = `${tasks.length} tasks analyzed (${this.getStrategyName(this.currentStrategy)})`;

        if (tasks.length === 0) {
            container.innerHTML = `
                <div class="emptyState">
                    <span class="material-symbols-outlined" aria-hidden="true">analytics</span>
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
                            <div class="taskTitle">${this.escapeHtml(task.title)}</div>
                            <div class="taskRank">#${index + 1} in priority - ${priorityLevel} priority</div>
                        </div>
                        <div class="priorityScore">
                            ${task.priority_score}
                        </div>
                    </div>
                    <div class="taskDetails">
                        <div class="taskDetail">
                            <span class="material-symbols-outlined" aria-hidden="true">calendar_today</span>
                            Due: ${new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                            ${task.estimated_hours}h estimated
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined" aria-hidden="true">priority</span>
                            Importance: ${task.importance}/10
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined" aria-hidden="true">link</span>
                            Dependencies: ${task.dependencies && task.dependencies.length > 0 ? task.dependencies.join(', ') : 'None'}
                        </div>
                    </div>
                    <div class="taskExplanation">
                        ${this.escapeHtml(task.explanation)}
                    </div>
                    ${task.component_scores ? `
                    <div class="taskScores">
                        <small>Component scores: Urgency (${task.component_scores.urgency}), Importance (${task.component_scores.importance}), Effort (${task.component_scores.effort}), Dependencies (${task.component_scores.dependency})</small>
                    </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    displaySuggestions(suggestions) {
        const container = document.getElementById('suggestionsContainer');

        if (!suggestions || suggestions.length === 0) {
            container.innerHTML = `
                <div class="emptyState">
                    <span class="material-symbols-outlined" aria-hidden="true">lightbulb</span>
                    <h3>No suggestions yet</h3>
                    <p>Analyze tasks to get personalized recommendations</p>
                </div>
            `;
            return;
        }

        container.innerHTML = suggestions.map((task, index) => {
            const reasons = task.suggestion_reason || 
                (task.component_scores ? this.generateSuggestionReason(task.component_scores, index + 1) : `Priority #${index + 1}`);

            return `
                <div class="suggestionItem">
                    <div class="suggestionRank">${index + 1}</div>
                    <div class="taskTitle">${this.escapeHtml(task.title)}</div>
                    <div class="taskDetails">
                        <div class="taskDetail">
                            <span class="material-symbols-outlined" aria-hidden="true">calendar_today</span>
                            ${new Date(task.due_date).toLocaleDateString()}
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined" aria-hidden="true">schedule</span>
                            ${task.estimated_hours}h
                        </div>
                        <div class="taskDetail">
                            <span class="material-symbols-outlined" aria-hidden="true">priority</span>
                            Score: ${task.priority_score}
                        </div>
                    </div>
                    <div class="taskExplanation">
                        <strong>Why start this:</strong> ${reasons}
                    </div>
                </div>
            `;
        }).join('');
    }

    generateSuggestionReason(componentScores, rank) {
        const reasons = [];
        if (componentScores.urgency > 0.7) reasons.push('urgent deadline');
        if (componentScores.importance > 0.7) reasons.push('high importance');
        if (componentScores.effort > 0.7) reasons.push('quick win');
        if (componentScores.dependency > 0.7) reasons.push('blocks other tasks');
        
        return `Priority #${rank}: ` + (reasons.length > 0 ? reasons.join(', ') : 'balanced priority');
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
        // Remove any existing messages
        const existingMessages = document.querySelectorAll('.success-message, .error-message');
        existingMessages.forEach(msg => msg.remove());

        const messageDiv = document.createElement('div');
        messageDiv.className = type === 'success' ? 'success-message' : 'error-message';
        messageDiv.textContent = message;

        // Insert at the top of main
        const main = document.querySelector('main');
        main.insertBefore(messageDiv, main.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.remove();
            }
        }, 5000);
    }

    escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    saveToLocalStorage() {
        localStorage.setItem('smartTaskAnalyzer_tasks', JSON.stringify(this.tasks));
        localStorage.setItem('smartTaskAnalyzer_strategy', this.currentStrategy);
    }

    loadFromLocalStorage() {
        const savedTasks = localStorage.getItem('smartTaskAnalyzer_tasks');
        const savedStrategy = localStorage.getItem('smartTaskAnalyzer_strategy');
        
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks);
        }
        
        if (savedStrategy) {
            this.currentStrategy = savedStrategy;
            const radio = document.querySelector(`input[value="${savedStrategy}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
    }

    updateUI() {
        // Update any UI elements that depend on task data
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = this.tasks.length === 0;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TaskAnalyzer();
});