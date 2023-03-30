from django.contrib import admin
from .models import *


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "username", "email", "last_login", "last_token_update")
    list_per_page = 10


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "section_type", "pinned", "updated_on")
    list_per_page = 10


@admin.register(Content)
class ContentAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "section", "status", "updated_on")
    list_per_page = 10


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "title", "section", "updated_on")
    list_per_page = 10
