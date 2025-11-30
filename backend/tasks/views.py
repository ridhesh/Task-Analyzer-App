from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from datetime import date
from .scoring import TaskScorer
import json

@api_view(['POST'])
def analyze_tasks(request):
    """
    Analyze and sort tasks by priority score
    """
    try:
        tasks_data = request.data
        
        if not isinstance(tasks_data, list):
            return Response(
                {"error": "Expected a list of tasks"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if len(tasks_data) == 0:
            return Response(
                {"error": "No tasks provided for analysis"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate tasks
        for i, task_data in enumerate(tasks_data):
            if not all(key in task_data for key in ['title', 'due_date', 'estimated_hours', 'importance']):
                return Response(
                    {"error": f"Task {i+1} is missing required fields (title, due_date, estimated_hours, importance)"},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Validate data types
            try:
                float(task_data['estimated_hours'])
                int(task_data['importance'])
            except (ValueError, TypeError):
                return Response(
                    {"error": f"Task {i+1} has invalid data types for estimated_hours or importance"},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Get sorting strategy
        strategy = request.data.get('strategy', 'smart_balance')
        scorer = TaskScorer(strategy)
        
        # Check for circular dependencies
        circular_deps = scorer.detect_circular_dependencies(tasks_data)
        if circular_deps:
            return Response(
                {"error": f"Circular dependencies detected: {circular_deps}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Calculate scores for all tasks
        scored_tasks = []
        for task_data in tasks_data:
            score_result = scorer.calculate_priority_score(task_data, tasks_data)
            scored_task = {**task_data, **score_result}
            scored_tasks.append(scored_task)
        
        # Sort by priority score (descending)
        sorted_tasks = sorted(scored_tasks, key=lambda x: x['priority_score'], reverse=True)
        
        return Response({
            'strategy_used': strategy,
            'tasks': sorted_tasks,
            'total_tasks': len(sorted_tasks),
            'message': f'Successfully analyzed {len(sorted_tasks)} tasks using {strategy.replace("_", " ").title()} strategy'
        })
    
    except Exception as e:
        return Response(
            {"error": f"An error occurred during analysis: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET', 'POST'])
def suggest_tasks(request):
    """
    Get top 3 tasks to work on today
    """
    try:
        if request.method == 'POST':
            tasks_data = request.data
            if not isinstance(tasks_data, list):
                return Response(
                    {"error": "Expected a list of tasks"}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Return empty suggestions for GET requests without data
            return Response({
                'suggested_tasks': [],
                'explanation': 'No tasks available for suggestions. Please use POST method with task data or use the analyze endpoint first.'
            })
        
        if len(tasks_data) == 0:
            return Response({
                'suggested_tasks': [],
                'explanation': 'No tasks provided for suggestions'
            })
        
        scorer = TaskScorer('smart_balance')
        scored_tasks = []
        
        for task_data in tasks_data:
            score_result = scorer.calculate_priority_score(task_data, tasks_data)
            scored_task = {**task_data, **score_result}
            scored_tasks.append(scored_task)
        
        # Get top 3 tasks
        top_tasks = sorted(scored_tasks, key=lambda x: x['priority_score'], reverse=True)[:3]
        
        # Generate detailed explanations for each suggestion
        for i, task in enumerate(top_tasks):
            reasons = []
            if task.get('component_scores', {}).get('urgency', 0) > 0.7:
                reasons.append('urgent deadline')
            if task.get('component_scores', {}).get('importance', 0) > 0.7:
                reasons.append('high importance')
            if task.get('component_scores', {}).get('effort', 0) > 0.7:
                reasons.append('quick win')
            if task.get('component_scores', {}).get('dependency', 0) > 0.7:
                reasons.append('blocks other tasks')
            
            task['suggestion_reason'] = f"Priority #{i+1}: " + ", ".join(reasons) if reasons else f"Priority #{i+1}: balanced priority score"
        
        return Response({
            'suggested_tasks': top_tasks,
            'explanation': f'Top {len(top_tasks)} tasks recommended based on urgency, importance, effort, and dependencies',
            'total_tasks_analyzed': len(tasks_data)
        })
    
    except Exception as e:
        return Response(
            {"error": f"An error occurred while generating suggestions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )