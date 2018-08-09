from django.contrib import admin
from mptt.admin import MPTTModelAdmin

from .models.geographic_boundary import *
from .models.party import Party, PartyClassification, PartyRelationship, PartyRole
from .models.types import *


class PartyClassificationInline(admin.TabularInline):
    model = PartyClassification


class PartyRoleInline(admin.TabularInline):
    model = PartyRole


class PartyAdmin(admin.ModelAdmin):
    inlines = (PartyClassificationInline, PartyRoleInline,)
    list_display = ('name', 'last_name', 'first_name', 'title')


class PartyRelationshipAdmin(admin.ModelAdmin):
    list_display = ('from_date', 'thru_date', 'from_party', 'to_party', 'type', 'status', 'priority')


admin.site.register(ClassificationType)
admin.site.register(ContactMechanismType, MPTTModelAdmin)
admin.site.register(GeographicBoundary, MPTTModelAdmin)
admin.site.register(GeographicBoundaryAssociation, MPTTModelAdmin)
admin.site.register(GeographicBoundaryType, MPTTModelAdmin)
admin.site.register(Party, PartyAdmin)
admin.site.register(PartyRelationship, PartyRelationshipAdmin)
admin.site.register(PartyType, MPTTModelAdmin)
admin.site.register(PriorityType)
admin.site.register(RelationshipStatusType)
admin.site.register(RelationshipType)
admin.site.register(RoleType)
