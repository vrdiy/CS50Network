import json
from telnetlib import STATUS
from django import forms
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.forms import ModelForm
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt

from .models import User, Post



def index(request):
    return render(request, "network/index.html", {
        
    })

@csrf_exempt
@login_required(login_url='login')
def likepost(request,postid):
    print("GOT TO LIKE POST")
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    posttocheck = Post.objects.get(id=postid)
    
    for liker in posttocheck.likes.all():
        if liker == request.user:
            posttocheck.likes.remove(request.user)
            posttocheck.save()
            return JsonResponse({"message": "You've unliked this post", "likestatus": "0"}, status=201)
    posttocheck.likes.add(request.user)
    posttocheck.save()
    return JsonResponse({"message": "Post Liked.", "likestatus": "1"}, status=201)


@csrf_exempt
@login_required(login_url='login')
def newpost(request):
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    postcontent = data.get("textcontent", "")

    post = Post(user=request.user,textcontent=postcontent)
    post.save()
    return JsonResponse({"message": "Post uploaded successfully."}, status=201)

def getposts(request):
    posts = Post.objects.all()
    posts = posts.order_by("-timestamp").all()
    serializedposts = []
    for post in posts:
        initial = post.serialize()
        initial["userhasliked"] = False
        for liker in post.likes.all():
            if liker == request.user:
                initial["userhasliked"] = True
        serializedposts.append(initial)
    print(serializedposts)
    return JsonResponse(serializedposts,safe=False, status =201)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
