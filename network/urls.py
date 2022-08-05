
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("newpost",views.newpost, name="newpost"),
    path("getposts",views.getposts, name="getposts"),
    path("likepost/<str:postid>",views.likepost, name="likepost"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
