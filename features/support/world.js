// features/support/world.js
import axios from "axios";
import config from "./config";
import database from "./database";

var {
    defineSupportCode
} = require('cucumber');

function CustomWorld() {
  this.config = config;
  this.db = database;
  this.axios = axios.create({
		baseURL: config.api.url,
		timeout: config.api.timeout,
		validateStatus: function (status) {
			return status < 500; // default
		}
	});
  this.person = {
      id: '',
      first_name: '',
      last_name: '',
      title: '',
      nickname: '',
      date_of_birth: '',
      comment: '',
      email_address: ''
  };

this.contact_mechanism_types = [];
this.party_types = [];

this.email_id = () => this.contact_mechanism_types.find((cm) => cm.description === 'Email Address').id;

this.party_type_id = (party_type) => this.party_types.find(pt => pt.description === party_type).id;

  this.result = {
      error: null,
      data: null
  };
}

defineSupportCode(function({
  setWorldConstructor
}) {
  setWorldConstructor(CustomWorld)
});
