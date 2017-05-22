# -*- coding: utf-8 -*-
from django.contrib.auth import authenticate
from django.http import HttpResponse
from django.shortcuts import render
from rest_framework import viewsets

# Create your views here.
from werkzeug.debug import console

from djangoExample.models import User
from djangoExample.serializers import UserSerializer


def init(request):
    return render(request, 'login.html')

class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    model = User
    queryset = User.objects.all()
    serializer_class = UserSerializer


