from django.contrib import admin
from .models import Task

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ['title', 'due_date', 'estimated_hours', 'importance', 'created_at']
    list_filter = ['due_date', 'importance', 'created_at']
    search_fields = ['title']
    date_hierarchy = 'due_date'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'due_date')
        }),
        ('Task Details', {
            'fields': ('estimated_hours', 'importance', 'dependencies')
        }),
    )