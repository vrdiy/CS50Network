
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("newpost",views.newpost, name="newpost"),
    path("getposts/<int:id>",views.getposts, name="getposts"),
    path("likepost/<int:postid>",views.likepost, name="likepost"),
    path("profile/<int:id>",views.load_profile,name="loadprofile"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register")
]
