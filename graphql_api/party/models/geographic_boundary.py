import uuid

from django.db import models
from mptt.models import MPTTModel, TreeForeignKey


class GeographicBoundaryType(MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    description = models.CharField(blank=False, null=False, unique=True, max_length=255)
    parent = TreeForeignKey('self', on_delete=models.CASCADE, blank=True, null=True)

    def __str__(self):
        return self.description


class GeographicBoundary(MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    geo_code = models.CharField(max_length=100, blank=True)
    name = models.CharField(max_length=200)
    abbreviation = models.CharField(max_length=100, blank=True)
    type = models.ForeignKey(GeographicBoundaryType, on_delete=models.PROTECT)
    contains = models.ManyToManyField('self', through='GeographicBoundaryAssociation')


class GeographicBoundaryAssociation(MPTTModel):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    containing = models.ForeignKey(GeographicBoundary, on_delete=models.CASCADE)
    contained_by = models.ForeignKey(GeographicBoundary, on_delete=models.CASCADE)
