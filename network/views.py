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
from django.core.paginator import Paginator

from .models import User, Post



def index(request):
    return render(request, "network/index.html", {
        
    })

def load_profile(request,id):
    try: 
        User.objects.get(id=id)
        profile = User.objects.get(id=id)
        userinfo = {"username": profile.username,"id": profile.id, "followers": profile.follower_count(),"following": profile.following_count()}
    except User.DoesNotExist:
        
        return JsonResponse({"error": "Profile could not be found."}, status=400)

    return render(request,"network/profile.html",{"userinfo":userinfo})
    
@csrf_exempt
def follow_user(request,userid):
    if(request.user.is_authenticated != True):
        print("what is going wrong here?")
        return JsonResponse({"error": "User is not logged in."}, status=401)
    print(f"user id to follow: {userid}")
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    usertofollow = User.objects.get(id=userid)
    
    for followers in usertofollow.followers.all():
        if followers == request.user:
            usertofollow.followers.remove(request.user)
            usertofollow.save()
            return JsonResponse({"message": "You've unfollowed this user", "followstatus": "0"}, status=201)
    usertofollow.followers.add(request.user)
    usertofollow.save()
    return JsonResponse({"message": "User Followed.", "followstatus": "1"}, status=201)

@csrf_exempt
def likepost(request,postid):
    if(request.user.is_authenticated != True):
        print("what is going wrong here?")
        return JsonResponse({"error": "User is not logged in."}, status=401)
    print("GOT TO LIKE POST")
    print(f"post id to like: {postid}")
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
def newpost(request):
    if(request.user.is_authenticated != True):
        print("what is going wrong here?")
        return JsonResponse({"error": "User is not logged in."}, status=401)
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)

    data = json.loads(request.body)
    postcontent = data.get("textcontent", "")

    post = Post(user=request.user,textcontent=postcontent)
    post.save()
    return JsonResponse({"message": "Post uploaded successfully."}, status=201)


def getposts(request,id):
    if(id == 0):
        posts = Post.objects.all()
    else:
        try:
            user_ = User.objects.get(id=id)
            posts = Post.objects.filter(user=user_)
        except User.DoesNotExist:
            return JsonResponse({"error": "User does not exist."}, status=400)
            
    posts = posts.order_by("-timestamp").all()
    serializedposts = []
    for post in posts:
        initial = post.serialize()
        initial["userhasliked"] = False
        if(request.user == post.user):
            initial["ownpost"] = True
        else:
            initial["ownpost"] = False

        for liker in post.likes.all():
            if liker == request.user:
                initial["userhasliked"] = True
        serializedposts.append(initial)
    #print(serializedposts)

    paginator = Paginator(serializedposts,10)
    currentpage = paginator.get_page(1)
    page = list(currentpage)

    pagemeta = {}
    pagemeta['count']= paginator.count
    pagemeta['num_pages']= paginator.num_pages
    pagemeta['has_next']= currentpage.has_next()
    pagemeta['has_previous']= currentpage.has_previous()
    page.append(pagemeta)
    
    return JsonResponse(page,safe=False,status =201)


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
