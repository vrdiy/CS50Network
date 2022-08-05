from tkinter import CASCADE
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField("User", related_name="followers")
    


class Post(models.Model):
    user = models.ForeignKey(User,on_delete=models.CASCADE, related_name="posts")
    textcontent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User,blank = True,related_name="liked_post")

    def serialize(self):
        return {
            "id": self.id,
            "user": self.user.username,
            "textcontent": self.textcontent,
            "timestamp": self.timestamp.strftime("%b %d %Y, %I:%M %p"),
            "likes": [user.username for user in self.likes.all()]
        }
