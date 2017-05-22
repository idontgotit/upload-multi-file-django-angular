# -*- coding: utf-8 -*-
# Generated by Django 1.11.1 on 2017-05-22 02:49
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('djangoExample', '0020_remove_experiment_user'),
    ]

    operations = [
        migrations.AddField(
            model_name='experiment',
            name='user',
            field=models.ForeignKey(default=2, on_delete=django.db.models.deletion.CASCADE, related_name='experiments', to='djangoExample.User'),
            preserve_default=False,
        ),
    ]