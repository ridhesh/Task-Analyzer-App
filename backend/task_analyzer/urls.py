from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.views.generic import TemplateView
from django.conf import settings
from django.conf.urls.static import static

def api_root(request):
    return JsonResponse({
        'message': 'Smart Task Analyzer API',
        'endpoints': {
            'analyze_tasks': '/api/tasks/analyze/',
            'suggest_tasks': '/api/tasks/suggest/',
            'admin': '/admin/'
        },
        'version': '1.0.0'
    })

urlpatterns = [
    path('', api_root, name='api_root'),
    path('api/', include('tasks.urls')),
    path('admin/', admin.site.urls),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)