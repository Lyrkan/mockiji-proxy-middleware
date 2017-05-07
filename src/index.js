'use strict';

const proxy = require('express-http-proxy');

module.exports = function({
  checkMockStatus = true,
  timeout = 60,
  paths = {},
}) {
  return ({logger}) => {
    logger.info('Mockiji proxy middleware loaded');

    return (req, res, next) => {
      const originalSend = res.send;
      res.send = (body) => {
        // If a mock file has been found, send it directly
        if ((res.getHeader('X-Mockiji-Not-Found') !== 'true') && checkMockStatus) {
          logger.debug('Mock file found by Mockiji, not proxying the request');
          originalSend.call(res, body);
          return;
        }

        // Else, proxy the request using the path resolved by Mockiji
        const resolvedPath = res.getHeader('X-Mockiji-Url') || req.url;

        // Check if a path matches the request
        let proxyHost = null;
        for (let path in paths) {
          let pathRegexp = new RegExp(path, 'i');
          if (pathRegexp.test(resolvedPath)) {
            proxyHost = paths[path];
            break;
          }
        }

        if (!proxyHost) {
          if (checkMockStatus) {
            logger.info(`Mock file not found by Mockiji and no proxy path matching "${resolvedPath}"`);
          } else {
            logger.debug(`No proxy path matching "${resolvedPath}", not proxying the request`)
          }

          originalSend.call(res, body);
          return;
        }

        logger.info(`Proxying the request to ${proxyHost}`);
        res.send = originalSend;
        proxy(proxyHost, {
          proxyReqPathResolver: () => resolvedPath,
          timeout,
        })(req, res, () => {});
      };

      // Call next middleware
      next();
    }
  };
}
