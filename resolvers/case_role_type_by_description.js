export default function (obj, args, context, graphql) {
	return context.database.any('select id, description, parent_id from case_role_type where description=${description}', args)
}
