import fs from "fs";

class Config {

	constructor() {
		this._currentEnvironment = process.env.NODE_ENV || defaultEnvironment();
		if (this._currentEnvironment == defaultEnvironment()) {
			this._config = {
				server  : {
					port   : process.env.SERVER_PORT || 80,
					name   : process.env.SERVER_NAME || "walker-knocker-admin-api",
					version: process.env.SERVER_VERSION || "0.1.0",
					url    : process.env.SERVER_URL || "http://localhost/api/party/graphql"
				},
				database: {
					host    : process.env.DATABASE_HOST || 'localhost',
					port    : process.env.DATABASE_PORT || 5432,
					database: process.env.DATABASE_DATABASE || 'party_database',
					user    : process.env.DATABASE_USER || 'party_database',
					password: process.env.DATABASE_PASSWORD || 'party_database'
				}
			};
		} else {
			this._config = JSON.parse(fs.readFileSync(`config.${this.currentEnvironment}.json`, "utf8"));
		}
	}

	get currentEnvironment() {
		return this._currentEnvironment;
	}

	get database() {
		return this._config.database;
	}

	get server() {
		return this._config.server;
	}

}

const config = new Config();
export default config;

export function defaultEnvironment() {
	return "default";
}

export function developmentEnvironment() {
	return "dev";
}

export function environments() {
	return [Config.defaultEnvironment(), Config.localEnvironment(), Config.developmentEnvironment(), Config.qaEnvironment(), Config.qaEnvironment(), Config.stagingEnvironment(), Config.prodEnvironment()];
}

export function localEnvironment() {
	return "local";
}

export function prodEnvironment() {
	return "prod";
}

export function qaEnvironment() {
	return "qa";
}

export function stagingEnvironment() {
	return "staging";
}
