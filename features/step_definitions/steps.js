import moment from "moment";
var {
    defineSupportCode
} = require('cucumber');

defineSupportCode(function({
    Given,
    When,
    Then
}) {

    Given('I have provided a first name as {first_name:stringInDoubleQuotes}', function(first_name, callback) {
        this.person.first_name = first_name;
        callback();
    });
    Given('I have provided a last name as {last_name:stringInDoubleQuotes}', function(last_name, callback) {
        this.person.last_name = last_name;
        callback();
    });
    Given('I have provided a title of {title:stringInDoubleQuotes}', function(title, callback) {
        this.person.title = title;
        callback();
    });
    Given('I have provided a nickname of {nickname:stringInDoubleQuotes}', function(nickname, callback) {
        this.person.nickname = nickname;
        callback();
    });
    Given('I have provided a date of birth of {date_of_birth:stringInDoubleQuotes}', function(date_of_birth, callback) {
        this.person.date_of_birth = moment(date_of_birth + "00:00 -0700", "MM-DD-YYYY HH:mm Z");
        callback();
    });

    Given('I have made the comment that {comment:stringInDoubleQuotes}', function(comment, callback) {
        this.person.comment = comment;
        callback();
    });

    When('I save the person', function() {
        return this.axios.post('/', {
                "query": "mutation create_person( $first_name: String, $last_name:String, $title:String, $nickname:String, $date_of_birth:String, $comment: String) { create_person(first_name: $first_name, last_name: $last_name, title: $title, nickname: $nickname, date_of_birth: $date_of_birth, comment: $comment){ id } }",
                "variables": {
                    "first_name": this.person.first_name,
                    "last_name": this.person.last_name,
                    "title": this.person.title,
                    "nickname": this.person.nickname,
                    "date_of_birth": this.person.date_of_birth.toJSON(),
                    "comment": this.person.comment
                },
                "operationName": "create_person"
            })
            .then((response) => this.result = response);

    });

    Then('the data will be in the database', function() {
        expect(this.result.status).to.be.equal(200);
        expect(this.result.data.errors).to.be.falsy;
        expect(this.result.data.data).to.exist;
        expect(this.result.data.data.create_person).to.exist;
        expect(this.result.data.data.create_person.id).to.exist;
        return this.db.one("select id, first_name, last_name, title, nickname, date_of_birth, comment from person where id=$1", [this.result.data.data.create_person.id])
            .then(data => {
                expect(data.id).to.be.equal(this.result.data.data.create_person.id);
                expect(data.first_name).to.be.equal(this.person.first_name);
                expect(data.last_name).to.be.equal(this.person.last_name);
                expect(data.title).to.be.equal(this.person.title);
                expect(data.nickname).to.be.equal(this.person.nickname);
                expect(data.date_of_birth.toJSON()).to.be.equal(this.person.date_of_birth.toJSON());
                expect(data.comment).to.be.equal(this.person.comment);
            });

    });

    Given('the person is in the database', function() {
        return this.db.one("insert into person (first_name, last_name, title, nickname, date_of_birth, comment) values($1, $2, $3, $4, $5, $6) returning id", [this.person.first_name, this.person.last_name, this.person.title, this.person.nickname, this.person.date_of_birth, this.person.comment])
            .then((data) => this.person.id = data.id)
    });

    When('I search by the person\'s id', function() {
        return this.axios.post('/', {
                "query": `query person( $id: ID!) {
                    person(id: $id) {
                        first_name,
                        last_name,
                        title,
                        nickname,
                        date_of_birth,
                        comment
                    }
                }`,
                "variables": {
                    "id": this.person.id
                },
                "operationName": "person"
            })
            .then((response) => this.result = response);
    });

    Then('I find the person', function(callback) {
        expect(this.result.status).to.be.equal(200);
        expect(this.result.data.errors).to.be.falsy;
        expect(this.result.data.data).to.exist;
        expect(this.result.data.data.person).to.exist;
        let data = this.result.data.data.person;
        expect(data.first_name).to.be.equal(this.person.first_name);
        expect(data.last_name).to.be.equal(this.person.last_name);
        expect(data.title).to.be.equal(this.person.title);
        expect(data.nickname).to.be.equal(this.person.nickname);
        let formattedDate = moment(data.date_of_birth,"ddd MMM DD YYYY HH:mm:ss GMTZ (UTC)");
        expect(formattedDate.toJSON()).to.be.equal(this.person.date_of_birth.toJSON());
        expect(data.comment).to.be.equal(this.person.comment);
        callback();
    });
});
