from datetime import date, timedelta

class TaskScorer:
    def __init__(self, strategy="smart_balance"):
        self.strategy = strategy
        self.weights = self._get_weights(strategy)
    
    def _get_weights(self, strategy):
        """Get weights based on the selected strategy"""
        weights = {
            "smart_balance": {"urgency": 0.4, "importance": 0.3, "effort": 0.2, "dependencies": 0.1},
            "fastest_wins": {"urgency": 0.2, "importance": 0.2, "effort": 0.5, "dependencies": 0.1},
            "high_impact": {"urgency": 0.2, "importance": 0.6, "effort": 0.1, "dependencies": 0.1},
            "deadline_driven": {"urgency": 0.7, "importance": 0.1, "effort": 0.1, "dependencies": 0.1},
        }
        return weights.get(strategy, weights["smart_balance"])
    
    def calculate_urgency_score(self, due_date, today=None):
        """Calculate urgency score based on due date"""
        if today is None:
            today = date.today()
        
        try:
            due_date_obj = date.fromisoformat(due_date) if isinstance(due_date, str) else due_date
            days_until_due = (due_date_obj - today).days
            
            if days_until_due < 0:
                return 1.0  # Overdue
            elif days_until_due == 0:
                return 0.9  # Due today
            elif days_until_due <= 1:
                return 0.8  # Tomorrow
            elif days_until_due <= 3:
                return 0.6  # 2-3 days
            elif days_until_due <= 7:
                return 0.4  # 4-7 days
            else:
                return 0.2  # More than 7 days
        except (ValueError, TypeError):
            return 0.5  # Default score for invalid dates
    
    def calculate_importance_score(self, importance):
        """Normalize importance score (1-10 scale to 0-1)"""
        try:
            importance_val = int(importance)
            return max(0.1, min(1.0, importance_val / 10.0))
        except (ValueError, TypeError):
            return 0.5  # Default score for invalid importance
    
    def calculate_effort_score(self, estimated_hours):
        """Calculate effort score (lower effort = higher score)"""
        try:
            hours = float(estimated_hours)
            if hours <= 1:
                return 1.0
            elif hours <= 4:
                return 0.7
            elif hours <= 8:
                return 0.4
            else:
                return 0.2
        except (ValueError, TypeError):
            return 0.5  # Default score for invalid hours
    
    def calculate_dependency_score(self, dependencies, all_tasks):
        """Calculate dependency score (tasks that block others get higher priority)"""
        if not dependencies or not isinstance(dependencies, list):
            return 0.5  # Neutral score for no dependencies
        
        try:
            # Check if this task blocks other tasks
            task_index = all_tasks.index(all_tasks) if all_tasks else -1
            if task_index == -1:
                return 0.5
            
            blocking_count = 0
            for task in all_tasks:
                task_deps = task.get('dependencies', [])
                if isinstance(task_deps, list) and (task_index + 1) in task_deps:
                    blocking_count += 1
            
            if blocking_count > 0:
                return 1.0  # High priority if blocking other tasks
            else:
                return 0.3  # Lower priority if has dependencies but not blocking others
        except (ValueError, IndexError):
            return 0.5
    
    def detect_circular_dependencies(self, tasks):
        """Detect circular dependencies in tasks"""
        circular_deps = []
        visited = set()
        
        def dfs(task_id, path):
            if task_id in path:
                circular_start = path.index(task_id)
                circular_deps.append(path[circular_start:])
                return
            
            if task_id in visited:
                return
            
            visited.add(task_id)
            path.append(task_id)
            
            # Find task by ID (assuming IDs start from 1)
            task = None
            for t in tasks:
                if t.get('id') == task_id or (tasks.index(t) + 1) == task_id:
                    task = t
                    break
            
            if task:
                deps = task.get('dependencies', [])
                if isinstance(deps, list):
                    for dep_id in deps:
                        dfs(dep_id, path.copy())
        
        for i in range(len(tasks)):
            task_id = i + 1
            if task_id not in visited:
                dfs(task_id, [])
        
        return circular_deps
    
    def calculate_priority_score(self, task, all_tasks=None):
        """Calculate overall priority score for a task"""
        if all_tasks is None:
            all_tasks = [task]
        
        # Calculate individual component scores with error handling
        urgency_score = self.calculate_urgency_score(task.get('due_date', ''))
        importance_score = self.calculate_importance_score(task.get('importance', 5))
        effort_score = self.calculate_effort_score(task.get('estimated_hours', 1))
        dependency_score = self.calculate_dependency_score(task.get('dependencies', []), all_tasks)
        
        # Calculate weighted overall score
        overall_score = (
            urgency_score * self.weights['urgency'] +
            importance_score * self.weights['importance'] +
            effort_score * self.weights['effort'] +
            dependency_score * self.weights['dependencies']
        )
        
        # Ensure score is between 0 and 1
        overall_score = max(0, min(1, overall_score))
        
        # Generate explanation
        explanation_parts = []
        if urgency_score > 0.7:
            explanation_parts.append('high urgency')
        if importance_score > 0.7:
            explanation_parts.append('high importance')
        if effort_score > 0.7:
            explanation_parts.append('quick win')
        if dependency_score > 0.7:
            explanation_parts.append('blocks other tasks')
        
        explanation = f"This task has {', '.join(explanation_parts)}" if explanation_parts else "This task has moderate priority across all factors"
        
        return {
            'priority_score': round(overall_score, 3),
            'explanation': explanation,
            'component_scores': {
                'urgency': round(urgency_score, 3),
                'importance': round(importance_score, 3),
                'effort': round(effort_score, 3),
                'dependency': round(dependency_score, 3)
            }
        }