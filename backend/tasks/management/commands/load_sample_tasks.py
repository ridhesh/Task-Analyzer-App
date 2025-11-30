from django.core.management.base import BaseCommand
from tasks.models import Task
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Load sample tasks for testing'

    def handle(self, *args, **options):
        sample_tasks = [
            {
                'title': 'Fix critical login bug',
                'due_date': datetime.now() + timedelta(days=2),
                'estimated_hours': 4,
                'importance': 9,
                'dependencies': []
            },
            {
                'title': 'Write project documentation',
                'due_date': datetime.now() + timedelta(days=7),
                'estimated_hours': 6,
                'importance': 7,
                'dependencies': [1]
            },
            {
                'title': 'Setup CI/CD pipeline',
                'due_date': datetime.now() + timedelta(days=5),
                'estimated_hours': 8,
                'importance': 8,
                'dependencies': []
            },
            {
                'title': 'Code review for feature X',
                'due_date': datetime.now() + timedelta(days=1),
                'estimated_hours': 2,
                'importance': 6,
                'dependencies': []
            },
            {
                'title': 'Team meeting preparation',
                'due_date': datetime.now(),
                'estimated_hours': 1,
                'importance': 5,
                'dependencies': []
            }
        ]

        Task.objects.all().delete()  # Clear existing tasks
        
        for task_data in sample_tasks:
            task = Task.objects.create(**task_data)
            self.stdout.write(
                self.style.SUCCESS(f'Created task: {task.title}')
            )

        self.stdout.write(
            self.style.SUCCESS('Successfully loaded sample tasks')
        )