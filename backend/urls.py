from django.urls import path
from .views import *

urlpatterns = [
    # Authentication
    path("login", LoginView.as_view()),
    path("login/refresh", RefreshView.as_view()),
    path("register", RegisterView.as_view()),
    path("logout", LogoutView.as_view()),
    path("account", EmailView.as_view()),
    path("account/<str:auth_token>", AccountConfiguration.as_view()),

    # Profile
    path("profile", ProfileView.as_view()),

    # Boards & Tasks
    path("board", BoardView.as_view()),
    path("task/<str:board_id>", TaskView.as_view()),

    # Books, Categories, Pages, Page
    path("books", BookView.as_view()),
    path("book/<str:book_id>", CategoryView.as_view()),
    path("book/<str:book_id>/subject/<str:category_id>", PagesView.as_view()),
    path("book/<str:book_id>/subject/<str:category_id>/page/<str:page_id>", PageView.as_view())
]
