import {Given, Then, When}      from 'cucumber'
import gql                      from 'graphql-tag'
import {create_parties_of_type} from './utils'

const PQ=require('pg-promise').ParameterizedQuery


Given('there are {int} parties with a type of {string} in the database', async function (number_of_parties, party_type) {
	this.parties= await create_parties_of_type(this.db, party_type, number_of_parties)
})

Given('a comment of {string}', function (comment) {
	this.party.comment=comment
})

Given('no comment field', function (callback) {
	delete this.party.comment
	callback()
})

Given('a party with a comment of {string} and a type of {string} is in the database', async function (comment, party_type_description) {
	let party_type    =await this.db.one('select id from party_type where description = ${party_type_description}', {party_type_description})
	this.party_type   ={id: party_type.id, description: party_type_description, parent_id: '', children: []}
	this.party.comment=comment
	let party         =await this.db.one('insert into party (comment, party_type_id) values(${comment}, ${party_type_id}) returning id, comment, party_type_id', {
		comment      : comment,
		party_type_id: party_type.id
	})
	this.party.id     =party.id
	this.parties.push(party)
})

Given('a party of type {string} is in the database', async function (party_type) {
	let party_type_id =await this.db.one('select id from party_type where description = ${party_type}', {party_type})
	let party_id      =await this.db.one('insert into party (party_type_id) values( ${party_type_id}) returning id', {
		party_type_id: party_type_id.id
	})
	this.party.id     =party_id.id
	this.party_type.id=party_type_id.id
})

When('I save the party', async function () {
	try {
		let inputParty={
			"inputParty": {
				'comment'      : this.party.comment,
				'party_type_id': this.party_type.id
			}
		}
		if (this.party.names && this.party.names.length > 0) {
			inputParty.inputParty.names=this.party.names
		}
		if (this.party.identifications && this.party.identifications.length > 0) {
			inputParty.inputParty.identifications=this.party.identifications
		}
		let response    =await this.client.mutate({
																								mutation : gql`mutation party_create($inputParty: InputParty!) { party_create(new_party: $inputParty) { id comment identifications { id ident id_type { id description}} names { id name name_type { id description}} party_type { id description} }}`,
																								variables: inputParty
																							})
		this.result.data=response.data.party_create
	} catch (error) {
		this.result.error=error
	}
})

When('I update the party', async function () {
	try {
		let response    =await this.client.mutate({
																								mutation : gql`mutation party_update($id: ID!, $comment: String, $party_type_id: ID!) {party_update(id: $id, comment: $comment, party_type_id: $party_type_id){id comment party_type{id}}}`,
																								variables: {
																									'id'           : this.party.id,
																									'comment'      : this.party.comment,
																									'party_type_id': this.party_type.id
																								}
																							})
		this.result.data=response.data.party_update
	} catch (error) {
		this.result.error=error
	}
})

When('I search for all parties', async function () {
	try {
		let response    =await this.client.query({
																							 query    : gql`query parties($start: Int!, $records: Int!) {parties(start: $start, records: $records){id comment party_type{id}}}`,
																							 variables: {
																								 'start'  : 0,
																								 'records': this.parties.length + 10
																							 }
																						 })
		this.result.data=response.data.parties
	} catch (error) {
		this.result.error=error
	}
})

When('I search for parties of type {string}', async function (party_type) {
	try {
		let response=await this.client.query({
																					 query    : gql`query parties_by_type($party_type: String!, $start: Int!, $records: Int!) {parties_by_type(party_type: $party_type, start: $start, records: $records){id comment party_type{id description}}}`,
																					 variables: {
																						 'start'     : 0,
																						 'records'   : this.parties.length + 10,
																						 'party_type': party_type
																					 }
																				 })

		this.result.data=response.data.parties_by_type
	} catch (error) {
		this.result.error=error
	}
})

Given('I change the comment to {string}', function (new_comment, callback) {
	this.party.comment=new_comment
	callback()
})

When('I search for the party by id', async function () {
	try {
		let response    =await this.client.query({
																							 query    : gql`query party($id: ID!) { party(id: $id){id comment party_type{id description}}}`,
																							 variables: {
																								 'id': this.party.id
																							 }
																						 })
		this.result.data=response.data.party
	} catch (error) {
		this.result.error=error
	}
})

When('I delete the party', async function () {
	try {
		this.graphql_function='party_delete'
		let response         =await this.client.mutate({
																										 mutation : gql`mutation party_delete($id: ID!) {party_delete(id: $id)}`,
																										 variables: {
																											 'id': this.party.id
																										 }
																									 })
		this.result.data     =response.data.party_delete
	} catch (error) {
		this.result.error=error
	}
})

Then('I get {int} parties', function (number_of_parties, callback) {
	expect(this.result.error, JSON.stringify(this.result.error)).to.be.null
	expect(this.result.data).to.not.be.null
	expect(this.result.data.length).to.be.equal(number_of_parties)
	callback()
})

Then('{int} of them are type {string}', async function (count, type) {
	let party_type=await this.db.one('select id, description, parent_id from party_type where description = ${type}', {type})
	expect(this.result.data.filter(p => p.party_type.id === party_type.id).length).to.be.equal(count)
})

Then('I get the party back', function (callback) {
	expect(this.result.error, JSON.stringify(this.result.error)).to.be.null
	expect(this.result.data).to.not.be.null
	expect(this.result.data.id).to.not.be.null
	if (this.party.comment) {
		expect(this.result.data.comment).to.be.equal(this.party.comment)
	} else {
		expect(this.result.data.comment).to.be.equal('')
	}
	expect(this.result.data.party_type.id).to.be.equal(this.party_type.id)
	callback()
})

Then('the party is in the database', async function () {
	expect(this.result.error, JSON.stringify(this.result.error)).to.be.null
	expect(this.result.data).to.not.be.null
	let party_id=''
	if (this.party.id && this.party.id !== '') {
		party_id=this.party.id
	} else {
		party_id=this.result.data.id
	}

	let party=await this.db.one('select id, comment, party_type_id from party where id = ${party_id}', {party_id})
	if (this.party.comment) {
		expect(party.comment).to.be.equal(this.party.comment)
	} else {
		expect(party.comment).to.not.be.ok
	}

	expect(party.party_type_id).to.be.equal(this.party_type.id)

})

Then('there is {int} party in the database', async function (party_count) {
	let actual_count=await this.db.one('select count(id) from party')
	expect(parseInt(actual_count.count)).to.be.equal(party_count)
})

Then('I get {string} back', function (string, callback) {
	expect(this.result.error, JSON.stringify(this.result.error)).to.be.null
	expect(this.result.data).to.not.be.null
	expect(this.result.data).to.be.true
	callback()
})

Then('the party is not in the database', async function () {
	try {
		expect(this.result.error, JSON.stringify(this.result.error)).to.be.null
		expect(this.result.data).to.not.be.null
		let party=await this.db.one('select id, comment, party_type_id from party where id = ${id}', this.party)

		fail('Party should be deleted: ', party)
	} catch (error) {
		expect(error.message).to.be.equal('No data returned from the query.')
	}
})

