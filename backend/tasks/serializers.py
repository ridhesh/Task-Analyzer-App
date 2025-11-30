from rest_framework import serializers
from .models import Task
import json

class TaskSerializer(serializers.ModelSerializer):
    priority_score = serializers.FloatField(read_only=True, required=False)
    explanation = serializers.CharField(read_only=True, required=False)
    dependencies = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        default=list
    )
    
    class Meta:
        model = Task
        fields = [
            'id', 'title', 'due_date', 'estimated_hours', 
            'importance', 'dependencies', 'priority_score', 'explanation',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_importance(self, value):
        if value < 1 or value > 10:
            raise serializers.ValidationError("Importance must be between 1 and 10")
        return value
    
    def validate_estimated_hours(self, value):
        if value <= 0:
            raise serializers.ValidationError("Estimated hours must be positive")
        return value
    
    def validate_dependencies(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Dependencies must be a list")
        for item in value:
            if not isinstance(item, int):
                raise serializers.ValidationError("All dependencies must be integers")
        return value
    
    def create(self, validated_data):
        dependencies = validated_data.pop('dependencies', [])
        task = Task.objects.create(**validated_data)
        task.set_dependencies(dependencies)
        task.save()
        return task
    
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        representation['dependencies'] = instance.get_dependencies()
        return representation