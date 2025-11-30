from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .scoring import TaskScorer

@api_view(['POST'])
def analyze_tasks(request):
    """
    Analyze and sort tasks by priority score
    """
    try:
        print("🔍 Analyze endpoint called")  # Debug log
        
        # Handle both array and object formats
        if isinstance(request.data, list):
            tasks_data = request.data
            strategy = 'smart_balance'
        elif isinstance(request.data, dict):
            tasks_data = request.data.get('tasks', [])
            strategy = request.data.get('strategy', 'smart_balance')
        else:
            return Response(
                {"error": "Expected a list of tasks or object with tasks array"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"📊 Processing {len(tasks_data)} tasks with strategy: {strategy}")  # Debug log
        
        if not tasks_data:
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
        
        # Initialize scorer
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
        
        print(f"✅ Successfully analyzed {len(sorted_tasks)} tasks")  # Debug log
        
        return Response({
            'strategy_used': strategy,
            'tasks': sorted_tasks,
            'total_tasks': len(sorted_tasks),
            'message': f'Successfully analyzed {len(sorted_tasks)} tasks using {strategy} strategy'
        })
    
    except Exception as e:
        print(f"❌ Error in analyze_tasks: {str(e)}")  # Debug log
        import traceback
        print(traceback.format_exc())  # Print full traceback
        
        return Response(
            {"error": f"An error occurred during analysis: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
def suggest_tasks(request):
    """
    Get top 3 tasks to work on today
    """
    try:
        print("💡 Suggest endpoint called")  # Debug log
        
        # Handle both array and object formats
        if isinstance(request.data, list):
            tasks_data = request.data
            strategy = 'smart_balance'
        elif isinstance(request.data, dict):
            tasks_data = request.data.get('tasks', [])
            strategy = request.data.get('strategy', 'smart_balance')
        else:
            return Response(
                {"error": "Expected a list of tasks or object with tasks array"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"📊 Processing {len(tasks_data)} tasks for suggestions")  # Debug log
        
        if not tasks_data:
            return Response({
                'suggested_tasks': [],
                'explanation': 'No tasks provided for suggestions'
            })
        
        # Initialize scorer
        scorer = TaskScorer(strategy)
        scored_tasks = []
        
        # Calculate scores for all tasks
        for task_data in tasks_data:
            score_result = scorer.calculate_priority_score(task_data, tasks_data)
            scored_task = {**task_data, **score_result}
            scored_tasks.append(scored_task)
        
        # Get top 3 tasks
        top_tasks = sorted(scored_tasks, key=lambda x: x['priority_score'], reverse=True)[:3]
        
        # Generate detailed explanations for each suggestion
        for i, task in enumerate(top_tasks):
            reasons = []
            component_scores = task.get('component_scores', {})
            
            if component_scores.get('urgency', 0) > 0.7:
                reasons.append('urgent deadline')
            if component_scores.get('importance', 0) > 0.7:
                reasons.append('high importance')
            if component_scores.get('effort', 0) > 0.7:
                reasons.append('quick win')
            if component_scores.get('dependency', 0) > 0.7:
                reasons.append('blocks other tasks')
            
            task['suggestion_reason'] = f"Priority #{i+1}: " + ", ".join(reasons) if reasons else f"Priority #{i+1}: balanced priority score"
        
        print(f"✅ Generated {len(top_tasks)} suggestions")  # Debug log
        
        return Response({
            'suggested_tasks': top_tasks,
            'explanation': f'Top {len(top_tasks)} tasks recommended based on urgency, importance, effort, and dependencies',
            'total_tasks_analyzed': len(tasks_data)
        })
    
    except Exception as e:
        print(f"❌ Error in suggest_tasks: {str(e)}")  # Debug log
        import traceback
        print(traceback.format_exc())  # Print full traceback
        
        return Response(
            {"error": f"An error occurred while generating suggestions: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )