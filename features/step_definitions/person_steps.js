import gql from 'graphql-tag'
import moment from "moment"


var {
	    defineSupportCode
    } = require('cucumber')

defineSupportCode(function ({
	                            Given,
	                            When,
	                            Then
                            }) {

	Given('I have provided a first name as {string}', function (first_name, callback) {
		this.person.first_name = first_name
		callback()
	})
	Given('I have provided a last name as {string}', function (last_name, callback) {
		this.person.last_name = last_name
		callback()
	})
	Given('I have provided a title of {string}', function (title, callback) {
		this.person.title = title
		callback()
	})
	Given('I have provided a nickname of {string}', function (nickname, callback) {
		this.person.nickname = nickname
		callback()
	})
	Given('I have provided a date of birth of {string}', function (date_of_birth, callback) {
		if (date_of_birth) {
			this.person.date_of_birth = moment(date_of_birth + "00:00 -0700", "MM-DD-YYYY HH:mm Z")
		} else {
			this.person.date_of_birth = null
		}
		callback()
	})

	Given('I have made the comment that {string}', function (comment, callback) {
		this.person.comment = comment
		callback()
	})

	Given('I have provided a party type of {string}', function (party_type, callback) {
		this.party.type = party_type
		callback()
	})

	Given('I have provided a comment of {string}', function (comment, callback) {
		this.party.comment = comment
		callback()
	})


	When('I save the person', function () {
		return this.client
		.mutate({
			mutation : gql`mutation create_person(
      $first_name: String
      $last_name: String
      $title: String
      $nickname: String
      $date_of_birth: String
      $comment: String
      $email: String
      ) {
        create_person(
          first_name: $first_name
          last_name: $last_name
          title: $title
          nickname: $nickname
          date_of_birth: $date_of_birth
          comment: $comment
          email: $email
        ) {
          id
        }
      }`,
			variables: {
				"first_name"   : this.person.first_name,
				"last_name"    : this.person.last_name,
				"title"        : this.person.title,
				"nickname"     : this.person.nickname,
				"date_of_birth": this.person.date_of_birth ? this.person.date_of_birth.toJSON() : null,
				"comment"      : this.person.comment,
				"email"        : this.person.email
			}
		})
		.then(results => this.result.data = results)
		.catch(error => this.result.error = error)

	})

	Then('the person data will be in the database', function () {
		expect(this.result.error).to.be.null
		expect(this.result.data.data).to.exist
		expect(this.result.data.data.create_person).to.exist
		expect(this.result.data.data.create_person.id).to.exist
		return this.db.one("select id, first_name, last_name, title, nickname, date_of_birth, comment from party where id=$1", [this.result.data.data.create_person.id])
			.then(data => {
				expect(data.id).to.be.equal(this.result.data.data.create_person.id)
				expect(data.first_name).to.be.equal(this.person.first_name)
				expect(data.last_name).to.be.equal(this.person.last_name)
				expect(data.title).to.be.equal(this.person.title)
				expect(data.nickname).to.be.equal(this.person.nickname)
				if (data.date_of_birth && this.person.date_of_birth) {
					expect(data.date_of_birth.toJSON()).to.be.equal(this.person.date_of_birth.toJSON())
				}
				expect(data.comment).to.be.equal(this.person.comment)
			})

	})

	Given('the person is in the database', function () {
		return this.db.one("insert into party (first_name, last_name, title, nickname, date_of_birth, comment, party_type_id) values($1, $2, $3, $4, $5, $6, $7) returning id",
			[this.person.first_name, this.person.last_name, this.person.title, this.person.nickname, this.person.date_of_birth, this.person.comment, this.party_type_id("Person")])
			.then((data) => this.person.id = data.id)
	})

	// When('I search by the person\'s id', function () {
	// 	return this.client
	// 		.query({
	// 			query    : gql`query person_by_id( $id: ID!) {
	// 									        person_by_id(id: $id) {
	// 									          first_name,
	// 									          last_name,
	// 									          title,
	// 									          nickname,
	// 									          date_of_birth,
	// 									          comment
	// 									        }
	// 									     }`,
	// 			variables: {
	// 				"id": this.person.id
	// 			}
	// 		})
	//
	// 		.then((response) => this.result.data = response)
	// 		.catch(error => this.result.error = error)
	// })

	Then('I find the person', function (callback) {
		expect(this.result.error).to.be.null
		expect(this.result.data.data).to.exist
		expect(this.result.data.data.person_by_id).to.exist
		let data = this.result.data.data.person_by_id
		expect(data.first_name).to.be.equal(this.person.first_name)
		expect(data.last_name).to.be.equal(this.person.last_name)
		expect(data.title).to.be.equal(this.person.title)
		expect(data.nickname).to.be.equal(this.person.nickname)
		let formattedDate = moment(data.date_of_birth, "ddd MMM DD YYYY HH:mm:ss GMTZ (UTC)")
		expect(formattedDate.toJSON()).to.be.equal(this.person.date_of_birth.toJSON())
		expect(data.comment).to.be.equal(this.person.comment)
		callback()
	})

	// When('I search for all people', function () {
	// 	return this.client
	// 	.query({
	// 		query: gql`{
	//       people {
	//         first_name,
	//         last_name,
	//         title,
	//         nickname,
	//         date_of_birth,
	//         comment
	//       }
	//     }`
	// 	})
	//
	// 	.then((response) => this.result.data = response)
	// 	.catch(error => this.result.error = error)
	// })

	Then('I find the person in the list', function (callback) {
		expect(this.result.error).to.be.null
		expect(this.result.data.data).to.exist
		let data = this.result.data.data.people[0]
		expect(data.first_name).to.be.equal(this.person.first_name)
		expect(data.last_name).to.be.equal(this.person.last_name)
		expect(data.title).to.be.equal(this.person.title)
		expect(data.nickname).to.be.equal(this.person.nickname)
		let formattedDate = moment(data.date_of_birth, "ddd MMM DD YYYY HH:mm:ss GMTZ (UTC)")
		expect(formattedDate.toJSON()).to.be.equal(this.person.date_of_birth.toJSON())
		expect(data.comment).to.be.equal(this.person.comment)
		callback()
	})

	// When('I update the first name to {string}', function (first_name) {
	// 	return this.client
	// 		.mutate({
	// 			mutation : gql`mutation update_person($id: ID!, $first_name: String, $last_name: String, $title: String, $nickname: String, $date_of_birth: String, $comment: String) {update_person(id: $id, first_name: $first_name, last_name: $last_name, title: $title, nickname: $nickname, date_of_birth: $date_of_birth, comment: $comment) {id, first_name, last_name, title, nickname, date_of_birth, comment}}`,
	// 			variables: {
	// 				"id"           : this.person.id,
	// 				"first_name"   : first_name,
	// 				"last_name"    : this.person.last_name,
	// 				"title"        : this.person.title,
	// 				"nickname"     : this.person.nickname,
	// 				"date_of_birth": this.person.date_of_birth.toJSON(),
	// 				"comment"      : this.person.comment
	// 			}
	// 		})
	//
	// 		.then((response) => this.result.data = response)
	// 		.catch(error => this.result.error = error)
	// })

	Then('the first name is {string}', function (first_name, callback) {
		expect(this.result.data.data.update_person.first_name).to.be.equal(first_name)
		callback()
	})

	Then('the last name is {string}', function (last_name, callback) {
		expect(this.result.data.data.update_person.last_name).to.be.equal(last_name)
		callback()
	})

	Then('the title is {string}', function (title, callback) {
		expect(this.result.data.data.update_person.title).to.be.equal(title)
		callback()
	})

	Then('the nickname is {string}', function (nickname, callback) {
		expect(this.result.data.data.update_person.nickname).to.be.equal(nickname)
		callback()
	})

	Then('the date of birth is {string}', function (date_of_birth, callback) {
		let formattedDate = moment(this.result.data.data.update_person.date_of_birth, "ddd MMM DD YYYY HH:mm:ss GMTZ (UTC)")
		expect(formattedDate.toJSON()).to.be.equal(moment(this.person.date_of_birth).toJSON())
		callback()
	})

	Then('the comment is {string}', function (comment, callback) {
		expect(this.result.data.data.update_person.comment).to.be.equal(comment)
		callback()
	})

	When('I delete the person', function () {
		return this.client
		.mutate({
			mutation : gql`mutation delete_person($id: ID!) {delete_person(id: $id)}`,
			variables: {
				"id": this.person.id
			}
		})
		.then(results => this.result.data = results)
		.catch(error => this.result.error = error)
	})

	Then('the person is no longer in the database', function () {
		expect(this.result.error).to.be.null
		expect(this.result.data.data).to.exist
		return this.db.one("select id from party where id=$1", [this.person.id])
			.then((data) => expect(data).to.not.exist)
			.catch((error) => expect(error.message).to.be.equal("No data returned from the query."))
	})

	Given('no last name', function (callback) {
		this.person.last_name = ''
		callback()
	})

	Given('No first name', function (callback) {
		this.person.first_name = ''
		callback()
	})

	Then('I get an error indicating that either a first name or a last name must be provided', function (callback) {
		console.log("this.result: ", this.result)
		callback(null, 'pending')
	})
})
