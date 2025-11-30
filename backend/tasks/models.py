from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import json

class Task(models.Model):
    title = models.CharField(
        max_length=200,
        help_text="Enter a descriptive title for the task"
    )
    due_date = models.DateField(
        help_text="When this task needs to be completed"
    )
    estimated_hours = models.FloatField(
        validators=[MinValueValidator(0.1)],
        help_text="Estimated time to complete in hours"
    )
    importance = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Importance level from 1 (low) to 10 (high)"
    )
    dependencies = models.TextField(
        default='[]',
        blank=True,
        help_text="List of task IDs that must be completed before this task (JSON format)"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} (Due: {self.due_date})"
    
    def get_dependencies(self):
        """Get dependencies as a Python list"""
        try:
            return json.loads(self.dependencies)
        except (json.JSONDecodeError, TypeError):
            return []
    
    def set_dependencies(self, value):
        """Set dependencies from a Python list"""
        if isinstance(value, list):
            self.dependencies = json.dumps(value)
        else:
            self.dependencies = '[]'