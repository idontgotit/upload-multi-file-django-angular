from django.contrib.auth import authenticate, logout, login
from django.http import HttpResponse
from django.shortcuts import render
from django.template import RequestContext
from django.views.decorators.csrf import csrf_protect
from rest_framework import generics, permissions, viewsets, status
from rest_framework.decorators import api_view
from rest_framework.generics import RetrieveAPIView
from rest_framework.parsers import FileUploadParser
from rest_framework.renderers import JSONRenderer
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authentication import SessionAuthentication, BasicAuthentication
from rest_framework.viewsets import ModelViewSet
from werkzeug.debug import console
import json

from djangoExample.forms import DocumentForm
from .serializers import UserSerializer, PostSerializer, PhotoSerializer, ExperimentSerializer
from .models import User, Post, Photo, Experiment


class UserMixin(object):
    model = User
    queryset = User.objects.all()
    serializer_class = UserSerializer


class UserList(UserMixin, generics.ListAPIView):
    permission_classes = [
        permissions.AllowAny
    ]
    pass


class UserDetail(UserMixin, RetrieveAPIView):
    renderer_classes = (JSONRenderer,)
    permission_classes = [
        permissions.AllowAny
    ]
    lookup_field = 'username'


class PostMixin(object):
    model = Post
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    # permission_classes = [
    #     PostAuthorCanEditPermission
    # ]

    def perform_create(self, serializer):
        """Force author to the current user on save"""
        serializer.save(author=self.request.user)


class PostList(PostMixin, generics.ListCreateAPIView):
    def post(self, request, format=None):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PostDetail(PostMixin, generics.RetrieveUpdateDestroyAPIView):
    def put(self, request,pk, format=None):
        instance = self.get_object()
        serializer = PostSerializer(instance, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



    def delete(self,request, pk, format=None):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class UserPostList(generics.ListAPIView):
    model = Post
    queryset = Post.objects.all()
    serializer_class = PostSerializer

    def get_queryset(self):
        queryset = super(UserPostList, self).get_queryset()
        return queryset.filter(author__id=self.kwargs.get('username'))


class PhotoMixin(object):
    model = Photo
    queryset = Photo.objects.all()
    serializer_class = PhotoSerializer


class PhotoList(PhotoMixin, generics.ListCreateAPIView):
    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request, format=None):
        form = DocumentForm(request.POST, request.FILES)
        parser_classes = (FileUploadParser,)
        serializer = PhotoSerializer(data=request.data)
        if form.is_valid():
            newdoc = Photo(image=request.FILES['docfile'], post=1)
            newdoc.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PhotoDetail(PhotoMixin, generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [
        permissions.AllowAny
    ]
    pass


class PostPhotoList(generics.ListAPIView):
    model = Experiment
    queryset = Experiment.objects.all()
    serializer_class = ExperimentSerializer

    def get_queryset(self):
        queryset = super(PostPhotoList, self).get_queryset()
        return queryset.filter(post__pk=self.kwargs.get('pk'))


#
# def login(request):
#     data = json.loads((request.body))
#     username = data.get('username', None)
#     password = data.get('password', None)
#     # import pdb;
#     # pdb.set_trace()
#     # queryset = User.objects.raw('SELECT username FROM djangoExample_user WHERE username = %s AND password = %s ',[username,password])
#     # user = authenticate(username=username, password=password)
#     queryset = User.objects.filter(username=username , password =password)
#     if queryset :
#         return render(request, 'detail.html')
#     else:
#         return HttpResponse(status=500)
#

class AccountViewSet(viewsets.ModelViewSet):
    # lookup_field = 'username'
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def create_user(self, request):
        serializer = self.serializer_class(data=request.data)

        if serializer.is_valid():
            User.objects.create_user(**serializer.validated_data)

            return Response(serializer.validated_data, status=status.HTTP_201_CREATED)

        return Response({
            'status': 'Bad request',
            'message': 'Account could not be created with received data.'
        }, status=status.HTTP_400_BAD_REQUEST)


class ExperimentViewSet(APIView):
    queryset = Experiment.objects.all()
    serializer_class = ExperimentSerializer

    # def perform_create(self, serializer):
    #     serializer.save(user=1)  # pass the current user as the 'owner'

    def post(self, request, format=None):
        # , file = request.FILES.get('file')
        # serializer = ExperimentSerializer(data=request.data)
        create_post = Post.objects.all().filter(id=self.request.POST.get('post_id')).get()
        length = request.POST.get('length');
        # listFile = request.POST.get('file');
        # self.request.FILES.get('file')
        a = self.request.FILES.get('file');
        b = self.request.FILES.get('userpic[]');
        # print(a)
        # import pdb
        # pdb.set_trace()
        for i in range(int(length)):
            obj = Experiment.objects.create(post=create_post)
            # obj.samplesheet = self.request.FILES.get('file')
            obj.samplesheet = self.request.FILES.get('userpic' + str(i) + '[]');
            obj.save()
        # import pdb
        # pdb.set_trace()


        return Response(status=status.HTTP_201_CREATED)


# return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


def get(self, request):
    queryset = Experiment.objects.all()
    serializer_class = ExperimentSerializer(queryset, many=True)
    # response = serializers.serialize("json", Student)

    return Response(serializer_class.data)
