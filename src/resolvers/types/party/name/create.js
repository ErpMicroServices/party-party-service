export default function (obj, args, context, graphql) {
	return context.database.one('insert into name_type (description) values(${description}) returning id', args)
		.then(data => context.database.one("select id, description, parent_id from name_type where id = ${id}", data))
}
