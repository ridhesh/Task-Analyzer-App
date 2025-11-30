from django.test import TestCase
from datetime import date, timedelta
from .scoring import TaskScorer

class TaskScoringTests(TestCase):
    def setUp(self):
        self.scorer = TaskScorer()
        self.today = date.today()
    
    def test_urgency_score_calculation(self):
        overdue_date = str(self.today - timedelta(days=1))
        self.assertEqual(self.scorer.calculate_urgency_score(overdue_date), 1.0)
        
        today_date = str(self.today)
        self.assertEqual(self.scorer.calculate_urgency_score(today_date), 0.9)
        
        tomorrow_date = str(self.today + timedelta(days=1))
        self.assertEqual(self.scorer.calculate_urgency_score(tomorrow_date), 0.8)
    
    def test_importance_score_calculation(self):
        self.assertEqual(self.scorer.calculate_importance_score(10), 1.0)
        self.assertEqual(self.scorer.calculate_importance_score(5), 0.5)
        self.assertEqual(self.scorer.calculate_importance_score(1), 0.1)
    
    def test_effort_score_calculation(self):
        self.assertEqual(self.scorer.calculate_effort_score(0.5), 1.0)
        self.assertEqual(self.scorer.calculate_effort_score(3), 0.7)
        self.assertEqual(self.scorer.calculate_effort_score(10), 0.2)
    
    def test_priority_score_calculation(self):
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