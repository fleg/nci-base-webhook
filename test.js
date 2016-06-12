'use strict';

var expect = require('expect.js'),
	sinon = require('sinon'),
	inherits = require('util').inherits,
	BaseWebhook = require('./lib').BaseWebhook;

var TestWebhook = function() {
	BaseWebhook.call(this, {name: 'test'});
};

inherits(TestWebhook, BaseWebhook);

describe('BaseWebhook', function() {
	var handler, webhook;

	var app = {
		lib: {
			logger: function() {
				return {
					log: function() {},
					error: function() {}
				};
			}
		},
		projects: {},
		builds: {},
		httpApp: {
			post: function(route, _handler) {
				handler = _handler;
			}
		}
	};

	var res = {
		sendStatus: sinon.spy()
	};

	var getReq = function(params) {
		return {
			params: params
		};
	};

	before(function() {
		webhook = new TestWebhook();
		webhook.register(app);
	});

	beforeEach(function() {
		res.sendStatus.reset();
	});

	it('not implemented check should throw error', function() {
		expect(function() {
			webhook.check();
		}).to.throwError(/not implemented/);
	});

	it('should be ok with unexisted project', function() {
		app.projects.get = sinon.stub().returns(null);
		handler(getReq({projectName: 'unexisted'}), res);

		expect(res.sendStatus.firstCall.args[0]).to.eql(404);
	});

	it('should be ok with disabled webhooks', function() {
		app.projects.get = sinon.stub().returns({});
		handler(getReq({projectName: 'ok'}), res);

		expect(res.sendStatus.firstCall.args[0]).to.eql(422);
	});

	it('should be ok with disabled test webhook', function() {
		app.projects.get = sinon.stub().returns({webhooks: {}});
		handler(getReq({projectName: 'ok'}), res);

		expect(res.sendStatus.firstCall.args[0]).to.eql(422);
	});

	it('should be ok with bad secret', function() {
		app.projects.get = sinon.stub()
			.returns({webhooks: {test: {secret: '123456'}}});
		handler(getReq({projectName: 'ok', secret: '123'}), res);

		expect(res.sendStatus.firstCall.args[0]).to.eql(403);
	});

	it('should be ok with non-passing check', function() {
		webhook.check = sinon.stub().returns(false);
		app.projects.get = sinon.stub()
			.returns({webhooks: {test: {secret: '123456'}}});
		handler(getReq({projectName: 'ok', secret: '123456'}), res);

		expect(res.sendStatus.firstCall.args[0]).to.eql(406);
	});

	it('should be ok with passing check', function() {
		webhook.check = sinon.stub().returns(true);
		app.builds.create = sinon.spy();
		app.projects.get = sinon.stub().returns({
			webhooks: {test: {secret: '123456'}},
			name: 'ok'
		});
		handler(getReq({projectName: 'ok', secret: '123456'}), res);

		expect(res.sendStatus.firstCall.args[0]).to.eql(200);
		expect(app.builds.create.calledOnce);
		expect(app.builds.create.firstCall.args[0]).to.eql({
			projectName: 'ok',
			withScmChangesOnly: false,
			initiator: {type: 'test-webhook'}
		});
	});
});
