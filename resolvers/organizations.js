import database from "../database"

export default function (obj, args, context, graphql) {
  console.log("organziations: ", args)
  return database.any('select id, name ' +
    'from party ' +
    'where party_type_id=${party_type_id} ' +
    'order by name ' +
    'limit ${limit} ' +
    'offset ${offset}',
    {
      party_type_id: context.organization_type_id(),
      limit: args.records,
      offset: args.start
    })
}