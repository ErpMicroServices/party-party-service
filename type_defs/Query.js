export default `
type Query {
	case_role_type_by_description(description: String!): [CaseRoleType] 
	case_status_type_by_description(description: String!): [CaseStatusType]
	communication_event_purpose_type_by_description(description: String!):[CommunicationEventPurposeType]
	communication_event_role_type_by_description(description: String!):[CommunicationEventRoleType]
	communication_event_status_type_by_description(description: String!):[CommunicationEventStatusType]
	communication_event_type_by_description(description: String!): [CommunicationEventType]
	contact_mechanism_type_by_description(description: String!): [ContactMechanismType]
	facility_role_type_by_description(description: String!): [FacilityRoleType]
	facility_type_by_description(description: String!): [FacilityType]
	geographic_boundary_type_by_description(description: String!): [GeographicBoundaryType]
	parties( start: Int!, records: Int!) : [Party]!
	party_classification_type_by_description(description: String!): [PartyClassificationType]
	party_relationship_status_type_by_description(description: String!): [PartyRelationshipStatusType]
	party_relationship_type_by_description(description: String!): [PartyRelationshipType]
	party_type_by_description(description: String!): [PartyType]
	party_role_type_by_description( description: String!): [PartyRoleType]
	priority_type_by_description(description: String!): [PriorityType]
}
`