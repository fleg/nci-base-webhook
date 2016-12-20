'use strict';

var BaseWebhook = function(options) {
	this.name = options.name;
};

exports.BaseWebhook = BaseWebhook;

BaseWebhook.prototype.register = function(app) {
	var self = this,
		logger = app.lib.logger('webhooks');

	app.express.post(
		'/webhooks/:projectName/' + self.name + '/:secret',
		function(req, res) {
			var project = app.projects.get(req.params.projectName);

			if (!project) {
				logger.error('project `%s` not found', req.params.projectName);
				return res.sendStatus(404);
			}

			if (!project.webhooks || !project.webhooks[self.name]) {
				logger.log('webhook disabled');
				return res.sendStatus(422);
			}

			if (project.webhooks[self.name].secret !== req.params.secret) {
				logger.error('bad secret');
				return res.sendStatus(403);
			}

			if (!self.check(req, project)) {
				return res.sendStatus(406);
			}

			self.createBuild(req, project, app);

			res.sendStatus(200);
		}
	);
};

BaseWebhook.prototype.createBuild = function(req, project, app) {
	app.builds.create({
		projectName: project.name,
		withScmChangesOnly: false,
		initiator: {type: this.name + '-webhook'}
	});
};

BaseWebhook.prototype.check = function(/* req, project */) {
	throw new Error('not implemented');
};

