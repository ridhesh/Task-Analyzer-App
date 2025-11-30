from django.test import TestCase
from datetime import date, timedelta
from .scoring import TaskScorer

class TaskScoringTests(TestCase):
    def setUp(self):
        self.scorer = TaskScorer()
        self.today = date.today()
    
    def test_urgency_score_calculation(self):
        # Test overdue task
        overdue_date = str(self.today - timedelta(days=1))
        self.assertEqual(self.scorer.calculate_urgency_score(overdue_date), 1.0)
        
        # Test due today
        today_date = str(self.today)
        self.assertEqual(self.scorer.calculate_urgency_score(today_date), 0.9)
        
        # Test due tomorrow
        tomorrow_date = str(self.today + timedelta(days=1))
        self.assertEqual(self.scorer.calculate_urgency_score(tomorrow_date), 0.8)
        
        # Test due in 7 days
        future_date = str(self.today + timedelta(days=7))
        self.assertEqual(self.scorer.calculate_urgency_score(future_date), 0.4)
    
    def test_importance_score_calculation(self):
        self.assertEqual(self.scorer.calculate_importance_score(10), 1.0)
        self.assertEqual(self.scorer.calculate_importance_score(5), 0.5)
        self.assertEqual(self.scorer.calculate_importance_score(1), 0.1)
    
    def test_effort_score_calculation(self):
        self.assertEqual(self.scorer.calculate_effort_score(0.5), 1.0)
        self.assertEqual(self.scorer.calculate_effort_score(2), 0.7)
        self.assertEqual(self.scorer.calculate_effort_score(10), 0.2)
    
    def test_circular_dependency_detection(self):
        tasks = [
            {'id': 1, 'dependencies': [2]},
            {'id': 2, 'dependencies': [1]},  # Circular dependency
            {'id': 3, 'dependencies': []}
        ]
        
        circular_deps = self.scorer.detect_circular_dependencies(tasks)
        self.assertEqual(len(circular_deps), 1)
    
    def test_priority_score_integration(self):
        task = {
            'title': 'Test Task',
            'due_date': str(self.today),
            'estimated_hours': 2,
            'importance': 8,
            'dependencies': []
        }
        
        result = self.scorer.calculate_priority_score(task)
        self.assertIn('priority_score', result)
        self.assertIn('explanation', result)
        self.assertIn('component_scores', result)
        self.assertTrue(0 <= result['priority_score'] <= 1)
    
    def test_different_strategies(self):
        task = {
            'title': 'Test Task',
            'due_date': str(self.today),
            'estimated_hours': 2,
            'importance': 8,
            'dependencies': []
        }
        
        # Test different strategies
        smart_balance_scorer = TaskScorer('smart_balance')
        fastest_wins_scorer = TaskScorer('fastest_wins')
        
        smart_score = smart_balance_scorer.calculate_priority_score(task)
        fast_score = fastest_wins_scorer.calculate_priority_score(task)
        
        # Scores should be different for different strategies
        self.assertNotEqual(smart_score['priority_score'], fast_score['priority_score'])

class TaskModelTests(TestCase):
    def test_task_creation(self):
        from .models import Task
        
        task = Task.objects.create(
            title="Test Task",
            due_date=date.today(),
            estimated_hours=2.0,
            importance=5,
            dependencies=[1, 2]
        )
        
        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.estimated_hours, 2.0)
        self.assertEqual(task.importance, 5)
        self.assertEqual(task.dependencies, [1, 2])