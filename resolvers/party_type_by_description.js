export default function (obj, args, context, graphql) {
	return context.database.any('select id, description from party_type where description=${description}', args)
}
