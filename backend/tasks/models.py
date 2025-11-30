from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
import json

class Task(models.Model):
    title = models.CharField(max_length=200)
    due_date = models.DateField()
    estimated_hours = models.FloatField(validators=[MinValueValidator(0.1)])
    importance = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(10)])
    dependencies = models.TextField(default='[]', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} (Due: {self.due_date})"
    
    def get_dependencies(self):
        try:
            return json.loads(self.dependencies)
        except (json.JSONDecodeError, TypeError):
            return []
    
    def set_dependencies(self, value):
        if isinstance(value, list):
            self.dependencies = json.dumps(value)
        else:
            self.dependencies = '[]'