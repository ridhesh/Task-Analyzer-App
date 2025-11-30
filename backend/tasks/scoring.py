from datetime import date

class TaskScorer:
    def __init__(self, strategy="smart_balance"):
        self.strategy = strategy
        self.weights = self._get_weights(strategy)
    
    def _get_weights(self, strategy):
        weights = {
            "smart_balance": {"urgency": 0.4, "importance": 0.3, "effort": 0.2, "dependencies": 0.1},
            "fastest_wins": {"urgency": 0.2, "importance": 0.2, "effort": 0.5, "dependencies": 0.1},
            "high_impact": {"urgency": 0.2, "importance": 0.6, "effort": 0.1, "dependencies": 0.1},
            "deadline_driven": {"urgency": 0.7, "importance": 0.1, "effort": 0.1, "dependencies": 0.1},
        }
        return weights.get(strategy, weights["smart_balance"])
    
    def calculate_urgency_score(self, due_date, today=None):
        if today is None:
            today = date.today()
        
        if not due_date:
            return 0.5
            
        try:
            due_date_obj = date.fromisoformat(due_date) if isinstance(due_date, str) else due_date
            days_until_due = (due_date_obj - today).days
            
            if days_until_due < 0:
                return 1.0
            elif days_until_due == 0:
                return 0.9
            elif days_until_due <= 1:
                return 0.8
            elif days_until_due <= 3:
                return 0.6
            elif days_until_due <= 7:
                return 0.4
            else:
                return 0.2
        except (ValueError, TypeError):
            return 0.5
    
    def calculate_importance_score(self, importance):
        try:
            importance_val = int(importance)
            return max(0.1, min(1.0, importance_val / 10.0))
        except (ValueError, TypeError):
            return 0.5
    
    def calculate_effort_score(self, estimated_hours):
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
            return 0.5
    
    def calculate_dependency_score(self, dependencies, all_tasks):
        if not dependencies or not isinstance(dependencies, list):
            return 0.5
        
        try:
            task_index = all_tasks.index(all_tasks)
            blocking_count = 0
            for task in all_tasks:
                task_deps = task.get('dependencies', [])
                if isinstance(task_deps, list) and (task_index + 1) in task_deps:
                    blocking_count += 1
            
            if blocking_count > 0:
                return 1.0
            else:
                return 0.3
        except (ValueError, IndexError):
            return 0.5
    
    def detect_circular_dependencies(self, tasks):
        graph = {}
        for i, task in enumerate(tasks):
            task_id = i + 1
            dependencies = task.get('dependencies', [])
            graph[task_id] = dependencies
        
        visited = set()
        rec_stack = set()
        circular_deps = []
        
        def dfs(node, path):
            if node in rec_stack:
                cycle_start = path.index(node)
                circular_deps.append(path[cycle_start:])
                return
            
            if node in visited:
                return
            
            visited.add(node)
            rec_stack.add(node)
            path.append(node)
            
            for neighbor in graph.get(node, []):
                dfs(neighbor, path.copy())
            
            rec_stack.remove(node)
            path.pop()
        
        for node in graph:
            if node not in visited:
                dfs(node, [])
        
        return circular_deps
    
    def calculate_priority_score(self, task, all_tasks=None):
        if all_tasks is None:
            all_tasks = [task]
        
        urgency_score = self.calculate_urgency_score(task.get('due_date', ''))
        importance_score = self.calculate_importance_score(task.get('importance', 5))
        effort_score = self.calculate_effort_score(task.get('estimated_hours', 1))
        dependency_score = self.calculate_dependency_score(task.get('dependencies', []), all_tasks)
        
        overall_score = (
            urgency_score * self.weights['urgency'] +
            importance_score * self.weights['importance'] +
            effort_score * self.weights['effort'] +
            dependency_score * self.weights['dependencies']
        )
        
        overall_score = max(0, min(1, overall_score))
        
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